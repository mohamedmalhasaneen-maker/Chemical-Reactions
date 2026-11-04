/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from "react";
import {
  Activity,
  Compass,
  Zap,
  ShieldAlert,
  Sparkles,
  Flame,
  RotateCcw,
  Plus,
  Trash2,
  AlertTriangle,
  BookOpen,
  Award,
  Search,
  CheckCircle,
  Sliders,
  Play,
  ArrowRight,
  X,
  Volume2,
  VolumeX,
  Thermometer,
  Sun,
  Moon
} from "lucide-react";

import { CHEMICAL_DATABASE, PREDEFINED_REACTIONS, EXPERIMENT_LESSONS, CHEMISTRY_BADGES } from "./data";
import { Chemical, ReactionDetail, ExperimentLesson, UserStats } from "./types";
import { PERIODIC_ELEMENTS, ElementProperty } from "./periodicTableData";
import MolecularSimulationCanvas from "./components/MolecularSimulationCanvas";
import SmokeSimulationCanvas from "./components/SmokeSimulationCanvas";
import LaserGlowCanvas from "./components/LaserGlowCanvas";
import UniversityToolsModal from "./components/UniversityToolsModal";

export default function App() {
  // Database / Search States
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  
  // University Tools Modal State
  const [isUniversityModalOpen, setIsUniversityModalOpen] = useState<boolean>(false);

  // Selected chemicals in current reaction workbench
  const [selectedReactants, setSelectedReactants] = useState<Chemical[]>([]);
  
  // Custom formula creator state
  const [showFormulaCreator, setShowFormulaCreator] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customFormula, setCustomFormula] = useState("");
  const [customPh, setCustomPh] = useState<number>(7);
  const [customCategory, setCustomCategory] = useState<Chemical["category"]>("acid");
  
  // Custom Chemical list registered by the user
  const [customChemicals, setCustomChemicals] = useState<Chemical[]>([]);

  // Simulation parameters
  const [heatIntensity, setHeatIntensity] = useState<number>(0); // Watts (0 - 500)
  const [stirSpeed, setStirSpeed] = useState<number>(200); // RPM (0 - 1000)
  
  // Live simulated values
  const [currentTemp, setCurrentTemp] = useState<number>(24.8);
  const [currentPh, setCurrentPh] = useState<number>(7.0);
  const [reactionProgress, setReactionProgress] = useState<number>(0); // 0 to 100
  const [isReactionPlaying, setIsReactionPlaying] = useState<boolean>(false);
  const [isStirring, setIsStirring] = useState<boolean>(true);
  const [synthSoundEnabled, setSynthSoundEnabled] = useState<boolean>(true);
  const [showVolumeControls, setShowVolumeControls] = useState<boolean>(false);
  const [effectVolumes, setEffectVolumes] = useState<{
    fizzSizzle: number;
    explosionShake: number;
    system: number;
    achievement: number;
  }>(() => {
    const saved = localStorage.getItem("chemistry_lab_effect_volumes");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return {
      fizzSizzle: 0.6,
      explosionShake: 0.8,
      system: 0.5,
      achievement: 0.7,
    };
  });

  const updateVolume = (category: keyof typeof effectVolumes, value: number) => {
    setEffectVolumes(prev => {
      const next = { ...prev, [category]: value };
      localStorage.setItem("chemistry_lab_effect_volumes", JSON.stringify(next));
      return next;
    });
  };

  // Active Reaction Result State
  const [activeReaction, setActiveReaction] = useState<ReactionDetail | null>(null);
  const [bubbleColorOverride, setBubbleColorOverride] = useState<string>("auto");
  const [loadingAiPrediction, setLoadingAiPrediction] = useState<boolean>(false);
  const [predictionSource, setPredictionSource] = useState<"preset" | "ai" | "fallback" | null>(null);
  
  // App Notification Toast
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "info" | "success" | "warning" | "error" } | null>(null);

  // Guided Lesson / gamification stats
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [lessonStepIndex, setLessonStepIndex] = useState<number>(0);
  const [quizQuestionIndex, setQuizQuestionIndex] = useState<number | null>(null); // null means not in quiz
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [quizFinished, setQuizFinished] = useState<boolean>(false);

  // Periodic Table modal state
  const [isPeriodicModalOpen, setIsPeriodicModalOpen] = useState(false);
  const [selectedElement, setSelectedElement] = useState<ElementProperty | null>(null);

  // User Stats loaded from LocalStorage
  const [userStats, setUserStats] = useState<UserStats>({
    completedLessons: [],
    unlockedBadges: [],
    scorePoints: 0,
    unlockedCustomMixing: false
  });

  // Molecular feeds for visual realism
  const [molecularFeed, setMolecularFeed] = useState<{ label: string; value: string; color: string }[]>([
    { label: "[H₃O⁺]", value: "1.00e-7 M", color: "text-indigo-400" },
    { label: "[OH⁻]", value: "1.00e-7 M", color: "text-cyan-400" },
    { label: "[Na⁺]", value: "0.00e-0 M", color: "text-slate-400" },
    { label: "[Cl⁻]", value: "0.00e-0 M", color: "text-slate-400" }
  ]);

  // Sparkline history for chart representation
  const [chartHistory, setChartHistory] = useState<number[]>([24.8, 24.8, 24.8, 24.8, 24.8, 24.8, 24.8, 24.8, 24.8, 24.8, 24.8, 24.8, 24.8]);

  // Active sidebar tab
  const [activeTab, setActiveTab] = useState<"analytics" | "lessons" | "badges">("analytics");

  // Theme Mode (Dark Cybernetic / Light Academic)
  const [themeMode, setThemeMode] = useState<"dark" | "light">(() => {
    try {
      const saved = localStorage.getItem("chem_lab_theme");
      return saved === "light" ? "light" : "dark";
    } catch {
      return "dark";
    }
  });

  const toggleThemeMode = () => {
    const nextTheme = themeMode === "dark" ? "light" : "dark";
    setThemeMode(nextTheme);
    try {
      localStorage.setItem("chem_lab_theme", nextTheme);
    } catch (e) {
      console.warn("Could not save theme preference", e);
    }
  };

  // Active view on mobile viewports: chemicals, reactor, or results
  const [activeMobileView, setActiveMobileView] = useState<"chemicals" | "reactor" | "results">("reactor");
  const mobileScrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollToMobileView = (view: "chemicals" | "reactor" | "results") => {
    setActiveMobileView(view);
    if (mobileScrollContainerRef.current) {
      const container = mobileScrollContainerRef.current;
      const targetIndex = view === "chemicals" ? 0 : view === "reactor" ? 1 : 2;
      const targetElement = container.children[targetIndex] as HTMLElement;
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  };

  const handleMobileScroll = () => {
    if (!mobileScrollContainerRef.current) return;
    if (window.innerWidth >= 768) return; // Only sync scroll active view on mobile

    const container = mobileScrollContainerRef.current;
    const children = Array.from(container.children) as HTMLElement[];
    const containerCenter = container.scrollLeft + container.clientWidth / 2;

    let closestIndex = 1;
    let minDiff = Infinity;
    children.forEach((child, idx) => {
      const childCenter = child.offsetLeft + child.clientWidth / 2;
      const diff = Math.abs(childCenter - containerCenter);
      if (diff < minDiff) {
        minDiff = diff;
        closestIndex = idx;
      }
    });

    const views: ("chemicals" | "reactor" | "results")[] = ["chemicals", "reactor", "results"];
    if (views[closestIndex] && views[closestIndex] !== activeMobileView) {
      setActiveMobileView(views[closestIndex]);
    }
  };

  // Audio Context Ref for synthetic physical sound effects
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Initialize and load user stats
  useEffect(() => {
    const saved = localStorage.getItem("chemistry_lab_user_stats");
    if (saved) {
      try {
        setUserStats(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved points", e);
      }
    }
  }, []);

  // Show a temporary toast helper
  const showToast = (text: string, type: "info" | "success" | "warning" | "error" = "info") => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Safe point update logic
  const addPoints = (points: number, badgeIdToUnlock?: string) => {
    setUserStats(prev => {
      const alreadyCompleted = badgeIdToUnlock ? prev.unlockedBadges.includes(badgeIdToUnlock) : false;
      const updatedBadges = badgeIdToUnlock && !alreadyCompleted 
        ? [...prev.unlockedBadges, badgeIdToUnlock] 
        : prev.unlockedBadges;
      
      const updated = {
        ...prev,
        scorePoints: prev.scorePoints + points,
        unlockedBadges: updatedBadges
      };
      localStorage.setItem("chemistry_lab_user_stats", JSON.stringify(updated));
      return updated;
    });

    if (badgeIdToUnlock) {
      const badge = CHEMISTRY_BADGES.find(b => b.id === badgeIdToUnlock);
      if (badge) {
        showToast(`🏆 تم فتح وسام جديد: ${badge.title}! (+${points} نقطة)`, "success");
        playSynthSound("achievement");
      }
    } else {
      showToast(`تم إضافة +${points} نقاط تفوق للأكاديمية!`, "success");
      playSynthSound("beep");
    }
  };

  // Safe chemical registration
  const handleCreateCustomChemical = () => {
    if (!customName || !customFormula) {
      showToast("يرجى إدخال اسم المادة الكيميائية وصيغتها الجزيئية.", "error");
      return;
    }

    const uniqueId = `custom_${customName.toLowerCase().replace(/\s+/g, "_")}`;
    const alreadyExists = CHEMICAL_DATABASE.some(c => c.id === uniqueId) || customChemicals.some(c => c.id === uniqueId);
    
    if (alreadyExists) {
      showToast("مادة كيميائية بهذا الاسم مسجلة بالفعل.", "warning");
      return;
    }

    const newChem: Chemical = {
      id: uniqueId,
      name: customName,
      formula: customFormula,
      state: "aqueous",
      color: "bg-purple-900/40 border-purple-500",
      liquidColor: "rgba(168, 85, 247, 0.3)",
      ph: customPh,
      category: customCategory,
      description: `مادة مخصصة ومبتكرة بواسطة الطالب في المختبر الافتراضي. الصيغة: ${customFormula}.`
    };

    setCustomChemicals(prev => [...prev, newChem]);
    setCustomName("");
    setCustomFormula("");
    showToast(`تم تسجيل المادة "${customName} (${customFormula})" بنجاح على رف المذيبات!`, "success");
    playSynthSound("beep");
  };

  // Filter chemicals
  const combinedChemicals = [...CHEMICAL_DATABASE, ...customChemicals];

  // Find or dynamically generate a reactant chemical representation for a given periodic element
  const getChemicalForElement = (element: ElementProperty): Chemical => {
    // 1. Try to find a precise elemental chemical already in our database
    const elementalMatches = [
      element.symbol.toLowerCase(),
      `${element.symbol.toLowerCase()}_metal`,
      `${element.symbol.toLowerCase()}_ribbon`,
      `${element.symbol.toLowerCase()}_powder`,
      `${element.symbol.toLowerCase()}_foil`,
      `${element.symbol.toLowerCase()}_granules`
    ];

    const matched = combinedChemicals.find(c => 
      elementalMatches.includes(c.id.toLowerCase()) || 
      c.formula.trim().toLowerCase() === element.symbol.trim().toLowerCase()
    );

    if (matched) {
      return matched;
    }

    // 2. Otherwise determine appropriate physical state
    let state: "solid" | "liquid" | "gas" | "aqueous" = "solid";
    if (element.category === "noble-gas" || ["H", "N", "O", "F", "Cl"].includes(element.symbol)) {
      state = "gas";
    } else if (element.symbol === "Hg" || element.symbol === "Br") {
      state = "liquid";
    }

    // 3. Select styling and color representation
    let color = "bg-slate-400 border-slate-500 shadow-inner";
    let liquidColor = "rgba(148, 163, 184, 0.3)";
    
    if (element.category === "alkali-metal") {
      color = "bg-pink-300 border-pink-400";
      liquidColor = "rgba(244, 114, 182, 0.25)";
    } else if (element.category === "alkaline-earth-metal") {
      color = "bg-amber-300 border-amber-400";
      liquidColor = "rgba(251, 191, 36, 0.25)";
    } else if (element.category === "transition-metal") {
      color = "bg-yellow-250 border-yellow-350";
      liquidColor = "rgba(234, 179, 8, 0.2)";
    } else if (element.category === "noble-gas") {
      color = "bg-red-400/30 border-red-500/50";
      liquidColor = "rgba(239, 68, 68, 0.15)";
    } else if (element.category === "halogen") {
      color = "bg-purple-300 border-purple-400";
      liquidColor = "rgba(192, 132, 252, 0.25)";
    } else if (element.category === "reactive-nonmetal") {
      color = "bg-sky-300 border-sky-400";
      liquidColor = "rgba(56, 189, 248, 0.25)";
    }

    let formula = element.symbol;
    if (["O", "H", "N", "F", "Cl", "Br", "I"].includes(element.symbol)) {
      formula = `${element.symbol}₂`; // Diatomic standard representation
    }

    return {
      id: `el_${element.symbol.toLowerCase()}`,
      name: `عنصر ${element.nameAr}`,
      formula: formula,
      state: state,
      color: color,
      liquidColor: liquidColor,
      ph: 7.0,
      category: element.category.includes("metal") ? "metal" : "other",
      description: element.descriptionAr,
    };
  };

  const filteredChemicals = combinedChemicals.filter(chem => {
    const matchesSearch = chem.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          chem.formula.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || chem.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Synthesizer engine to produce procedural audio feedback safe for the browser sandbox
  const playSynthSound = (type: "beep" | "fizz" | "sizzle" | "pop" | "explosion" | "cabinet_shake" | "achievement" | "completion") => {
    if (!synthSoundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const now = ctx.currentTime;

      switch (type) {
        case "beep": {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(600, now);
          osc.frequency.exponentialRampToValueAtTime(800, now + 0.1);
          gain.gain.setValueAtTime(0.08 * effectVolumes.system, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.15);
          break;
        }
        case "achievement": {
          const notes = [440, 554.37, 659.25, 880];
          notes.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.frequency.setValueAtTime(freq, now + idx * 0.08);
            gain.gain.setValueAtTime(0.05 * effectVolumes.achievement, now + idx * 0.08);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.3);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + idx * 0.08);
            osc.stop(now + idx * 0.08 + 0.3);
          });
          break;
        }
        case "completion": {
          // A beautiful, shimmering glass crystallization / reaction completion harmonic beep
          const rootFreq = 587.33; // D5 (pleasant scientific chime)
          const freqs = [rootFreq, rootFreq * 1.5, rootFreq * 2.0]; // Perfect chord
          const volFactor = effectVolumes.achievement;

          freqs.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const delay = idx * 0.04; // staggered start for shimmering effect

            osc.type = idx === 1 ? "triangle" : "sine";
            osc.frequency.setValueAtTime(freq, now + delay);
            // subtle pitch drift up representing final purity/stabilization
            osc.frequency.exponentialRampToValueAtTime(freq * 1.05, now + delay + 0.5);

            gain.gain.setValueAtTime(0.06 * volFactor, now + delay);
            gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.6);

            const filter = ctx.createBiquadFilter();
            filter.type = "lowpass";
            filter.frequency.setValueAtTime(1500, now + delay);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(ctx.destination);

            osc.start(now + delay);
            osc.stop(now + delay + 0.75);
          });
          break;
        }
        case "fizz":
        case "sizzle": {
          // White noise synth
          const bufferSize = ctx.sampleRate * (type === "fizz" ? 1.5 : 0.8);
          const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
          const data = buffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
          }
          const noise = ctx.createBufferSource();
          noise.buffer = buffer;

          const filter = ctx.createBiquadFilter();
          filter.type = "bandpass";
          filter.frequency.value = type === "fizz" ? 1800 : 800;

          const gain = ctx.createGain();
          gain.gain.setValueAtTime(0.04 * effectVolumes.fizzSizzle, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + (type === "fizz" ? 1.4 : 0.75));

          noise.connect(filter);
          filter.connect(gain);
          gain.connect(ctx.destination);

          noise.start(now);
          break;
        }
        case "pop": {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(150, now);
          osc.frequency.exponentialRampToValueAtTime(30, now + 0.12);
          gain.gain.setValueAtTime(0.15 * effectVolumes.system, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.12);
          break;
        }
        case "explosion": {
          // Red noise simulated explosion
          const osc = ctx.createOscillator();
          const filter = ctx.createBiquadFilter();
          const gain = ctx.createGain();

          osc.type = "sawtooth";
          osc.frequency.setValueAtTime(80, now);
          osc.frequency.exponentialRampToValueAtTime(30, now + 0.7);

          filter.type = "lowpass";
          filter.frequency.setValueAtTime(500, now);
          filter.frequency.exponentialRampToValueAtTime(40, now + 0.6);

          gain.gain.setValueAtTime(0.25 * effectVolumes.explosionShake, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.82);

          // Crackling high noise sparkle
          const bufferSize = ctx.sampleRate * 0.4;
          const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
          const data = buffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
          }
          const noise = ctx.createBufferSource();
          noise.buffer = buffer;
          const noiseGain = ctx.createGain();
          noiseGain.gain.setValueAtTime(0.12 * effectVolumes.explosionShake, now);
          noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
          noise.connect(noiseGain);
          noiseGain.connect(ctx.destination);
          noise.start(now);
          break;
        }
        case "cabinet_shake": {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(45, now);
          osc.frequency.setValueAtTime(55, now + 0.1);
          osc.frequency.setValueAtTime(35, now + 0.2);
          gain.gain.setValueAtTime(0.12 * effectVolumes.explosionShake, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.5);
          break;
        }
      }
    } catch (e) {
      console.warn("Synth audio context play blocked or failed:", e);
    }
  };

  // Gradual progression timeline manager for product conversion and sound crystallization playbacks
  const runReactionVisualTimeline = (reaction: ReactionDetail, source: "preset" | "ai" | "fallback", reactantsList: Chemical[]) => {
    setActiveReaction(reaction);
    setPredictionSource(source);
    setLoadingAiPrediction(false);
    playReactionEffects(reaction);

    // Initial progress starts at 10%
    setReactionProgress(10);
    setIsReactionPlaying(true);

    const startTime = Date.now();
    const duration = 2800; // 2.8 seconds smooth reaction product conversion
    let playedCompletion = false;

    const intervalId = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, 10 + Math.floor((elapsed / duration) * 90));
      setReactionProgress(progress);

      // Play completion chime as it approaches the end of the products stage (85% to 92%)
      if (progress >= 85 && progress < 100 && !playedCompletion) {
        playedCompletion = true;
        playSynthSound("completion");
      }

      if (progress >= 100) {
        clearInterval(intervalId);
        setIsReactionPlaying(false);
        validateStepCompletion(reactantsList, reaction);
      }
    }, 40);
  };

  // Core reaction solver (looks up preset index or contacts server AI node)
  const computeReaction = async (reactants: Chemical[]) => {
    if (reactants.length < 2) {
      setActiveReaction(null);
      setPredictionSource(null);
      setReactionProgress(0);
      return;
    }

    setIsReactionPlaying(true);
    setReactionProgress(10);
    setLoadingAiPrediction(true);

    // 1. Check Predefined list first
    const sortedIds = reactants.map(r => r.id).sort().join("+");
    const matchedPreset = PREDEFINED_REACTIONS[sortedIds];

    if (matchedPreset) {
      setTimeout(() => {
        runReactionVisualTimeline(matchedPreset, "preset", reactants);
      }, 700);
      return;
    }

    // 2. Query Server Service for general AI Prediction fallback
    try {
      const response = await fetch("/api/reaction/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reactantsSelected: reactants.map(r => ({
            id: r.id,
            name: r.name,
            formula: r.formula
          }))
        })
      });

      if (!response.ok) {
        throw new Error("Server prediction request returned unscheduled state.");
      }

      const outcomeData = await response.json();
      
      runReactionVisualTimeline(outcomeData, "ai", reactants);
      
      // Award special badge for executing AI custom reaction 
      if (!userStats.unlockedBadges.includes("badge_ai_explorer")) {
        addPoints(50, "badge_ai_explorer");
      }

    } catch (err: any) {
      console.warn("Server AI Chemistry model offline, substituting sandbox fallback rules:", err);
      
      // Fallback prediction generator
      setTimeout(() => {
        const fall = generateFallbackReaction(reactants);
        runReactionVisualTimeline(fall, "fallback", reactants);
      }, 800);
    }
  };

  // Triggers visual state machines & synth playbacks
  const playReactionEffects = (reaction: ReactionDetail) => {
    if (reaction.audioEffect && reaction.audioEffect !== "none") {
      playSynthSound(reaction.audioEffect);
    }

    let finalPh = 7.0;
    const withPh = selectedReactants.filter(r => r.ph !== undefined);
    if (withPh.length > 0) {
      const phs = withPh.map(r => r.ph!);
      const sum = phs.reduce((a, b) => a + b, 0);
      finalPh = sum / phs.length;
    }

    if (reaction.reactionType === "neutralization") {
      finalPh = 7.1;
    }

    setCurrentPh(finalPh);

    const delta = reaction.temperatureDelta;
    let startT = currentTemp;
    const interval = setInterval(() => {
      if (startT < 24.8 + delta) {
        startT += 0.8;
        setCurrentTemp(parseFloat(startT.toFixed(1)));
      } else {
        clearInterval(interval);
      }
    }, 40);

    updateMolecularFeed(reaction, finalPh);

    if (reaction.isDangerous) {
      showToast(`⚠️ تنبيه خطر نشط: ${reaction.dangerLevel.toUpperCase()}! ${reaction.safetyWarning || ""}`, "warning");
    } else {
      showToast(`اكتمل التفاعل الكيميائي بنجاح! ${reaction.equation}`, "success");
    }
  };

  const generateFallbackReaction = (reactants: Chemical[]): ReactionDetail => {
    const listStr = reactants.map(r => r.formula).join(" + ");
    const hasAcid = reactants.some(r => r.category === "acid");
    const hasBase = reactants.some(r => r.category === "base");
    const hasMetal = reactants.some(r => r.category === "metal");

    let equation = `${listStr} → مصفوفة مركب حافز`;
    let isDangerous = false;
    let dangerLevel: ReactionDetail["dangerLevel"] = "safe";
    let explanation = `اندمجت جزيئات المواد الكيميائية لتكوين محلول مائي مركب داخل دورق التفاعل الكيميائي.`;
    let reactionType: ReactionDetail["reactionType"] = "other";
    let tempDelta = 2.0;
    let audio: ReactionDetail["audioEffect"] = "none";
    let colorChg = { from: "transparent", to: "rgba(99, 102, 241, 0.2)" };

    if (hasAcid && hasBase) {
      reactionType = "neutralization";
      equation = `${reactants[0].formula} + ${reactants[1].formula} → ملح + ماء`;
      tempDelta = 14.5;
      audio = "sizzle";
      explanation = "تفاعل تعادل وازاحة حمض وقاعدة طارد للحرارة. تنتقل بروتونات الحمض إلى المواد القلوية، مطلقاً جزيئات ماء مستقرة وملح منحل.";
      colorChg = { from: "transparent", to: "rgba(255, 255, 255, 0.1)" };
    } else if (hasAcid && hasMetal) {
      reactionType = "gas-release";
      equation = `${reactants[0].formula} + ${reactants[1].formula} → أيون ذائب + غاز هيدروجين ↑`;
      tempDelta = 19.0;
      audio = "fizz";
      explanation = "تفاعل إزاحة نشط لغاز الهيدروجين الحرة. يهاجم الحمض جزيئات الفلز، مذيباً إياها ومصعداً لغاز الهيدروجين بشكل سريع.";
    } else if (hasMetal && reactants.some(r => r.id === "h2o")) {
      reactionType = "dangerous";
      dangerLevel = "extreme";
      isDangerous = true;
      tempDelta = 40.0;
      audio = "explosion";
      equation = "فلز نشط + ماء → قاعدة قوية + هيدروجين ↑ (تفاعل عنيف)";
      explanation = "تفاعل اختزال وإزاحة قلوي فوري وعنيف. يذوب فلز الصوديوم القلوي بسرعة فائقة بالماء منتجاً طاقة كيميائية هائلة تشعل غاز الهيدروجين المنفصل.";
    }

    return {
      reactants: reactants.map(r => r.id),
      products: ["أيونات مزاحة كيميائياً", "مذيبات متعادلة"],
      equation,
      reactionType,
      temperatureDelta: tempDelta,
      colorChange: colorChg,
      isDangerous,
      dangerLevel,
      audioEffect: audio,
      explanation,
      molecularExplanation: "تصطدم البلورات والأيونات تحت تأثير الطاقة الحركية للمحلول. يعاد اصطفاف الروابط والمدارات الإلكترونية لتفريغ المحتوى الحراري كاملاً."
    };
  };

  const updateMolecularFeed = (reaction: ReactionDetail, ph: number) => {
    const calculatedH3O = Math.pow(10, -ph).toExponential(3);
    const calculatedOH = Math.pow(10, -(14 - ph)).toExponential(3);
    
    const feed = [
      { label: "[H₃O⁺]", value: `${calculatedH3O} M`, color: ph < 7 ? "text-red-400 font-bold" : "text-indigo-400" },
      { label: "[OH⁻]", value: `${calculatedOH} M`, color: ph > 7 ? "text-pink-400 font-bold" : "text-cyan-400" }
    ];

    if (reaction.reactants.includes("hcl") && reaction.reactants.includes("naoh")) {
      feed.push({ label: "[Na⁺]", value: "0.501 M", color: "text-amber-300" });
      feed.push({ label: "[Cl⁻]", value: "0.501 M", color: "text-emerald-400" });
    } else {
      feed.push({ label: "[أنيون نشط]", value: "1.24e-3 M", color: "text-slate-400" });
      feed.push({ label: "[كاتيون حر]", value: "4.82e-3 M", color: "text-slate-400" });
    }

    setMolecularFeed(feed);
  };

  useEffect(() => {
    let t = currentTemp;
    setChartHistory(prev => {
      const copy = [...prev.slice(1), t];
      return copy;
    });
  }, [currentTemp]);

  // Handle chemical list selection
  const handleSelectChemical = (chem: Chemical) => {
    if (selectedReactants.some(r => r.id === chem.id)) {
      showToast(`المادة "${chem.name}" متواجدة بالفعل داخل دورق التفاعل!`, "warning");
      return;
    }
    
    if (selectedReactants.length >= 3) {
      showToast("سعة الحجم محدودة: لا يمكن دمج أكثر من 3 كواشف في الكأس في نفس الوقت.", "info");
      return;
    }

    const nextReactants = [...selectedReactants, chem];
    setSelectedReactants(nextReactants);
    playSynthSound("pop");

    if (nextReactants.length === 1) {
      setCurrentPh(chem.ph ?? 7.0);
    }

    showToast(`تم صب ${chem.name} في الكأس الكيميائي.`, "info");
  };

  // Remove single reactant
  const handleRemoveReactant = (id: string) => {
    const nextReactants = selectedReactants.filter(r => r.id !== id);
    setSelectedReactants(nextReactants);
    playSynthSound("pop");
    setActiveReaction(null);
    setPredictionSource(null);
    setReactionProgress(0);

    if (nextReactants.length === 0) {
      setCurrentPh(7.0);
      setCurrentTemp(24.8);
    } else {
      setCurrentPh(nextReactants[0].ph ?? 7.0);
    }
  };

  const handleClearBeaker = () => {
    setSelectedReactants([]);
    setActiveReaction(null);
    setBubbleColorOverride("auto");
    setPredictionSource(null);
    setReactionProgress(0);
    setCurrentTemp(24.8);
    setCurrentPh(7.0);
    setIsReactionPlaying(false);
    playSynthSound("pop");
    showToast("تم غسل الأجهزة الزجاجية وتفريغ الدورق بالكامل.", "success");
  };

  // Guided Lesson Workflow Validators
  const handleSelectLesson = (lesson: ExperimentLesson) => {
    setActiveLessonId(lesson.id);
    setLessonStepIndex(0);
    setQuizQuestionIndex(null);
    setQuizAnswers([]);
    setQuizFinished(false);
    
    setSelectedReactants([]);
    setActiveReaction(null);
    setPredictionSource(null);
    setReactionProgress(0);
    
    setActiveTab("lessons");
    showToast(`الدرس النشط: ${lesson.title}. يرجى اتباع التعليمات!`, "info");
    playSynthSound("beep");
  };

  const validateStepCompletion = (reactants: Chemical[], reaction: ReactionDetail) => {
    if (!activeLessonId) return;
    const lesson = EXPERIMENT_LESSONS.find(l => l.id === activeLessonId);
    if (!lesson) return;

    const currentIds = reactants.map(r => r.id);
    const requiredIds = lesson.targetReactants;
    const allRequiredPresent = requiredIds.every(id => currentIds.includes(id));

    if (allRequiredPresent) {
      if (lessonStepIndex < lesson.steps.length - 1) {
        setLessonStepIndex(prev => prev + 1);
        showToast("أنجزت الخطوة بنجاح! تابع التوجيهات في الخطوة التالية.", "success");
      } else {
        setLessonStepIndex(lesson.steps.length); // complete
        showToast(`مستهدف المعمل الموجه اكتمل الآن! تقدم للاختبار لحصد النقاط!`, "success");
        playSynthSound("achievement");
      }
    }
  };

  const startLessonQuiz = () => {
    setQuizQuestionIndex(0);
    setQuizAnswers([]);
    setQuizFinished(false);
    playSynthSound("beep");
  };

  const handleSelectQuizOption = (optionIdx: number) => {
    if (quizQuestionIndex === null) return;
    const lesson = EXPERIMENT_LESSONS.find(l => l.id === activeLessonId);
    if (!lesson) return;

    const currentQuestion = lesson.quiz[quizQuestionIndex];
    const isCorrect = optionIdx === currentQuestion.correctAnswerIndex;

    const nextAnswers = [...quizAnswers, optionIdx];
    setQuizAnswers(nextAnswers);

    if (isCorrect) {
      showToast("استنتاج علمي دقيق وصحيح!", "success");
      playSynthSound("beep");
    } else {
      showToast(`إجابة خاطئة: ${currentQuestion.explanation}`, "error");
      playSynthSound("cabinet_shake");
    }

    if (quizQuestionIndex < lesson.quiz.length - 1) {
      setTimeout(() => {
        setQuizQuestionIndex(prev => prev! + 1);
      }, 2000);
    } else {
      // Quiz complete!
      setTimeout(() => {
        setQuizFinished(true);
        let correctCount = 0;
        lesson.quiz.forEach((q, idx) => {
          if (nextAnswers[idx] === q.correctAnswerIndex) {
            correctCount++;
          }
        });

        const scoreEarned = correctCount * 50 + 100; // 50 pts correct, 100 bonus
        const badgeId = lesson.badgeId;
        addPoints(scoreEarned, badgeId);

        setUserStats(prev => {
          const already = prev.completedLessons.includes(lesson.id);
          const updatedLessons = already ? prev.completedLessons : [...prev.completedLessons, lesson.id];
          const updatedStats = { ...prev, completedLessons: updatedLessons };
          localStorage.setItem("chemistry_lab_user_stats", JSON.stringify(updatedStats));
          return updatedStats;
        });

      }, 1200);
    }
  };

  const getFluidColor = () => {
    if (activeReaction && activeReaction.colorChange) {
      return activeReaction.colorChange.to;
    }

    const hasPhenol = selectedReactants.some(r => r.id === "phenolphthalein");
    if (hasPhenol && currentPh >= 8.2) {
      return "rgba(236, 72, 153, 0.75)";
    }

    if (selectedReactants.length > 0) {
      const withColor = selectedReactants.find(r => r.liquidColor !== undefined);
      if (withColor) return withColor.liquidColor;
    }

    return "rgba(255, 255, 255, 0.05)";
  };

  const getBubbleColor = () => {
    if (bubbleColorOverride && bubbleColorOverride !== "auto") {
      return bubbleColorOverride;
    }
    
    // Dynamic color detection based on reactants/products/active reaction
    if (selectedReactants.length > 0) {
      const hasCopper = selectedReactants.some(r => r.id === "cuso4" || r.id === "cu_foil");
      const hasPotassium = selectedReactants.some(r => r.id === "ki");
      const hasSodium = selectedReactants.some(r => r.id === "na_metal" || r.id === "naoh" || r.id === "naclo" || r.id === "nacl");
      const hasIndicator = selectedReactants.some(r => r.id === "phenolphthalein");
      
      if (hasIndicator && currentPh >= 8.2) {
        return "rgba(236, 72, 153, 0.75)"; // Pink bubbles for active phenolphthalein in basic solution
      }
      if (hasCopper) {
        return "rgba(20, 184, 166, 0.75)"; // Teal/turquoise bubbles for copper
      }
      if (hasPotassium) {
        return "rgba(168, 85, 247, 0.75)"; // Violet/purple bubbles for potassium
      }
      if (hasSodium) {
        return "rgba(245, 158, 11, 0.75)"; // Orange/amber bubbles for sodium
      }
      
      // Check if there is an active reaction with special colors or acids
      if (activeReaction) {
        if (activeReaction.reactionType === "dangerous") {
          return "rgba(239, 68, 68, 0.8)"; // Red glowing bubbles for danger!
        }
        if (activeReaction.reactionType === "neutralization") {
          return "rgba(59, 130, 246, 0.75)"; // Blue bubbles for neutralization
        }
        if (activeReaction.reactionType === "exothermic") {
          return "rgba(249, 115, 22, 0.75)"; // Orange-gold for exothermic
        }
      }
      
      // Default based on category
      const hasAcid = selectedReactants.some(r => r.category === "acid");
      if (hasAcid) {
        return "rgba(239, 68, 68, 0.6)"; // Red-tinted bubbles for acid
      }
      const hasBase = selectedReactants.some(r => r.category === "base");
      if (hasBase) {
        return "rgba(59, 130, 246, 0.6)"; // Blue-tinted bubbles for base
      }
    }
    
    return "rgba(255, 255, 255, 0.5)"; // Standard translucent white bubbles
  };

  const getIsActiveMetalAndAcid = () => {
    const hasActiveMetal = selectedReactants.some(r => r.category === "metal" && (r.id === "mg_ribbon" || r.id === "na_metal"));
    const hasAcid = selectedReactants.some(r => r.category === "acid");
    return !!(hasActiveMetal && hasAcid && activeReaction);
  };

  const getBubbleSpeedAndDensity = () => {
    let count = 0;
    let speed = "3s";
    
    if (selectedReactants.length > 0) {
      if (getIsActiveMetalAndAcid()) {
        speed = "0.38s"; // Extremely fast rising
        count = 95;      // High density vertical micro bubbles
      } else if (activeReaction) {
        // Decide density and speed based on reactionType and bubblingRate
        const bubblingRate = activeReaction.bubblingRate || "slow";
        
        if (activeReaction.reactionType === "dangerous" || activeReaction.dangerLevel === "extreme") {
          speed = "0.7s";
          count = 40;
        } else if (activeReaction.reactionType === "exothermic") {
          speed = bubblingRate === "explosive" ? "0.5s" : bubblingRate === "rapid" ? "0.9s" : "1.6s";
          count = bubblingRate === "explosive" ? 45 : bubblingRate === "rapid" ? 30 : 15;
        } else if (activeReaction.reactionType === "gas-release") {
          speed = bubblingRate === "explosive" ? "0.6s" : bubblingRate === "rapid" ? "1.0s" : "2.0s";
          count = bubblingRate === "explosive" ? 40 : bubblingRate === "rapid" ? 25 : 12;
        } else if (activeReaction.reactionType === "displacement") {
          speed = "1.3s";
          count = 20;
        } else if (activeReaction.reactionType === "neutralization") {
          speed = "1.8s";
          count = 14;
        } else {
          // precipitation / other
          speed = bubblingRate === "rapid" ? "1.4s" : "2.5s";
          count = bubblingRate === "none" ? 0 : bubblingRate === "slow" ? 8 : 16;
        }
      } else {
        // If no active reaction, check temperature for boiling (thermal bubbling!)
        if (currentTemp > 90) {
          speed = "0.6s";
          count = 35; // violent boiling bubbling
        } else if (currentTemp > 75) {
          speed = "1.2s";
          count = 20; // gentle boiling bubbling
        } else if (currentTemp > 50) {
          speed = "2.2s";
          count = 8;  // warm convection bubbles
        } else {
          // Standard very quiet baseline bubbles
          speed = "4s";
          count = 3;
        }
      }
    }
    
    return { count, speed };
  };

  const getFluidViscosity = () => {
    let viscosity = 1.0; // Baseline (water)
    if (selectedReactants.length === 0) return viscosity;

    // 1. Sulfuric acid (h2so4) is explicitly a viscous, syrupy liquid
    if (selectedReactants.some(r => r.id === "h2so4")) {
      viscosity += 2.0;
    }
    // 2. Bases like NaOH (sodium hydroxide) feel slippery/soapy and increase viscosity mildly
    if (selectedReactants.some(r => r.id === "naoh" || r.category === "base")) {
      viscosity += 0.4;
    }
    // 3. Chemical reactions resulting in precipitation block current lines and increase suspension thickness
    if (activeReaction?.hasPrecipitate) {
      viscosity += 1.6;
    }
    // 4. Cumulative reactants dissolved creates a denser solution, raising viscosity
    viscosity += Math.min(selectedReactants.length * 0.2, 0.9);

    // 5. Temperature effect: heating reduces viscosity (liquids become more fluid!)
    const tempFactor = Math.max(0.35, 1.0 - (currentTemp - 24.8) / 115);
    viscosity = 1.0 + (viscosity - 1.0) * tempFactor;

    return Math.min(Math.max(viscosity, 1.0), 5.0);
  };

  const handleQuitLesson = () => {
    setActiveLessonId(null);
    setQuizQuestionIndex(null);
    setQuizFinished(false);
    showToast("تم العودة إلى وضع الفضاء الحر (دراسة حرة).", "info");
  };

  return (
    <div className={`w-full min-h-full ${themeMode === "light" ? "bg-[#eef2f6] text-slate-900" : "bg-[#07070A] text-slate-300"} flex flex-col font-sans select-none relative overflow-x-hidden md:h-screen md:overflow-y-hidden`} id="virtual-lab-dashboard" dir="rtl">
      
      {/* Dynamic Toast System */}
      {toastMessage && (
        <div id="toast-notify" className={`fixed top-4 inset-x-4 max-w-sm mx-auto md:right-4 md:left-auto md:inset-x-auto z-[150] flex items-center gap-3 p-4 rounded-xl border-2 shadow-2xl transition-all animate-bounce ${
          toastMessage.type === "success" ? "bg-slate-950 border-emerald-500 text-emerald-355 shadow-[0_0_30px_rgba(16,185,129,0.25)] animate-pulse" :
          toastMessage.type === "warning" ? "bg-slate-950 border-amber-500 text-amber-300 shadow-[0_0_30px_rgba(245,158,11,0.2)]" :
          toastMessage.type === "error" ? "bg-slate-950 border-rose-500 text-rose-300 shadow-[0_0_30px_rgba(239,68,68,0.25)] animate-shake" :
          "bg-slate-950 border-indigo-500 text-indigo-300 shadow-[0_0_30px_rgba(99,102,241,0.2)]"
        }`}>
          {toastMessage.type === "success" && <CheckCircle className="w-5 h-5 flex-shrink-0 text-emerald-400" id="toast-icon-suc" />}
          {toastMessage.type === "warning" && <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-400" id="toast-icon-war" />}
          {toastMessage.type === "error" && <ShieldAlert className="w-5 h-5 flex-shrink-0 text-rose-400" id="toast-icon-err" />}
          {toastMessage.type === "info" && <Sparkles className="w-5 h-5 flex-shrink-0 text-indigo-400" id="toast-icon-inf" />}
          <p className="text-xs font-bold leading-relaxed text-right flex-1" id="toast-body-text">{toastMessage.text}</p>
          <button onClick={() => setToastMessage(null)} className="mr-auto text-slate-400 hover:text-white pr-2 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Cybernetic Nav / Lab Header */}
      <nav className={`min-h-[5rem] h-auto md:h-20 border-b ${themeMode === "light" ? "border-slate-300 bg-white/90 text-slate-900" : "border-white/10 bg-[#0C0C10]/90 text-slate-100"} backdrop-blur-md flex flex-col md:flex-row items-center justify-between px-4 md:px-6 gap-4 py-3 md:py-0 flex-shrink-0 relative z-30 shadow-lg`} id="lab-header">
        <div className="flex items-center gap-4 flex-row-reverse md:flex-row justify-between w-full md:w-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-cyan-600 flex items-center justify-center border border-indigo-400/40 shadow-lg shadow-indigo-500/20 hover:scale-105 transition-all cursor-pointer glass-icon" id="nav-badge">
              <span className="text-white font-display font-medium text-xl md:text-2xl">🧪</span>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1.5 flex-row-reverse justify-end">
                <h1 className={`font-display font-black text-base md:text-lg tracking-wide ${themeMode === "light" ? "text-slate-900" : "text-white"}`} id="app-title-main">المختبر الكيميائي الافتراضي</h1>
                {activeLessonId && (
                  <span className="px-1.5 py-0.5 bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 text-[9px] font-mono rounded font-bold uppercase" id="lesson-active-tag">
                    الدرس نشط
                  </span>
                )}
              </div>
              <p className={`text-[9px] md:text-[10px] font-mono mt-0.5 ${themeMode === "light" ? "text-slate-600" : "text-slate-400"}`} id="app-status-indicator">
                جلسة العمل: مساحة الطالب الأكاديمية • {activeLessonId ? `تعليم موجه ومبني على الأهداف` : `دراسة حرة (تحكم كامل وبحث حر)`}
              </p>
            </div>
          </div>
        </div>

        {/* Dynamic Achievements & Stats Counter */}
        <div className="flex items-center gap-2 md:gap-3 flex-wrap justify-center w-full md:w-auto" id="header-stats-panel">
          
          {/* Points Counter */}
          <div className="glass-card px-3 py-1.5 rounded-xl flex items-center gap-2" id="score-counter-box">
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></div>
            <div className="text-right">
              <div className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">النقاط الأكاديمية</div>
              <div className="text-xs font-mono font-bold text-amber-400" id="student-score-val">{userStats.scorePoints} XP</div>
            </div>
          </div>

          {/* Badges Earned */}
          <div className="glass-card px-3 py-1.5 rounded-xl flex items-center gap-2" id="badge-counter-box">
            <Award className="w-4 h-4 text-emerald-400" />
            <div className="text-right">
              <div className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">الأوسمة والشهادات</div>
              <div className="text-xs font-mono font-bold text-emerald-400">{userStats.unlockedBadges.length} / {CHEMISTRY_BADGES.length}</div>
            </div>
          </div>

          {/* Header Controls: Sound, Volume, Theme */}
          <div className="flex items-center gap-1.5 glass-card p-1 rounded-xl relative">
            <button 
              onClick={() => setSynthSoundEnabled(!synthSoundEnabled)} 
              title={synthSoundEnabled ? "كتم المؤثرات الصوتية" : "تشغيل المؤثرات الصوتية"}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${synthSoundEnabled ? "text-indigo-400 bg-indigo-500/15" : "text-slate-400 hover:text-slate-200"}`}
              id="sound-toggle-btn"
            >
              {synthSoundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button 
              onClick={() => setShowVolumeControls(!showVolumeControls)} 
              title="التحكم بمستوى الصوت للمؤثرات"
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${showVolumeControls ? "text-cyan-400 bg-cyan-500/15" : "text-slate-400 hover:text-slate-200"}`}
              id="volume-sliders-toggle-btn"
            >
              <Sliders className="w-4 h-4" />
            </button>
            <button
              onClick={toggleThemeMode}
              title={themeMode === "dark" ? "التحويل للوضع النهاري الناصع" : "التحويل للوضع الليلي المستقبلي"}
              className="p-1.5 rounded-lg text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 transition-all cursor-pointer"
              id="theme-toggle-btn"
            >
              {themeMode === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4 text-indigo-400" />}
            </button>

            {/* Volume settings dropdown card */}
            {showVolumeControls && (
              <>
                {/* Mobile absolute/fixed full-page click-away backdrop to prevent click leakage and ensure top display */}
                <div 
                  className="fixed inset-0 z-40 bg-black/70 backdrop-blur-xs md:hidden"
                  onClick={() => setShowVolumeControls(false)}
                />
                <div 
                  className="fixed inset-x-4 top-24 z-50 mx-auto max-w-sm bg-slate-950 border-2 border-cyan-400 rounded-2xl p-5 shadow-[0_0_50px_rgba(0,0,0,0.95),0_0_20px_rgba(6,182,212,0.3)] text-right animate-fade-in backdrop-blur-md md:absolute md:inset-auto md:top-12 md:left-0 md:mx-0 md:w-72 md:border-2 md:border-slate-500 md:p-4 md:rounded-xl md:shadow-[0_0_30px_rgba(0,0,0,0.85),0_0_15px_rgba(6,182,212,0.15)]"
                  id="volume-controls-menu"
                  style={{ direction: "rtl" }}
                >
                  <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2">
                    <h4 className="text-xs font-extra-bold text-white tracking-wide">التحكم بمستوى المؤثرات</h4>
                    <button 
                      onClick={() => setShowVolumeControls(false)}
                      className="text-slate-350 hover:text-white bg-slate-800 hover:bg-slate-700 p-1 rounded-md transition-colors"
                      aria-label="إغلاق نافذة التحكم"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                <div className="space-y-4">
                  {/* Category 1: Gas & Sizzle */}
                  <div>
                    <div className="flex justify-between text-[11px] mb-1 flex-row-reverse">
                      <span className="text-white font-bold">تفاعلات الغاز والصفير</span>
                      <span className="text-cyan-300 font-mono font-bold bg-cyan-950/60 px-1.5 py-0.2 rounded border border-cyan-800/40">{(effectVolumes.fizzSizzle * 100).toFixed(0)}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="1" 
                      step="0.05"
                      value={effectVolumes.fizzSizzle}
                      onChange={(e) => updateVolume("fizzSizzle", parseFloat(e.target.value))}
                      className="w-full h-1 bg-slate-850 border border-slate-700/60 rounded-lg appearance-none cursor-pointer accent-cyan-400 font-sans"
                    />
                  </div>

                  {/* Category 2: Explosions & Shakes */}
                  <div>
                    <div className="flex justify-between text-[11px] mb-1 flex-row-reverse">
                      <span className="text-white font-bold">أصوات الانفجارات والمخاطر</span>
                      <span className="text-orange-300 font-mono font-bold bg-orange-950/60 px-1.5 py-0.2 rounded border border-orange-800/40">{(effectVolumes.explosionShake * 100).toFixed(0)}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="1" 
                      step="0.05"
                      value={effectVolumes.explosionShake}
                      onChange={(e) => updateVolume("explosionShake", parseFloat(e.target.value))}
                      className="w-full h-1 bg-slate-850 border border-slate-700/60 rounded-lg appearance-none cursor-pointer accent-orange-400 font-sans"
                    />
                  </div>

                  {/* Category 3: System sound UI */}
                  <div>
                    <div className="flex justify-between text-[11px] mb-1 flex-row-reverse">
                      <span className="text-white font-bold">النقرات وواجهة المستخدم</span>
                      <span className="text-indigo-300 font-mono font-bold bg-indigo-950/60 px-1.5 py-0.2 rounded border border-indigo-805/40">{(effectVolumes.system * 100).toFixed(0)}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="1" 
                      step="0.05"
                      value={effectVolumes.system}
                      onChange={(e) => updateVolume("system", parseFloat(e.target.value))}
                      className="w-full h-1 bg-slate-850 border border-slate-700/60 rounded-lg appearance-none cursor-pointer accent-indigo-400 font-sans"
                    />
                  </div>

                  {/* Category 4: Achievements & Reaction Completion */}
                  <div>
                    <div className="flex justify-between text-[11px] mb-1 flex-row-reverse">
                      <span className="text-white font-bold">النجاح واكتمال النواتج</span>
                      <span className="text-emerald-350 font-mono font-bold bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-805/40">{(effectVolumes.achievement * 100).toFixed(0)}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="1" 
                      step="0.05"
                      value={effectVolumes.achievement}
                      onChange={(e) => updateVolume("achievement", parseFloat(e.target.value))}
                      className="w-full h-1 bg-slate-850 border border-slate-700/60 rounded-lg appearance-none cursor-pointer accent-emerald-400 font-sans"
                    />
                  </div>
                </div>

                <div className="mt-3 border-t border-white/10 pt-2.5 flex justify-between items-center text-[10px] flex-row-reverse">
                  <button 
                    onClick={() => {
                      playSynthSound("completion");
                    }}
                    className="text-emerald-300 hover:text-emerald-250 bg-emerald-950 hover:bg-emerald-900 border border-emerald-805/50 px-2.5 py-1 rounded font-bold transition-all shadow-sm"
                  >
                    تجربة نغمة الاكتمال ♪
                  </button>
                  <span className="text-[10px] text-slate-350 font-medium">ميزة المختبر الرقمي الفردي</span>
                </div>
              </div>
              </>
            )}
          </div>

          <button 
            onClick={handleClearBeaker} 
            className="px-3.5 py-1.5 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold rounded-lg hover:bg-rose-500/20 active:scale-95 transition-all"
            id="emergency-clear-btn"
          >
            تطهير الدورق الزجاجي
          </button>
        </div>
      </nav>

      {/* Mobile Top iPad-Style Status Banner */}
      <div className="md:hidden bg-[#0A0A0D] border-b border-white/10 px-3 py-1.5 flex items-center justify-between text-[10px] font-mono flex-row-reverse text-slate-400 select-none shadow-md">
        <div className="flex items-center gap-2 flex-row-reverse">
          <span className="text-cyan-400 font-bold">🧪 مختبر الكيمياء الافتراضي (iPad Touch)</span>
          <span className="bg-white/5 px-1.5 py-0.5 rounded text-[9px] text-slate-300">
            {activeMobileView === "chemicals" ? "1/3 المواد" : activeMobileView === "reactor" ? "2/3 المفاعل" : "3/3 التحليل"}
          </span>
        </div>

        {/* Indicator dots for swiping between panels */}
        <div className="flex items-center gap-1.5 flex-row-reverse">
          <button 
            onClick={() => scrollToMobileView("chemicals")}
            className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${activeMobileView === "chemicals" ? "bg-cyan-400 scale-125 shadow-[0_0_8px_#22d3ee]" : "bg-white/20"}`}
            title="المواد والكواشف"
          />
          <button 
            onClick={() => scrollToMobileView("reactor")}
            className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${activeMobileView === "reactor" ? "bg-indigo-400 scale-125 shadow-[0_0_8px_#818cf8]" : "bg-white/20"}`}
            title="المفاعل الزجاجي"
          />
          <button 
            onClick={() => scrollToMobileView("results")}
            className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${activeMobileView === "results" ? "bg-emerald-400 scale-125 shadow-[0_0_8px_#34d399]" : "bg-white/20"}`}
            title="نتائج التحليل"
          />
        </div>
      </div>

      {/* Workspace Core Area */}
      <div 
        ref={mobileScrollContainerRef}
        onScroll={handleMobileScroll}
        className="flex-1 flex flex-row overflow-x-auto md:overflow-hidden snap-x snap-mandatory scroll-smooth w-full min-h-[500px] pb-16 md:pb-0 scrollbar-none touch-pan-x bg-[#0a0a0c]" 
        id="workspace-main-panel"
      >
        
        {/* Left Drawer Shelf: Chemical Selection & Custom Formula Creator */}
        <aside className="w-full md:w-80 flex-shrink-0 snap-center border-b md:border-b-0 md:border-l border-white/10 bg-[#0E0E11] p-3.5 sm:p-4 flex flex-col gap-4 overflow-y-auto h-full" id="left-shelf">
          
          {/* Periodic Table & University Tools Buttons */}
          <div className="flex flex-col gap-2" id="shelf-academic-tools">
            <button
              onClick={() => {
                setIsPeriodicModalOpen(true);
                setSelectedElement(PERIODIC_ELEMENTS[0]); // Default selection is Hydrogen
                playSynthSound("beep");
              }}
              className="w-full py-2.5 px-3 bg-gradient-to-r from-indigo-900 to-indigo-950 border border-indigo-500/35 hover:border-indigo-500/60 rounded-xl text-xs font-bold text-indigo-200 hover:text-white transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer"
              id="btn-open-periodic-table"
            >
              <span className="text-sm">📊</span>
              تصفح الجدول الدوري للعناصر
            </button>

            <button
              onClick={() => {
                setIsUniversityModalOpen(true);
                playSynthSound("beep");
              }}
              className="w-full py-2.5 px-3 bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 border border-emerald-500/40 hover:border-emerald-400 rounded-xl text-xs font-bold text-emerald-200 hover:text-white transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer"
              id="btn-open-university-tools-shelf"
            >
              <span className="text-sm">🎓</span>
              أجهزة ومعدات المختبر الجامعي
            </button>
          </div>

          <div className="space-y-2">
            <span className="h-0 px-1" />
            <div className="flex justify-between items-center flex-row-reverse">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block" id="database-label">مستودع الكواشف الكيميائية</label>
              <button 
                onClick={() => setShowFormulaCreator(!showFormulaCreator)} 
                className="text-[10px] text-indigo-400 hover:text-indigo-300 hover:underline flex items-center gap-1 font-mono font-bold"
                id="toggle-custom-creator-btn"
              >
                {showFormulaCreator ? "← عرض الرف" : "+ تفصيل مادة مخصصة"}
              </button>
            </div>

            {!showFormulaCreator ? (
              <div className="space-y-2" id="db-shelf-view">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute right-2.5 top-2.5 w-4 h-4 text-slate-500" />
                  <input 
                    type="text" 
                    placeholder="ابحث عن مادة بالاسم أو الصيغة..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pr-9 pl-3 text-xs text-slate-100 placeholder-slate-550 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-right"
                    id="chemical-search-input"
                  />
                  {searchTerm && (
                    <button onClick={() => setSearchTerm("")} className="absolute left-2.5 top-2.5 text-slate-400 text-xs hover:text-white">
                      مسح
                    </button>
                  )}
                </div>

                {/* Filters */}
                <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none flex-row-reverse" id="shelf-filters">
                  {[
                    { id: "all", name: "الكل" },
                    { id: "organic", name: "عضوية وجامعية 🎓" },
                    { id: "acid", name: "أحماض" },
                    { id: "base", name: "قواعد" },
                    { id: "salt", name: "أملاح" },
                    { id: "metal", name: "فلزات" },
                    { id: "indicator", name: "كواشف وتحليل" }
                  ].map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setCategoryFilter(cat.id)}
                      className={`px-2.5 py-1 text-[10px] rounded-md font-medium flex-shrink-0 transition-colors ${
                        categoryFilter === cat.id 
                          ? "bg-indigo-650 text-white border border-indigo-550 shadow-md font-bold" 
                          : "bg-white/5 text-slate-400 border border-transparent hover:bg-white/10 hover:text-slate-200"
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>

                {/* Chemical Shelf Scroll Layout */}
                <div className="space-y-1.5 max-h-[200px] md:max-h-[290px] overflow-y-auto pl-1" id="shelf-chemical-list">
                  {filteredChemicals.length === 0 ? (
                    <div className="p-6 text-center text-slate-500 text-xs font-mono" id="no-chemicals-msg">
                      لا تتوفر مواد تطابق بحثك حالياً. يمكنك تفصيل مادة مخصصة جديدة من رابط 'تفصيل مادة مخصصة'.
                    </div>
                  ) : (
                    filteredChemicals.map(chem => {
                      const isSelected = selectedReactants.some(r => r.id === chem.id);
                      return (
                        <div 
                          key={chem.id}
                          onClick={() => handleSelectChemical(chem)}
                          className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer hover:border-indigo-550 active:scale-98 transition-all group flex-row-reverse ${
                            isSelected 
                              ? "bg-indigo-500/15 border-indigo-500/40 opacity-70" 
                              : "bg-white/5 border-white/5 hover:bg-white/10"
                          }`}
                          title={`انقر لصب المادة في الدورق الزجاجي: ${chem.description}`}
                        >
                          <div className="flex flex-col text-right">
                            <div className="flex items-center gap-1.5 flex-row-reverse">
                              <span className="text-xs text-white font-medium group-hover:text-indigo-300 transition-colors">{chem.name}</span>
                              <span className="text-[10px] text-slate-400 font-mono font-bold bg-white/5 px-1 py-0.2 rounded" dir="ltr">{chem.formula}</span>
                            </div>
                            <span className="text-[10px] text-slate-500 mt-0.5 line-clamp-1 text-right">{chem.description}</span>
                          </div>

                          <div className="flex items-center gap-1.5 flex-shrink-0 flex-row-reverse">
                            <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider ${
                              chem.category === "acid" ? "bg-red-500/15 text-red-400 border border-red-500/20" :
                              chem.category === "base" ? "bg-pink-500/15 text-pink-400 border border-pink-500/20" :
                              chem.category === "salt" ? "bg-slate-500/15 text-slate-300 border border-slate-500/20" :
                              chem.category === "metal" ? "bg-indigo-500/15 text-indigo-400 border border-indigo-505/20" :
                              chem.category === "indicator" ? "bg-purple-500/15 text-purple-400 border border-purple-505/20" :
                              "bg-slate-800 text-slate-400"
                            }`}>
                              {chem.category === "acid" ? "حمض" :
                               chem.category === "base" ? "قاعدة" :
                               chem.category === "salt" ? "ملح" :
                               chem.category === "metal" ? "فلز" :
                               chem.category === "indicator" ? "كاشف" : "آخر"}
                            </span>
                            <Plus className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-colors" />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            ) : (
              // Custom Chemical Creator Card
              <div className="space-y-3 bg-[#131117] p-3 rounded-xl border border-white/10" id="custom-creator-card">
                <div className="flex justify-between items-center flex-row-reverse">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 flex-row-reverse">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                    تصميم كاشف مخصص
                  </h3>
                  <button onClick={() => setShowFormulaCreator(false)} className="text-slate-405 hover:text-white">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                
                <p className="text-[10px] text-slate-400 leading-relaxed font-mono text-right">
                  صمم الصيغة الجزيئية وعيّر الرقم الهيدروجيني بدقة، وسيتولى الذكاء الاصطناعي من Google Gemini حساب التفاعلات الذرية وحل النواتج.
                </p>

                <div className="space-y-2 text-right">
                  <div>
                    <label className="text-[9px] uppercase font-bold text-slate-550 block">اسم المادة باللغة العربية</label>
                    <input 
                      type="text" 
                      placeholder="مثال: يودات الصوديوم" 
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs mt-1 text-white text-right focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] uppercase font-bold text-slate-550 block">الصيغة الجزيئية الكيميائية (مترابطة)</label>
                    <input 
                      type="text" 
                      placeholder="e.g. NaIO₃" 
                      value={customFormula}
                      onChange={(e) => setCustomFormula(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs mt-1 text-white font-mono focus:outline-none focus:border-indigo-550 text-left"
                      dir="ltr"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center flex-row-reverse">
                      <label className="text-[9px] uppercase font-bold text-slate-550">مستوى الرقم الهيدروجيني (pH)</label>
                      <span className="text-[10px] text-indigo-400 font-bold font-mono">pH: {customPh}</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="14" 
                      step="0.5"
                      value={customPh}
                      onChange={(e) => setCustomPh(parseFloat(e.target.value))}
                      className="w-full accent-indigo-550 mt-1 cursor-pointer"
                    />
                    <div className="flex justify-between text-[8px] text-slate-600 font-mono flex-row-reverse">
                      <span>0.0 (حمض قوي)</span>
                      <span>7.0 (تعادل تام)</span>
                      <span>14.0 (قاعدة كاوية)</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-[9px] uppercase font-bold text-slate-550 block">تصنيف الكاشف الفرعي</label>
                    <select 
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value as Chemical["category"])}
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs mt-1 text-white text-right focus:outline-none focus:border-indigo-500"
                    >
                      <option value="acid" className="bg-[#0e0e11]">حمض (Acid)</option>
                      <option value="base" className="bg-[#0e0e11]">قاعدة (Base)</option>
                      <option value="salt" className="bg-[#0e0e11]">ملح ذائب (Salt)</option>
                      <option value="metal" className="bg-[#0e0e11]">فلز فعال (Active Metal)</option>
                      <option value="indicator" className="bg-[#0e0e11]">صبغة كاشف ألوان (Indicator)</option>
                      <option value="organic" className="bg-[#0e0e11]">مركب عضوي (Organic)</option>
                    </select>
                  </div>
                </div>

                <div className="pt-1.5">
                  <button 
                    onClick={handleCreateCustomChemical}
                    className="w-full py-2 bg-indigo-650 hover:bg-indigo-555 text-white rounded-lg text-xs font-bold uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    تسجيل المادة في مستودع المختبر
                  </button>
                </div>
              </div>
            )}
          </div>

          <hr className="border-white/5 my-1" />

          {/* Workbench Beaker Rack showing chemicals currently placed inside beaker */}
          <div className="flex-1 flex flex-col justify-end gap-2 text-left" id="beaker-rack-section">
            <div className="flex justify-between items-center flex-row-reverse">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">دورق المحاليل قيد الفحص</label>
              <span className="text-[10px] text-slate-500 font-mono px-1.5 py-0.2 rounded bg-white/5" dir="ltr">{selectedReactants.length} / 3 المواد مصبوبة</span>
            </div>

            <div className="space-y-1 bg-black/35 p-2.5 rounded-xl border border-white/5 min-h-[140px] flex flex-col justify-center gap-2" id="selected-reactants-rack">
              {selectedReactants.length === 0 ? (
                <div className="text-center text-slate-500 text-xs py-10 font-mono" id="empty-rack-msg">
                  <div className="text-xl mb-2 opacity-30 animate-bounce">🧪</div>
                  الدورق الزجاجي فارغ الآن.<br />
                  انقر على الكواشف من الرف لصبها هنا بالترتيب.
                </div>
              ) : (
                selectedReactants.map(reactant => (
                  <div 
                    key={reactant.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-[#141419] border border-white/10 hover:border-rose-500/40 transition-all flex-row-reverse group"
                    id={`rack-chem-${reactant.id}`}
                  >
                    <div className="flex items-center gap-2 flex-row-reverse">
                      <div className={`w-3 h-3 rounded-full ${
                        reactant.category === "acid" ? "bg-red-400 shadow-md shadow-red-500/20" :
                        reactant.category === "base" ? "bg-pink-400 shadow-md shadow-pink-500/20" :
                        reactant.category === "salt" ? "bg-sky-400 shadow-md shadow-sky-505/20" :
                        reactant.category === "metal" ? "bg-amber-400 shadow-md shadow-amber-500/20 animate-pulse" :
                        "bg-white"
                      }`}></div>
                      <div className="flex flex-col text-right">
                        <span className="text-xs text-white font-medium">{reactant.name}</span>
                        <span className="text-[9px] text-slate-500 font-mono font-bold leading-none mt-0.5 text-right" dir="ltr">{reactant.formula}</span>
                      </div>
                    </div>

                    <button 
                      onClick={() => handleRemoveReactant(reactant.id)}
                      className="p-1 text-slate-400 hover:text-rose-450 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all rounded cursor-pointer"
                      title="سحب وإلغاء صب المادة من Beaker"
                      id={`remove-rack-${reactant.id}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* General Domestic Household Safety alert block based on active selection */}
            {selectedReactants.some(r => r.id === "naclo") && selectedReactants.some(r => r.id === "nh3") && (
              <div className="p-3 bg-red-950/40 border border-red-500/30 rounded-xl flex items-start gap-2 animate-pulse flex-row-reverse" id="warning-bleach-ammonia">
                <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" id="danger-sign" />
                <div className="text-right">
                  <h4 className="text-[10px] font-bold text-red-400 uppercase tracking-wider">تحذير أمني شديد الخطورة</h4>
                  <p className="text-[10px] text-red-200 leading-relaxed">
                    خلط هيبوكلوريت الصوديومNaClO (المبيض) مع الأمونياNH₃ (المطهر) يحرر غاز الكلورامين السام والقاتل للاختناق!
                  </p>
                </div>
              </div>
            )}
            
            {selectedReactants.some(r => r.id === "na_metal") && selectedReactants.some(r => r.id === "h2o") && (
              <div className="p-3 bg-red-950/40 border border-red-505/30 rounded-xl flex items-start gap-2 animate-pulse flex-row-reverse mx-0.5" id="warning-sodium-water">
                <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 animate-bounce mt-0.5" id="danger-sign-na" />
                <div className="text-right">
                  <h4 className="text-[10px] font-bold text-red-400 uppercase tracking-wide">تفاعل قنبلة الصوديوم الهيدروجينية</h4>
                  <p className="text-[10px] text-red-200 leading-relaxed">
                    ملامسة معدن الصوديوم الصلب النشط للماء المقطر تطلق تعادلاً طارداً وقوياً يسبب اشتعالاً فجائياً لغاز الهيدروجين الحتمي!
                  </p>
                </div>
              </div>
            )}
            
            <div className="p-2.5 rounded-lg bg-orange-500/5 border border-orange-550/25 flex items-start gap-2 shadow-inner flex-row-reverse" id="safety-alert">
              <span className="text-orange-400 text-xs flex-shrink-0 mt-0.5">⚠️</span>
              <p className="text-[9px] text-orange-400 font-mono leading-relaxed text-right" id="lab-safety-rules">
                <b className="uppercase text-orange-300">إرشادات الأمان الرقمي:</b> الأحماض القوية والمعادن الثقيلة تتفاعل بتآكل هائل. احرص على تفعيل إجراءات السلامة وتحليل النواتج.
              </p>
            </div>
          </div>
        </aside>

        {/* Center Section: Main Interactive Lab Bench Reaction Vessel Simulation */}
        <main className="w-full md:flex-1 flex-shrink-0 snap-center bg-gradient-to-b from-[#111115] to-[#0A0A0B] flex flex-col items-center justify-between p-3 sm:p-4 relative overflow-y-auto h-full" id="reactor-bench">
          
          {/* Reaction environment context indices floating on left */}
          <div className="absolute top-4 right-4 space-y-1.5 text-right pointer-events-none z-10" id="chamber-labels">
            <div className="flex items-center gap-2 flex-row-reverse justify-end">
              <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></div>
              <span className="text-[9px] text-slate-500 font-mono font-bold">الضغط الجوي للغرفة: 1.018 ATM</span>
            </div>
            <div className="flex items-center gap-2 flex-row-reverse justify-end">
              <div className="w-2.5 h-2.5 rounded-full bg-indigo-505 animate-ping"></div>
              <span className="text-[9px] text-slate-500 font-mono font-bold">درجة حرارة البيئة: 24.8 °C</span>
            </div>
            {activeReaction && (
              <div className="flex items-center gap-2 flex-row-reverse justify-end" id="prediction-source-pill">
                <div className={`w-2.5 h-2.5 rounded-full ${predictionSource === 'ai' ? 'bg-blue-400 animate-pulse' : 'bg-emerald-500'}`}></div>
                <span className="text-[9px] text-slate-300 font-mono font-bold bg-white/5 px-2 py-0.5 rounded border border-white/5">
                  خوارزمية التوقع: {predictionSource === 'preset' ? 'النموذج المثبت بالمركز' : predictionSource === 'ai' ? 'سحابة الذكاء الاصطناعي الذري' : 'توقع فرضي تقريبي'}
                </span>
              </div>
            )}
          </div>

          <div className="absolute top-4 left-4 flex flex-col gap-2 z-15" id="beaker-indicators">
            {/* Thermometer scale */}
            <div className="flex items-center gap-2 bg-black/45 px-3 py-1.5 rounded-xl border border-white/5 shadow-2xl flex-row-reverse">
              <Thermometer className={`w-4 h-4 ${currentTemp > 45 ? 'text-red-400 animate-pulse' : 'text-cyan-400'}`} />
              <div className="text-right">
                <span className="text-[9px] uppercase text-slate-500 font-bold block">ميزان حرارة الكأس</span>
                <span className={`text-sm font-mono font-bold block ${currentTemp > 45 ? 'text-red-400' : 'text-slate-100'}`} dir="ltr">
                  {currentTemp} °C
                </span>
              </div>
            </div>

            {/* Bubble customizer panel */}
            {selectedReactants.length > 0 && (
              <div className="bg-black/60 backdrop-blur-md p-3 rounded-xl border border-white/10 shadow-2xl text-right w-48 space-y-2.5 animate-fade-in" id="bubble-control-card">
                <div className="flex justify-between items-center border-b border-white/5 pb-1 flex-row-reverse">
                  <span className="text-[10px] font-bold text-slate-350 flex items-center gap-1 flex-row-reverse">
                    <span className="animate-bounce">🫧</span> فقاعات غاز التفاعل
                  </span>
                  {activeReaction && (
                    <span className="text-[8px] px-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded font-mono">
                      {activeReaction.reactionType}
                    </span>
                  )}
                </div>

                {/* Bubble speed and volume indicators */}
                <div className="space-y-1 text-[9px] font-mono text-slate-400 bg-white/5 p-1.5 rounded">
                  <div className="flex justify-between items-center flex-row-reverse text-right">
                    <span>درجة غليان التفاعل:</span>
                    <span className="text-slate-200 font-bold">
                      {activeReaction ? (
                        activeReaction.reactionType === "dangerous" ? "عنيفة للغاية 🔥" :
                        activeReaction.reactionType === "exothermic" ? "غاز متصاعد نشط ⚡" :
                        activeReaction.reactionType === "gas-release" ? "طرد غازي مكثف 💨" :
                        "تفاعل هادئ 🌱"
                      ) : currentTemp > 60 ? "غليان حراري 🌡️" : "مستقر"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center flex-row-reverse text-right">
                    <span>سرعة الفقاعات:</span>
                    <span className="text-cyan-400 font-bold" dir="ltr">
                      {getBubbleSpeedAndDensity().speed === "0.7s" ? "سريع جداً" :
                       getBubbleSpeedAndDensity().speed === "0.5s" || getBubbleSpeedAndDensity().speed === "0.6s" ? "مفرط الغليان" :
                       getBubbleSpeedAndDensity().speed === "0.9s" || getBubbleSpeedAndDensity().speed === "1.0s" || getBubbleSpeedAndDensity().speed === "1.3s" ? "نشط" : 
                       getBubbleSpeedAndDensity().speed === "1.4s" || getBubbleSpeedAndDensity().speed === "1.6s" || getBubbleSpeedAndDensity().speed === "1.8s" ? "متوسط" : "بطيء"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center flex-row-reverse text-right">
                    <span>كثافة التدفق (عدد):</span>
                    <span className="text-amber-400 font-bold">
                      {getBubbleSpeedAndDensity().count > 25 ? `فوار مكثف (${getBubbleSpeedAndDensity().count})` :
                       getBubbleSpeedAndDensity().count > 10 ? `متوسط النشاط (${getBubbleSpeedAndDensity().count})` : `خفيف (${getBubbleSpeedAndDensity().count})`}
                    </span>
                  </div>
                </div>

                {/* Color option picker */}
                <div className="space-y-1">
                  <span className="text-[8px] text-slate-500 font-bold block">لون فقاعات الغاز:</span>
                  <div className="flex flex-wrap gap-1.5 justify-end" id="bubble-color-selectors">
                    {/* Auto circle option */}
                    <button
                      onClick={() => setBubbleColorOverride("auto")}
                      className={`w-4 h-4 rounded-full border flex items-center justify-center relative cursor-pointer ${
                        bubbleColorOverride === "auto" ? "border-white scale-110" : "border-white/20 hover:border-white/45"
                      }`}
                      style={{
                        background: "linear-gradient(45deg, #ef4444, #3b82f6, #10b981, #f59e0b)"
                      }}
                      title="لون تلقائي ذكي حسب كيمياء المواد"
                    >
                      {bubbleColorOverride === "auto" && <span className="w-1 h-1 bg-white rounded-full"></span>}
                    </button>

                    {/* Blue / Aqua circle */}
                    <button
                      onClick={() => setBubbleColorOverride("rgba(56, 189, 248, 0.75)")}
                      className={`w-4 h-4 rounded-full border flex items-center justify-center relative bg-sky-450 cursor-pointer ${
                        bubbleColorOverride === "rgba(56, 189, 248, 0.75)" ? "border-white scale-110 shadow-lg" : "border-white/20 hover:border-white/45"
                      }`}
                      title="أزرق متعادل (هيدروكسيل/قاعدة)"
                    >
                      {bubbleColorOverride === "rgba(56, 189, 248, 0.75)" && <span className="w-1 h-1 bg-white rounded-full"></span>}
                    </button>

                    {/* Teal / Green circle */}
                    <button
                      onClick={() => setBubbleColorOverride("rgba(20, 184, 166, 0.75)")}
                      className={`w-4 h-4 rounded-full border flex items-center justify-center relative bg-teal-500 cursor-pointer ${
                        bubbleColorOverride === "rgba(20, 184, 166, 0.75)" ? "border-white scale-110 shadow-lg" : "border-white/20 hover:border-white/45"
                      }`}
                      title="أخضر نحاسي / هالوجين"
                    >
                      {bubbleColorOverride === "rgba(20, 184, 166, 0.75)" && <span className="w-1 h-1 bg-white rounded-full"></span>}
                    </button>

                    {/* Purple / Violet circle */}
                    <button
                      onClick={() => setBubbleColorOverride("rgba(168, 85, 247, 0.75)")}
                      className={`w-4 h-4 rounded-full border flex items-center justify-center relative bg-purple-500/70 cursor-pointer ${
                        bubbleColorOverride === "rgba(168, 85, 247, 0.75)" ? "border-white scale-110 shadow-lg" : "border-white/20 hover:border-white/45"
                      }`}
                      title="نترات / بوتاسيوم بنفسجي"
                    >
                      {bubbleColorOverride === "rgba(168, 85, 247, 0.75)" && <span className="w-1 h-1 bg-white rounded-full"></span>}
                    </button>

                    {/* Orange / Amber circle */}
                    <button
                      onClick={() => setBubbleColorOverride("rgba(245, 158, 11, 0.75)")}
                      className={`w-4 h-4 rounded-full border flex items-center justify-center relative bg-amber-500 cursor-pointer ${
                        bubbleColorOverride === "rgba(245, 158, 11, 0.75)" ? "border-white scale-110 shadow-lg" : "border-white/20 hover:border-white/45"
                      }`}
                      title="صوديوم فوار برتقالي"
                    >
                      {bubbleColorOverride === "rgba(245, 158, 11, 0.75)" && <span className="w-1 h-1 bg-white rounded-full"></span>}
                    </button>

                    {/* Red / Magenta circle */}
                    <button
                      onClick={() => setBubbleColorOverride("rgba(239, 68, 68, 0.75)")}
                      className={`w-4 h-4 rounded-full border flex items-center justify-center relative bg-red-500/70 cursor-pointer ${
                        bubbleColorOverride === "rgba(239, 68, 68, 0.75)" ? "border-white scale-110 shadow-lg" : "border-white/20 hover:border-white/45"
                      }`}
                      title="أحمر حامضي متوهج"
                    >
                      {bubbleColorOverride === "rgba(239, 68, 68, 0.75)" && <span className="w-1 h-1 bg-white rounded-full"></span>}
                    </button>

                    {/* White / Translucent circle */}
                    <button
                      onClick={() => setBubbleColorOverride("rgba(255, 255, 255, 0.75)")}
                      className={`w-4 h-4 rounded-full border flex items-center justify-center relative bg-white/40 cursor-pointer ${
                        bubbleColorOverride === "rgba(255, 255, 255, 0.75)" ? "border-white scale-110 shadow-lg" : "border-white/20 hover:border-white/45"
                      }`}
                      title="أبيض بلوري قياسي"
                    >
                      {bubbleColorOverride === "rgba(255, 255, 255, 0.75)" && <span className="w-1 h-1 bg-white rounded-full"></span>}
                    </button>
                  </div>
                </div>

                {/* Viscosity details */}
                <div className="border-t border-white/5 pt-2.5 space-y-1 text-right" id="viscosity-level-display">
                  <div className="flex justify-between items-center flex-row-reverse text-right text-[8.5px] font-bold text-slate-350">
                    <span>💧 لزوجة الخليط والسرعة:</span>
                    <span className="text-emerald-400 font-mono text-[9px]" id="current-viscosity-val">
                      {getFluidViscosity().toFixed(2)} cP
                    </span>
                  </div>
                  <div className="w-full bg-slate-900/80 h-1.5 rounded-full overflow-hidden flex flex-row-reverse border border-white/5">
                    <div 
                      className={`h-full rounded-full transition-all duration-700 ${
                        getFluidViscosity() > 3.0 ? "bg-amber-500 shadow-[0_0_4px_#f59e0b]" :
                        getFluidViscosity() > 1.8 ? "bg-amber-400" : "bg-sky-400"
                      }`}
                      style={{ width: `${Math.max(5, Math.min(((getFluidViscosity() - 1.0) / 4.0) * 100, 100))}%` }}
                    />
                  </div>
                  <p className="text-[7.5px] text-slate-400 leading-normal">
                    {getFluidViscosity() > 3.0 ? "محلول هلامي لزج للغاية؛ تصبح حركة التحرك السفلية والأنوية ثقيلة ومتباطئة." :
                     getFluidViscosity() > 1.8 ? "كثافة مرتفعة ونسبة حركة لزجة معتدلة (انسياب خامل)." : "سائل مائي منخفض اللزوجة (انسياب طبيعي حركي حر)."}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Central Animated Glass Apparatus and Stirrer platform */}
          <div className="flex-1 flex flex-col items-center justify-center p-6 w-full max-w-md relative" id="beaker-visualizer">
            
            {/* Dynamic temperature glow reflections */}
            {currentTemp > 40 && (
              <div className={`absolute select-none pointer-events-none inset-0 w-72 h-72 rounded-full m-auto filter blur-3xl transition-all duration-1000 ${
                currentTemp > 65 ? "bg-red-500/10 animate-pulse" : "bg-orange-500/5"
              }`} id="heating-glow-reflect" />
            )}

            {/* Steam animation triggers above the Beaker when temperature boils */}
            {currentTemp > 38 && (
              <div className="absolute top-[15%] flex justify-center w-full gap-4 max-w-[150px] pointer-events-none z-10" id="steam-container">
                <div className="w-2 h-16 bg-white/20 blur-sm rounded-full animate-steam" style={{ animationDelay: "0s" }}></div>
                <div className="w-1.5 h-16 bg-white/10 blur-sm rounded-full animate-steam" style={{ animationDelay: "1.2s" }}></div>
                <div className="w-2.5 h-16 bg-white/15 blur-sm rounded-full animate-steam" style={{ animationDelay: "2s" }}></div>
              </div>
            )}

            {/* The glassware vessel (gorgeous 3D beaker glass look) */}
            <div 
              className={`relative w-56 h-72 md:w-44 md:h-56 border-[6px] md:border-[5px] border-slate-300/40 border-t-0 rounded-b-[50px] md:rounded-b-[42px] flex flex-col justify-end overflow-hidden shadow-inner transition-transform duration-500 ${
                activeReaction?.isDangerous && activeReaction.dangerLevel === "extreme" ? "animate-shake" : ""
              }`}
              id="glass-vessel"
              style={{
                boxShadow: "inset 10px 0px 20px rgba(255,255,255,0.03), inset -10px 0px 20px rgba(0,0,0,0.6)"
              }}
            >
              <div className="absolute inset-0 bg-sky-400/2 leading-none pointer-events-none animate-pulse-glow" style={{ background: "linear-gradient(90deg, rgba(255,255,255,0.06), transparent 30%, transparent 70%, rgba(255,255,255,0.06))" }}></div>

              {/* Liquid fluid surface */}
              {selectedReactants.length > 0 && (
                <div 
                  className="w-full relative transition-all duration-1000 origin-bottom"
                  style={{ 
                    height: `${Math.min(25 + selectedReactants.length * 15, 80)}%`,
                    backgroundColor: getFluidColor(),
                    animation: isStirring && stirSpeed > 0
                      ? `fluid-viscous-stir ${(Math.max(1, 6 / (stirSpeed / 120)) * getFluidViscosity()).toFixed(2)}s ease-in-out infinite`
                      : 'none',
                    transformOrigin: 'bottom center'
                  }}
                  id="beaker-fluid-mass"
                >
                  {/* Fluid level crown reflection */}
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-white/40 blur-[1px] shadow-lg"></div>

                  {/* Molecular particle collision physics animation */}
                  <MolecularSimulationCanvas 
                    reactants={selectedReactants}
                    activeReaction={activeReaction}
                    isReactionPlaying={isReactionPlaying}
                    reactionProgress={reactionProgress}
                    stirSpeed={stirSpeed}
                    isStirring={isStirring}
                  />

                  {/* Laser glow effect for violent redox reactions representing electron transfers */}
                  <LaserGlowCanvas
                    activeReaction={activeReaction}
                    isReactionPlaying={isReactionPlaying}
                    reactionProgress={reactionProgress}
                    selectedReactants={selectedReactants}
                  />

                  {/* Gas Bubbles rendering */}
                  {getBubbleSpeedAndDensity().count > 0 && (
                    <div className="absolute inset-0 overflow-hidden text-right animate-fade-in" id="liquid-bubbles">
                      {Array.from({ length: getBubbleSpeedAndDensity().count }).map((_, index) => {
                        const { speed } = getBubbleSpeedAndDensity();
                        const isHydrogenReaction = getIsActiveMetalAndAcid();
                        // Nicely distribute positions so bubbles are staggered beautifully
                        const leftPercent = isHydrogenReaction 
                          ? (index * 47) % 88 + 6 // focus more centrally/evenly throughout base
                          : (index * 79 + 11) % 85;
                        const delaySecs = isHydrogenReaction 
                          ? (index * 0.015).toFixed(3) // super high frequency stagger for high density
                          : (index * 0.12).toFixed(2);
                        // Shift individual bubble speed slightly so they rise at slightly offset paces
                        const viscosityVal = getFluidViscosity();
                        const speedSecs = isHydrogenReaction
                          ? (0.35 + (index % 6) * 0.06).toFixed(2) + "s" // very fast ascending pace
                          : (parseFloat(speed) * (0.8 + (index % 5) * 0.1) * (0.4 + viscosityVal * 0.6)).toFixed(2) + "s";
                        
                        const sizePx = isHydrogenReaction
                          ? (index % 3) * 0.6 + 1.25 // extremely fine bubbles: 1.25px, 1.85px, 2.45px
                          : ((index * 3) % 4) + 4; // varied sizes: 4px, 5px, 6px, 7px
                        
                        const driftValue = isHydrogenReaction
                          ? `${((index % 3) - 1) * 1.5}px` // vertical rise (little to no horizontal drift)
                          : (index * 13 % 24) - 12 + "px";
                        
                        const customColor = getBubbleColor();

                        return (
                          <div
                            key={index}
                            className={`absolute rounded-full ${isHydrogenReaction ? "animate-hydrogen-bubble" : "animate-bubble"}`}
                            style={{
                              bottom: isHydrogenReaction 
                                ? `${(index * 2) % 6}px` // start exactly at the nucleation bottom surface
                                : `${(index * 17 + 3) % 25}px`,
                              left: `${leftPercent}%`,
                              width: `${sizePx}px`,
                              height: `${sizePx}px`,
                              backgroundColor: customColor,
                              animationDelay: `${delaySecs}s`,
                              animationDuration: speedSecs,
                              boxShadow: isHydrogenReaction 
                                ? `0 0 4px 1px ${customColor}` // faint glow around each micro bubble
                                : `0 0 6px ${customColor}`,
                              "--bubble-drift": driftValue
                            } as any}
                          />
                        );
                      })}
                    </div>
                  )}

                  {/* Faint base glow representing active Hydrogen gas nucleation zone */}
                  {getIsActiveMetalAndAcid() && (
                    <div 
                      className="absolute bottom-0 left-[5%] right-[5%] h-5 bg-gradient-to-t from-white/30 to-transparent blur-[2.5px] rounded-b-[42px] pointer-events-none animate-pulse z-0" 
                      style={{ 
                        boxShadow: `0 -4px 12px 2px ${getBubbleColor()}`,
                        opacity: 0.6,
                        mixBlendMode: "screen"
                      }}
                      id="hydrogen-base-glow"
                    />
                  )}

                  {/* Precipitate layer settling to the bottom */}
                  {activeReaction?.hasPrecipitate && (
                    <div 
                      className="absolute bottom-0 left-0 right-0 h-4 rounded-b-[38px] transition-all duration-[2000ms] animate-pulse"
                      style={{ backgroundColor: activeReaction.precipitateColor || "rgba(255, 255, 255, 0.75)" }}
                      id="beaker-precipitate-sediment"
                    />
                  )}

                  {/* Vortex swirl lines reflecting active stirring speed */}
                  {isStirring && stirSpeed > 0 && (
                    <div 
                      className="absolute left-1/2 top-4 border border-white/20 rounded-full animate-spin flex items-center justify-center -translate-x-1/2 font-sans"
                      style={{ 
                        animationDuration: `${(Math.max(2.5 - stirSpeed / 400, 0.3) * (0.35 + getFluidViscosity() * 0.65)).toFixed(2)}s`,
                        height: `${Math.max(20, 64 - (getFluidViscosity() - 1.0) * 10)}px`,
                        width: `${Math.max(16, 40 + (getFluidViscosity() - 1.0) * 8)}px`
                      }}
                      id="stirring-vortex"
                    >
                      <div className="w-4 h-10 border-l border-white/10 rounded-full"></div>
                    </div>
                  )}
                </div>
              )}

              {/* Glass measurement markings */}
              <div className="absolute right-2.5 top-8 bottom-4 flex flex-col justify-between text-[8px] text-slate-500 font-mono pointer-events-none select-none text-right">
                <div className="flex items-center gap-1 flex-row-reverse">
                  <span className="w-4 h-0.5 bg-slate-500/50"></span>
                  <span>250 mL</span>
                </div>
                <div className="flex items-center gap-1 flex-row-reverse">
                  <span className="w-2.5 h-0.5 bg-slate-500/30"></span>
                  <span>200 mL</span>
                </div>
                <div className="flex items-center gap-1 flex-row-reverse">
                  <span className="w-4 h-0.5 bg-slate-500/50"></span>
                  <span>150 mL</span>
                </div>
                <div className="flex items-center gap-1 flex-row-reverse">
                  <span className="w-2.5 h-0.5 bg-slate-500/30"></span>
                  <span>100 mL</span>
                </div>
                <div className="flex items-center gap-1 flex-row-reverse">
                  <span className="w-4 h-0.5 bg-slate-500/50"></span>
                  <span>50 mL</span>
                </div>
              </div>
            </div>

            {/* Spark Flame combustion color representation */}
            {activeReaction?.flameColor && activeReaction.flameColor !== "none" && (
              <div className="absolute -top-[10%] z-20 flex flex-col items-center animate-bounce" id="chemical-flame-combust">
                <Flame className={`w-14 h-14 ${
                  activeReaction.flameColor === "yellow" ? "text-amber-400" :
                  activeReaction.flameColor === "blue" ? "text-cyan-400" :
                  activeReaction.flameColor === "green" ? "text-emerald-400" :
                  activeReaction.flameColor === "purple" ? "text-purple-400" :
                  activeReaction.flameColor === "red" ? "text-red-500" :
                  "text-indigo-400"
                } drop-shadow-[0_0_15px_currentColor]`} />
                <span className="text-[8px] bg-black/60 px-1.5 py-0.5 rounded font-mono font-bold tracking-wider text-white">
                  وهج لهب: {activeReaction.flameColor}
                </span>
              </div>
            )}

            {/* Smoke and fog/steam visual simulation overlay */}
            <SmokeSimulationCanvas 
              activeReaction={activeReaction}
              isReactionPlaying={isReactionPlaying}
              reactionProgress={reactionProgress}
              currentTemp={currentTemp}
              selectedReactants={selectedReactants}
            />

            {/* Stirrer and Hot Heater Plate platform assembly */}
            <div className="w-56 h-8 bg-slate-800 rounded-t-2xl border-t border-slate-700 shadow-2xl relative flex items-center justify-between px-4 flex-row-reverse" id="stirrer-hotplate">
              {/* LED status indicator lamps */}
              <div className="flex gap-1.5 flex-row-reverse">
                <div className={`w-2 h-2 rounded-full ${isStirring ? "bg-emerald-400 shadow-md shadow-emerald-400/50 animate-pulse" : "bg-slate-600"}`}></div>
                <div className={`w-2 h-2 rounded-full ${heatIntensity > 0 ? "bg-red-400 shadow-md shadow-red-400/50 animate-pulse" : "bg-slate-600"}`}></div>
              </div>
              
              <div className="text-[8px] text-slate-500 font-mono text-center select-none tracking-widest uppercase">
                محلل كينتيكا ومحرك الخلط المستمر
              </div>

              <div className="w-7 h-3 bg-black/45 rounded font-mono text-[8px] text-indigo-400 text-center leading-normal">
                {isStirring ? "نشط" : "خامل"}
              </div>
            </div>
            
            {/* Lower pedestal base deck */}
            <div className="w-60 h-3 bg-slate-900 border-t border-white/5 rounded-b-xl shadow-xl"></div>
          </div>

          {/* Interactive Guided Lesson Current Objective Frame if active */}
          {activeLessonId && (
            <div className="w-full bg-[#131118]/95 border border-indigo-500/20 p-4 rounded-xl text-right scale-98 hover:scale-100 transition-all shadow-xl" id="guided-lesson-dock animate-pulse">
              {(() => {
                const lesson = EXPERIMENT_LESSONS.find(l => l.id === activeLessonId);
                if (!lesson) return null;
                const isStepComplete = lessonStepIndex >= lesson.steps.length;
                return (
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 flex-row-reverse">
                    <div className="space-y-1 text-right w-full">
                      <div className="flex items-center gap-2 flex-row-reverse">
                        <BookOpen className="w-4 h-4 text-indigo-400" />
                        <h4 className="text-white text-xs font-bold uppercase tracking-wider">{lesson.title} :الدرس العملي الموجه</h4>
                      </div>
                      
                      {!isStepComplete ? (
                        <p className="text-xs text-slate-300 font-mono mt-1 leading-relaxed text-right">
                          <b>الخطوة {lessonStepIndex + 1}:</b> {lesson.steps[lessonStepIndex]?.instruction}
                        </p>
                      ) : (
                        <div className="space-y-1 text-right">
                          <p className="text-xs text-yellow-400 font-mono font-bold flex items-center gap-1 flex-row-reverse">
                            <CheckCircle className="w-4 h-4 text-emerald-400" /> تمت تلبية جميع الملاحظات والجسيمات الفيزيائية!
                          </p>
                          <p className="text-[11px] text-slate-300 leading-relaxed font-mono">
                            تعلم من التفسير المخبري العام للمكونات، ثم انقر على زر "إجراء اختبار التحصيل العلمي" لإنهاء الدرس وحصد الأوسمة والدرجات.
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 flex-shrink-0 flex-row-reverse w-full md:w-auto">
                      {isStepComplete && !quizFinished && (
                        <button 
                          onClick={startLessonQuiz} 
                          className="px-4 py-2 bg-yellow-500 text-black text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-yellow-400 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                          id="btn-trigger-quiz"
                        >
                          إجراء اختبار التحصيل العلمي
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                      
                      <button 
                        onClick={handleQuitLesson} 
                        className="px-3 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-400 hover:text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
                        id="btn-quit-lesson"
                      >
                        مغادرة الدرس الموجه
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Live Action Chemical Controllers Deck */}
          <footer className="w-full bg-[#0E0E11]/80 backdrop-blur-md border border-white/5 rounded-2xl p-4 flex flex-col md:flex-row items-center gap-6 mt-4 flex-shrink-0" id="lab-control-deck">
            
            {/* Heater Watts Adjuster Slider */}
            <div className="flex-1 w-full flex flex-col gap-1 text-right" id="ctrl-panel-heat">
              <div className="flex justify-between items-center px-1 flex-row-reverse">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1 flex-row-reverse">
                  <Flame className="w-3.5 h-3.5 text-orange-550" /> مسخن اللوح الساخن (حراري)
                </label>
                <span className="text-[9px] text-slate-300 font-mono bg-white/5 px-2 py-0.5 rounded font-bold" dir="ltr">
                  {heatIntensity === 0 ? "مغلق / حرارة الغرفة" : `${heatIntensity} Watts`}
                </span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="500" 
                value={heatIntensity}
                onChange={(e) => {
                  setHeatIntensity(parseInt(e.target.value));
                  if (parseInt(e.target.value) > 0) {
                    playSynthSound("beep");
                  }
                }}
                className="w-full accent-orange-550 cursor-pointer h-1.5"
                id="heater-intensity-slider"
              />
              <div className="flex justify-between text-[8px] text-slate-600 font-mono pt-1 flex-row-reverse">
                <span>0 واط (برودة الغرفة)</span>
                <span>250 واط</span>
                <span>500 واط (غليان وتوهج مفرط)</span>
              </div>
            </div>

            {/* Stirrer RPM Adjuster Slider */}
            <div className="flex-1 w-full flex flex-col gap-1 text-right" id="ctrl-panel-stirrer">
              <div className="flex justify-between items-center px-1 flex-row-reverse">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1 flex-row-reverse">
                  <Sliders className="w-3.5 h-3.5 text-emerald-400" /> معدل الدوران المغناطيسي
                </label>
                <span className="text-[9px] text-slate-300 font-mono bg-white/5 px-2 py-0.5 rounded font-bold" dir="ltr">
                  {stirSpeed === 0 ? "متوقف" : `${stirSpeed} RPM`}
                </span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="1000" 
                step="50"
                value={stirSpeed}
                onChange={(e) => {
                  setStirSpeed(parseInt(e.target.value));
                  setIsStirring(parseInt(e.target.value) > 0);
                }}
                className="w-full accent-emerald-500 cursor-pointer h-1.5"
                id="stirrer-speed-slider"
              />
              <div className="flex justify-between text-[8px] text-slate-600 font-mono pt-1 flex-row-reverse">
                <span>0 دورة (ساكن)</span>
                <span>500 دورة/دقيقة</span>
                <span>1000 دورة (تدوير دوامي مفرط)</span>
              </div>
            </div>

            {/* Active Trigger buttons */}
            <div className="flex items-center gap-2 w-full md:w-auto flex-shrink-0" id="workbench-primary-actions">
              <button 
                onClick={() => computeReaction(selectedReactants)}
                disabled={selectedReactants.length < 2 || loadingAiPrediction} 
                className={`flex-1 md:flex-initial px-6 py-3.5 bg-indigo-650 hover:bg-indigo-555 text-white font-display font-medium text-xs tracking-wider uppercase rounded-xl border border-indigo-500/50 active:scale-95 transition-all flex items-center justify-center gap-2 duration-200 cursor-pointer ${
                  (selectedReactants.length < 2 || loadingAiPrediction) ? "opacity-40 cursor-not-allowed" : ""
                }`}
                id="mix-reactants-btn"
                title="صب المحاليل وتحليل المعادلات الكيميائية"
              >
                {loadingAiPrediction ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    جاري المحاكاة الكيميائية...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    خلط ومحاكاة التفاعل
                  </>
                )}
              </button>
            </div>
          </footer>
        </main>

        {/* Right Tabbed Panel: Analytics Feed, Course Lessons, & Earned Badges */}
        <aside className="w-full md:w-80 flex-shrink-0 snap-center border-t md:border-t-0 md:border-r border-white/10 bg-[#0E0E11] flex flex-col overflow-y-auto h-full" id="right-tab-panel">
          
          {/* Sidebar Tab Triggers */}
          <div className="flex border-b border-white/10 p-2 gap-1 bg-[#0A0A0C] flex-row-reverse" id="sidebar-tab-header">
            <button
              onClick={() => setActiveTab("analytics")}
              className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === "analytics" ? "bg-white/5 text-white border border-white/10" : "text-slate-400 hover:text-slate-200"
              }`}
              id="tab-btn-analytics"
            >
              <Activity className="w-3.5 h-3.5" />
              التحليل الرقمي
            </button>
            <button
              onClick={() => setActiveTab("lessons")}
              className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === "lessons" ? "bg-white/5 text-white border border-white/10" : "text-slate-400 hover:text-slate-200"
              }`}
              id="tab-btn-lessons"
            >
              <BookOpen className="w-3.5 h-3.5" />
              الدروس الموجهة
            </button>
            <button
              onClick={() => setActiveTab("badges")}
              className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === "badges" ? "bg-white/5 text-white border border-white/10" : "text-slate-400 hover:text-slate-200"
              }`}
              id="tab-btn-badges"
            >
              <Award className="w-3.5 h-3.5" />
              أوسمة الأكاديمية
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-left" id="sidebar-tab-content">

            {/* Tab 1: Real-time Reaction Analytics Feed */}
            {activeTab === "analytics" && (
              <div className="space-y-4" id="view-analytics">
                
                {/* Physical metrics graphs mockup */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center bg-black/35 p-2 rounded-lg border border-white/5 text-[10px] font-mono flex-row-reverse">
                    <span className="text-slate-500 uppercase font-bold text-[8px] tracking-wide text-right">مخطط التغير الحراري</span>
                    <span className="text-white font-bold" dir="ltr">{currentTemp} °C</span>
                  </div>
                  
                  {/* Procedural Temperature Sparkline Graph */}
                  <div className="h-20 w-full bg-black/45 rounded-lg flex items-end p-2 gap-1 border border-white/5 relative" id="history-chart">
                    {chartHistory.map((val, idx) => {
                      const max = Math.max(...chartHistory, 100);
                      const min = Math.min(...chartHistory, 20);
                      const percent = max === min ? 50 : ((val - min) / (max - min)) * 90 + 10;
                      return (
                        <div 
                          key={idx} 
                          className={`flex-1 rounded-sm transition-all duration-300 ${
                            val > 45 ? "bg-red-500/60" : "bg-indigo-505/45"
                          }`}
                          style={{ height: `${percent}%` }}
                          title={`درجة حرارة المسجلة: ${val}°C`}
                        />
                      );
                    })}
                    <div className="absolute inset-0 flex justify-between px-2 pt-1 pb-2 items-end pointer-events-none select-none text-[8px] text-slate-600 font-mono flex-row-reverse">
                      <span>الخط الزمي المباشر</span>
                      <span>سير التفاعل</span>
                    </div>
                  </div>
                </div>

                {/* pH Level Indicator Gauges */}
                <div className="bg-white/5 border border-white/10 p-3 rounded-xl space-y-2" id="ph-card">
                  <div className="flex justify-between items-end flex-row-reverse">
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">مستوى الرقم الهيدروجيني للأيونات (pH)</span>
                    <span className={`text-base font-mono font-bold ${
                      currentPh < 6.0 ? "text-red-400 animate-pulse" :
                      currentPh > 8.0 ? "text-pink-400" :
                      "text-emerald-400"
                    }`}>
                      {parseFloat(currentPh.toFixed(2))}
                    </span>
                  </div>

                  {/* Gradient scale slider */}
                  <div className="h-2 bg-gradient-to-r from-red-500 via-green-550 to-pink-500 rounded-full relative">
                    <div 
                      className="absolute w-3 h-3 bg-white border border-slate-900 rounded-full top-1/2 -translate-y-1/2 transition-all duration-500"
                      style={{ left: `${(currentPh / 14) * 95}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[8px] text-slate-500 font-mono flex-row-reverse">
                    <span>حمضي مفرط (0)</span>
                    <span>متعادل (7)</span>
                    <span>قاعدي مفرط (14)</span>
                  </div>
                </div>

                {/* Balanced Chemical Equation Block */}
                <div className="space-y-1 text-right">
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">معادلة التفاعل المتوازنة</label>
                  <div className="p-3 bg-black/45 rounded-xl border border-white/10 font-mono text-xs text-white overflow-x-auto whitespace-nowrap text-left shadow-inner font-bold" id="beaker-chemical-equation" dir="ltr">
                    {activeReaction ? activeReaction.equation : "Beaker Static (لا توجد محصلة تفاعل)"}
                  </div>
                </div>

                {/* Reaction Dynamics list or explanation description */}
                <div className="space-y-3 bg-[#131118] p-3.5 rounded-xl border border-white/5 text-right">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">التحليل العلمي للتجربة والمكونات</h4>
                  
                  {activeReaction ? (
                    <div className="space-y-4" id="science-explanation-results">
                      <div className="text-right">
                        <span className="text-[9px] uppercase font-bold text-slate-500 font-mono">التفسير الكيميائي المبسط:</span>
                        <p className="text-xs text-slate-300 leading-relaxed mt-1 text-right" id="science-main-desc">
                          {activeReaction.explanation}
                        </p>
                      </div>

                      {activeReaction.molecularExplanation && (
                        <div className="text-right">
                          <span className="text-[9px] uppercase font-bold text-slate-500 font-mono">التحليل الجزيئي المجهري:</span>
                          <p className="text-[11px] text-slate-400 leading-relaxed mt-1 text-right" id="science-molecular-desc">
                            {activeReaction.molecularExplanation}
                          </p>
                        </div>
                      )}

                      {activeReaction.products && activeReaction.products.length > 0 && (
                        <div className="text-right">
                          <span className="text-[9px] uppercase font-bold text-slate-500 font-mono">النواتج الحرة المترسبة أو المتصاعدة:</span>
                          <div className="flex gap-1.5 flex-wrap mt-1 justify-end">
                            {activeReaction.products.map((p, idx) => (
                              <span key={idx} className="bg-indigo-500/15 text-indigo-300 border border-indigo-505/20 text-[10px] px-2 py-0.5 rounded font-mono font-bold" dir="ltr">
                                {p}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-550 leading-relaxed font-mono text-right" id="no-reaction-guide">
                      يرجى تحديد عنصرين من الكواشف الكيميائية على الأقل وصبها بالدورق، ثم انقر على زر "خلط ومحاكاة التفاعل" لحساب التفاعلات وحل المعادلات الأيونية والحرارية الصاعدة.
                    </p>
                  )}
                </div>

                {/* Live Molecular ionic particle Feed list */}
                <div className="bg-black/25 p-3 rounded-xl border border-white/5 space-y-1.5" id="molecular-feed-box bg-slate-900 border border-slate-800">
                  <h4 className="text-[9px] font-bold text-slate-500 uppercase font-mono tracking-widest block text-right">تركيز توازن الأيونات الحرة</h4>
                  <div className="font-mono text-[10px] space-y-1 text-right" id="mol-feed-list">
                    {molecularFeed.map((item, idx) => (
                      <div key={idx} className="flex justify-between border-b border-white/5 py-1 last:border-0 flex-row-reverse" id={`feed-row-${idx}`}>
                        <span className="text-slate-400">{item.label}</span>
                        <span className={item.color} dir="ltr">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* Tab 2: Guided Academic Labs & Lessons List */}
            {activeTab === "lessons" && (
              <div className="space-y-3 animate-in slide-in-from-left" id="view-lessons">
                
                {activeLessonId && quizQuestionIndex !== null ? (
                  // QUIZ MODE RENDER
                  <div className="space-y-3 bg-[#111115] p-3 rounded-xl border border-indigo-500/30 text-right" id="lesson-quiz-view">
                    {(() => {
                      const lesson = EXPERIMENT_LESSONS.find(l => l.id === activeLessonId);
                      if (!lesson) return null;

                      if (quizFinished) {
                        return (
                          <div className="text-center py-4 space-y-3 text-right" id="quiz-finished-card">
                            <Award className="w-12 h-12 text-yellow-500 mx-auto animate-bounce" />
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-center">أحسنت! أتممت الدرس بنجاح</h3>
                            <p className="text-[11px] text-slate-300 leading-relaxed text-center">
                              {lesson.congratulationText}
                            </p>
                            
                            <div className="p-2 bg-emerald-950/40 border border-emerald-500/20 rounded-lg text-emerald-300 text-xs font-mono text-center">
                              لقد جنيت مكافأة الأكاديمية: إضافة وسام جديد للملف + 150 نقطة تفوق XP!
                            </div>

                            <button 
                              onClick={handleQuitLesson}
                              className="w-full py-2 bg-indigo-650 hover:bg-indigo-550 text-white rounded-lg text-xs font-bold uppercase transition cursor-pointer"
                            >
                              رائع، أريد الدرس التالي
                            </button>
                          </div>
                        );
                      }

                      const currentQuestion = lesson.quiz[quizQuestionIndex];
                      return (
                        <div className="space-y-4 text-right" id={`quiz-question-card-${currentQuestion.id}`}>
                          <div className="flex justify-between text-[10px] font-mono font-bold text-slate-550 flex-row-reverse">
                            <span>اختبار الأكاديمية العلمي الحاسم</span>
                            <span dir="ltr">{quizQuestionIndex + 1} / {lesson.quiz.length}</span>
                          </div>

                          <span className="text-xs text-white font-medium leading-relaxed block text-right">
                            {currentQuestion.question}
                          </span>

                          <div className="space-y-2">
                            {currentQuestion.options.map((option, idx) => (
                              <button
                                key={idx}
                                onClick={() => handleSelectQuizOption(idx)}
                                className="w-full text-right p-3 text-xs bg-white/5 border border-white/5 hover:border-indigo-550 hover:bg-white/10 rounded-lg transition cursor-pointer"
                              >
                                {option}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                ) : (
                  // STANDARD LESSONS LIST
                  <div className="space-y-3" id="lessons-selector-shelf">
                    <p className="text-[10px] text-slate-400 font-mono leading-relaxed text-right" id="lessons-narrative">
                      شارك في الدروس والتجارب المعملية المنهجية الموجهة، وسيعطيك المعلم الأكاديمي الخطوات والضوابط بالترتيب لكسب الأوسمة المعملية.
                    </p>

                    <div className="space-y-2.5" id="lessons-scroller">
                      {EXPERIMENT_LESSONS.map(lesson => {
                        const isCompleted = userStats.completedLessons.includes(lesson.id);
                        const isActive = activeLessonId === lesson.id;
                        
                        return (
                          <div 
                            key={lesson.id}
                            onClick={() => handleSelectLesson(lesson)}
                            className={`p-3 rounded-xl border cursor-pointer hover:border-indigo-500/50 transition-all text-right ${
                              isActive 
                                ? "bg-indigo-505/10 border-indigo-550/50 scale-[1.01]" 
                                : isCompleted 
                                ? "bg-emerald-950/10 border-emerald-500/25" 
                                : "bg-white/5 border-white/5 shadow"
                            }`}
                          >
                            <div className="flex justify-between items-start flex-row-reverse">
                              <div className="text-right">
                                <span className={`text-[8px] tracking-widest font-bold px-1.5 py-0.2 rounded ${
                                  lesson.difficulty === "beginner" ? "bg-emerald-500/15 text-emerald-400" :
                                  lesson.difficulty === "intermediate" ? "bg-yellow-500/15 text-yellow-400" :
                                  "bg-rose-500/15 text-rose-400 animate-pulse animate-bounce"
                                }`}>
                                  {lesson.difficulty === "beginner" ? "مبتدئ" :
                                   lesson.difficulty === "intermediate" ? "متوسط" : "متقدم"}
                                </span>
                                <h3 className="text-xs font-bold text-white mt-1 group-hover:text-indigo-300">{lesson.title}</h3>
                                <p className="text-[10px] text-slate-400">{lesson.subtitle}</p>
                              </div>

                              {isCompleted && (
                                <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5">
                                  ✓ تم الفوز
                                </span>
                              )}
                            </div>

                            <hr className="border-white/5 my-2" />

                            <div className="space-y-1 text-right font-sans">
                              <span className="text-[9px] uppercase font-bold text-slate-500 block">رؤوس الأهداف الأساسية:</span>
                              <ul className="list-disc pr-3 text-[10px] text-slate-400 space-y-0.5 text-right font-sans">
                                {lesson.objectives.map((obj, i) => (
                                  <li key={i}>{obj}</li>
                                ))}
                              </ul>
                            </div>

                            <button
                              key={`btn-${lesson.id}`}
                              className={`w-full py-1.5 mt-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                                isActive ? "bg-indigo-650 text-white" : "bg-white/5 hover:bg-white/10 text-slate-300"
                              }`}
                            >
                              {isActive ? "جاري الخلط والتحقق من الخطوات" : isCompleted ? "إعادة استكشاف الدرس العلمي" : "بدء المهمة المعملية الموجهة"}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* Tab 3: Student Badge Deck & Achievements */}
            {activeTab === "badges" && (
              <div className="space-y-4 animate-in fade-in" id="view-badges">
                
                <div className="bg-[#141419] p-3.5 rounded-xl border border-white/5 space-y-2 text-center" id="certification-shield">
                  <div className="w-12 h-12 rounded-full bg-yellow-400/10 flex items-center justify-center mx-auto border border-yellow-400/30 animate-pulse">
                    <Award className="w-6 h-6 text-yellow-400" />
                  </div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">سجل شرف الكيمياء وشهادات الأكاديمية</h3>
                  <p className="text-[10px] text-slate-400 leading-relaxed font-mono">
                    أكمل الخطوات المعملية بنجاح واجب عن اختبارات الأكاديمية لحصد وتوثيق أوسمة الشرف والدراسة.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-2 mx-0.5 text-right" id="badges-deck-grid">
                  {CHEMISTRY_BADGES.map(badge => {
                    const isUnlocked = userStats.unlockedBadges.includes(badge.id);
                    return (
                      <div 
                        key={badge.id}
                        className={`p-3 rounded-xl border flex items-start gap-3 transition-all flex-row-reverse ${
                          isUnlocked 
                            ? "bg-[#141219] border-indigo-500/25" 
                            : "bg-black/40 border-white/5 opacity-50"
                        }`}
                        title={isUnlocked ? "نلت هذا الشرف الأكاديمي!" : "وسام مقفل: أكمل الدرس العلمي المطابق لفتحه"}
                      >
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          isUnlocked ? "bg-indigo-600 border border-indigo-500/30 text-white shadow shadow-indigo-500/30" : "bg-slate-900 border border-slate-800 text-slate-600"
                        }`}>
                          {badge.id === "badge_neutralizer" && <Activity className="w-5 h-5" />}
                          {badge.id === "badge_gold_maker" && <Compass className="w-5 h-5" />}
                          {badge.id === "badge_catalyst_guru" && <Zap className="w-5 h-5" />}
                          {badge.id === "badge_safety_warden" && <ShieldAlert className="w-5 h-5 animate-pulse" />}
                          {badge.id === "badge_ai_explorer" && <Sparkles className="w-5 h-5" />}
                        </div>

                        <div className="text-right flex-1 space-y-0.5">
                          <div className="flex justify-between items-center flex-row-reverse">
                            <span className="text-xs font-bold text-white">{badge.title}</span>
                            <span className={`text-[8px] px-1.5 py-0.2 rounded font-mono font-bold ${
                              isUnlocked ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-850 text-slate-500"
                            }`}>
                              {isUnlocked ? "مكتسب (+150 XP)" : "مغلق"}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 leading-relaxed text-right">
                            {badge.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>
            )}

          </div>

          <div className="p-3 mt-auto border-t border-white/5 bg-[#0a0a0c]">
             <div className="flex justify-between text-[8px] font-mono text-slate-500 uppercase flex-row-reverse">
               <span>محرك كروي التحليل الحركي</span>
               <span>v4.2.0 • نشط بأمان</span>
             </div>
          </div>
        </aside>

      </div>

      {/* Mobile Floating Action Button to quickly jump to Beaker when chemicals are poured */}
      {activeMobileView === "chemicals" && selectedReactants.length > 0 && (
        <button
          onClick={() => {
            scrollToMobileView("reactor");
            playSynthSound("beep");
          }}
          className="fixed bottom-20 right-4 z-50 bg-gradient-to-r from-indigo-600 via-indigo-700 to-cyan-600 text-white font-bold text-xs px-4 py-3 rounded-full shadow-[0_0_25px_rgba(99,102,241,0.6)] border border-indigo-400 flex items-center gap-2 animate-bounce cursor-pointer active:scale-95 transition-all md:hidden"
          id="mobile-floating-beaker-btn"
        >
          <span>🧪 الانتقال إلى المفاعل ({selectedReactants.length})</span>
          <ArrowRight className="w-4 h-4 rotate-180" />
        </button>
      )}

      {/* Mobile Bottom Navigation Bar */}
      <div 
        className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 border-t border-white/10 p-1.5 md:hidden flex justify-around items-center backdrop-blur-lg shadow-2xl touch-manipulation"
        id="mobile-navigation-bar"
      >
        <button
          onClick={() => {
            scrollToMobileView("chemicals");
            playSynthSound("beep");
          }}
          className={`flex-1 flex flex-col items-center justify-center py-2 text-[10px] font-bold uppercase transition-all rounded-xl min-h-[48px] active:scale-95 ${
            activeMobileView === "chemicals" ? "text-cyan-400 bg-cyan-500/15 border border-cyan-500/30 font-bold shadow-sm" : "text-slate-400 hover:text-slate-200"
          }`}
          id="mobile-nav-btn-chemicals"
        >
          <Search className="w-5 h-5 mb-0.5" />
          <span>الكواشف والمواد</span>
        </button>

        <button
          onClick={() => {
            scrollToMobileView("reactor");
            playSynthSound("beep");
          }}
          className={`flex-1 flex flex-col items-center justify-center py-2 text-[10px] font-bold uppercase transition-all rounded-xl min-h-[48px] active:scale-95 relative ${
            activeMobileView === "reactor" ? "text-indigo-400 bg-indigo-500/15 border border-indigo-500/30 font-bold shadow-sm" : "text-slate-400 hover:text-slate-200"
          }`}
          id="mobile-nav-btn-reactor"
        >
          {selectedReactants.length > 0 && (
            <span className="absolute top-1 right-3 bg-indigo-500 text-white text-[9px] font-mono font-bold w-4 h-4 rounded-full flex items-center justify-center border border-white/20 animate-pulse">
              {selectedReactants.length}
            </span>
          )}
          <Flame className="w-5 h-5 mb-0.5" />
          <span>المفاعل الكيميائي</span>
        </button>

        <button
          onClick={() => {
            scrollToMobileView("results");
            playSynthSound("beep");
          }}
          className={`flex-1 flex flex-col items-center justify-center py-2 text-[10px] font-bold uppercase transition-all rounded-xl min-h-[48px] active:scale-95 ${
            activeMobileView === "results" ? "text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 font-bold shadow-sm" : "text-slate-400 hover:text-slate-200"
          }`}
          id="mobile-nav-btn-results"
        >
          <BookOpen className="w-5 h-5 mb-0.5" />
          <span>التقارير والدروس</span>
        </button>
      </div>

      {/* Periodic Table Modal View */}
      {isPeriodicModalOpen && (
        <div 
          className="fixed inset-0 z-[200] flex items-center justify-center p-2.5 sm:p-4 bg-black/90 backdrop-blur-md animate-fade-in"
          id="periodic-table-modal"
          onClick={() => setIsPeriodicModalOpen(false)}
        >
          <div 
            className="bg-slate-950 border-2 border-indigo-500/60 rounded-2xl w-full max-w-5xl h-[96vh] sm:h-[90vh] flex flex-col overflow-hidden shadow-[0_0_60px_rgba(99,102,241,0.25)] text-slate-200 animate-in scale-in duration-200"
            id="periodic-modal-body"
            onClick={(e) => e.stopPropagation()} // Prevent close on outer click
          >
            {/* Modal Header */}
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/40 flex-row-reverse">
              <div className="flex items-center gap-2 flex-row-reverse">
                <span className="text-xl">📊</span>
                <div className="text-right">
                  <h2 className="text-white font-bold text-base">الجدول الدوري المنهجي والأكاديمي التفاعلي</h2>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                    انقر على أي عنصر لاستكشاف وزنه خصائصه الذرية العميقة، والتعرف هيبو كواشف المختبر المتواجدة والتي تحويه.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsPeriodicModalOpen(false)} 
                className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Split View */}
            <div className="flex-1 flex flex-col lg:flex-row-reverse overflow-hidden">
              {/* Grid content container on right for Arabic layout flow */}
              <div className="flex-1 overflow-auto p-3 sm:p-4 flex flex-col justify-start sm:justify-center min-h-[300px]">
                {/* Mobile scroll swipe indicator */}
                <div className="lg:hidden text-[10px] text-indigo-300 bg-indigo-950/70 px-3 py-1.5 rounded-xl border border-indigo-500/30 mb-2 text-center flex items-center justify-center gap-1.5 font-bold shadow-sm">
                  <span>👈 اسحب اللوحة أفقياً لتصفح جميع مجموعات وعناصر الجدول الدوري 18 👉</span>
                </div>

                {/* Dynamic periodic table representation */}
                <div className="min-w-[780px] sm:min-w-[800px] mx-auto space-y-1.5 overflow-x-auto pb-2" id="periodic-table-grid-wrapper" dir="ltr">
                  {/* Table Rows (Periods 1 to 7) */}
                  {Array.from({ length: 7 }, (_, i) => i + 1).map((pPeriod) => (
                    <div 
                      key={pPeriod} 
                      className="grid gap-1.5" 
                      style={{ gridTemplateColumns: 'repeat(18, minmax(0, 1fr))' }}
                    >
                      {Array.from({ length: 18 }, (_, k) => k + 1).map((gGroup) => {
                        // Display visual placeholders for Lanthanides and Actinides inside the main row Group 3
                        if (pPeriod === 6 && gGroup === 3) {
                          return (
                            <div key={gGroup} className="w-full aspect-square rounded-lg border border-yellow-500/25 text-yellow-400 bg-yellow-950/15 flex flex-col justify-center items-center text-center p-0.5 leading-none shadow-sm cursor-help" title="الفئة الموضحة بالصف السفلي المستقل: لانثانيدات">
                              <span className="text-[7.5px] font-mono opacity-70">57-71</span>
                              <span className="text-[11px] font-bold my-0.5">La-Lu</span>
                              <span className="text-[6.5px] scale-90 opacity-80 font-medium">لانثانيدات</span>
                            </div>
                          );
                        }
                        if (pPeriod === 7 && gGroup === 3) {
                          return (
                            <div key={gGroup} className="w-full aspect-square rounded-lg border border-yellow-500/25 text-yellow-500 bg-yellow-950/15 flex flex-col justify-center items-center text-center p-0.5 leading-none shadow-sm cursor-help" title="الفئة الموضحة بالصف السفلي المستقل: أكتينيدات">
                              <span className="text-[7.5px] font-mono opacity-70">89-103</span>
                              <span className="text-[11px] font-bold my-0.5">Ac-Lr</span>
                              <span className="text-[6.5px] scale-90 opacity-80 font-medium">أكتينيدات</span>
                            </div>
                          );
                        }

                        const element = PERIODIC_ELEMENTS.find(el => el.period === pPeriod && el.group === gGroup);
                        
                        if (!element) {
                          return <div key={gGroup} className="w-full aspect-square" />;
                        }

                        const isActive = selectedElement?.symbol === element.symbol;
                        const isUsedInDatabase = element.reagentsUsed.length > 0;

                        let catColor = "border-slate-800 text-slate-400 bg-slate-950/20";
                        if (element.category === "reactive-nonmetal") catColor = "border-sky-500/20 text-sky-400 bg-sky-950/20 hover:border-sky-450";
                        else if (element.category === "noble-gas") catColor = "border-red-500/20 text-red-500 bg-red-950/20 hover:border-red-450";
                        else if (element.category === "alkali-metal") catColor = "border-pink-500/20 text-pink-400 bg-pink-950/20 hover:border-pink-450";
                        else if (element.category === "alkaline-earth-metal") catColor = "border-amber-500/20 text-orange-400 bg-amber-950/20 hover:border-amber-450";
                        else if (element.category === "transition-metal") catColor = "border-yellow-500/20 text-yellow-400 bg-yellow-950/20 hover:border-yellow-450";
                        else if (element.category === "post-transition-metal") catColor = "border-emerald-500/20 text-emerald-450 bg-emerald-950/20 hover:border-emerald-450";
                        else if (element.category === "metalloid") catColor = "border-teal-500/20 text-teal-400 bg-teal-950/20 hover:border-teal-450";
                        else if (element.category === "halogen") catColor = "border-purple-500/20 text-purple-400 bg-purple-950/20 hover:border-purple-450";

                        return (
                          <button
                            key={gGroup}
                            onClick={() => {
                              setSelectedElement(element);
                              playSynthSound("pop");
                              const chemRepresentative = getChemicalForElement(element);
                              handleSelectChemical(chemRepresentative);
                            }}
                            className={`w-full aspect-square rounded-lg border text-left p-1 flex flex-col justify-between transition-all relative cursor-pointer ${catColor} ${
                              isActive 
                                ? "ring-2 ring-indigo-500 scale-105 shadow-lg border-indigo-400 bg-indigo-950/40 font-bold" 
                                : "hover:scale-102 hover:bg-white/5"
                            }`}
                            id={`el-${element.symbol}`}
                          >
                            {isUsedInDatabase && (
                              <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
                            )}
                            
                            <div className="flex justify-between w-full text-[8px] font-mono opacity-60 leading-none">
                              <span>{element.atomicNumber}</span>
                              <span>{element.atomicMass.toFixed(0)}</span>
                            </div>
                            
                            <div className="text-center font-bold text-sm leading-none mt-1 w-full text-white">
                              {element.symbol}
                            </div>
                            
                            <div className="text-[7.5px] scale-90 w-full text-center truncate tracking-tighter opacity-70">
                              {element.nameAr}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ))}

                  {/* Lanthanides & Actinides Independent Visual Rows Below Table */}
                  <div className="h-6 flex items-center justify-center">
                    <div className="w-2/3 h-px bg-slate-800" />
                  </div>

                  {[8, 9].map((pPeriod) => (
                    <div 
                      key={pPeriod} 
                      className="grid gap-1.5" 
                      style={{ gridTemplateColumns: 'repeat(18, minmax(0, 1fr))' }}
                    >
                      {/* Left col span helper for beautiful visual indentation */}
                      <div className="col-span-3 flex items-center justify-end pr-3 text-[10px] font-bold text-yellow-500 font-mono tracking-wide">
                        {pPeriod === 8 ? "لانثانيدات ✦" : "أكتينيدات ✦"}
                      </div>

                      {Array.from({ length: 15 }, (_, k) => k + 4).map((gGroup) => {
                        const element = PERIODIC_ELEMENTS.find(el => el.period === pPeriod && el.group === gGroup);
                        
                        if (!element) return <div key={gGroup} className="w-full aspect-square" />;
                        
                        const isActive = selectedElement?.symbol === element.symbol;
                        const isUsedInDatabase = element.reagentsUsed.length > 0;
                        const catColor = "border-yellow-500/20 text-yellow-400 bg-yellow-950/20 hover:border-yellow-450"; // Highlighted as transition metals of rare-earth

                        return (
                          <button
                            key={gGroup}
                            onClick={() => {
                              setSelectedElement(element);
                              playSynthSound("pop");
                              const chemRepresentative = getChemicalForElement(element);
                              handleSelectChemical(chemRepresentative);
                            }}
                            className={`w-full aspect-square rounded-lg border text-left p-1 flex flex-col justify-between transition-all relative cursor-pointer ${catColor} ${
                              isActive 
                                ? "ring-2 ring-indigo-500 scale-105 shadow-lg border-indigo-400 bg-indigo-950/40 font-bold" 
                                : "hover:scale-102 hover:bg-white/5"
                            }`}
                            id={`el-${element.symbol}`}
                          >
                            {isUsedInDatabase && (
                              <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
                            )}
                            
                            <div className="flex justify-between w-full text-[8px] font-mono opacity-60 leading-none">
                              <span>{element.atomicNumber}</span>
                              <span>{element.atomicMass.toFixed(0)}</span>
                            </div>
                            
                            <div className="text-center font-bold text-sm leading-none mt-1 w-full text-white">
                              {element.symbol}
                            </div>
                            
                            <div className="text-[7.5px] scale-90 w-full text-center truncate tracking-tighter opacity-70">
                              {element.nameAr}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>

                {/* Table Legend */}
                <div className="mt-4 flex flex-wrap gap-2 justify-center text-[8.5px] opacity-70 flex-row-reverse" id="periodic-legend">
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-sky-950/20 border border-sky-500/20" /> لا فلز نشط</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-red-950/20 border border-red-500/20" /> غاز خامل</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-pink-950/20 border border-pink-500/20" /> فلز قلوي</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-amber-950/20 border border-amber-500/20" /> قلوي ترابي</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-yellow-950/20 border border-yellow-500/20" /> فلز انتقالي</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-emerald-950/20 border border-emerald-500/20" /> فلز بعد انتقالي</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-teal-950/20 border border-teal-500/20" /> شبه فلز</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-purple-950/20 border border-purple-500/20" /> هالوجين</span>
                </div>
              </div>

              {/* Left pane: Side Panel displaying element specific properties and chemical reagents links (Arabic layout left sidebar) with supreme high contrast bg */}
              <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-r border-white/15 bg-slate-900/90 shadow-2xl p-4 flex flex-col gap-4 overflow-y-auto">
                {selectedElement ? (
                  <div className="space-y-4 text-right" id="element-detail-panel">
                    {/* Top Banner */}
                    <div className="flex justify-between items-center bg-[#131118]/80 p-4 rounded-xl border border-white/5 relative overflow-hidden flex-row-reverse">
                      <div className="absolute bottom-0 right-0 bg-indigo-500/5 text-[90px] font-bold font-mono leading-none tracking-tighter opacity-10 select-none translate-x-4 translate-y-4">
                        {selectedElement.symbol}
                      </div>
                      
                      <div className="z-10 text-right">
                        <div className="text-[10px] text-slate-500 font-mono">العدد الذري: {selectedElement.atomicNumber}</div>
                        <h3 className="text-white font-bold text-xl mt-0.5">{selectedElement.nameAr}</h3>
                        <div className="text-[11px] text-indigo-400 font-mono mt-0.5 font-bold">{selectedElement.nameEn} ({selectedElement.symbol})</div>
                      </div>

                      <div className="w-14 h-14 rounded-lg bg-indigo-950/65 border border-indigo-500/30 flex flex-col items-center justify-center z-10">
                        <span className="text-[10px] text-slate-550 font-mono leading-none">الملو</span>
                        <span className="text-sm font-mono font-bold text-white mt-1 leading-none">{selectedElement.atomicMass.toFixed(1)}</span>
                      </div>
                    </div>

                    {/* Advanced Atomic Specs Card */}
                    <div className="bg-white/5 rounded-xl p-3 border border-white/10 space-y-2 text-right">
                      <div className="flex justify-between border-b border-white/5 py-1 text-xs flex-row-reverse">
                        <span className="font-mono text-slate-400" dir="ltr">{selectedElement.electronConfiguration}</span>
                        <span className="text-slate-500">التوزيع الإلكتروني:</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 py-1 text-xs flex-row-reverse">
                        <span className="font-bold text-indigo-300">
                          {selectedElement.category === "reactive-nonmetal" ? "لا فلز نشط" :
                           selectedElement.category === "noble-gas" ? "غاز خامل" :
                           selectedElement.category === "alkali-metal" ? "فلز قلوي" :
                           selectedElement.category === "alkaline-earth-metal" ? "فلز قلوي ترابي" :
                           selectedElement.category === "transition-metal" ? "فلز انتقالي" :
                           selectedElement.category === "post-transition-metal" ? "فلز بعد انتقالي" :
                           selectedElement.category === "metalloid" ? "شبه فلز" :
                           selectedElement.category === "halogen" ? "هالوجين" : "عنصر دوري"}
                        </span>
                        <span className="text-slate-500">فئة العنصر:</span>
                      </div>
                      <div className="flex justify-between py-1 text-xs flex-row-reverse">
                        <span className="font-mono text-slate-400">المجموعة {selectedElement.group} • الدورة {selectedElement.period}</span>
                        <span className="text-slate-500">الموقع بالجدول الدوري:</span>
                      </div>
                    </div>

                    {/* Narrative description */}
                    <div className="space-y-1 text-right">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">سياق المادة وخصائصها:</span>
                      <p className="text-xs text-slate-300 leading-relaxed bg-white/5 p-3 rounded-lg border border-transparent">
                        {selectedElement.descriptionAr}
                      </p>
                    </div>

                    {/* Linked chemical database references */}
                    <div className="space-y-2 text-right">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">الكواشف المتواجدة لدينا على الرف وتحويه ({selectedElement.reagentsUsed.length}):</span>
                      {selectedElement.reagentsUsed.length === 0 ? (
                        <div className="text-center text-[10px] text-slate-500 font-mono py-6 bg-white/5 rounded-xl border border-dashed border-white/5">
                          لا تتوفر محاليل مركبة على الرف تحتوي بشكل صريح على هذا العنصر حالياً.
                        </div>
                      ) : (
                        <div className="space-y-1.5 shadow-inner">
                          {selectedElement.reagentsUsed.map(rId => {
                            const matchedChem = combinedChemicals.find(c => c.id === rId);
                            if (!matchedChem) return null;
                            
                            const isAlreadySelected = selectedReactants.some(r => r.id === rId);

                            return (
                              <div 
                                key={rId}
                                onClick={() => {
                                  if (!isAlreadySelected) {
                                    handleSelectChemical(matchedChem);
                                  } else {
                                    handleRemoveReactant(matchedChem.id);
                                  }
                                }}
                                className={`flex items-center justify-between p-2.5 rounded-lg border text-right cursor-pointer group active:scale-98 transition-all flex-row-reverse ${
                                  isAlreadySelected
                                    ? "bg-indigo-500/10 border-indigo-505/40 text-indigo-300 shadow"
                                    : "bg-[#121216] border-white/5 hover:border-indigo-500/30 text-white"
                                }`}
                              >
                                <div className="flex items-center gap-1 flex-row-reverse">
                                  {isAlreadySelected ? (
                                    <span className="text-[9px] px-1 bg-indigo-500/20 rounded font-bold text-indigo-400">مصبوبة بالفعل</span>
                                  ) : (
                                    <span className="text-[9px] px-1 bg-white/5 rounded font-bold text-slate-500 group-hover:text-indigo-300 group-hover:bg-indigo-505/10">صب بالكأس</span>
                                  )}
                                </div>
                                
                                <div className="flex items-center gap-2 flex-row-reverse">
                                  <span className="text-[10px] font-mono text-slate-400 bg-white/5 px-1 rounded font-bold" dir="ltr">{matchedChem.formula}</span>
                                  <span className="text-xs group-hover:text-indigo-300 transition-colors">{matchedChem.name}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-slate-500 text-xs font-mono py-20">
                    يرجى النقر على عنصر في الجدول لعرض تفاصيله وبحوث المذيبات المرتبطة به.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* University Tools & Equipment Drawer Modal */}
      <UniversityToolsModal
        isOpen={isUniversityModalOpen}
        onClose={() => setIsUniversityModalOpen(false)}
        selectedReactants={selectedReactants}
        activeReaction={activeReaction}
        currentPh={currentPh}
        currentTemp={currentTemp}
        playSynthSound={playSynthSound}
      />
    </div>
  );
}
