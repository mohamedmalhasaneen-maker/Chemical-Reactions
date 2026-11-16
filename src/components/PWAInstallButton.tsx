import React from "react";
import {
  CheckCircle2,
  Download,
  Monitor,
  Share,
  Smartphone,
  X,
} from "lucide-react";
import { usePWAInstall } from "../hooks/usePWAInstall";
import { playSound } from "../utils/soundEngine";

interface PWAInstallButtonProps {
  variant?: "hero" | "header" | "drawer";
  onInstalledToast?: (msg: string) => void;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = "hero",
  onInstalledToast,
}) => {
  const {
    isInstalled,
    platform,
    showManualGuide,
    setShowManualGuide,
    triggerInstall,
  } = usePWAInstall();

  const handleClick = async () => {
    if (isInstalled) {
      playSound("click");
      onInstalledToast?.("التطبيق مثبت ويعمل بالفعل في وضع التشغيل المستقل دون إنترنت.");
      return;
    }
    playSound("select");
    const outcome = await triggerInstall();
    if (outcome === "accepted") {
      playSound("achievement");
      onInstalledToast?.("تم تثبيت تطبيق المختبر الكيميائي على جهازك بنجاح!");
    }
  };

  return (
    <>
      {variant === "hero" && (
        <button
          type="button"
          onClick={handleClick}
          className={`group inline-flex min-h-[48px] items-center justify-center gap-2.5 rounded-2xl px-5 py-3 text-sm sm:text-base font-bold transition-all active:scale-[0.97] shadow-md ${
            isInstalled
              ? "border border-emerald-500/45 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
              : "border border-cyan-500/50 bg-gradient-to-r from-emerald-600/90 to-cyan-600/90 hover:from-emerald-500 hover:to-cyan-500 text-white shadow-[0_10px_24px_-6px_rgba(16,185,129,0.45)]"
          }`}
        >
          {isInstalled ? (
            <>
              <CheckCircle2 size={19} className="text-emerald-500 dark:text-emerald-300" />
              <span>التطبيق مثبت</span>
            </>
          ) : (
            <>
              <Download size={19} className="group-hover:translate-y-0.5 transition-transform" />
              <span>تنزيل التطبيق</span>
            </>
          )}
        </button>
      )}

      {variant === "header" && (
        <button
          type="button"
          onClick={handleClick}
          title={isInstalled ? "التطبيق مثبت على جهازك" : "تثبيت التطبيق للعمل دون إنترنت"}
          className={`inline-flex h-9 items-center gap-1.5 rounded-xl px-2.5 text-[11px] font-bold transition-all active:scale-95 shrink-0 ${
            isInstalled
              ? "border border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
              : "border border-emerald-500/45 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-700 dark:text-emerald-300"
          }`}
        >
          {isInstalled ? <CheckCircle2 size={14} /> : <Download size={14} />}
          <span className="hidden xl:inline">
            {isInstalled ? "التطبيق مثبت" : "تنزيل التطبيق"}
          </span>
        </button>
      )}

      {variant === "drawer" && (
        <button
          type="button"
          onClick={handleClick}
          className={`flex w-full items-center justify-between gap-3 rounded-2xl p-3 text-start transition active:scale-[0.98] border ${
            isInstalled
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
              : "border-emerald-500/45 bg-gradient-to-r from-emerald-600/20 to-cyan-600/15 text-emerald-800 dark:text-emerald-200"
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {isInstalled ? (
              <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
            ) : (
              <Download size={18} className="text-emerald-400 shrink-0" />
            )}
            <div className="min-w-0">
              <span className="text-xs sm:text-sm font-extrabold block">
                {isInstalled ? "التطبيق مثبت" : "تنزيل التطبيق"}
              </span>
              <span className="text-[11px] opacity-80 block truncate">
                {isInstalled
                  ? "جاهز للتشغيل الكامل دون إنترنت"
                  : "تثبيت على الهاتف أو الكمبيوتر كـ PWA"}
              </span>
            </div>
          </div>
        </button>
      )}

      {/* Manual Install Guide Modal when native prompt is unavailable (iOS Safari / Desktop Menu) */}
      {showManualGuide && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="دليل تثبيت التطبيق"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn"
        >
          <div className="relative w-full max-w-md rounded-3xl border border-cyan-500/35 bg-slate-900 p-6 text-slate-100 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                {platform === "desktop" ? (
                  <Monitor size={20} className="text-cyan-400" />
                ) : (
                  <Smartphone size={20} className="text-cyan-400" />
                )}
                <h3 className="text-base font-extrabold text-white">
                  تثبيت «المختبر الكيميائي» على جهازك
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowManualGuide(false)}
                className="h-8 w-8 rounded-xl bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X size={16} />
              </button>
            </div>

            {platform === "ios" ? (
              <ol className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed list-decimal list-inside">
                <li>
                  اضغط على زر المشاركة{" "}
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-800 text-cyan-300 font-bold">
                    <Share size={13} /> مشاركة
                  </span>{" "}
                  في شريط متصفح Safari السفلي.
                </li>
                <li>
                  مرر للأسفل واختر{" "}
                  <strong className="text-white">«إضافة إلى الشاشة الرئيسية» (Add to Home Screen)</strong>.
                </li>
                <li>اضغط <strong className="text-emerald-400">إضافة</strong> لفتح التطبيق مباشرة في وضع Standalone دون إنترنت.</li>
              </ol>
            ) : platform === "android" ? (
              <ol className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed list-decimal list-inside">
                <li>افتح قائمة المتصفح (⋮ أعلى الشاشة في Chrome / Edge).</li>
                <li>
                  اختر <strong className="text-white">«تثبيت التطبيق» (Install App)</strong> أو{" "}
                  <strong className="text-white">«الإضافة إلى الشاشة الرئيسية»</strong>.
                </li>
                <li>أكد التثبيت لتظهر أيقونة المختبر الكيميائي على شاشة هاتفك.</li>
              </ol>
            ) : (
              <ol className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed list-decimal list-inside">
                <li>انقر على أيقونة التثبيت الموجودة في شريط العنوان بمتصفح Chrome أو Edge.</li>
                <li>أو افتح قائمة المتصفح (⋮) ← <strong className="text-white">الحفظ والمشاركة ← تثبيت التطبيق</strong>.</li>
                <li>سيُفتح المختبر في نافذة مستقلة على سطح المكتب ويعمل دون اتصال بالإنترنت.</li>
              </ol>
            )}

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowManualGuide(false)}
                className="rounded-xl bg-cyan-600 hover:bg-cyan-500 px-5 py-2 text-xs font-extrabold text-white transition"
              >
                حسناً، فهمت
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
