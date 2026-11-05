import React, { useState, useEffect } from "react";
import {
  Atom,
  BookOpenCheck,
  ChevronLeft,
  FlaskConical,
  GraduationCap,
  Home,
  Menu,
  Microscope,
  Moon,
  Sparkles,
  Sun,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { AppPage } from "../types";
import { GlassIcon, GlassTone } from "./GlassIcon";

interface NavigationChromeProps {
  activePage: AppPage;
  onNavigate: (page: AppPage) => void;
  isDark: boolean;
  onToggleTheme: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenSoundSettings: () => void;
  beakerCount: number;
  scorePoints: number;
}

const NAV_ITEMS: {
  id: AppPage;
  labelDesktop: string;
  labelCompact: string;
  labelMobile: string;
  description: string;
  tone: GlassTone;
  renderIcon: (size: number) => React.ReactNode;
}[] = [
  {
    id: "home",
    labelDesktop: "الرئيسية",
    labelCompact: "الرئيسية",
    labelMobile: "الرئيسية",
    description: "الواجهة الرئيسية وميزات المنصة والمحاكاة السريعة",
    tone: "blue",
    renderIcon: (s) => <Home size={s} strokeWidth={2.1} />,
  },
  {
    id: "baccalaureate",
    labelDesktop: "كيمياء البكالوريا",
    labelCompact: "البكالوريا",
    labelMobile: "البكالوريا",
    description: "المنهج الدراسي لكيمياء الثانوية العامة والمسائل المحلولة",
    tone: "indigo",
    renderIcon: (s) => <GraduationCap size={s} strokeWidth={2.1} />,
  },
  {
    id: "lab",
    labelDesktop: "المختبر التفاعلي",
    labelCompact: "المختبر",
    labelMobile: "المختبر",
    description: "خلط الكواشف، محاكاة التصادم الجزيئي، وقياس الحرارة وpH",
    tone: "cyan",
    renderIcon: (s) => <FlaskConical size={s} strokeWidth={2.1} />,
  },
  {
    id: "periodic",
    labelDesktop: "الجدول الدوري",
    labelCompact: "الجدول الدوري",
    labelMobile: "العناصر",
    description: "الجدول الدوري الشامل مع خصائص الـ 118 عنصراً كيميائياً",
    tone: "violet",
    renderIcon: (s) => <Atom size={s} strokeWidth={2.1} />,
  },
  {
    id: "instruments",
    labelDesktop: "أجهزة الجامعة",
    labelCompact: "الأجهزة",
    labelMobile: "الأجهزة",
    description: "أجهزة التحليل الكيميائي المتقدمة (Spectroscopy & NMR)",
    tone: "emerald",
    renderIcon: (s) => <Microscope size={s} strokeWidth={2.1} />,
  },
  {
    id: "curriculum",
    labelDesktop: "الدروس والإنجازات",
    labelCompact: "الدروس",
    labelMobile: "الإنجازات",
    description: "سجل التجارب، الاختبارات التفاعلية، والأوسمة المكتسبة",
    tone: "amber",
    renderIcon: (s) => <BookOpenCheck size={s} strokeWidth={2.1} />,
  },
];

export const NavigationChrome: React.FC<NavigationChromeProps> = ({
  activePage,
  onNavigate,
  isDark,
  onToggleTheme,
  isMuted,
  onToggleMute,
  onOpenSoundSettings,
  beakerCount,
  scorePoints,
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Close drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && drawerOpen) {
        setDrawerOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [drawerOpen]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  const handleNavClick = (page: AppPage) => {
    onNavigate(page);
    setDrawerOpen(false);
  };

  return (
    <>
      {/* =========================================================================
          Desktop Scientific Top Bar (>= 1024px)
          Strictly proportional single-row layout for 1024px to 1920px+
         ========================================================================= */}
      <header className="hidden lg:block sticky top-0 z-40 glass-panel border-x-0 border-t-0 shadow-xs backdrop-blur-md">
        <div className="mx-auto flex h-[62px] max-w-[1480px] items-center justify-between gap-1.5 lg:gap-2.5 px-3 lg:px-5">
          {/* Zone 1: Brand Lockup */}
          <button
            type="button"
            onClick={() => onNavigate("home")}
            className="group flex items-center gap-2 text-start shrink-0 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 py-1 pe-1.5 transition active:scale-95 min-w-0"
          >
            <GlassIcon
              icon={<FlaskConical size={18} strokeWidth={2.2} />}
              tone="cyan"
              shape="nav"
            />
            <div className="flex flex-col min-w-0">
              <span className="whitespace-nowrap text-xs lg:text-sm font-extrabold tracking-tight text-slate-900 dark:text-white">
                المختبر الكيميائي الافتراضي
              </span>
              <span className="hidden 2xl:inline-block text-[9px] font-mono font-semibold text-cyan-600 dark:text-cyan-400">
                منصة المحاكاة التفاعلية
              </span>
            </div>
          </button>

          {/* Zone 2: Primary Single-Row Navigation - All 6 Links Always Visible in Single Row */}
          <nav
            aria-label="التنقل الرئيسي"
            className="flex items-center gap-1 shrink min-w-0 overflow-x-auto scrollbar-none py-1"
          >
            {NAV_ITEMS.map((item) => {
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onNavigate(item.id)}
                  aria-current={isActive ? "page" : undefined}
                  title={item.labelDesktop}
                  className={`group relative flex h-9.5 lg:h-10 items-center gap-1.5 rounded-xl px-2 lg:px-2.5 text-[11px] lg:text-xs font-bold whitespace-nowrap transition-all duration-200 active:scale-[0.98] shrink-0 ${
                    isActive
                      ? "bg-blue-600/12 dark:bg-cyan-400/15 text-blue-700 dark:text-cyan-300 border border-blue-500/35 dark:border-cyan-400/35 shadow-xs"
                      : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-900/5 dark:hover:bg-white/5 border border-transparent"
                  }`}
                >
                  <GlassIcon
                    icon={item.renderIcon(14)}
                    tone={item.tone}
                    shape="xs"
                    active={isActive}
                    interactive={false}
                  />
                  <span>{item.labelCompact}</span>

                  {item.id === "lab" && beakerCount > 0 && (
                    <span className="font-mono tabular-nums text-[10px] font-bold text-cyan-600 dark:text-cyan-300 bg-cyan-500/15 px-1 py-0.2 rounded-full border border-cyan-500/30">
                      {beakerCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Compact Utility Controls (XP + Sound + Theme) */}
          <div className="flex items-center gap-1.5 lg:gap-2 whitespace-nowrap shrink-0">
            {/* Scientific XP Badge */}
            <div
              title="نقاط الخبرة العلمية المكتسبة"
              className="inline-flex items-center gap-1 rounded-lg border border-amber-500/30 dark:border-amber-400/30 bg-amber-500/10 dark:bg-amber-400/10 px-2 py-1 text-[11px] font-mono font-bold tabular-nums text-amber-700 dark:text-amber-300 shrink-0"
            >
              <Sparkles size={12} className="text-amber-500" />
              <span>{scorePoints} XP</span>
            </div>

            {/* Glass Audio Controller Capsule */}
            <div className="inline-flex items-center rounded-xl border border-slate-300/70 dark:border-slate-700/70 bg-white/70 dark:bg-slate-900/60 p-0.5 shadow-xs shrink-0">
              <button
                type="button"
                onClick={onToggleMute}
                aria-label={isMuted ? "تفعيل الصوت" : "كتم الصوت"}
                title={isMuted ? "تفعيل الصوت" : "كتم الصوت"}
                className={`inline-flex h-8 w-8 items-center justify-center rounded-lg transition-all active:scale-90 ${
                  isMuted
                    ? "text-rose-500 hover:bg-rose-500/10"
                    : "text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/10"
                }`}
              >
                {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
              </button>
              <button
                type="button"
                onClick={onOpenSoundSettings}
                aria-label="إعدادات الصوت الذكي"
                title="إعدادات الصوت ومستويات الصوت"
                className="inline-flex h-8 px-1.5 items-center justify-center rounded-lg text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-500/10 transition-all active:scale-95"
              >
                صوت
              </button>
            </div>

            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={onToggleTheme}
              aria-label={isDark ? "التبديل إلى الوضع النهاري" : "التبديل إلى الوضع الليلي"}
              title={isDark ? "التبديل إلى الوضع النهاري" : "التبديل إلى الوضع الليلي"}
              className="group inline-flex h-9 items-center gap-1.5 rounded-xl border border-slate-300/70 dark:border-slate-700/70 bg-white/75 dark:bg-slate-900/65 px-2.5 text-[11px] font-bold text-slate-800 dark:text-slate-100 hover:border-blue-500/50 transition-all active:scale-95 shadow-xs shrink-0"
            >
              {isDark ? (
                <>
                  <Sun size={14} className="text-amber-400" />
                  <span className="hidden xl:inline">نهاري</span>
                </>
              ) : (
                <>
                  <Moon size={14} className="text-blue-600" />
                  <span className="hidden xl:inline">ليلي</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* =========================================================================
          Mobile & Tablet Top Bar (< 1024px)
          Features prominent Drawer Menu Button, Brand Lockup, XP, and Quick Controls
         ========================================================================= */}
      <header className="lg:hidden sticky top-0 z-40 glass-panel border-x-0 border-t-0 pt-safe">
        <div className="flex h-13 items-center justify-between gap-1.5 px-2.5 sm:px-3">
          {/* Brand Logo & Title */}
          <button
            type="button"
            onClick={() => onNavigate("home")}
            className="flex min-w-0 items-center gap-1.5 text-start active:scale-95 transition shrink"
          >
            <GlassIcon
              icon={<FlaskConical size={16} strokeWidth={2.2} />}
              tone="cyan"
              shape="nav"
              interactive={false}
            />
            <div className="min-w-0">
              <span className="truncate block text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
                المختبر الكيميائي
              </span>
            </div>
          </button>

          {/* Quick Controls & Menu Trigger */}
          <div className="flex items-center gap-1 shrink-0">
            {/* XP readout */}
            <span className="text-[10px] font-bold font-mono tabular-nums text-amber-700 dark:text-amber-300 bg-amber-500/10 px-1.5 py-0.5 rounded-md border border-amber-500/25">
              {scorePoints} XP
            </span>

            {/* Sound button */}
            <button
              type="button"
              onClick={onOpenSoundSettings}
              aria-label="إعدادات الصوت"
              className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300/70 dark:border-slate-700/70 bg-white/70 dark:bg-slate-900/60 transition active:scale-90 ${
                isMuted ? "text-rose-500" : "text-cyan-600 dark:text-cyan-400"
              }`}
            >
              {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
            </button>

            {/* Theme button */}
            <button
              type="button"
              onClick={onToggleTheme}
              aria-label={isDark ? "الوضع النهاري" : "الوضع الليلي"}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300/70 dark:border-slate-700/70 bg-white/70 dark:bg-slate-900/60 text-slate-700 dark:text-slate-200 active:scale-90 transition"
            >
              {isDark ? (
                <Sun size={15} className="text-amber-400" />
              ) : (
                <Moon size={15} className="text-blue-600" />
              )}
            </button>

            {/* Slide-out Menu Drawer Trigger Button */}
            <button
              type="button"
              onClick={() => setDrawerOpen((prev) => !prev)}
              aria-label={drawerOpen ? "إغلاق القائمة الجانبية" : "فتح القائمة الجانبية"}
              aria-expanded={drawerOpen}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-blue-500/40 bg-blue-600/10 dark:bg-cyan-400/15 text-blue-700 dark:text-cyan-300 transition active:scale-90 shadow-xs"
            >
              {drawerOpen ? <X size={17} /> : <Menu size={17} />}
            </button>
          </div>
        </div>
      </header>

      {/* =========================================================================
          Mobile & Tablet Slide-Out Navigation Drawer
          Fluid, glassmorphic sidebar sliding smoothly from the right in RTL
         ========================================================================= */}
      {drawerOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="القائمة الجانبية الرئيسية"
          className="fixed inset-0 z-50 lg:hidden flex justify-end animate-in fade-in duration-200"
        >
          {/* Dimmed Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/65 backdrop-blur-sm transition-opacity"
            onClick={() => setDrawerOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="relative z-50 flex h-full w-[310px] sm:w-[350px] max-w-[85vw] flex-col glass-modal border-s border-slate-300/70 dark:border-slate-800 shadow-2xl overflow-y-auto p-4 sm:p-5">
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800/80 pb-4 mb-4">
              <div className="flex items-center gap-2.5">
                <GlassIcon
                  icon={<FlaskConical size={20} strokeWidth={2.2} />}
                  tone="cyan"
                  shape="action"
                />
                <div>
                  <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
                    المختبر الكيميائي
                  </h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    المنصة العلمية التفاعلية
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="إغلاق القائمة"
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-300/70 dark:border-slate-700/70 bg-white/80 dark:bg-slate-900/70 text-slate-700 dark:text-slate-300 active:scale-90 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* User Progress Banner */}
            <div className="rounded-2xl border border-blue-500/25 dark:border-cyan-400/25 bg-gradient-to-br from-blue-600/10 via-cyan-500/5 to-transparent p-3.5 mb-4 space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                <span className="flex items-center gap-1.5">
                  <Sparkles size={14} className="text-amber-500" />
                  <span>الخبرة العلمية المكتسبة</span>
                </span>
                <span className="font-mono text-cyan-700 dark:text-cyan-300">
                  {scorePoints} XP
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                أكمل الدروس والتجارب لفتح أوسمة التحليل المتقدمة.
              </p>
            </div>

            {/* Main Navigation Links List */}
            <div className="space-y-2 flex-1">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
                أقسام المنصة
              </div>
              {NAV_ITEMS.map((item) => {
                const isActive = activePage === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNavClick(item.id)}
                    className={`group flex w-full items-center justify-between gap-3 rounded-2xl p-2.5 text-start transition active:scale-[0.98] ${
                      isActive
                        ? "bg-blue-600/15 dark:bg-cyan-400/15 border border-blue-500/40 dark:border-cyan-400/40 shadow-xs"
                        : "hover:bg-slate-900/5 dark:hover:bg-white/5 border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <GlassIcon
                        icon={item.renderIcon(18)}
                        tone={item.tone}
                        shape="module"
                        active={isActive}
                        interactive={false}
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-sm font-bold truncate ${
                              isActive
                                ? "text-blue-700 dark:text-cyan-300 font-extrabold"
                                : "text-slate-800 dark:text-slate-200"
                            }`}
                          >
                            {item.labelDesktop}
                          </span>
                          {item.id === "lab" && beakerCount > 0 && (
                            <span className="text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-600 dark:text-cyan-300 px-1.5 py-0.5 rounded-full border border-cyan-500/30">
                              {beakerCount} مواد
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {item.description}
                        </p>
                      </div>
                    </div>
                    <ChevronLeft
                      size={16}
                      className={`shrink-0 transition-transform ${
                        isActive
                          ? "text-blue-600 dark:text-cyan-300 -translate-x-1"
                          : "text-slate-400 opacity-60"
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            {/* Quick Settings Footer in Drawer */}
            <div className="border-t border-slate-200/80 dark:border-slate-800/80 pt-4 mt-4 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onOpenSoundSettings();
                    setDrawerOpen(false);
                  }}
                  className="flex items-center justify-center gap-2 rounded-xl border border-slate-300/70 dark:border-slate-700/70 bg-white/70 dark:bg-slate-900/60 p-2 text-xs font-bold text-slate-700 dark:text-slate-300 active:scale-95 transition"
                >
                  <Volume2 size={16} className="text-cyan-600 dark:text-cyan-400" />
                  <span>إعدادات الصوت</span>
                </button>

                <button
                  type="button"
                  onClick={onToggleTheme}
                  className="flex items-center justify-center gap-2 rounded-xl border border-slate-300/70 dark:border-slate-700/70 bg-white/70 dark:bg-slate-900/60 p-2 text-xs font-bold text-slate-700 dark:text-slate-300 active:scale-95 transition"
                >
                  {isDark ? (
                    <>
                      <Sun size={16} className="text-amber-400" />
                      <span>وضع نهاري</span>
                    </>
                  ) : (
                    <>
                      <Moon size={16} className="text-blue-600" />
                      <span>وضع ليلي</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          Dedicated Mobile Bottom Glass Tab Bar (< 1024px)
          Thumb-friendly quick navigation across the 6 core platform areas
         ========================================================================= */}
      <nav
        aria-label="التنقل السفلي للموبايل"
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 glass-panel border-x-0 border-b-0 pb-safe shadow-lg backdrop-blur-lg"
      >
        <div className="mx-auto grid max-w-lg grid-cols-6 items-center px-1 pt-1.5 pb-1">
          {NAV_ITEMS.map((item) => {
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                aria-current={isActive ? "page" : undefined}
                className="group relative flex min-h-[52px] flex-col items-center justify-center gap-0.5 rounded-xl px-0.5 py-1 transition active:scale-95"
              >
                <span className="relative flex items-center justify-center">
                  <GlassIcon
                    icon={item.renderIcon(16)}
                    tone={item.tone}
                    shape="nav"
                    active={isActive}
                    interactive={false}
                  />
                  {item.id === "lab" && beakerCount > 0 && (
                    <span className="absolute -top-1 -start-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-600 dark:bg-cyan-400 px-1 text-[9px] font-bold font-mono tabular-nums text-white dark:text-slate-950 shadow-xs">
                      {beakerCount}
                    </span>
                  )}
                </span>
                <span
                  className={`text-[10px] leading-tight font-bold truncate max-w-full mt-0.5 ${
                    isActive
                      ? "text-blue-700 dark:text-cyan-300"
                      : "text-slate-600 dark:text-slate-400"
                  }`}
                >
                  {item.labelMobile}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};

