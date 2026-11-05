import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import {
  AppPage,
  AudioEffectType,
  BacProgressState,
  Chemical,
  ExperimentLesson,
  ExperimentLogEntry,
  QuickExperimentPreset,
  ReactionDetail,
  SimulationStatus,
  UserStats,
} from "./types";
import {
  CHEMICAL_DATABASE,
  CHEMISTRY_BADGES,
  EXPERIMENT_LESSONS,
  PREDEFINED_REACTIONS,
} from "./data";
import {
  findPredefinedReaction,
  generateScientificFallbackReaction,
} from "./utils/reactionMatcher";
import { ElementProperty } from "./periodicTableData";
import {
  auth,
  db,
  firebaseSignOut,
  googleProvider,
  handleFirestoreError,
  onAuthStateChanged,
  OperationType,
  signInWithPopup,
  User,
} from "./firebase";
import { NavigationChrome } from "./components/NavigationChrome";
import { HomeView } from "./components/HomeView";
import { LabView } from "./components/LabView";
import { PeriodicTableView } from "./components/PeriodicTableView";
import { UniversityToolsModal } from "./components/UniversityToolsModal";
import {
  AudioMixerSettings,
  CurriculumView,
} from "./components/CurriculumView";
import { BaccalaureateView } from "./components/BaccalaureateView";
import { SoundSettingsModal } from "./components/SoundSettingsModal";
import { playSound, soundEngine, SoundFeedbackConfig, stopAllSounds } from "./utils/soundEngine";

const STORAGE_KEYS = {
  theme: "chem_lab_theme",
  stats: "chem_lab_user_stats_v2",
  log: "chem_lab_experiment_log_v2",
  customChems: "chem_lab_custom_chemicals_v2",
  audio: "chem_lab_audio_mixer_v2",
  muted: "chem_lab_audio_muted_v2",
  bacProgress: "chem_lab_bac_progress_v1",
};

const DEFAULT_USER_STATS: UserStats = {
  completedLessons: [],
  unlockedBadges: [],
  scorePoints: 0,
  experimentsRun: 0,
  unlockedCustomMixing: true,
};

const DEFAULT_AUDIO_SETTINGS: AudioMixerSettings = {
  master: 0.75,
  fizz: 0.8,
  sizzle: 0.75,
  ui: 0.65,
};

// Map common elements directly to calibrated database entries when available
const ELEMENT_TO_DB_REAGENT_ID: Record<string, string> = {
  Na: "na_metal",
  K: "k_metal",
  Mg: "mg_ribbon",
  Zn: "zn_granules",
  Cu: "cu_turnings",
  Al: "al_foil",
};

