import React, { useState } from "react";
import {
  ArrowLeft,
  Atom,
  BookOpenCheck,
  ExternalLink,
  Flame,
  FlaskConical,
  Globe,
  GraduationCap,
  Microscope,
  Play,
  ShieldCheck,
  Sliders,
  Sparkles,
  Thermometer,
} from "lucide-react";
import { AppPage, QuickExperimentPreset } from "../types";
import {
  CHEMICAL_DATABASE,
  EXPERIMENT_LESSONS,
  PREDEFINED_REACTIONS,
  QUICK_EXPERIMENTS,
} from "../data";
import { PERIODIC_ELEMENTS } from "../periodicTableData";
import { GlassIcon, GlassTone } from "./GlassIcon";
import { ChemicalEquation } from "./ChemicalFormula";
import { HeroMolecularCanvas } from "./HeroMolecularCanvas";
import { DeveloperAuditReportModal } from "./baccalaureate/DeveloperAuditReportModal";

import { playSound } from "../utils/soundEngine";
import heroReactorImg from "../assets/images/hero_molecular_reactor_1793813032279.jpg";
import spectroscopyImg from "../assets/images/feature_analytical_spectroscopy_1793813033756.jpg";
import periodicImg from "../assets/images/feature_periodic_elements_1793813034362.jpg";

interface HomeViewProps {
  isDark: boolean;
  onNavigate: (page: AppPage) => void;
  onRunQuickExperiment: (preset: QuickExperimentPreset) => void;
  onStartLesson: (lessonId: string) => void;
}

const HERO_PREVIEW_KEYS: {
  key: string;
  title: string;
  reactantIds: string[];
  phAfter: string;
  visualTint: string;
}[] = [
  {
    key: "pb_no3_2+ki",
    title: "ترسيب المطر الذهبي البلوري",
    reactantIds: ["pb_no3_2", "ki"],
    phAfter: "7.00",
    visualTint: "from-amber-400/45 via-yellow-500/25 to-amber-600/35",
  },
  {
    key: "hcl+naoh",
    title: "معايرة التعادل القياسي",
    reactantIds: ["hcl", "naoh"],
    phAfter: "7.00",
    visualTint: "from-sky-400/35 via-cyan-400/20 to-blue-500/30",
  },
  {
    key: "fecl3+kscn",
    title: "معقد ثيوسيانات الحديد الطيفي",
    reactantIds: ["fecl3", "kscn"],
    phAfter: "3.40",
    visualTint: "from-rose-600/55 via-red-600/35 to-orange-700/40",
  },
];

