import React, { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Atom,
  BookOpenCheck,
  CheckCircle2,
  Droplets,
  Flame,
  FlaskConical,
  Loader2,
  Microscope,
  Minus,
  Pause,
  Play,
  Plus,
  RefreshCw,
  RotateCcw,
  RotateCw,
  Search,
  ShieldAlert,
  Sparkles,
  Thermometer,
  Trash2,
  X,
} from "lucide-react";
import {
  Chemical,
  ChemicalCategory,
  ExperimentLesson,
  ReactionDetail,
  SimulationStatus,
} from "../types";
import { GlassIcon } from "./GlassIcon";
import { ChemicalEquation, ChemicalFormula } from "./ChemicalFormula";
import { MolecularSimulationCanvas } from "./MolecularSimulationCanvas";
import { SmokeSimulationCanvas } from "./SmokeSimulationCanvas";
import { LaserGlowCanvas } from "./LaserGlowCanvas";
import { playSound } from "../utils/soundEngine";
import { findPredefinedReaction } from "../utils/reactionMatcher";

interface LabViewProps {
  allChemicals: Chemical[];
  selectedReactants: Chemical[];
  onAddChemical: (chem: Chemical) => void;
  onRemoveChemical: (id: string) => void;
  onResetBeaker: () => void;
  onExecuteReaction: () => void;
  simulationStatus?: SimulationStatus;
  onStartReaction?: () => void;
  onPauseReaction?: () => void;
  onResumeReaction?: () => void;
  onResetReaction?: () => void;
  isPredictingAi: boolean;
  activeReaction: ReactionDetail | null;
  isReactionPlaying: boolean;
  reactionProgress: number;
  currentTemp: number;
  currentPh: number;
  temperatureHistory: number[];
  heaterPowerW: number;
  onChangeHeaterPowerW: (w: number) => void;
  stirSpeed: number;
  onChangeStirSpeed: (rpm: number) => void;
  isStirring: boolean;
  onToggleStirring: () => void;
  viscosityCp: number;
  onChangeViscosityCp: (cp: number) => void;
  bubbleSpeedMultiplier: number;
  onChangeBubbleSpeedMultiplier: (v: number) => void;
  customBubbleTint: string;
  onChangeCustomBubbleTint: (tint: string) => void;
  onOpenPeriodicModal: () => void;
  onOpenInstrumentsModal: () => void;
  onCreateCustomChemical: (chem: Chemical) => void;
  activeLesson: ExperimentLesson | null;
  onExitLesson: () => void;
  onGoToLessonQuiz: () => void;
}

const CATEGORY_FILTERS: { id: "all" | ChemicalCategory; label: string }[] = [
  { id: "all", label: "الكل" },
  { id: "acid", label: "أحماض" },
  { id: "base", label: "قواعد" },
  { id: "salt", label: "أملاح" },
  { id: "metal", label: "فلزات" },
  { id: "indicator", label: "أدلة لونية" },
  { id: "oxidizer", label: "مؤكسدات" },
  { id: "organic", label: "عضوية وجامعية" },
];

const BUBBLE_TINTS = [
  { label: "طبيعي", value: "rgba(224, 242, 254, 0.78)", hex: "#bae6fd" },
  { label: "سماوي", value: "rgba(34, 211, 238, 0.78)", hex: "#22d3ee" },
  { label: "زمردي", value: "rgba(52, 211, 153, 0.78)", hex: "#34d399" },
  { label: "كهرماني", value: "rgba(251, 191, 36, 0.78)", hex: "#fbbf24" },
  { label: "بنفسجي", value: "rgba(192, 132, 252, 0.78)", hex: "#c084fc" },
];

