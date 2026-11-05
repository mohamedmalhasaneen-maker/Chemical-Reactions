import React, { useEffect, useRef, useState } from "react";
import {
  Bell,
  Sliders,
  Volume1,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { soundEngine, SoundFeedbackConfig } from "../utils/soundEngine";
import { GlassIcon } from "./GlassIcon";

interface SoundSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SoundSettingsModal: React.FC<SoundSettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [config, setConfig] = useState<SoundFeedbackConfig>(soundEngine.getConfig());
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsub = soundEngine.subscribe(setConfig);
    return unsub;
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        soundEngine.play("modal_close");
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="إعدادات الصوت والمؤثرات التفاعلية"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-3 sm:p-5"
      onClick={() => {
        soundEngine.play("modal_close");
        onClose();
      }}
    >
      <div
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        className="glass-modal w-full max-w-md rounded-3xl p-5 sm:p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <GlassIcon
              icon={<Volume2 size={20} />}
              tone="cyan"
              shape="action"
              interactive={false}
            />
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                إعدادات الصوت الذكي والتفاعل
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                مؤثرات فيزيائية ونغمات استجابة فورية
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              soundEngine.play("modal_close");
              onClose();
            }}
            aria-label="إغلاق إعدادات الصوت"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-300/70 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60 text-slate-700 dark:text-slate-200 hover:border-rose-500/50 transition active:scale-95"
          >
            <X size={17} />
          </button>
        </div>

        {/* Master Toggle Button */}
        <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-900/5 dark:bg-slate-950/50 p-4">
          <div className="flex items-center gap-3">
            {config.enabled && config.masterVolume > 0.01 ? (
              <span className="text-cyan-600 dark:text-cyan-400">
                <Volume2 size={22} />
              </span>
            ) : (
              <span className="text-rose-500">
                <VolumeX size={22} />
              </span>
            )}
            <div>
              <div className="text-sm font-bold text-slate-900 dark:text-white">
                {config.enabled ? "الصوت مفعّل" : "الوضع الصامت (Muted)"}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                {config.enabled
                  ? "تفعيل نغمات الأزرار والمحاكاة التفاعلية"
                  : "كتم جميع أصوات التفاعل والمحاكاة"}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              const next = !config.enabled;
              soundEngine.setEnabled(next);
              if (next) {
                soundEngine.play("success");
              }
            }}
            className={`min-h-[40px] px-4 rounded-xl text-xs font-bold transition-all active:scale-95 ${
              config.enabled
                ? "bg-cyan-600 hover:bg-cyan-500 text-white shadow-xs"
                : "bg-slate-300/80 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
            }`}
          >
            {config.enabled ? "تعطيل" : "تشغيل"}
          </button>
        </div>

        {/* Volume Sliders */}
        <div className={`space-y-4 ${!config.enabled ? "opacity-40 pointer-events-none" : ""}`}>
          {/* Master Volume */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Sliders size={14} className="text-cyan-500" />
                <span>مستوى الصوت العام</span>
              </span>
              <span dir="ltr" className="font-mono tabular-nums text-cyan-600 dark:text-cyan-300">
                {Math.round(config.masterVolume * 100)}%
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={config.masterVolume}
              onChange={(e) => {
                soundEngine.setMasterVolume(parseFloat(e.target.value));
              }}
              className="w-full accent-cyan-500 h-2 rounded-lg cursor-pointer"
            />
          </div>

          {/* UI Clicks Volume */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Volume1 size={14} className="text-blue-500" />
                <span>أصوات الأزرار والتنقل (UI Clicks)</span>
              </span>
              <span dir="ltr" className="font-mono tabular-nums text-blue-600 dark:text-blue-300">
                {Math.round(config.uiVolume * 100)}%
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={config.uiVolume}
              onChange={(e) => {
                soundEngine.setUiVolume(parseFloat(e.target.value));
              }}
              className="w-full accent-blue-600 h-2 rounded-lg cursor-pointer"
            />
          </div>

          {/* Simulation & Reaction Volume */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Bell size={14} className="text-violet-500" />
                <span>أصوات المحاكاة والتفاعلات (Reactions)</span>
              </span>
              <span dir="ltr" className="font-mono tabular-nums text-violet-600 dark:text-violet-300">
                {Math.round(config.effectsVolume * 100)}%
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={config.effectsVolume}
              onChange={(e) => {
                soundEngine.setEffectsVolume(parseFloat(e.target.value));
              }}
              className="w-full accent-violet-500 h-2 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* Quick Test Audio Button */}
        <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3">
          <button
            type="button"
            disabled={!config.enabled}
            onClick={() => soundEngine.play("select")}
            className="flex-1 min-h-[40px] rounded-xl glass-card text-xs font-bold text-slate-800 dark:text-slate-200 hover:border-cyan-400/50 disabled:opacity-40 transition active:scale-95"
          >
            تجربة صوت الزر (Click)
          </button>
          <button
            type="button"
            disabled={!config.enabled}
            onClick={() => soundEngine.play("success")}
            className="flex-1 min-h-[40px] rounded-xl bg-blue-600/15 dark:bg-cyan-400/15 border border-blue-500/30 text-xs font-bold text-blue-700 dark:text-cyan-300 hover:bg-blue-600/25 disabled:opacity-40 transition active:scale-95"
          >
            تجربة صوت النجاح
          </button>
        </div>
      </div>
    </div>
  );
};
