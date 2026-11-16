import React from "react";
import { RefreshCw, Wifi, WifiOff, ArrowUpCircle } from "lucide-react";

interface ConnectivityStatusIndicatorProps {
  isOnline: boolean;
  isSyncing: boolean;
  hasPendingSync: boolean;
  needRefresh: boolean;
  onApplyUpdate: () => void;
  compact?: boolean;
}

export const ConnectivityStatusIndicator: React.FC<ConnectivityStatusIndicatorProps> = ({
  isOnline,
  isSyncing,
  hasPendingSync,
  needRefresh,
  onApplyUpdate,
  compact = false,
}) => {
  if (needRefresh) {
    return (
      <button
        type="button"
        onClick={onApplyUpdate}
        title="توجد نسخة جديدة من المنصة — اضغط للتحديث الآمن دون فقدان بياناتك"
        className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/50 bg-amber-500/15 hover:bg-amber-500/25 px-2.5 py-1 text-[11px] font-bold text-amber-700 dark:text-amber-300 transition active:scale-95 shrink-0"
      >
        <ArrowUpCircle size={13} className="animate-bounce" />
        <span>{compact ? "تحديث متاح" : "توجد تحديثات متاحة"}</span>
      </button>
    );
  }

  if (isSyncing) {
    return (
      <span
        role="status"
        className="inline-flex items-center gap-1.5 rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-2.5 py-1 text-[11px] font-bold text-cyan-700 dark:text-cyan-300 shrink-0"
      >
        <RefreshCw size={12} className="animate-spin" />
        <span>{compact ? "مزامنة..." : "جارٍ مزامنة البيانات"}</span>
      </span>
    );
  }

  if (!isOnline) {
    return (
      <span
        role="status"
        title={
          hasPendingSync
            ? "تعمل دون إنترنت — سيتم مزامنة تقدمك تلقائياً عند عودة الاتصال"
            : "تعمل دون إنترنت — المحتوى المحفوظ جاهز"
        }
        className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 px-2.5 py-1 text-[11px] font-bold text-amber-700 dark:text-amber-300 shrink-0"
      >
        <WifiOff size={12} />
        <span>{compact ? "دون إنترنت" : "تعمل دون إنترنت"}</span>
      </span>
    );
  }

  return (
    <span
      role="status"
      className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/35 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 shrink-0"
    >
      <Wifi size={12} />
      <span>{compact ? "متصل" : "متصل بالإنترنت"}</span>
    </span>
  );
};