export const HomeView: React.FC<HomeViewProps> = ({
  isDark,
  onNavigate,
  onRunQuickExperiment,
  onStartLesson,
}) => {
  const [previewIdx, setPreviewIdx] = useState(0);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const [isAuditReportOpen, setIsAuditReportOpen] = useState(false);

  const currentPreview = HERO_PREVIEW_KEYS[previewIdx];
  const sortedKey = [...currentPreview.reactantIds].sort().join("+");
  const previewReaction =
    PREDEFINED_REACTIONS[sortedKey] || PREDEFINED_REACTIONS["hcl+naoh"];

  const markImgFailed = (id: string) => {
    setFailedImages((prev) => ({ ...prev, [id]: true }));
  };

  const totalReagents = CHEMICAL_DATABASE.length;
  const totalElements = PERIODIC_ELEMENTS.length;
  const totalPresetReactions = Object.keys(PREDEFINED_REACTIONS).length;
  const totalLessons = EXPERIMENT_LESSONS.length;

  return (
    <div className="space-y-12 sm:space-y-16 pb-10">
      {/* 1. Scientific Hero Section */}
      <section className="relative overflow-hidden rounded-3xl glass-panel px-5 py-8 sm:px-10 sm:py-12 lg:py-14">
        <HeroMolecularCanvas isDark={isDark} />

        {/* Subtle ambient scientific depth gradients */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-28 -start-24 h-72 w-72 rounded-full bg-blue-500/15 dark:bg-blue-500/20 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-28 -end-24 h-72 w-72 rounded-full bg-cyan-400/15 dark:bg-violet-500/18 blur-3xl"
        />

        <div className="relative z-10 grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-10">
          {/* Right Column (RTL Primary Copy & Actions) */}
          <div className="lg:col-span-7 space-y-5 text-start">
            <p className="text-xs sm:text-sm font-semibold tracking-wide text-blue-700 dark:text-cyan-300">
              منصة المحاكاة الكيميائية والتحليل الطيفي الجامعي
            </p>

            <h1 className="text-2xl sm:text-4xl lg:text-[2.65rem] font-extrabold leading-[1.22] tracking-tight text-slate-900 dark:text-white">
              اختبر التفاعلات الكيميائية بدقة جزيئية وفيزيائية حية
            </h1>

            <p className="max-w-2xl text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-300">
              بيئة مختبرية تفاعلية تجمع بين نمذجة التصادمات الأيونية، حسابات
              الديناميكا الحرارية والرقم الهيدروجيني، الجدول الدوري الكامل لـ{" "}
              <span className="font-mono tabular-nums font-semibold">
                {totalElements}
              </span>{" "}
              عنصراً، وخمسة أجهزة تحليل جامعية متكاملة.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => {
                  playSound("navigate");
                  onNavigate("baccalaureate");
                }}
                className="group inline-flex min-h-[48px] items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-l from-indigo-600 via-blue-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 px-6 py-3 text-sm sm:text-base font-bold text-white shadow-[0_10px_28px_-6px_rgba(79,70,229,0.55)] transition-all active:scale-[0.97]"
              >
                <GraduationCap size={20} />
                <span>كيمياء البكالوريا (52 درساً)</span>
                <ArrowLeft
                  size={17}
                  className="transition-transform group-hover:-translate-x-1"
                />
              </button>

              <button
                type="button"
                onClick={() => {
                  playSound("navigate");
                  onNavigate("lab");
                }}
                className="group inline-flex min-h-[48px] items-center justify-center gap-2.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-700/80 px-5 py-3 text-sm sm:text-base font-bold transition-all active:scale-[0.97]"
              >
                <FlaskConical size={19} className="text-cyan-400" />
                <span>المختبر التفاعلي</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  playSound("navigate");
                  onNavigate("periodic");
                }}
                className="group inline-flex min-h-[48px] items-center justify-center gap-2.5 rounded-2xl glass-card px-5 py-3 text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100 hover:border-blue-500/45 transition-all active:scale-[0.97]"
              >
                <Atom
                  size={18}
                  className="text-violet-600 dark:text-violet-300"
                />
                <span>الجدول الدوري</span>
              </button>
            </div>

            {/* Real Dynamic Project Statistics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-200/80 dark:border-slate-800/80">
              <div>
                <div className="text-xl sm:text-2xl font-extrabold font-mono tabular-nums text-slate-900 dark:text-white">
                  {totalReagents}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  كاشفاً ومادة نقية
                </div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-extrabold font-mono tabular-nums text-slate-900 dark:text-white">
                  {totalElements}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  عنصراً قياسياً IUPAC
                </div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-extrabold font-mono tabular-nums text-slate-900 dark:text-white">
                  {totalPresetReactions}+
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  معادلة موزونة واستنتاج ذكي
                </div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-extrabold font-mono tabular-nums text-slate-900 dark:text-white">
                  5
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  أجهزة تحليل جامعية
                </div>
              </div>
            </div>
          </div>

          {/* Left Column: Live Interactive Reaction Preview Card */}
          <div className="lg:col-span-5">
            <div className="glass-card rounded-2xl p-4 sm:p-5 space-y-4 border border-blue-500/20 dark:border-cyan-400/20">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <GlassIcon
                    icon={<Sparkles size={18} />}
                    tone="cyan"
                    shape="action"
                    interactive={false}
                  />
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                      معاينة تفاعلية فورية
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      اختر تفاعلاً لفحص معادلته وتشغيله مباشرة
                    </p>
                  </div>
                </div>
              </div>

              {/* Interactive Switcher Buttons */}
              <div className="grid grid-cols-3 gap-1.5">
                {HERO_PREVIEW_KEYS.map((item, idx) => {
                  const active = idx === previewIdx;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => {
                        playSound("select");
                        setPreviewIdx(idx);
                      }}
                      className={`min-h-[40px] rounded-xl px-2 py-1.5 text-xs font-bold transition-all active:scale-95 ${
                        active
                          ? "bg-blue-600 text-white shadow-sm"
                          : "bg-slate-200/70 dark:bg-slate-800/70 text-slate-700 dark:text-slate-300 hover:bg-slate-300/70 dark:hover:bg-slate-700/70"
                      }`}
                    >
                      {idx === 0
                        ? "المطر الذهبي"
                        : idx === 1
                        ? "تعادل حمضي"
                        : "معقد الحديد"}
                    </button>
                  );
                })}
              </div>

              {/* Visual Vessel + Telemetry */}
              <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-700/70 bg-slate-950/90 p-4 text-white">
                {!failedImages["hero"] && (
                  <img
                    src={heroReactorImg}
                    alt="مفاعل كيميائي زجاجي يعرض تفاعلاً جزيئياً مضيئاً"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    onError={() => markImgFailed("hero")}
                    className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-28 mix-blend-luminosity"
                  />
                )}
                <div
                  className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${currentPreview.visualTint}`}
                />

                <div className="relative z-10 space-y-3">
                  <div className="flex items-center justify-between gap-2 text-xs text-slate-200">
                    <span className="font-bold">{currentPreview.title}</span>
                    <span className="font-mono tabular-nums text-cyan-300">
                      ΔT{" "}
                      {previewReaction.temperatureDelta >= 0 ? "+" : ""}
                      {previewReaction.temperatureDelta.toFixed(1)} °C · pH{" "}
                      {currentPreview.phAfter}
                    </span>
                  </div>

                  <div className="overflow-x-auto scrollbar-none rounded-xl bg-slate-950/75 px-3 py-2.5 border border-white/12">
                    <ChemicalEquation
                      equation={previewReaction.equation}
                      className="text-xs sm:text-sm text-white"
                    />
                  </div>

                  <p className="text-xs leading-relaxed text-slate-200 line-clamp-2">
                    {previewReaction.explanation}
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      playSound("simulation_start");
                      onRunQuickExperiment({
                        id: currentPreview.key,
                        title: currentPreview.title,
                        categoryLabel: "معاينة سريعة",
                        equationPreview: previewReaction.equation,
                        reactantIds: currentPreview.reactantIds,
                        summary: previewReaction.explanation,
                        accentTone: "cyan",
                      });
                    }}
                    className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-white/95 hover:bg-white text-slate-950 text-xs sm:text-sm font-extrabold transition active:scale-[0.98]"
                  >
                    <Play size={15} className="fill-current" />
                    <span>صبّ الكواشف وتشغيل التجربة في المختبر</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Core Platform Modules Showcase */}
      <section className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              أقسام المنصة العلمية المتكاملة
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              انتقل بسلاسة بين التجريب المعملي الحر، استكشاف البنية الذرية،
              والقياس التحليلي الدقيق
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Interactive Lab */}
          <article className="group glass-card glass-card-interactive rounded-2xl overflow-hidden flex flex-col">
            <div className="relative h-44 bg-gradient-to-br from-slate-900 via-blue-950 to-cyan-950 overflow-hidden">
              {!failedImages["card_lab"] && (
                <img
                  src={heroReactorImg}
                  alt="بيئة المختبر التفاعلي ومحاكاة الكأس الزجاجي"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  onError={() => markImgFailed("card_lab")}
                  className="h-full w-full object-cover opacity-80 transition-transform duration-500 group-hover:scale-105"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/25 to-transparent" />
              <div className="absolute bottom-3 start-4">
                <GlassIcon
                  icon={<FlaskConical size={22} />}
                  tone="cyan"
                  shape="module"
                />
              </div>
            </div>
            <div className="flex flex-1 flex-col justify-between p-5 space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  المختبر الكيميائي التفاعلي
                </h3>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  امزج حتى 3 كواشف مع تحكم فيزيائي كامل في التسخين الحراري،
                  التحريك المغناطيسي، اللزوجة، ومحاكاة الجزيئات والغازات.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  playSound("navigate");
                  onNavigate("lab");
                }}
                className="inline-flex min-h-[44px] items-center justify-between rounded-xl bg-blue-600/10 dark:bg-cyan-400/12 px-4 py-2.5 text-sm font-bold text-blue-700 dark:text-cyan-300 hover:bg-blue-600/18 transition active:scale-[0.98]"
              >
                <span>فتح طاولة المختبر</span>
                <ArrowLeft size={16} />
              </button>
            </div>
          </article>

          {/* Card 2: Periodic Table */}
          <article className="group glass-card glass-card-interactive rounded-2xl overflow-hidden flex flex-col">
            <div className="relative h-44 bg-gradient-to-br from-slate-900 via-indigo-950 to-violet-950 overflow-hidden">
              {!failedImages["card_periodic"] && (
                <img
                  src={periodicImg}
                  alt="الجدول الدوري التفاعلي للعناصر الكيميائية"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  onError={() => markImgFailed("card_periodic")}
                  className="h-full w-full object-cover opacity-80 transition-transform duration-500 group-hover:scale-105"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/25 to-transparent" />
              <div className="absolute bottom-3 start-4">
                <GlassIcon
                  icon={<Atom size={22} />}
                  tone="violet"
                  shape="module"
                />
              </div>
            </div>
            <div className="flex flex-1 flex-col justify-between p-5 space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  الجدول الدوري الذكي (118 عنصراً)
                </h3>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  استعرض التوزيع الإلكتروني، الكهرسلبية، والكتلة الذرية لجميع
                  العناصر مع إمكانية إضافتها مباشرة إلى دورق التفاعل بضغطة
                  واحدة.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  playSound("navigate");
                  onNavigate("periodic");
                }}
                className="inline-flex min-h-[44px] items-center justify-between rounded-xl bg-violet-600/10 dark:bg-violet-400/12 px-4 py-2.5 text-sm font-bold text-violet-700 dark:text-violet-300 hover:bg-violet-600/18 transition active:scale-[0.98]"
              >
                <span>استكشاف العناصر الذرية</span>
                <ArrowLeft size={16} />
              </button>
            </div>
          </article>

          {/* Card 3: University Analytical Suite */}
          <article className="group glass-card glass-card-interactive rounded-2xl overflow-hidden flex flex-col">
            <div className="relative h-44 bg-gradient-to-br from-slate-900 via-teal-950 to-emerald-950 overflow-hidden">
              {!failedImages["card_inst"] && (
                <img
                  src={spectroscopyImg}
                  alt="أجهزة التحليل الطيفي والمخبري الجامعية"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  onError={() => markImgFailed("card_inst")}
                  className="h-full w-full object-cover opacity-80 transition-transform duration-500 group-hover:scale-105"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/25 to-transparent" />
              <div className="absolute bottom-3 start-4">
                <GlassIcon
                  icon={<Microscope size={22} />}
                  tone="emerald"
                  shape="module"
                />
              </div>
            </div>
            <div className="flex flex-1 flex-col justify-between p-5 space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  أجهزة القياس والتحليل الجامعية
                </h3>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  مطياف الأشعة المرئية UV-Vis، الطرد المركزي، سحاحة المعايرة
                  الحجمية، كروماتوغرافيا الطبقة الرقيقة TLC، والميزان الحساس
                  0.0001 g.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  playSound("navigate");
                  onNavigate("instruments");
                }}
                className="inline-flex min-h-[44px] items-center justify-between rounded-xl bg-emerald-600/10 dark:bg-emerald-400/12 px-4 py-2.5 text-sm font-bold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-600/18 transition active:scale-[0.98]"
              >
                <span>تشغيل الأجهزة الجامعية</span>
                <ArrowLeft size={16} />
              </button>
            </div>
          </article>
        </div>
      </section>

      {/* 3. Quick-Launch Experiments Grid */}
      <section className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              تجارب سريعة جاهزة للتشغيل الفوري
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              اختر أي تجربة لتحميل كواشفها المعايرة تلقائياً داخل الكأس وبدء
              المحاكاة الفيزيائية
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              playSound("navigate");
              onNavigate("curriculum");
            }}
            className="self-start sm:self-auto inline-flex min-h-[42px] items-center gap-2 text-sm font-bold text-blue-700 dark:text-cyan-300 hover:underline active:scale-95"
          >
            <BookOpenCheck size={17} />
            <span>استعراض {totalLessons} دروس أكاديمية موجهة</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {QUICK_EXPERIMENTS.map((preset) => {
            const toneMap: Record<
              QuickExperimentPreset["accentTone"],
              GlassTone
            > = {
              blue: "blue",
              cyan: "cyan",
              violet: "violet",
              amber: "amber",
              emerald: "emerald",
              rose: "rose",
            };

            return (
              <div
                key={preset.id}
                className="group glass-card glass-card-interactive rounded-2xl p-5 flex flex-col justify-between gap-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        {preset.categoryLabel} · {preset.reactantIds.length}{" "}
                        كواشف
                      </p>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        {preset.title}
                      </h3>
                    </div>
                    <GlassIcon
                      icon={<Flame size={18} />}
                      tone={toneMap[preset.accentTone]}
                      shape="action"
                    />
                  </div>

                  <div className="overflow-x-auto scrollbar-none rounded-xl bg-slate-900/5 dark:bg-slate-950/60 px-3 py-2 border border-slate-200/70 dark:border-slate-800/80">
                    <ChemicalEquation
                      equation={preset.equationPreview}
                      className="text-xs"
                    />
                  </div>

                  <p className="text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                    {preset.summary}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    playSound("simulation_start");
                    onRunQuickExperiment(preset);
                  }}
                  className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-blue-500/30 dark:border-cyan-400/30 bg-blue-600/8 dark:bg-cyan-400/10 hover:bg-blue-600 hover:text-white dark:hover:bg-cyan-500 dark:hover:text-slate-950 text-xs sm:text-sm font-bold text-blue-700 dark:text-cyan-300 transition-all active:scale-[0.98]"
                >
                  <Play size={15} className="fill-current" />
                  <span>تنفيذ التجربة الآن</span>
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Guided Curriculum Preview + Platform Engineering Pillars */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7 glass-panel rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <GlassIcon
                icon={<BookOpenCheck size={20} />}
                tone="amber"
                shape="module"
                interactive={false}
              />
              <div>
                <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  المسار الأكاديمي والتجارب الموجهة
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                  خطوات عملية تفاعلية متبوعة باختبارات فهم علمي وأوسمة إنجاز
                </p>
              </div>
            </div>
          </div>

          <div className="divide-y divide-slate-200/70 dark:divide-slate-800/80">
            {EXPERIMENT_LESSONS.slice(0, 3).map((lesson) => (
              <div
                key={lesson.id}
                className="py-3.5 first:pt-1 last:pb-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                    {lesson.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {lesson.difficulty === "beginner"
                      ? "مستوى تأسيسي"
                      : lesson.difficulty === "intermediate"
                      ? "مستوى متوسط"
                      : "مستوى جامعي متقدم"}{" "}
                    ·{" "}
                    <span className="font-mono tabular-nums">
                      {lesson.durationMinutes}
                    </span>{" "}
                    دقائق · {lesson.quiz.length} أسئلة تقييم
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onStartLesson(lesson.id)}
                  className="self-start sm:self-center shrink-0 inline-flex min-h-[42px] items-center gap-2 rounded-xl bg-amber-500/12 hover:bg-amber-500/22 border border-amber-500/30 px-4 py-2 text-xs font-bold text-amber-800 dark:text-amber-300 transition"
                >
                  <span>بدء الدرس العملي</span>
                  <ArrowLeft size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Scientific Reliability & Safety Capabilities */}
        <div className="lg:col-span-5 glass-panel rounded-2xl p-5 sm:p-6 space-y-4">
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
            معايير الدقة العلمية والسلامة
          </h2>
          <div className="space-y-3.5">
            <div className="flex items-start gap-3">
              <GlassIcon
                icon={<Thermometer size={18} />}
                tone="blue"
                shape="action"
                interactive={false}
              />
              <div className="space-y-0.5">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  ديناميكا حرارية وحركية واقعية
                </h3>
                <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                  تتبع حي لمنحنى درجة الحرارة والرقم الهيدروجيني pH وتأثير
                  اللزوجة وسرعة التحريك المغناطيسي.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <GlassIcon
                icon={<Sliders size={18} />}
                tone="violet"
                shape="action"
                interactive={false}
              />
              <div className="space-y-0.5">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  استنتاج ذكي للتراكيب غير المسبوقة
                </h3>
                <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                  دمج قاعدة المعادلات القياسية الموثقة مع محرك استنتاج كيميائي
                  لتحليل أي مزيج مخصص أو عناصر ذرية.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <GlassIcon
                icon={<ShieldCheck size={18} />}
                tone="rose"
                shape="action"
                interactive={false}
              />
              <div className="space-y-0.5">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  نظام إنذار السلامة المخبرية
                </h3>
                <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                  تنبيهات علمية فورية عند تكون غازات سامة كالكلور أو تفاعلات
                  طاردة للحرارة بشدة كالصوديوم وغرينيار.
                </p>
              </div>
            </div>

            {/* Developer Profile Card */}
            <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <img
                  src="/assets/aistudio/WhatsApp_Image_2026-09-10_at_11.57.19_PM_b38793ef.jpeg"
                  alt="محمد محمود"
                  className="h-11 w-11 shrink-0 rounded-full object-cover border-2 border-blue-500/50 shadow-md"
                />
                <div className="space-y-0.5 min-w-0">
                  <span className="block text-[11px] font-bold text-slate-500 dark:text-slate-400">
                    إعداد المطور
                  </span>
                  <span className="block text-sm font-extrabold text-slate-900 dark:text-white truncate">
                    محمد محمود
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 mt-2 sm:mt-0">
                <button
                  type="button"
                  onClick={() => {
                    setIsAuditReportOpen(true);
                    playSound("modal_open");
                  }}
                  title="عرض تقرير المراجعة والتدقيق العلمي المعتمد لجميع دروس بكالوريا الكيمياء"
                  className="group inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 px-3.5 py-2 text-xs font-bold text-emerald-700 dark:text-emerald-300 transition-all active:scale-95 shadow-xs shrink-0"
                >
                  <ShieldCheck size={15} className="text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
                  <span>📋 تقرير التدقيق العلمي لكتاب الوزارة</span>
                </button>

                <a
                  href="https://mohamed-mahmoud-official.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="🌐 موقع المطور | Mohamed Mahmoud"
                  className="group inline-flex items-center gap-2 rounded-xl border border-cyan-500/40 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 hover:from-cyan-500/20 hover:to-blue-500/20 px-3.5 py-2 text-xs font-bold text-cyan-700 dark:text-cyan-300 transition-all active:scale-95 shadow-xs shrink-0"
                >
                  <Globe size={15} className="text-cyan-600 dark:text-cyan-400 group-hover:rotate-12 transition-transform" />
                  <span>🌐 موقع المطور | Mohamed Mahmoud</span>
                  <ExternalLink size={13} className="opacity-75" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Developer Final Audit Report Modal */}
      {isAuditReportOpen && (
        <DeveloperAuditReportModal
          onClose={() => {
            setIsAuditReportOpen(false);
            playSound("modal_close");
          }}
        />
      )}
    </div>
  );
};