export const LabView: React.FC<LabViewProps> = ({
  allChemicals,
  selectedReactants,
  onAddChemical,
  onRemoveChemical,
  onResetBeaker,
  onExecuteReaction,
  simulationStatus = "ready",
  onStartReaction,
  onPauseReaction,
  onResumeReaction,
  onResetReaction,
  isPredictingAi,
  activeReaction,
  isReactionPlaying,
  reactionProgress,
  currentTemp,
  currentPh,
  temperatureHistory,
  heaterPowerW,
  onChangeHeaterPowerW,
  stirSpeed,
  onChangeStirSpeed,
  isStirring,
  onToggleStirring,
  viscosityCp,
  onChangeViscosityCp,
  bubbleSpeedMultiplier,
  onChangeBubbleSpeedMultiplier,
  customBubbleTint,
  onChangeCustomBubbleTint,
  onOpenPeriodicModal,
  onOpenInstrumentsModal,
  onCreateCustomChemical,
  activeLesson,
  onExitLesson,
  onGoToLessonQuiz,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<
    "all" | ChemicalCategory
  >("all");
  const [mobileShelfOpen, setMobileShelfOpen] = useState(false);
  const [customModalOpen, setCustomModalOpen] = useState(false);

  // Custom reagent creator form
  const [customName, setCustomName] = useState("");
  const [customFormula, setCustomFormula] = useState("");
  const [customCategory, setCustomCategory] =
    useState<ChemicalCategory>("salt");
  const [customState, setCustomState] =
    useState<Chemical["state"]>("aqueous");
  const [customPh, setCustomPh] = useState(7.0);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (customModalOpen) setCustomModalOpen(false);
        else if (mobileShelfOpen) setMobileShelfOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [customModalOpen, mobileShelfOpen]);

  const filteredChemicals = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return allChemicals.filter((c) => {
      if (categoryFilter !== "all" && c.category !== categoryFilter) {
        return false;
      }
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        (c.nameEn && c.nameEn.toLowerCase().includes(q)) ||
        c.formula.toLowerCase().includes(q)
      );
    });
  }, [allChemicals, searchQuery, categoryFilter]);

  // Compute realistic composite fluid tint in the beaker
  const fluidBackgroundColor = useMemo(() => {
    if (selectedReactants.length === 0) return "transparent";
    if (activeReaction?.liquidColor) return activeReaction.liquidColor;
    const lastWithTint = [...selectedReactants]
      .reverse()
      .find((r) => r.liquidColor);
    return lastWithTint?.liquidColor || "rgba(186, 230, 253, 0.28)";
  }, [selectedReactants, activeReaction]);

  // Fluid fill height % based on reagent count (up to 3)
  const fillPercent =
    selectedReactants.length === 0
      ? 0
      : Math.min(78, 28 + selectedReactants.length * 16);

  const phBadgeColor = useMemo(() => {
    if (currentPh < 3.5) return "text-rose-600 dark:text-rose-400";
    if (currentPh < 6.5) return "text-amber-600 dark:text-amber-300";
    if (currentPh <= 7.5) return "text-emerald-600 dark:text-emerald-400";
    if (currentPh <= 10.5) return "text-cyan-600 dark:text-cyan-300";
    return "text-violet-600 dark:text-violet-300";
  }, [currentPh]);

  // Dynamic Hazardous / Dangerous reaction detector
  const isDangerousReaction = useMemo(() => {
    if (activeReaction?.isDangerous) return true;
    if (selectedReactants.length >= 2) {
      const matched = findPredefinedReaction(selectedReactants);
      if (matched?.isDangerous) return true;
    }
    return false;
  }, [activeReaction, selectedReactants]);

  const handleSubmitCustomChemical = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim() || !customFormula.trim()) return;
    const created: Chemical = {
      id: `custom_${Date.now()}`,
      name: customName.trim(),
      formula: customFormula.trim(),
      state: customState,
      category: customCategory,
      ph: customPh,
      molarMass: 85.0,
      color: "bg-cyan-500/15 border-cyan-500/40",
      liquidColor: "rgba(56, 189, 248, 0.30)",
      hazardLabel: "مركب مخصص",
      description:
        "مركب كيميائي مخصص أُنشئ بواسطة الباحث لاختبار سلوكه التفاعلي.",
    };
    onCreateCustomChemical(created);
    setCustomName("");
    setCustomFormula("");
    setCustomModalOpen(false);
  };

  // Shared Reagent List Renderer (used in Desktop Left Panel & Mobile Bottom Sheet)
  const renderReagentList = (closeOnSelect: boolean) => (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <Search
          size={16}
          className="pointer-events-none absolute top-1/2 -translate-y-1/2 start-3 text-slate-400"
        />
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ابحث عن حمض، قاعدة، ملح، أو صيغة..."
          className="h-11 w-full rounded-xl border border-slate-300/80 dark:border-slate-700/80 bg-white/85 dark:bg-slate-950/65 ps-9 pe-3 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
        />
      </div>

      {/* Category Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
        {CATEGORY_FILTERS.map((cat) => {
          const active = categoryFilter === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                playSound("select");
                setCategoryFilter(cat.id);
              }}
              className={`min-h-[36px] shrink-0 rounded-xl border px-3 py-1 text-xs font-bold transition active:scale-95 ${
                active
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-slate-300/70 dark:border-slate-700/80 bg-white/70 dark:bg-slate-900/55 text-slate-700 dark:text-slate-300"
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Chemical Items */}
      <div className="space-y-2 max-h-[54vh] lg:max-h-[580px] overflow-y-auto pe-1">
        {filteredChemicals.map((chem) => {
          const inBeakerCount = selectedReactants.filter(
            (r) => r.id === chem.id
          ).length;
          const isTargetForLesson = activeLesson?.targetReactants.includes(
            chem.id
          );

          return (
            <button
              key={chem.id}
              type="button"
              disabled={selectedReactants.length >= 3 && inBeakerCount === 0}
              onClick={() => {
                playSound("select");
                onAddChemical(chem);
                if (closeOnSelect && selectedReactants.length >= 1) {
                  setMobileShelfOpen(false);
                }
              }}
              className={`group flex w-full items-center justify-between gap-2.5 rounded-xl border p-3 text-start transition active:scale-[0.98] disabled:opacity-45 ${
                isTargetForLesson
                  ? "border-amber-500/60 bg-amber-500/8 dark:bg-amber-500/12"
                  : inBeakerCount > 0
                  ? "border-blue-500/50 bg-blue-600/8 dark:bg-cyan-400/10"
                  : "border-slate-200/85 dark:border-slate-800/90 bg-white/75 dark:bg-slate-900/55 hover:border-blue-500/45"
              }`}
            >
              <div className="min-w-0 space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                    {chem.name}
                  </span>
                  {isTargetForLesson && (
                    <span className="text-[10px] font-bold text-amber-600 dark:text-amber-300 shrink-0">
                      · مطلوب للدرس
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                  {chem.hazardLabel || "كاشف قياسي"}
                  {chem.ph !== undefined ? ` · pH ${chem.ph}` : ""}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <ChemicalFormula
                  formula={chem.formula}
                  className="text-xs font-bold text-blue-700 dark:text-cyan-300"
                />
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600/12 dark:bg-cyan-400/15 text-blue-700 dark:text-cyan-300 group-hover:bg-blue-600 group-hover:text-white transition">
                  <Plus size={15} />
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="space-y-4 sm:space-y-5 pb-10">
      {/* Guided Lesson Step Dock (if active) */}
      {activeLesson && (
        <section className="glass-panel rounded-2xl p-4 border-amber-500/40 bg-amber-500/8 dark:bg-amber-500/10 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <GlassIcon
              icon={<BookOpenCheck size={19} />}
              tone="amber"
              shape="action"
              interactive={false}
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-300">
                <span>درس عملي موجه: {activeLesson.title}</span>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100">
                {selectedReactants.length === 0
                  ? activeLesson.steps[0]?.instruction
                  : activeReaction
                  ? "اكتملت المحاكاة بنجاح! افحص المعادلة الموزونة ثم انتقل إلى اختبار الدرس."
                  : activeLesson.steps[1]?.instruction ||
                    activeLesson.steps[0]?.instruction}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {activeReaction && (
              <button
                type="button"
                onClick={onGoToLessonQuiz}
                className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-3.5 py-2 text-xs font-bold text-white transition"
              >
                <CheckCircle2 size={15} />
                <span>انتقل لاختبار الدرس</span>
              </button>
            )}
            <button
              type="button"
              onClick={onExitLesson}
              className="inline-flex min-h-[40px] items-center justify-center rounded-xl border border-slate-300/70 dark:border-slate-700 px-3 text-xs font-bold text-slate-700 dark:text-slate-200"
            >
              إنهاء التوجيه
            </button>
          </div>
        </section>
      )}

      {/* Safety Warning Banner for Hazardous Reactions */}
      {activeReaction?.isDangerous && activeReaction.safetyWarning && (
        <section
          role="alert"
          className="glass-panel rounded-2xl p-4 border-rose-500/50 bg-rose-500/10 dark:bg-rose-500/14 flex items-start gap-3"
        >
          <GlassIcon
            icon={<AlertTriangle size={20} />}
            tone="rose"
            shape="action"
            interactive={false}
          />
          <div className="space-y-0.5">
            <h2 className="text-sm font-extrabold text-rose-800 dark:text-rose-200">
              تنبيه السلامة المخبرية القصوى
            </h2>
            <p className="text-xs sm:text-sm leading-relaxed text-rose-900/90 dark:text-rose-100/90">
              {activeReaction.safetyWarning}
            </p>
          </div>
        </section>
      )}

      {/* Quick Action Utility Bar (Works seamlessly on Mobile & Desktop) */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex flex-wrap items-center gap-2">
          {/* Mobile Primary Trigger to Open Reagent Drawer */}
          <button
            type="button"
            onClick={() => {
              playSound("modal_open");
              setMobileShelfOpen(true);
            }}
            className="lg:hidden inline-flex min-h-[46px] items-center gap-2 rounded-2xl bg-blue-600 hover:bg-blue-500 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm transition active:scale-95"
          >
            <Plus size={17} />
            <span>إضافة كاشف كيميائي ({selectedReactants.length}/3)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playSound("modal_open");
              onOpenPeriodicModal();
            }}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-2xl glass-card px-3.5 py-2 text-xs font-bold text-slate-800 dark:text-slate-100 hover:border-violet-500/50 transition active:scale-95"
          >
            <Atom size={16} className="text-violet-600 dark:text-violet-300" />
            <span>الجدول الدوري السريع</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playSound("modal_open");
              onOpenInstrumentsModal();
            }}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-2xl glass-card px-3.5 py-2 text-xs font-bold text-slate-800 dark:text-slate-100 hover:border-emerald-500/50 transition active:scale-95"
          >
            <Microscope
              size={16}
              className="text-emerald-600 dark:text-emerald-300"
            />
            <span>أجهزة التحليل الجامعية</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            playSound("modal_open");
            setCustomModalOpen(true);
          }}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-2xl glass-card px-3.5 py-2 text-xs font-bold text-blue-700 dark:text-cyan-300 hover:border-cyan-400/50 transition active:scale-95"
        >
          <Sparkles size={15} />
          <span>ابتكار مركب مخصص</span>
        </button>
      </div>

      {/* Main 3-Column Desktop Workbench / Clean Single-Column Mobile Stack */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Column 1 (Desktop Only): Reagent Repository */}
        <aside className="hidden lg:block lg:col-span-4 xl:col-span-3 glass-panel rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <FlaskConical
                size={17}
                className="text-blue-600 dark:text-cyan-300"
              />
              <span>خزانة الكواشف ({allChemicals.length})</span>
            </h2>
            <span className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
              {selectedReactants.length}/3
            </span>
          </div>
          {renderReagentList(false)}
        </aside>

        {/* Column 2: Central Borosilicate Reaction Vessel + Primary Controls */}
        <div className="lg:col-span-5 xl:col-span-5 space-y-4">
          <div className="glass-panel rounded-3xl p-4 sm:p-6 space-y-5">
            {/* Active Poured Reagents Rack */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  المحتويات المضافة داخل الدورق ({selectedReactants.length}/3)
                </span>
                {selectedReactants.length > 0 && (
                  <button
                    type="button"
                    onClick={onResetBeaker}
                    className="inline-flex items-center gap-1 font-bold text-rose-600 dark:text-rose-400 hover:underline"
                  >
                    <Trash2 size={13} />
                    <span>تفريغ وغسل</span>
                  </button>
                )}
              </div>

              {selectedReactants.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 px-3.5 py-2.5 text-center text-xs text-slate-500 dark:text-slate-400">
                  الكأس فارغ — اختر مادتين أو أكثر من خزانة الكواشف أو الجدول
                  الدوري لبدء التفاعل.
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {selectedReactants.map((chem, idx) => (
                    <div
                      key={`${chem.id}-${idx}`}
                      className="inline-flex items-center gap-2 rounded-xl border border-blue-500/30 dark:border-cyan-400/30 bg-blue-600/8 dark:bg-cyan-400/10 ps-3 pe-1.5 py-1.5 text-xs"
                    >
                      <span className="font-bold text-slate-900 dark:text-white">
                        {chem.name}
                      </span>
                      <ChemicalFormula
                        formula={chem.formula}
                        className="text-[11px] text-blue-700 dark:text-cyan-300"
                      />
                      <button
                        type="button"
                        onClick={() => onRemoveChemical(chem.id)}
                        aria-label={`إزالة ${chem.name}`}
                        className="inline-flex h-6 w-6 items-center justify-center rounded-lg hover:bg-rose-500/20 text-slate-500 hover:text-rose-600 dark:text-slate-300 transition"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Live Digital Telemetry Strip */}
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-xl bg-slate-900/5 dark:bg-slate-950/60 p-2.5 border border-slate-200/70 dark:border-slate-800 text-center">
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  درجة الحرارة
                </div>
                <div
                  dir="ltr"
                  className="text-sm sm:text-base font-extrabold font-mono tabular-nums text-slate-900 dark:text-white"
                >
                  {currentTemp.toFixed(1)} °C
                </div>
              </div>

              <div className="rounded-xl bg-slate-900/5 dark:bg-slate-950/60 p-2.5 border border-slate-200/70 dark:border-slate-800 text-center">
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  الرقم الهيدروجيني
                </div>
                <div
                  dir="ltr"
                  className={`text-sm sm:text-base font-extrabold font-mono tabular-nums ${phBadgeColor}`}
                >
                  pH {currentPh.toFixed(2)}
                </div>
              </div>

              <div className="rounded-xl bg-slate-900/5 dark:bg-slate-950/60 p-2.5 border border-slate-200/70 dark:border-slate-800 text-center">
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  اللزوجة الحركية
                </div>
                <div
                  dir="ltr"
                  className="text-sm sm:text-base font-extrabold font-mono tabular-nums text-cyan-700 dark:text-cyan-300"
                >
                  {viscosityCp} cP
                </div>
              </div>
            </div>

            {/* Borosilicate 300mL Graduated Reaction Beaker Stage */}
            <div className="relative flex flex-col items-center justify-end pt-10 pb-3 select-none">
              {/* Dynamic Hazardous Ambient Glow Backdrop */}
              {isDangerousReaction && (
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -inset-4 sm:-inset-6 rounded-3xl bg-red-600/15 blur-2xl animate-danger-flash z-0"
                />
              )}

              <div
                className={`relative w-56 sm:w-64 h-64 sm:h-72 transition-transform duration-300 ${
                  activeReaction?.dangerLevel === "extreme" && isReactionPlaying
                    ? "animate-shake"
                    : ""
                }`}
              >
                {/* Dynamic Flashing Red Danger Alert Frame around the Glass Beaker */}
                {isDangerousReaction && (
                  <div
                    role="alert"
                    aria-live="assertive"
                    className="pointer-events-none absolute -inset-3 sm:-inset-4.5 rounded-[2.8rem] border-2 border-red-500/90 shadow-[0_0_35px_rgba(239,68,68,0.7),inset_0_0_20px_rgba(239,68,68,0.25)] animate-danger-pulse z-30 flex flex-col justify-between p-2.5 transition-all duration-300"
                  >
                    {/* Top Alert Tag & Beacon */}
                    <div className="flex items-center justify-between px-2 pt-0.5">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-600/20 dark:bg-red-950/90 border border-red-500/80 px-2.5 py-0.5 text-[11px] font-black text-red-600 dark:text-red-400 shadow-[0_0_12px_rgba(239,68,68,0.4)]">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                        </span>
                        <span>تفاعل خطر (isDangerous)</span>
                      </span>

                      <span className="inline-flex items-center gap-1 rounded bg-red-600/20 dark:bg-red-950/80 border border-red-500/60 px-2 py-0.5 text-[10px] font-mono font-extrabold text-red-600 dark:text-red-300">
                        <AlertTriangle size={12} className="text-red-500 animate-bounce" />
                        <span>DANGER</span>
                      </span>
                    </div>

                    {/* Bottom Safety Warning Snippet */}
                    <div className="px-1 pb-0.5 text-center">
                      <div className="inline-flex items-center gap-1.5 rounded-xl bg-red-950/90 dark:bg-red-950/95 border border-red-500/80 px-3 py-1 text-[11px] font-bold text-red-100 shadow-xl backdrop-blur-md max-w-full">
                        <ShieldAlert size={14} className="shrink-0 text-red-400" />
                        <span className="truncate">
                          {activeReaction?.safetyWarning || "تفاعل كيميائي نشط يتطلب تدابير أمان مشددة!"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Rising Gas & Steam Plume Canvas */}
                <SmokeSimulationCanvas
                  activeReaction={activeReaction}
                  isReactionPlaying={isReactionPlaying}
                  simulationStatus={simulationStatus}
                  reactionProgress={reactionProgress}
                  currentTemp={currentTemp}
                  selectedReactants={selectedReactants}
                />

                {/* Beaker Top Lip */}
                <div
                  className={`mx-auto h-3 w-[104%] -ms-[2%] rounded-full border-2 transition-all duration-300 ${
                    isDangerousReaction
                      ? "border-red-500 bg-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.85)] animate-pulse"
                      : "border-slate-400/70 dark:border-slate-400/45 bg-white/40 dark:bg-white/10 backdrop-blur-xs"
                  }`}
                />

                {/* Main Borosilicate Cylindrical Vessel */}
                <div
                  className={`relative mx-auto h-[calc(100%-12px)] w-full rounded-b-[2.2rem] border-x-2 border-b-4 overflow-hidden transition-all duration-300 ${
                    isDangerousReaction
                      ? "border-red-500 ring-2 ring-red-500/70 shadow-[0_0_35px_rgba(239,68,68,0.7),inset_0_0_25px_rgba(239,68,68,0.3)] animate-danger-pulse bg-gradient-to-r from-red-500/10 via-slate-100/10 to-red-500/10 dark:from-red-950/30 dark:via-slate-900/40 dark:to-red-950/25"
                      : "border-slate-400/75 dark:border-slate-400/45 bg-gradient-to-r from-white/40 via-slate-100/15 to-white/35 dark:from-white/10 dark:via-slate-900/40 dark:to-white/8 shadow-[inset_0_-10px_25px_rgba(15,23,42,0.18)]"
                  }`}
                >
                  {/* Specular Vertical Glass Highlight */}
                  <div className="pointer-events-none absolute inset-y-3 start-3 w-2.5 rounded-full bg-gradient-to-b from-white/65 via-white/25 to-transparent z-20" />

                  {/* Volumetric Graduation Marks (50mL - 250mL) */}
                  <div
                    dir="ltr"
                    className="pointer-events-none absolute inset-y-6 end-3 z-20 flex flex-col justify-between items-end text-[9px] font-mono tabular-nums text-slate-600/80 dark:text-slate-300/70"
                  >
                    {[250, 200, 150, 100, 50].map((ml) => (
                      <div key={ml} className="flex items-center gap-1">
                        <span>{ml}</span>
                        <span className="h-[1.5px] w-2.5 bg-current" />
                      </div>
                    ))}
                  </div>

                  {/* Liquid Volume Container */}
                  <div
                    style={{
                      height: `${fillPercent}%`,
                      backgroundColor: fluidBackgroundColor,
                      animation:
                        isStirring && stirSpeed > 0 && simulationStatus !== "paused"
                          ? `fluid-viscous-stir ${Math.max(
                              0.45,
                              2.2 - stirSpeed / 650
                            )}s ease-in-out infinite`
                          : undefined,
                    }}
                    className="absolute inset-x-0 bottom-0 transition-all duration-700 ease-out border-t border-white/50 dark:border-white/30"
                  >
                    {/* Redox / Exothermic Luminescence */}
                    <LaserGlowCanvas
                      activeReaction={activeReaction}
                      isReactionPlaying={isReactionPlaying}
                      simulationStatus={simulationStatus}
                      reactionProgress={reactionProgress}
                      selectedReactants={selectedReactants}
                    />

                    {/* 2D Kinetic Molecular Collision Canvas */}
                    <MolecularSimulationCanvas
                      reactants={selectedReactants}
                      activeReaction={activeReaction}
                      isReactionPlaying={isReactionPlaying}
                      simulationStatus={simulationStatus}
                      reactionProgress={reactionProgress}
                      stirSpeed={stirSpeed}
                      isStirring={isStirring}
                      temperature={currentTemp}
                      viscosity={viscosityCp}
                    />

                    {/* Custom Effervescent Bubbles Overlay when Gas or Heating Active */}
                    {(activeReaction?.hasGas || currentTemp >= 78) && (
                      <div className="pointer-events-none absolute inset-0 overflow-hidden z-10">
                        {Array.from({ length: 10 }, (_, bIdx) => (
                          <span
                            key={bIdx}
                            style={{
                              left: `${12 + bIdx * 8.5}%`,
                              backgroundColor: customBubbleTint,
                              animationDuration: `${(
                                (1.4 + (bIdx % 3) * 0.45) /
                                Math.max(0.4, bubbleSpeedMultiplier)
                              ).toFixed(2)}s`,
                              animationDelay: `${(bIdx * 0.18).toFixed(2)}s`,
                            }}
                            className="absolute bottom-1 h-2.5 w-2.5 rounded-full animate-bubble"
                          />
                        ))}
                      </div>
                    )}

                    {/* Crystalline Settled Precipitate Bed */}
                    {activeReaction?.hasPrecipitate && (
                      <div
                        style={{
                          backgroundColor:
                            activeReaction.precipitateColor || "#facc15",
                        }}
                        className="absolute inset-x-3 bottom-1 h-3.5 rounded-full opacity-85 blur-[0.5px] transition-all duration-700"
                      />
                    )}

                    {/* Magnetic PTFE Stir Bar */}
                    {isStirring && (
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20">
                        <div
                          style={{
                            animationDuration: `${Math.max(
                              0.18,
                              1.1 - stirSpeed / 1100
                            )}s`,
                          }}
                          className={`h-2 w-9 rounded-full bg-white border border-slate-400 shadow-sm ${
                            stirSpeed > 0 ? "animate-spin" : ""
                          }`}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Ceramic Hotplate & Magnetic Stirrer Base */}
              <div className="w-64 sm:w-72 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-200/90 dark:bg-slate-900/90 px-4 py-2 shadow-md">
                <div
                  className={`mx-auto mb-1.5 h-1.5 w-36 rounded-full transition-all duration-500 ${
                    heaterPowerW > 0
                      ? "bg-gradient-to-r from-orange-500 via-red-500 to-amber-500 shadow-[0_0_12px_rgba(249,115,22,0.8)]"
                      : "bg-slate-400/40 dark:bg-slate-700"
                  }`}
                />
                <div className="flex items-center justify-between text-[10px] font-mono tabular-nums text-slate-600 dark:text-slate-400">
                  <span>HEATER: {heaterPowerW} W</span>
                  <span>STIR: {isStirring ? `${stirSpeed} RPM` : "OFF"}</span>
                </div>
              </div>
            </div>

            {/* Simulation Status & Dynamic Progress Track */}
            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-900/5 dark:bg-slate-950/70 p-3 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-bold flex items-center gap-1.5">
                  <span>حالة المحاكاة:</span>
                </span>

                {/* State Badges */}
                {simulationStatus === "ready" && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30">
                    <Sparkles size={13} />
                    <span>جاهز للبدء</span>
                  </span>
                )}
                {simulationStatus === "running" && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-600 dark:text-amber-300 border border-amber-500/30">
                    <Activity size={13} className="animate-pulse" />
                    <span>التفاعل قيد التشغيل...</span>
                  </span>
                )}
                {simulationStatus === "paused" && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-yellow-500/20 text-yellow-600 dark:text-yellow-300 border border-yellow-500/40">
                    <Pause size={13} />
                    <span>التفاعل متوقف مؤقتاً</span>
                  </span>
                )}
                {simulationStatus === "completed" && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                    <CheckCircle2 size={13} />
                    <span>اكتمل التفاعل بنجاح</span>
                  </span>
                )}
                {simulationStatus === "error" && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                    <AlertTriangle size={13} />
                    <span>حدث خطأ في التفاعل</span>
                  </span>
                )}
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400">
                  <span>مستوى اكتمال التفاعل</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{reactionProgress}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      simulationStatus === "paused"
                        ? "bg-amber-400"
                        : simulationStatus === "completed"
                        ? "bg-emerald-500"
                        : "bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400"
                    }`}
                    style={{ width: `${reactionProgress}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Primary Simulation Execution CTAs with Start, Pause, Resume, Reset */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {/* Ready or Error State: Start Reaction Button */}
              {(simulationStatus === "ready" || simulationStatus === "error") && (
                <button
                  type="button"
                  disabled={selectedReactants.length === 0 || isPredictingAi}
                  onClick={() => {
                    if (onStartReaction) {
                      onStartReaction();
                    } else {
                      playSound("simulation_start");
                      onExecuteReaction();
                    }
                  }}
                  className="flex-1 min-h-[50px] inline-flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-l from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:opacity-45 px-5 py-3 text-sm sm:text-base font-extrabold text-white shadow-[0_10px_26px_-6px_rgba(37,99,235,0.55)] transition active:scale-[0.98]"
                >
                  {isPredictingAi ? (
                    <>
                      <Loader2 size={19} className="animate-spin" />
                      <span>جاري الاستنتاج الجزيئي للتفاعل...</span>
                    </>
                  ) : (
                    <>
                      <Play size={18} className="fill-current" />
                      <span>بدء التفاعل والمحاكاة</span>
                    </>
                  )}
                </button>
              )}

              {/* Running State: Pause Button + Reset Button */}
              {simulationStatus === "running" && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      if (onPauseReaction) {
                        onPauseReaction();
                      }
                    }}
                    className="flex-1 min-h-[50px] inline-flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-l from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 px-5 py-3 text-sm sm:text-base font-extrabold text-white shadow-[0_10px_26px_-6px_rgba(245,158,11,0.55)] transition active:scale-[0.98]"
                  >
                    <Pause size={19} />
                    <span>إيقاف التفاعل مؤقتاً</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (onResetReaction) {
                        onResetReaction();
                      }
                    }}
                    title="إعادة ضبط التفاعل إلى البداية"
                    className="inline-flex h-[50px] px-3 sm:px-4 items-center justify-center gap-1.5 rounded-2xl glass-card text-slate-700 dark:text-slate-200 hover:border-cyan-500/50 transition active:scale-95 text-xs font-bold"
                  >
                    <RotateCcw size={17} />
                    <span className="hidden sm:inline">إعادة التفاعل</span>
                  </button>
                </>
              )}

              {/* Paused State: Resume Button + Reset Button */}
              {simulationStatus === "paused" && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      if (onResumeReaction) {
                        onResumeReaction();
                      }
                    }}
                    className="flex-1 min-h-[50px] inline-flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-l from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 px-5 py-3 text-sm sm:text-base font-extrabold text-white shadow-[0_10px_26px_-6px_rgba(16,185,129,0.55)] transition active:scale-[0.98]"
                  >
                    <Play size={18} className="fill-current" />
                    <span>استكمال التفاعل</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (onResetReaction) {
                        onResetReaction();
                      }
                    }}
                    title="إعادة ضبط التفاعل إلى البداية"
                    className="inline-flex h-[50px] px-3 sm:px-4 items-center justify-center gap-1.5 rounded-2xl glass-card text-slate-700 dark:text-slate-200 hover:border-cyan-500/50 transition active:scale-95 text-xs font-bold"
                  >
                    <RotateCcw size={17} />
                    <span className="hidden sm:inline">إعادة التفاعل</span>
                  </button>
                </>
              )}

              {/* Completed State: Replay Button */}
              {simulationStatus === "completed" && (
                <button
                  type="button"
                  onClick={() => {
                    if (onStartReaction) {
                      onStartReaction();
                    } else {
                      onExecuteReaction();
                    }
                  }}
                  className="flex-1 min-h-[50px] inline-flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-l from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 px-5 py-3 text-sm sm:text-base font-extrabold text-white shadow-[0_10px_26px_-6px_rgba(37,99,235,0.55)] transition active:scale-[0.98]"
                >
                  <RotateCcw size={18} />
                  <span>إعادة تشغيل التفاعل من البداية</span>
                </button>
              )}

              {/* Reset / Empty Beaker Button (always accessible) */}
              <button
                type="button"
                onClick={() => {
                  playSound("click");
                  onResetBeaker();
                }}
                aria-label="إفراغ الكأس بالكامل"
                title="إفراغ الكأس بالكامل"
                className="inline-flex h-[50px] w-[50px] shrink-0 items-center justify-center rounded-2xl glass-card text-slate-700 dark:text-slate-200 hover:border-rose-500/45 hover:text-rose-500 transition active:scale-95"
              >
                <Trash2 size={19} />
              </button>
            </div>
          </div>

          {/* Touch-Friendly Physical Benchtop Controls */}
          <div className="glass-panel rounded-2xl p-4 sm:p-5 space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
              أدوات الضبط الفيزيائي للطاولة المخبرية
            </h3>

            {/* Heater Power W */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                  <Flame size={15} className="text-orange-500" />
                  <span>قدرة السخان الحراري</span>
                </span>
                <span
                  dir="ltr"
                  className="font-mono tabular-nums text-orange-600 dark:text-orange-300"
                >
                  {heaterPowerW} W
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    playSound("click");
                    onChangeHeaterPowerW(Math.max(0, heaterPowerW - 50));
                  }}
                  aria-label="خفض التسخين"
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl glass-card active:scale-95 transition"
                >
                  <Minus size={15} />
                </button>
                <input
                  type="range"
                  min={0}
                  max={500}
                  step={25}
                  value={heaterPowerW}
                  onChange={(e) => onChangeHeaterPowerW(Number(e.target.value))}
                  className="flex-1 accent-orange-500 h-2 rounded-lg cursor-pointer"
                />
                <button
                  type="button"
                  onClick={() => {
                    playSound("click");
                    onChangeHeaterPowerW(Math.min(500, heaterPowerW + 50));
                  }}
                  aria-label="رفع التسخين"
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl glass-card active:scale-95 transition"
                >
                  <Plus size={15} />
                </button>
              </div>
            </div>

            {/* Magnetic Stirrer RPM */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                  <RotateCw size={15} className="text-cyan-500" />
                  <span>المحرك المغناطيسي (Stirrer)</span>
                </span>
                <div className="flex items-center gap-2">
                  <span
                    dir="ltr"
                    className="font-mono tabular-nums text-cyan-700 dark:text-cyan-300"
                  >
                    {stirSpeed} RPM
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      playSound("click");
                      onToggleStirring();
                    }}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition active:scale-95 ${
                      isStirring
                        ? "bg-cyan-600 text-white"
                        : "bg-slate-300/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {isStirring ? "نشط" : "متوقف"}
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    playSound("click");
                    onChangeStirSpeed(Math.max(0, stirSpeed - 100));
                  }}
                  aria-label="خفض سرعة التقليب"
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl glass-card active:scale-95 transition"
                >
                  <Minus size={15} />
                </button>
                <input
                  type="range"
                  min={0}
                  max={1000}
                  step={50}
                  value={stirSpeed}
                  onChange={(e) => onChangeStirSpeed(Number(e.target.value))}
                  className="flex-1 accent-cyan-500 h-2 rounded-lg cursor-pointer"
                />
                <button
                  type="button"
                  onClick={() => {
                    playSound("click");
                    onChangeStirSpeed(Math.min(1000, stirSpeed + 100));
                  }}
                  aria-label="زيادة سرعة التقليب"
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl glass-card active:scale-95 transition"
                >
                  <Plus size={15} />
                </button>
              </div>
            </div>

            {/* Fluid Viscosity & Bubble Dynamics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
                    <Droplets size={14} className="text-blue-500" />
                    <span>اللزوجة</span>
                  </span>
                  <span dir="ltr" className="font-mono tabular-nums">
                    {viscosityCp} cP
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={250}
                  step={5}
                  value={viscosityCp}
                  onChange={(e) => onChangeViscosityCp(Number(e.target.value))}
                  className="w-full accent-blue-600 h-2 rounded-lg cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-700 dark:text-slate-300">
                    سرعة ولون الفقاعات
                  </span>
                  <span dir="ltr" className="font-mono tabular-nums">
                    {bubbleSpeedMultiplier.toFixed(1)}×
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={0.5}
                    max={2.5}
                    step={0.25}
                    value={bubbleSpeedMultiplier}
                    onChange={(e) =>
                      onChangeBubbleSpeedMultiplier(Number(e.target.value))
                    }
                    className="flex-1 accent-violet-500 h-2 rounded-lg cursor-pointer"
                  />
                  <div className="flex items-center gap-1">
                    {BUBBLE_TINTS.map((t) => (
                      <button
                        key={t.label}
                        type="button"
                        onClick={() => onChangeCustomBubbleTint(t.value)}
                        title={t.label}
                        aria-label={`لون فقاعات ${t.label}`}
                        style={{ backgroundColor: t.hex }}
                        className={`h-5 w-5 rounded-full border ${
                          customBubbleTint === t.value
                            ? "ring-2 ring-blue-600 dark:ring-white scale-110"
                            : "border-white/50 opacity-75"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Column 3: Balanced Equation, Mechanism Analysis & Thermal Kinetics */}
        <div className="lg:col-span-3 xl:col-span-4 space-y-4">
          {/* Equation & Scientific Explanation */}
          <div className="glass-panel rounded-2xl p-4 sm:p-5 space-y-4">
            <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
              المعادلة الكيميائية والتفسير الجزيئي
            </h2>

            {activeReaction ? (
              <div className="space-y-4">
                <div className="overflow-x-auto scrollbar-none rounded-xl bg-slate-900/6 dark:bg-slate-950/75 p-3.5 border border-blue-500/25 dark:border-cyan-400/25">
                  <ChemicalEquation
                    equation={activeReaction.equation}
                    className="text-xs sm:text-sm"
                  />
                </div>

                {/* Products & Delta T Summary */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 dark:text-slate-300">
                  <span>
                    النواتج:{" "}
                    {activeReaction.products.map((prod, i) => (
                      <React.Fragment key={i}>
                        {i > 0 && " ، "}
                        <ChemicalFormula
                          formula={prod}
                          className="font-bold text-slate-900 dark:text-white"
                        />
                      </React.Fragment>
                    ))}
                  </span>
                  <span className="font-mono tabular-nums font-bold text-blue-700 dark:text-cyan-300">
                    ΔT {activeReaction.temperatureDelta >= 0 ? "+" : ""}
                    {activeReaction.temperatureDelta.toFixed(1)} °C
                  </span>
                </div>

                <div className="space-y-2 text-xs sm:text-sm leading-relaxed">
                  <p className="text-slate-700 dark:text-slate-200">
                    {activeReaction.explanation}
                  </p>
                  {activeReaction.molecularExplanation && (
                    <div className="rounded-xl bg-blue-600/8 dark:bg-cyan-400/8 border border-blue-500/20 dark:border-cyan-400/20 p-3 text-xs text-slate-700 dark:text-slate-300">
                      <strong className="block text-blue-800 dark:text-cyan-300 mb-1">
                        الميكانيكية الأيونية والجزيئية:
                      </strong>
                      {activeReaction.molecularExplanation}
                    </div>
                  )}

                  {activeReaction.isDangerous && (
                    <div className="rounded-xl border border-red-500/60 bg-red-500/10 dark:bg-red-950/40 p-3 text-xs text-red-700 dark:text-red-300 space-y-1">
                      <div className="flex items-center gap-2 font-black text-red-600 dark:text-red-400">
                        <AlertTriangle size={15} className="animate-bounce shrink-0" />
                        <span>تحذير السلامة الكيميائية: تفاعل مصنف كخطر (isDangerous: true)</span>
                      </div>
                      <p className="leading-relaxed">
                        {activeReaction.safetyWarning ||
                          "ينبغي اتخاذ الحذر الشديد وارتداء واقي العينين وقفازات مقاومة للأحماض والقلويات."}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-xs sm:text-sm leading-relaxed text-slate-500 dark:text-slate-400 py-4">
                أضف الكواشف إلى الدورق ثم اضغط «خلط ومحاكاة التفاعل» لعرض
                المعادلة الرمزية الموزونة، حالة الأطوار الفيزيائية، والتفسير
                الأيوني الدقيق.
              </p>
            )}
          </div>

          {/* pH Spectrum Meter (0 - 14) */}
          <div className="glass-panel rounded-2xl p-4 sm:p-5 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-700 dark:text-slate-300">
                طيف الحموضة والقلوية (pH 0–14)
              </span>
              <span dir="ltr" className={`font-mono tabular-nums ${phBadgeColor}`}>
                pH {currentPh.toFixed(2)}
              </span>
            </div>
            <div className="relative pt-2 pb-1">
              <div
                className="h-3 w-full rounded-full"
                style={{
                  background:
                    "linear-gradient(to right, #ef4444, #f97316, #eab308, #22c55e, #06b6d4, #3b82f6, #8b5cf6)",
                }}
              />
              <span
                style={{
                  left: `${Math.max(0, Math.min(100, (currentPh / 14) * 100))}%`,
                }}
                className="absolute top-1 h-5 w-2.5 -translate-x-1/2 rounded-full bg-white border-2 border-slate-900 shadow-md transition-all duration-300"
              />
            </div>
            <div
              dir="ltr"
              className="flex justify-between text-[10px] font-mono text-slate-500 dark:text-slate-400"
            >
              <span>0 حمضي</span>
              <span>7 متعادل</span>
              <span>14 قاعدي</span>
            </div>
          </div>

          {/* Live Thermal Kinetic Graph */}
          <div className="glass-panel rounded-2xl p-4 sm:p-5 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                <Thermometer size={14} className="text-cyan-500" />
                <span>السجل الحراري الزمني</span>
              </span>
              <span
                dir="ltr"
                className="font-mono tabular-nums text-slate-700 dark:text-slate-200"
              >
                {currentTemp.toFixed(1)} °C
              </span>
            </div>

            <div className="rounded-xl bg-slate-950/90 p-3 border border-slate-800">
              <svg
                viewBox="0 0 280 90"
                className="w-full h-24 overflow-visible"
                aria-label="مخطط تغير درجة الحرارة"
              >
                <line
                  x1={0}
                  x2={280}
                  y1={45}
                  y2={45}
                  stroke="rgba(148,163,184,0.16)"
                  strokeDasharray="3 3"
                />
                {temperatureHistory.length > 1 && (
                  <path
                    d={temperatureHistory
                      .map((t, idx) => {
                        const x =
                          (idx / Math.max(1, temperatureHistory.length - 1)) *
                          280;
                        const clamped = Math.max(0, Math.min(120, t));
                        const y = 82 - (clamped / 120) * 74;
                        return `${idx === 0 ? "M" : "L"} ${x.toFixed(
                          1
                        )} ${y.toFixed(1)}`;
                      })
                      .join(" ")}
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="2.2"
                  />
                )}
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom-Sheet Reagent Selector Drawer */}
      {mobileShelfOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="خزانة الكواشف الكيميائية"
          className="lg:hidden fixed inset-0 z-50 flex items-end justify-center bg-slate-950/65 backdrop-blur-xs"
          onClick={() => setMobileShelfOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="glass-modal w-full rounded-t-3xl p-4 sm:p-5 max-h-[86vh] overflow-y-auto space-y-3 pb-safe"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                إضافة كاشف إلى الدورق ({selectedReactants.length}/3)
              </h3>
              <button
                type="button"
                onClick={() => setMobileShelfOpen(false)}
                aria-label="إغلاق خزانة الكواشف"
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-300/70 dark:border-slate-700 text-slate-600 dark:text-slate-300"
              >
                <X size={18} />
              </button>
            </div>
            {renderReagentList(true)}
          </div>
        </div>
      )}

      {/* Custom Reagent Creator Modal */}
      {customModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="ابتكار مركب كيميائي مخصص"
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/65 backdrop-blur-xs p-0 sm:p-4"
          onClick={() => setCustomModalOpen(false)}
        >
          <form
            onSubmit={handleSubmitCustomChemical}
            onClick={(e) => e.stopPropagation()}
            className="glass-modal w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 space-y-4 pb-safe"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                ابتكار مركب كيميائي مخصص
              </h3>
              <button
                type="button"
                onClick={() => setCustomModalOpen(false)}
                aria-label="إغلاق"
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-300/60 dark:border-slate-700 text-slate-600 dark:text-slate-300"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  اسم المركب بالعربية
                </label>
                <input
                  type="text"
                  required
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="مثال: كلوريد الكوبالت الثنائي"
                  className="h-11 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  الصيغة الكيميائية الرمزية (LTR)
                </label>
                <input
                  type="text"
                  dir="ltr"
                  required
                  value={customFormula}
                  onChange={(e) => setCustomFormula(e.target.value)}
                  placeholder="CoCl2(aq)"
                  className="h-11 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 font-mono text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    التصنيف الكيميائي
                  </label>
                  <select
                    value={customCategory}
                    onChange={(e) =>
                      setCustomCategory(e.target.value as ChemicalCategory)
                    }
                    className="h-11 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-2.5 text-xs font-bold text-slate-900 dark:text-white"
                  >
                    <option value="acid">حمض</option>
                    <option value="base">قاعدة</option>
                    <option value="salt">ملح</option>
                    <option value="metal">فلز</option>
                    <option value="oxidizer">مؤكسد</option>
                    <option value="organic">عضوي</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    الحالة الفيزيائية
                  </label>
                  <select
                    value={customState}
                    onChange={(e) =>
                      setCustomState(e.target.value as Chemical["state"])
                    }
                    className="h-11 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-2.5 text-xs font-bold text-slate-900 dark:text-white"
                  >
                    <option value="aqueous">محلول مائي (aq)</option>
                    <option value="liquid">سائل نقي (l)</option>
                    <option value="solid">صلب (s)</option>
                    <option value="gas">غاز (g)</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-slate-700 dark:text-slate-300">
                    الرقم الهيدروجيني التقريبي
                  </span>
                  <span dir="ltr" className="font-mono">
                    pH {customPh.toFixed(1)}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={14}
                  step={0.5}
                  value={customPh}
                  onChange={(e) => setCustomPh(Number(e.target.value))}
                  className="w-full accent-blue-600 h-2 rounded-lg"
                />
              </div>
            </div>

            <button
              type="submit"
              className="min-h-[46px] w-full rounded-xl bg-gradient-to-l from-blue-600 to-cyan-600 px-5 py-2.5 text-sm font-bold text-white shadow-md"
            >
              إضافة المركب إلى الخزانة والدورق
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
