import React from "react";

export type GlassTone =
  | "blue"
  | "cyan"
  | "violet"
  | "emerald"
  | "amber"
  | "rose"
  | "indigo"
  | "teal"
  | "slate";

export type GlassShape = "hero" | "module" | "action" | "nav" | "orb" | "compact" | "xs";

interface GlassIconProps {
  icon: React.ReactNode;
  tone?: GlassTone;
  shape?: GlassShape;
  active?: boolean;
  interactive?: boolean;
  className?: string;
  ariaHidden?: boolean;
}

const TONE_STYLES: Record<
  GlassTone,
  {
    surface: string;
    border: string;
    text: string;
    glow: string;
    specular: string;
    highlight: string;
  }
> = {
  blue: {
    surface:
      "bg-gradient-to-br from-blue-500/25 via-blue-600/12 to-indigo-600/10 dark:from-blue-400/28 dark:via-blue-500/16 dark:to-slate-900/50",
    border:
      "border-blue-500/40 dark:border-blue-400/45",
    text: "text-blue-600 dark:text-blue-300",
    glow: "shadow-[0_4px_16px_-2px_rgba(37,99,235,0.32),inset_0_1px_0_rgba(255,255,255,0.55)] dark:shadow-[0_6px_20px_-2px_rgba(59,130,246,0.42),inset_0_1px_0_rgba(255,255,255,0.25)]",
    specular: "from-white/80 via-blue-200/30 to-transparent dark:from-white/45 dark:via-blue-300/20 dark:to-transparent",
    highlight: "bg-blue-400/20 dark:bg-blue-400/25",
  },
  cyan: {
    surface:
      "bg-gradient-to-br from-cyan-500/25 via-sky-500/12 to-blue-500/10 dark:from-cyan-400/28 dark:via-sky-500/16 dark:to-slate-900/50",
    border:
      "border-cyan-500/40 dark:border-cyan-400/45",
    text: "text-cyan-700 dark:text-cyan-300",
    glow: "shadow-[0_4px_16px_-2px_rgba(8,145,178,0.32),inset_0_1px_0_rgba(255,255,255,0.55)] dark:shadow-[0_6px_20px_-2px_rgba(34,211,238,0.40)]",
    specular: "from-white/80 via-cyan-200/30 to-transparent dark:from-white/45 dark:via-cyan-300/20 dark:to-transparent",
    highlight: "bg-cyan-400/20 dark:bg-cyan-400/25",
  },
  violet: {
    surface:
      "bg-gradient-to-br from-violet-500/25 via-purple-500/12 to-indigo-500/10 dark:from-violet-400/28 dark:via-purple-500/16 dark:to-slate-900/50",
    border:
      "border-violet-500/40 dark:border-violet-400/45",
    text: "text-violet-700 dark:text-violet-300",
    glow: "shadow-[0_4px_16px_-2px_rgba(109,40,217,0.30),inset_0_1px_0_rgba(255,255,255,0.55)] dark:shadow-[0_6px_20px_-2px_rgba(139,92,246,0.40)]",
    specular: "from-white/80 via-violet-200/30 to-transparent dark:from-white/45 dark:via-violet-300/20 dark:to-transparent",
    highlight: "bg-violet-400/20 dark:bg-violet-400/25",
  },
  emerald: {
    surface:
      "bg-gradient-to-br from-emerald-500/25 via-teal-500/12 to-cyan-500/10 dark:from-emerald-400/28 dark:via-teal-500/16 dark:to-slate-900/50",
    border:
      "border-emerald-500/40 dark:border-emerald-400/45",
    text: "text-emerald-700 dark:text-emerald-300",
    glow: "shadow-[0_4px_16px_-2px_rgba(5,150,105,0.30),inset_0_1px_0_rgba(255,255,255,0.55)] dark:shadow-[0_6px_20px_-2px_rgba(16,185,129,0.38)]",
    specular: "from-white/80 via-emerald-200/30 to-transparent dark:from-white/45 dark:via-emerald-300/20 dark:to-transparent",
    highlight: "bg-emerald-400/20 dark:bg-emerald-400/25",
  },
  amber: {
    surface:
      "bg-gradient-to-br from-amber-500/26 via-orange-500/12 to-yellow-500/10 dark:from-amber-400/28 dark:via-orange-500/16 dark:to-slate-900/50",
    border:
      "border-amber-500/45 dark:border-amber-400/45",
    text: "text-amber-700 dark:text-amber-300",
    glow: "shadow-[0_4px_16px_-2px_rgba(217,119,6,0.30),inset_0_1px_0_rgba(255,255,255,0.55)] dark:shadow-[0_6px_20px_-2px_rgba(245,158,11,0.38)]",
    specular: "from-white/80 via-amber-200/30 to-transparent dark:from-white/45 dark:via-amber-300/20 dark:to-transparent",
    highlight: "bg-amber-400/20 dark:bg-amber-400/25",
  },
  rose: {
    surface:
      "bg-gradient-to-br from-rose-500/26 via-pink-500/12 to-red-500/10 dark:from-rose-400/28 dark:via-pink-500/16 dark:to-slate-900/50",
    border:
      "border-rose-500/45 dark:border-rose-400/45",
    text: "text-rose-700 dark:text-rose-300",
    glow: "shadow-[0_4px_16px_-2px_rgba(225,29,72,0.30),inset_0_1px_0_rgba(255,255,255,0.55)] dark:shadow-[0_6px_20px_-2px_rgba(244,63,94,0.40)]",
    specular: "from-white/80 via-rose-200/30 to-transparent dark:from-white/45 dark:via-rose-300/20 dark:to-transparent",
    highlight: "bg-rose-400/20 dark:bg-rose-400/25",
  },
  indigo: {
    surface:
      "bg-gradient-to-br from-indigo-500/25 via-blue-600/12 to-slate-900/10 dark:from-indigo-400/28 dark:via-indigo-500/16 dark:to-slate-900/50",
    border:
      "border-indigo-500/40 dark:border-indigo-400/45",
    text: "text-indigo-700 dark:text-indigo-300",
    glow: "shadow-[0_4px_16px_-2px_rgba(79,70,229,0.30),inset_0_1px_0_rgba(255,255,255,0.55)] dark:shadow-[0_6px_20px_-2px_rgba(99,102,241,0.40)]",
    specular: "from-white/80 via-indigo-200/30 to-transparent dark:from-white/45 dark:via-indigo-300/20 dark:to-transparent",
    highlight: "bg-indigo-400/20 dark:bg-indigo-400/25",
  },
  teal: {
    surface:
      "bg-gradient-to-br from-teal-500/25 via-emerald-600/12 to-cyan-500/10 dark:from-teal-400/28 dark:via-teal-500/16 dark:to-slate-900/50",
    border:
      "border-teal-500/40 dark:border-teal-400/45",
    text: "text-teal-700 dark:text-teal-300",
    glow: "shadow-[0_4px_16px_-2px_rgba(13,148,136,0.30),inset_0_1px_0_rgba(255,255,255,0.55)] dark:shadow-[0_6px_20px_-2px_rgba(20,184,166,0.40)]",
    specular: "from-white/80 via-teal-200/30 to-transparent dark:from-white/45 dark:via-teal-300/20 dark:to-transparent",
    highlight: "bg-teal-400/20 dark:bg-teal-400/25",
  },
  slate: {
    surface:
      "bg-gradient-to-br from-slate-500/18 via-slate-400/12 to-slate-300/6 dark:from-slate-300/16 dark:via-slate-500/12 dark:to-slate-900/50",
    border:
      "border-slate-400/40 dark:border-slate-500/40",
    text: "text-slate-700 dark:text-slate-200",
    glow: "shadow-[0_4px_14px_-2px_rgba(15,23,42,0.18),inset_0_1px_0_rgba(255,255,255,0.55)] dark:shadow-[0_6px_18px_-2px_rgba(2,6,23,0.5)]",
    specular: "from-white/80 via-slate-200/25 to-transparent dark:from-white/30 dark:via-slate-300/15 dark:to-transparent",
    highlight: "bg-slate-400/15 dark:bg-slate-400/20",
  },
};