export function App() {
  // 1. Theme State (Dark Scientific Navy default, seamless Light Mode toggle)
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.theme);
      return saved ? saved === "dark" : true;
    } catch {
      return true;
    }
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    try {
      localStorage.setItem(STORAGE_KEYS.theme, isDark ? "dark" : "light");
    } catch {
      // ignore storage quota errors
    }
  }, [isDark]);

  // 2. Navigation & Modal Overlays
  const [activePage, setActivePage] = useState<AppPage>("home");
  const [periodicModalOpen, setPeriodicModalOpen] = useState(false);
  const [instrumentsModalOpen, setInstrumentsModalOpen] = useState(false);
  const [soundModalOpen, setSoundModalOpen] = useState(false);

  // 3. Sound Engine Reactive State
  const [soundConfig, setSoundConfig] = useState<SoundFeedbackConfig>(
    soundEngine.getConfig()
  );

  useEffect(() => {
    const unsub = soundEngine.subscribe(setSoundConfig);
    return unsub;
  }, []);

  // 3. Toast Notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  }, []);

  const isMuted = !soundConfig.enabled || soundConfig.masterVolume <= 0.005;

  const handleToggleMute = useCallback(() => {
    const next = !soundConfig.enabled;
    soundEngine.setEnabled(next);
    if (next) {
      playSound("success");
      showToast("تم تفعيل المؤثرات الصوتية التفاعلية");
    } else {
      showToast("تم كتم الصوت (الوضع الصامت)");
    }
  }, [soundConfig.enabled, showToast]);

  const playSoundEffect = useCallback((effect: AudioEffectType) => {
    soundEngine.play(effect);
  }, []);

  // 3. Custom Reagents & Active Beaker State
  const [customChemicals, setCustomChemicals] = useState<Chemical[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.customChems);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const allChemicals = useMemo(
    () => [...CHEMICAL_DATABASE, ...customChemicals],
    [customChemicals]
  );

  const [selectedReactants, setSelectedReactants] = useState<Chemical[]>([]);
  const [activeReaction, setActiveReaction] = useState<ReactionDetail | null>(
    null
  );
  const [simulationStatus, setSimulationStatus] =
    useState<SimulationStatus>("ready");
  const [isPredictingAi, setIsPredictingAi] = useState(false);
  const isReactionPlaying = simulationStatus === "running";
  const [reactionProgress, setReactionProgress] = useState(0);
  const progTimerRef = useRef<number | null>(null);

  // 4. Physical Benchtop Telemetry
  const [heaterPowerW, setHeaterPowerW] = useState(0);
  const [stirSpeed, setStirSpeed] = useState(250);
  const [isStirring, setIsStirring] = useState(false);
  const [viscosityCp, setViscosityCp] = useState(1);
  const [bubbleSpeedMultiplier, setBubbleSpeedMultiplier] = useState(1.0);
  const [customBubbleTint, setCustomBubbleTint] = useState(
    "rgba(224, 242, 254, 0.78)"
  );
  const [currentTemp, setCurrentTemp] = useState(24.0);
  const [temperatureHistory, setTemperatureHistory] = useState<number[]>([
    24.0, 24.0, 24.0, 24.0, 24.0, 24.0,
  ]);

  // 5. Guided Curriculum, Stats, Log & Toast
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const activeLesson = useMemo(
    () => EXPERIMENT_LESSONS.find((l) => l.id === activeLessonId) || null,
    [activeLessonId]
  );

  const [userStats, setUserStats] = useState<UserStats>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.stats);
      return raw
        ? { ...DEFAULT_USER_STATS, ...JSON.parse(raw) }
        : DEFAULT_USER_STATS;
    } catch {
      return DEFAULT_USER_STATS;
    }
  });

  const [experimentLog, setExperimentLog] = useState<ExperimentLogEntry[]>(
    () => {
      try {
        const raw = localStorage.getItem(STORAGE_KEYS.log);
        return raw ? JSON.parse(raw) : [];
      } catch {
        return [];
      }
    }
  );



  const [bacProgress, setBacProgress] = useState<BacProgressState>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.bacProgress);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  const handleUpdateBacProgress = useCallback(
    (lessonId: string, completed: boolean, scorePercent?: number) => {
      setBacProgress((prev) => {
        const next: BacProgressState = {
          ...prev,
          [lessonId]: {
            completed,
            scorePercent,
            lastStudiedAt: new Date().toISOString(),
          },
        };
        try {
          localStorage.setItem(STORAGE_KEYS.bacProgress, JSON.stringify(next));
        } catch {
          // ignore
        }
        return next;
      });
    },
    []
  );

  const handleAddBacXp = useCallback(
    (amount: number) => {
      setUserStats((prev) => {
        const next = { ...prev, scorePoints: prev.scorePoints + amount };
        try {
          localStorage.setItem(STORAGE_KEYS.stats, JSON.stringify(next));
        } catch {
          // ignore
        }
        return next;
      });
      showToast(`+${amount} XP نقطة خبرة جديدة من كيمياء البكالوريا!`);
    },
    [showToast]
  );

  const [audioSettings, setAudioSettings] = useState<AudioMixerSettings>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.audio);
      return raw
        ? { ...DEFAULT_AUDIO_SETTINGS, ...JSON.parse(raw) }
        : DEFAULT_AUDIO_SETTINGS;
    } catch {
      return DEFAULT_AUDIO_SETTINGS;
    }
  });

  // Persist local settings
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.stats, JSON.stringify(userStats));
    } catch {
      // ignore
    }
  }, [userStats]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.log, JSON.stringify(experimentLog));
    } catch {
      // ignore
    }
  }, [experimentLog]);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEYS.customChems,
        JSON.stringify(customChemicals)
      );
    } catch {
      // ignore
    }
  }, [customChemicals]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.audio, JSON.stringify(audioSettings));
      localStorage.setItem(STORAGE_KEYS.muted, String(isMuted));
    } catch {
      // ignore
    }
  }, [audioSettings, isMuted]);

  // 7. Firebase Auth & Cloud Profile Sync (/lab_profiles/{userId})
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isSyncingCloud, setIsSyncingCloud] = useState(false);

  const syncStatsToFirestore = useCallback(
    async (uid: string, displayName: string, statsToSync: UserStats) => {
      const path = `lab_profiles/${uid}`;
      const profileRef = doc(db, "lab_profiles", uid);
      setIsSyncingCloud(true);
      try {
        const snap = await getDoc(profileRef);
        const safeDisplayName = (displayName || "باحث كيميائي").slice(0, 80);
        if (!snap.exists()) {
          await setDoc(profileRef, {
            ownerId: uid,
            displayName: safeDisplayName,
            scorePoints: Math.max(0, Math.floor(statsToSync.scorePoints)),
            completedLessons: statsToSync.completedLessons.slice(0, 50),
            unlockedBadges: statsToSync.unlockedBadges.slice(0, 50),
            experimentsRun: Math.max(0, Math.floor(statsToSync.experimentsRun)),
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        } else {
          const remote = snap.data();
          const mergedScore = Math.max(
            statsToSync.scorePoints,
            Number(remote.scorePoints) || 0
          );
          const mergedRuns = Math.max(
            statsToSync.experimentsRun,
            Number(remote.experimentsRun) || 0
          );
          const mergedLessons = Array.from(
            new Set([
              ...statsToSync.completedLessons,
              ...(Array.isArray(remote.completedLessons)
                ? remote.completedLessons
                : []),
            ])
          ).slice(0, 50);
          const mergedBadges = Array.from(
            new Set([
              ...statsToSync.unlockedBadges,
              ...(Array.isArray(remote.unlockedBadges)
                ? remote.unlockedBadges
                : []),
            ])
          ).slice(0, 50);

          await updateDoc(profileRef, {
            displayName: safeDisplayName,
            scorePoints: Math.floor(mergedScore),
            completedLessons: mergedLessons,
            unlockedBadges: mergedBadges,
            experimentsRun: Math.floor(mergedRuns),
            updatedAt: serverTimestamp(),
          });

          setUserStats((prev) => ({
            ...prev,
            scorePoints: mergedScore,
            experimentsRun: mergedRuns,
            completedLessons: mergedLessons,
            unlockedBadges: mergedBadges,
          }));
        }
      } catch (err) {
        try {
          handleFirestoreError(err, OperationType.WRITE, path);
        } catch {
          // Logged by handleFirestoreError
        }
      } finally {
        setIsSyncingCloud(false);
      }
    },
    []
  );

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user && user.emailVerified) {
        syncStatsToFirestore(
          user.uid,
          user.displayName || "باحث كيميائي",
          userStats
        );
      }
    });
    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSignInGoogle = async () => {
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      if (cred.user && cred.user.emailVerified) {
        await syncStatsToFirestore(
          cred.user.uid,
          cred.user.displayName || "باحث كيميائي",
          userStats
        );
        showToast("تمت مزامنة ملفك الأكاديمي السحابي بنجاح");
      }
    } catch {
      showToast("تعذر إكمال تسجيل الدخول السحابي");
    }
  };

  const handleSignOutGoogle = async () => {
    try {
      await firebaseSignOut(auth);
      showToast("تم تسجيل الخروج مع الاحتفاظ بتقدمك المحلي");
    } catch {
      // ignore
    }
  };

  // 8. Continuous Thermal Kinetics Loop (Hotplate + Reaction Delta + Ambient Cooling)
  useEffect(() => {
    const interval = window.setInterval(() => {
      setCurrentTemp((prevTemp) => {
        const ambient = 24.0;
        const heaterTargetBoost = (heaterPowerW / 500) * 76.0; // up to 100°C boiling
        const reactionBoost = activeReaction
          ? activeReaction.temperatureDelta *
            (isReactionPlaying ? 1.0 : 0.65)
          : 0;
        const target = Math.max(
          -10,
          Math.min(125, ambient + heaterTargetBoost + reactionBoost)
        );
        const next = prevTemp + (target - prevTemp) * 0.24;
        const rounded = Number(next.toFixed(1));
        setTemperatureHistory((hist) => [...hist.slice(-23), rounded]);
        return rounded;
      });
    }, 900);

    return () => window.clearInterval(interval);
  }, [heaterPowerW, activeReaction, isReactionPlaying]);

  // Compute live pH of the beaker
  const currentPh = useMemo(() => {
    if (selectedReactants.length === 0) return 7.0;
    if (activeReaction?.reactionType === "neutralization") return 7.0;
    const phValues = selectedReactants
      .map((r) => r.ph)
      .filter((v): v is number => v !== undefined);
    if (phValues.length === 0) return 7.0;
    const avg = phValues.reduce((a, b) => a + b, 0) / phValues.length;
    return Number(avg.toFixed(2));
  }, [selectedReactants, activeReaction]);

  // 9. Reagent & Reaction Handlers
  const handleAddChemical = useCallback(
    (chem: Chemical) => {
      setSelectedReactants((prev) => {
        if (prev.length >= 3) {
          showToast("السعة القصوى للدورق 3 مواد — أفرغ الدورق لإضافة المزيد");
          return prev;
        }
        if (progTimerRef.current) {
          window.clearInterval(progTimerRef.current);
          progTimerRef.current = null;
        }
        stopAllSounds();
        setActiveReaction(null);
        setReactionProgress(0);
        setSimulationStatus("ready");
        playSoundEffect("beep");
        return [...prev, chem];
      });
    },
    [playSoundEffect, showToast]
  );

  const handleRemoveChemical = useCallback((id: string) => {
    if (progTimerRef.current) {
      window.clearInterval(progTimerRef.current);
      progTimerRef.current = null;
    }
    stopAllSounds();
    setActiveReaction(null);
    setReactionProgress(0);
    setSimulationStatus("ready");
    setSelectedReactants((prev) => {
      const idx = prev.findIndex((c) => c.id === id);
      if (idx === -1) return prev;
      const copy = [...prev];
      copy.splice(idx, 1);
      return copy;
    });
  }, []);

  const handleResetBeaker = useCallback(() => {
    if (progTimerRef.current) {
      window.clearInterval(progTimerRef.current);
      progTimerRef.current = null;
    }
    stopAllSounds();
    setSelectedReactants([]);
    setActiveReaction(null);
    setReactionProgress(0);
    setSimulationStatus("ready");
    setHeaterPowerW(0);
    playSoundEffect("beep");
    showToast("تم إفراغ الكأس بالكامل");
  }, [playSoundEffect, showToast]);

  const handleAddElementToBeaker = useCallback(
    (element: ElementProperty) => {
      const mappedDbId = ELEMENT_TO_DB_REAGENT_ID[element.symbol];
      const existingDbChem = mappedDbId
        ? CHEMICAL_DATABASE.find((c) => c.id === mappedDbId)
        : undefined;

      const stateSuffix =
        element.standardState === "gas"
          ? "(g)"
          : element.standardState === "liquid"
          ? "(l)"
          : "(s)";

      const diatomicSymbols = new Set(["H", "N", "O", "F", "Cl", "Br", "I"]);
      const formulaBase = diatomicSymbols.has(element.symbol)
        ? `${element.symbol}₂`
        : element.symbol;

      const chemToPour: Chemical = existingDbChem || {
        id: `el_${element.symbol.toLowerCase()}`,
        name: `عنصر ${element.nameAr}`,
        nameEn: element.nameEn,
        formula: `${formulaBase}${stateSuffix}`,
        molarMass: element.atomicMass,
        state: element.standardState,
        color: "bg-violet-500/15 border-violet-500/40",
        liquidColor:
          element.standardState === "liquid"
            ? "rgba(217, 119, 6, 0.42)"
            : "rgba(148, 163, 184, 0.24)",
        ph: 7.0,
        category: element.category.includes("metal") ? "metal" : "other",
        hazardLabel:
          element.category === "alkali-metal"
            ? "فلز قلوي شديد النشاط"
            : "عنصر نقي",
        description: element.descriptionAr,
      };

      setSelectedReactants((prev) => {
        if (prev.length >= 3) {
          showToast("الدورق ممتلئ (3/3) — أفرغ مادة أولاً لإضافة العنصر");
          return prev;
        }
        if (progTimerRef.current) {
          window.clearInterval(progTimerRef.current);
          progTimerRef.current = null;
        }
        stopAllSounds();
        setActiveReaction(null);
        setReactionProgress(0);
        setSimulationStatus("ready");
        playSoundEffect("beep");
        showToast(`أُضيف ${chemToPour.name} (${chemToPour.formula}) إلى الكأس`);
        return [...prev, chemToPour];
      });

      if (activePage !== "lab" && !periodicModalOpen) {
        setActivePage("lab");
      }
    },
    [activePage, periodicModalOpen, playSoundEffect, showToast]
  );

  // Resolve chemical reaction via preset, AI, or guaranteed scientific fallback
  const resolveReactionDetails = useCallback(
    async (reactantsToMix: Chemical[]): Promise<{ reaction: ReactionDetail; source: ExperimentLogEntry["source"] }> => {
      // 1. Check calibrated stoichiometric reactions first
      const predefined = findPredefinedReaction(reactantsToMix);
      if (predefined) {
        return { reaction: predefined, source: "preset" };
      }

      // 2. Query AI predictor endpoint
      try {
        setIsPredictingAi(true);
        const res = await fetch("/api/reaction/predict", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reactantsSelected: reactantsToMix.map((r) => ({
              id: r.id,
              name: r.name,
              formula: r.formula,
            })),
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const reaction: ReactionDetail = {
            equation:
              data.equation ||
              `${reactantsToMix.map((r) => r.formula).join(" + ")} → نواتج متوازنة`,
            products: Array.isArray(data.products) && data.products.length > 0 ? data.products : ["مزيج مستقر"],
            reactionType: data.reactionType || "other",
            temperatureDelta: Number(data.temperatureDelta) || 0,
            liquidColor: data.liquidColor || "rgba(186, 230, 253, 0.30)",
            hasPrecipitate: Boolean(data.hasPrecipitate),
            precipitateColor: data.precipitateColor || "#e2e8f0",
            hasGas: Boolean(data.hasGas),
            gasType: data.gasType || "None",
            bubblingRate: data.bubblingRate || "none",
            flameColor: data.flameColor || "none",
            isDangerous: Boolean(data.isDangerous),
            dangerLevel: data.dangerLevel || "safe",
            safetyWarning: data.safetyWarning,
            audioEffect: data.audioEffect || "fizz",
            explanation:
              data.explanation ||
              "تم تحليل المزيج الكيميائي وحساب حالة التوازن للمواد المضافة.",
            molecularExplanation: data.molecularExplanation,
          };
          return { reaction, source: "ai" };
        }
      } catch (err) {
        console.warn("AI reaction predictor fallback used:", err);
      } finally {
        setIsPredictingAi(false);
      }

      // 3. Fallback to scientific rule generator
      return {
        reaction: generateScientificFallbackReaction(reactantsToMix),
        source: "fallback",
      };
    },
    []
  );

  // 10. Multi-State Reaction Engine Handlers (Start, Pause, Resume, Reset)
  const handleStartReaction = useCallback(async () => {
    if (selectedReactants.length === 0) {
      showToast("يرجى اختيار مادة كيميائية واحدة على الأقل أولاً");
      return;
    }
    if (simulationStatus === "running" || isPredictingAi) {
      return; // Prevent duplicate race conditions
    }

    try {
      if (progTimerRef.current) {
        window.clearInterval(progTimerRef.current);
        progTimerRef.current = null;
      }
      stopAllSounds();

      playSound("simulation_start");
      setSimulationStatus("running");
      setReactionProgress(10);

      const { reaction, source } = await resolveReactionDetails(selectedReactants);
      setActiveReaction(reaction);

      if (reaction.audioEffect && reaction.audioEffect !== "none") {
        playSoundEffect(reaction.audioEffect);
      }

      // Progressively animate reaction progress to 100%
      let prog = 15;
      progTimerRef.current = window.setInterval(() => {
        prog += 15;
        if (prog >= 100) {
          setReactionProgress(100);
          setSimulationStatus("completed");
          playSound("simulation_complete");
          if (progTimerRef.current) {
            window.clearInterval(progTimerRef.current);
            progTimerRef.current = null;
          }
        } else {
          setReactionProgress(prog);
        }
      }, 450);

      // Append to Experiment History Log
      const logEntry: ExperimentLogEntry = {
        id: `exp_${Date.now()}`,
        timestamp: new Date().toISOString(),
        reactantNames: selectedReactants.map((r) => r.name),
        equation: reaction.equation,
        reactionType: reaction.reactionType,
        temperatureDelta: reaction.temperatureDelta,
        source,
      };
      setExperimentLog((prev) => [logEntry, ...prev].slice(0, 40));

      // Update XP & AI Explorer badge if novel reaction
      setUserStats((prev) => {
        const xpGain = source === "ai" ? 35 : 20;
        const nextBadges =
          source === "ai" && !prev.unlockedBadges.includes("badge_ai_explorer")
            ? [...prev.unlockedBadges, "badge_ai_explorer"]
            : prev.unlockedBadges;

        const updated: UserStats = {
          ...prev,
          scorePoints: prev.scorePoints + xpGain,
          experimentsRun: prev.experimentsRun + 1,
          unlockedBadges: nextBadges,
        };

        if (currentUser && currentUser.emailVerified) {
          syncStatsToFirestore(
            currentUser.uid,
            currentUser.displayName || "باحث كيميائي",
            updated
          );
        }
        return updated;
      });
    } catch (err) {
      console.error("Error executing reaction:", err);
      setSimulationStatus("error");
      playSound("error");
      showToast("حدث خطأ أثناء بدء التفاعل");
    }
  }, [
    selectedReactants,
    simulationStatus,
    isPredictingAi,
    resolveReactionDetails,
    playSoundEffect,
    currentUser,
    syncStatsToFirestore,
    showToast,
  ]);

  // Pause simulation handler
  const handlePauseReaction = useCallback(() => {
    if (progTimerRef.current) {
      window.clearInterval(progTimerRef.current);
      progTimerRef.current = null;
    }
    stopAllSounds();
    setSimulationStatus("paused");
    playSound("click");
    showToast("تم إيقاف التفاعل مؤقتاً");
  }, [showToast]);

  // Resume simulation from where it stopped
  const handleResumeReaction = useCallback(() => {
    if (!activeReaction || simulationStatus === "running") return;

    setSimulationStatus("running");
    playSound("simulation_start");
    if (activeReaction.audioEffect && activeReaction.audioEffect !== "none") {
      playSoundEffect(activeReaction.audioEffect);
    }

    let prog = reactionProgress;
    if (progTimerRef.current) {
      window.clearInterval(progTimerRef.current);
    }
    progTimerRef.current = window.setInterval(() => {
      prog += 15;
      if (prog >= 100) {
        setReactionProgress(100);
        setSimulationStatus("completed");
        playSound("simulation_complete");
        if (progTimerRef.current) {
          window.clearInterval(progTimerRef.current);
          progTimerRef.current = null;
        }
      } else {
        setReactionProgress(prog);
      }
    }, 450);

    showToast("تم استكمال التفاعل من نفس النقطة");
  }, [activeReaction, simulationStatus, reactionProgress, playSoundEffect, showToast]);

  // Reset reaction to 0% progress without clearing reactants
  const handleResetReaction = useCallback(() => {
    if (progTimerRef.current) {
      window.clearInterval(progTimerRef.current);
      progTimerRef.current = null;
    }
    stopAllSounds();
    setReactionProgress(0);
    setSimulationStatus("ready");
    playSound("click");
    showToast("تمت إعادة التفاعل إلى نقطة البداية");
  }, [showToast]);

  // Quick preset runner
  const handleRunQuickExperiment = useCallback(
    (preset: QuickExperimentPreset) => {
      const chems = preset.reactantIds
        .map((id) => allChemicals.find((c) => c.id === id))
        .filter((c): c is Chemical => Boolean(c));
      if (chems.length === 0) return;

      if (progTimerRef.current) {
        window.clearInterval(progTimerRef.current);
        progTimerRef.current = null;
      }
      stopAllSounds();
      setSelectedReactants(chems);
      setActiveReaction(null);
      setReactionProgress(0);
      setSimulationStatus("ready");
      setActivePage("lab");
      window.scrollTo({ top: 0, behavior: "smooth" });
      window.setTimeout(() => {
        handleStartReaction();
      }, 220);
    },
    [allChemicals, handleStartReaction]
  );

  const handleStartLesson = useCallback((lessonId: string) => {
    setActiveLessonId(lessonId);
    if (progTimerRef.current) {
      window.clearInterval(progTimerRef.current);
      progTimerRef.current = null;
    }
    stopAllSounds();
    setSelectedReactants([]);
    setActiveReaction(null);
    setSimulationStatus("ready");
    setReactionProgress(0);
    setActivePage("lab");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleCompleteLessonQuiz = useCallback(
    (lesson: ExperimentLesson) => {
      playSoundEffect("achievement");
      const badgeObj = CHEMISTRY_BADGES.find((b) => b.id === lesson.badgeId);
      const bonusXp = badgeObj ? badgeObj.xpReward : 150;

      setUserStats((prev) => {
        const alreadyDone = prev.completedLessons.includes(lesson.id);
        const nextLessons = alreadyDone
          ? prev.completedLessons
          : [...prev.completedLessons, lesson.id];
        const nextBadges = prev.unlockedBadges.includes(lesson.badgeId)
          ? prev.unlockedBadges
          : [...prev.unlockedBadges, lesson.badgeId];

        const updated: UserStats = {
          ...prev,
          completedLessons: nextLessons,
          unlockedBadges: nextBadges,
          scorePoints: alreadyDone
            ? prev.scorePoints
            : prev.scorePoints + bonusXp,
        };

        if (currentUser && currentUser.emailVerified) {
          syncStatsToFirestore(
            currentUser.uid,
            currentUser.displayName || "باحث كيميائي",
            updated
          );
        }
        return updated;
      });

      showToast(`أحسنت! اكتمل درس «${lesson.title}» وحصلت على الوسام العلمي`);
    },
    [currentUser, playSoundEffect, showToast, syncStatsToFirestore]
  );

  const handleCreateCustomChemical = useCallback(
    (newChem: Chemical) => {
      setCustomChemicals((prev) => [newChem, ...prev]);
      handleAddChemical(newChem);
      showToast(`تم ابتكار وإضافة ${newChem.name} إلى خزانة المختبر`);
    },
    [handleAddChemical, showToast]
  );

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] text-slate-900 dark:text-slate-100 transition-colors duration-300 pb-20 lg:pb-8 overflow-x-hidden">
      {/* Global Navigation Chrome (Desktop 3-Zone Bar + Mobile-First Chrome) */}
      <NavigationChrome
        activePage={activePage}
        onNavigate={(page) => {
          playSound("navigate");
          setActivePage(page);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        isDark={isDark}
        onToggleTheme={() => {
          playSound("click");
          setIsDark((d) => !d);
        }}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onOpenSoundSettings={() => {
          playSound("modal_open");
          setSoundModalOpen(true);
        }}
        beakerCount={selectedReactants.length}
        scorePoints={userStats.scorePoints}
      />

      {/* Main Responsive Viewport Container */}
      <main className="mx-auto max-w-[1440px] px-3.5 sm:px-6 pt-4 sm:pt-6">
        {activePage === "home" && (
          <HomeView
            isDark={isDark}
            onNavigate={(page) => {
              setActivePage(page);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            onRunQuickExperiment={handleRunQuickExperiment}
            onStartLesson={handleStartLesson}
          />
        )}

        {activePage === "lab" && (
          <LabView
            allChemicals={allChemicals}
            selectedReactants={selectedReactants}
            onAddChemical={handleAddChemical}
            onRemoveChemical={handleRemoveChemical}
            onResetBeaker={handleResetBeaker}
            onExecuteReaction={handleStartReaction}
            simulationStatus={simulationStatus}
            onStartReaction={handleStartReaction}
            onPauseReaction={handlePauseReaction}
            onResumeReaction={handleResumeReaction}
            onResetReaction={handleResetReaction}
            isPredictingAi={isPredictingAi}
            activeReaction={activeReaction}
            isReactionPlaying={isReactionPlaying}
            reactionProgress={reactionProgress}
            currentTemp={currentTemp}
            currentPh={currentPh}
            temperatureHistory={temperatureHistory}
            heaterPowerW={heaterPowerW}
            onChangeHeaterPowerW={setHeaterPowerW}
            stirSpeed={stirSpeed}
            onChangeStirSpeed={setStirSpeed}
            isStirring={isStirring}
            onToggleStirring={() => setIsStirring((s) => !s)}
            viscosityCp={viscosityCp}
            onChangeViscosityCp={setViscosityCp}
            bubbleSpeedMultiplier={bubbleSpeedMultiplier}
            onChangeBubbleSpeedMultiplier={setBubbleSpeedMultiplier}
            customBubbleTint={customBubbleTint}
            onChangeCustomBubbleTint={setCustomBubbleTint}
            onOpenPeriodicModal={() => setPeriodicModalOpen(true)}
            onOpenInstrumentsModal={() => setInstrumentsModalOpen(true)}
            onCreateCustomChemical={handleCreateCustomChemical}
            activeLesson={activeLesson}
            onExitLesson={() => setActiveLessonId(null)}
            onGoToLessonQuiz={() => {
              setActivePage("curriculum");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        )}

        {activePage === "periodic" && (
          <PeriodicTableView
            mode="page"
            onAddElementToBeaker={handleAddElementToBeaker}
            onAddChemicalToBeaker={(chem) => {
              handleAddChemical(chem);
              showToast(`أُضيف ${chem.name} إلى الكأس`);
            }}
            selectedReactants={selectedReactants}
          />
        )}

        {activePage === "instruments" && (
          <UniversityToolsModal
            mode="page"
            selectedReactants={selectedReactants}
            activeReaction={activeReaction}
          />
        )}

        {activePage === "baccalaureate" && (
          <BaccalaureateView
            progressState={bacProgress}
            onUpdateProgress={handleUpdateBacProgress}
            onAddXp={handleAddBacXp}
          />
        )}

        {activePage === "curriculum" && (
          <CurriculumView
            userStats={userStats}
            experimentLog={experimentLog}
            onClearLog={() => setExperimentLog([])}
            onStartLessonInLab={handleStartLesson}
            onCompleteLessonQuiz={handleCompleteLessonQuiz}
            audioSettings={audioSettings}
            onChangeAudioSettings={setAudioSettings}
            currentUser={currentUser}
            isSyncingCloud={isSyncingCloud}
            onSignInGoogle={handleSignInGoogle}
            onSignOutGoogle={handleSignOutGoogle}
          />
        )}
      </main>

      {/* Quick Periodic Table Modal Overlay inside Lab */}
      {periodicModalOpen && (
        <PeriodicTableView
          mode="modal"
          onClose={() => setPeriodicModalOpen(false)}
          onAddElementToBeaker={(el) => {
            handleAddElementToBeaker(el);
            setPeriodicModalOpen(false);
          }}
          onAddChemicalToBeaker={(chem) => {
            handleAddChemical(chem);
            setPeriodicModalOpen(false);
            showToast(`أُضيف ${chem.name} إلى الكأس`);
          }}
          selectedReactants={selectedReactants}
        />
      )}

      {/* Quick University Analytical Suite Modal Overlay inside Lab */}
      {instrumentsModalOpen && (
        <UniversityToolsModal
          mode="modal"
          isOpen={instrumentsModalOpen}
          onClose={() => setInstrumentsModalOpen(false)}
          selectedReactants={selectedReactants}
          activeReaction={activeReaction}
        />
      )}

      {/* Global Interactive Sound & Feedback Settings Modal */}
      <SoundSettingsModal
        isOpen={soundModalOpen}
        onClose={() => setSoundModalOpen(false)}
      />

      {/* Non-intrusive Accessible Scientific Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-20 lg:bottom-6 start-1/2 -translate-x-1/2 z-50 max-w-[92vw] glass-modal rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-900 dark:text-white shadow-xl pointer-events-none"
        >
          {toastMessage}
        </div>
      )}
    </div>
  );
}

export default App;