const SHAPE_STYLES: Record<GlassShape, string> = {
  hero: "w-14 h-14 rounded-2xl",
  module: "w-11 h-11 rounded-xl",
  action: "w-9.5 h-9.5 rounded-xl",
  nav: "w-8 h-8 rounded-lg",
  orb: "w-10 h-10 rounded-full",
  compact: "w-7.5 h-7.5 rounded-lg",
  xs: "w-6 h-6 rounded-md",
};

export const GlassIcon: React.FC<GlassIconProps> = ({
  icon,
  tone = "blue",
  shape = "module",
  active = false,
  interactive = true,
  className = "",
  ariaHidden = true,
}) => {
  const palette = TONE_STYLES[tone];
  const geometry = SHAPE_STYLES[shape];

  return (
    <span
      aria-hidden={ariaHidden}
      className={[
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden select-none backdrop-blur-md border",
        geometry,
        palette.surface,
        palette.border,
        palette.text,
        palette.glow,
        active
          ? "ring-2 ring-blue-500/50 dark:ring-cyan-400/50 scale-[1.04] shadow-md"
          : "",
        interactive
          ? "transition-all duration-200 group-hover:-translate-y-0.5 group-hover:brightness-110 group-active:scale-95"
          : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* Top 3D Specular Glass Reflection */}
      <span
        className={`pointer-events-none absolute inset-x-0 top-0 h-[52%] bg-gradient-to-b ${palette.specular} opacity-90`}
      />

      {/* Subtle Inner 3D Glass Prism Border */}
      <span className="pointer-events-none absolute inset-[1px] rounded-[inherit] border border-white/40 dark:border-white/14" />

      {/* High-Contrast Clear Icon Layer */}
      <span className="relative z-10 flex items-center justify-center drop-shadow-[0_1px_1.5px_rgba(0,0,0,0.18)]">
        {icon}
      </span>
    </span>
  );
};
