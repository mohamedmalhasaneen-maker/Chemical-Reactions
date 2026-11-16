import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Download,
  FileText,
  HardDrive,
  Headphones,
  Layers,
  Pause,
  Play,
  ShieldCheck,
  Sparkles,
  Trash2,
  Volume2,
  WifiOff,
  X,
  AlertTriangle,
} from "lucide-react";
import { BACCALAUREATE_PART_1 } from "../data/baccalaureatePart1";
import { BACCALAUREATE_PART_2 } from "../data/baccalaureatePart2";
import {
  buildCatalogDescriptors,
  clearAllOfflineContentPacks,
  deleteOfflinePack,
  downloadAllPlatformContent,
  formatBytesArabic,
  getAllPackStatuses,
  PackDescriptor,
  pauseOfflineDownload,
  startOrResumePackDownload,
} from "../utils/offlineContentManager";
import {
  cleanupTemporaryOfflineData,
  getStorageEstimate,
  OfflinePackRecord,
  requestPersistentStorage,
  StorageEstimateReport,
} from "../utils/offlineDb";
import { playSound } from "../utils/soundEngine";

interface OfflineContentManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  isOnline: boolean;
  onNotify?: (msg: string) => void;
}

export const OfflineContentManagerModal: React.FC<OfflineContentManagerModalProps> = ({
  isOpen,
  onClose,
  isOnline,
  onNotify,
}) => {
  const [activeTab, setActiveTab] = useState<"parts" | "chapters" | "audio" | "pdfs">("parts");
  const [packStatuses, setPackStatuses] = useState<Record<string, OfflinePackRecord>>({});
  const [storage, setStorage] = useState<StorageEstimateReport>({
    usageBytes: 0,
    quotaBytes: 0,
    usagePercent: 0,
    isPersisted: false,
  });
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);
  const [overallProgress, setOverallProgress] = useState<{ percent: number; label: string }>({
    percent: 0,
    label: "",
  });
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [expandedChapterId, setExpandedChapterId] = useState<string | null>(null);
  const allAbortRef = useRef<AbortController | null>(null);

  const catalog = useMemo(() => buildCatalogDescriptors(), []);

  const refreshState = useCallback(async () => {
    const [statuses, est] = await Promise.all([getAllPackStatuses(), getStorageEstimate()]);
    setPackStatuses(statuses);
    setStorage(est);
  }, []);

  useEffect(() => {
    if (isOpen) {
      refreshState();
    }
  }, [isOpen, refreshState]);

  // Auto-pause active PDF downloads if connection drops
  useEffect(() => {
    if (!isOnline) {
      catalog
        .filter((d) => d.category === "pdf")
        .forEach((d) => {
          if (packStatuses[d.id]?.status === "downloading") {
            pauseOfflineDownload(d.id);
          }
        });
    }
  }, [isOnline, catalog, packStatuses]);

  const handlePackUpdate = useCallback((record: OfflinePackRecord) => {
    setPackStatuses((prev) => ({ ...prev, [record.id]: record }));
    if (record.status === "downloaded" || record.status === "error") {
      getStorageEstimate().then(setStorage).catch(() => {});
    }
  }, []);

  const handleDownloadPack = async (desc: PackDescriptor) => {
    playSound("select");
    const result = await startOrResumePackDownload(desc, handlePackUpdate);
    if (result.status === "downloaded") {
      playSound("success");
      onNotify?.(`تم حفظ «${desc.title}» للعمل دون إنترنت`);
    } else if (result.status === "error" && result.errorMessage) {
      playSound("error");
      onNotify?.(result.errorMessage);
    }
  };

  const handlePausePack = (desc: PackDescriptor) => {
    playSound("click");
    pauseOfflineDownload(desc.id);
  };

  const handleDeletePack = async (desc: PackDescriptor) => {
    playSound("click");
    await deleteOfflinePack(desc);
    setConfirmDeleteId(null);
    await refreshState();
    onNotify?.(`تم حذف «${desc.title}» وتوفير مساحة التخزين`);
  };

  const handleDownloadAll = async () => {
    if (isDownloadingAll) {
      allAbortRef.current?.abort();
      setIsDownloadingAll(false);
      return;
    }
    playSound("simulation_start");
    const controller = new AbortController();
    allAbortRef.current = controller;
    setIsDownloadingAll(true);
    await downloadAllPlatformContent(
      handlePackUpdate,
      (percent, label) => setOverallProgress({ percent, label }),
      controller.signal
    );
    setIsDownloadingAll(false);
    await refreshState();
    playSound("achievement");
    onNotify?.("اكتمل تجهيز محتوى المنصة المختار للعمل دون إنترنت");
  };

  const handleRequestPersist = async () => {
    playSound("select");
    const granted = await requestPersistentStorage();
    await refreshState();
    onNotify?.(
      granted
        ? "تم تفعيل التخزين الدائم لحماية دروسك وملفاتك من الحذف التلقائي."
        : "المتصفح يدير التخزين تلقائياً؛ تظل بياناتك محفوظة في IndexedDB."
    );
  };

  const handleCleanupTemp = async () => {
    playSound("click");
    const removed = await cleanupTemporaryOfflineData();
    await refreshState();
    onNotify?.(
      removed > 0
        ? `تم تنظيف ${removed} عنصر مؤقت دون المساس بتقدمك أو الدروس المحفوظة.`
        : "الذاكرة منظمة ولا توجد ملفات مؤقتة منتهية الصلاحية."
    );
  };

  const handleClearAllContent = async () => {
    playSound("click");
    await clearAllOfflineContentPacks();
    setConfirmDeleteId(null);
    await refreshState();
    onNotify?.("تم حذف جميع الحزم المحفوظة دون المساس بنتائج اختباراتك ونقاطك.");
  };

  if (!isOpen) return null;

  const partAndAudioDescriptors = catalog.filter((d) =>
    activeTab === "parts"
      ? d.category === "part"
      : activeTab === "audio"
      ? d.category === "audio"
      : activeTab === "pdfs"
      ? d.category === "pdf"
      : false
  );

  const allChapters = [...BACCALAUREATE_PART_1.chapters, ...BACCALAUREATE_PART_2.chapters];

  const renderPackRow = (desc: PackDescriptor) => {
    const rec = packStatuses[desc.id];
    const status = rec?.status || "idle";
    const pct =
      rec && rec.totalBytes > 0
        ? Math.min(100, Math.round((rec.bytesDownloaded / rec.totalBytes) * 100))
        : status === "downloaded"
        ? 100
        : 0;

    return (
      <div
        key={desc.id}
        className={`rounded-2xl border p-4 transition-all space-y-3 ${
          status === "downloaded"
            ? "border-emerald-500/40 bg-emerald-950/15"
            : status === "error"
            ? "border-rose-500/40 bg-rose-950/15"
            : "border-slate-800 bg-slate-950/70"
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-sm font-bold text-white">{desc.title}</h4>
              <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-cyan-300 border border-slate-700">
                الحجم المتوقع: {formatBytesArabic(rec?.totalBytes || desc.estimatedBytes)}
              </span>
              {status === "downloaded" && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/30">
                  <CheckCircle2 size={11} />
                  <span>محفوظ دون إنترنت</span>
                </span>
              )}
              {status === "paused" && (
                <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-500/30">
                  متوقف مؤقتاً ({pct}%)
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">{desc.description}</p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {status === "downloading" ? (
              <button
                type="button"
                onClick={() => handlePausePack(desc)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600/90 hover:bg-amber-500 px-3.5 py-2 text-xs font-bold text-white transition active:scale-95"
              >
                <Pause size={14} />
                <span>إيقاف مؤقت</span>
              </button>
            ) : status === "paused" ? (
              <button
                type="button"
                onClick={() => handleDownloadPack(desc)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 px-3.5 py-2 text-xs font-bold text-white transition active:scale-95"
              >
                <Play size={14} />
                <span>استكمال ({pct}%)</span>
              </button>
            ) : status === "downloaded" ? (
              confirmDeleteId === desc.id ? (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleDeletePack(desc)}
                    className="rounded-xl bg-rose-600 hover:bg-rose-500 px-3 py-1.5 text-xs font-bold text-white"
                  >
                    تأكيد الحذف
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteId(null)}
                    className="rounded-xl bg-slate-800 px-2.5 py-1.5 text-xs font-bold text-slate-300"
                  >
                    إلغاء
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmDeleteId(desc.id)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/35 bg-rose-500/10 hover:bg-rose-500/20 px-3 py-2 text-xs font-bold text-rose-300 transition"
                >
                  <Trash2 size={14} />
                  <span>حذف</span>
                </button>
              )
            ) : (
              <button
                type="button"
                onClick={() => handleDownloadPack(desc)}
                disabled={desc.category === "pdf" && !isOnline}
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-45 px-3.5 py-2 text-xs font-extrabold text-white shadow-sm transition active:scale-95"
              >
                <Download size={14} />
                <span>تنزيل</span>
              </button>
            )}
          </div>
        </div>

        {(status === "downloading" || status === "paused") && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] font-mono text-cyan-300">
              <span>
                {formatBytesArabic(rec?.bytesDownloaded || 0)} /{" "}
                {formatBytesArabic(rec?.totalBytes || desc.estimatedBytes)}
              </span>
              <span>{pct}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-200"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        )}

        {rec?.errorMessage && (
          <div className="flex items-center gap-2 rounded-xl bg-rose-950/40 border border-rose-500/30 px-3 py-2 text-xs text-rose-300">
            <AlertTriangle size={14} className="shrink-0" />
            <span>{rec.errorMessage}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="إدارة المحتوى دون إنترنت"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fadeIn overflow-y-auto"
    >
      <div className="relative w-full max-w-4xl max-h-[92vh] rounded-3xl border border-cyan-500/35 bg-slate-900 shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/80 px-5 sm:px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/35">
              <HardDrive size={22} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-white">
                إدارة المحتوى دون إنترنت
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                نزّل الدروس، الشروحات الصوتية، والكتب الرسمية لتعمل المنصة بكفاءة كاملة دون اتصال
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              playSound("modal_close");
              onClose();
            }}
            aria-label="إغلاق النافذة"
            className="h-9 w-9 flex items-center justify-center rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Storage & Quick Download All Banner */}
        <div className="border-b border-slate-800 bg-slate-950/50 p-4 sm:px-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            {/* Storage Meter */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-200 flex items-center gap-1.5">
                  <HardDrive size={14} className="text-cyan-400" />
                  <span>المساحة المستخدمة على الجهاز</span>
                </span>
                <span className="font-mono text-cyan-300">
                  {formatBytesArabic(storage.usageBytes)}
                  {storage.quotaBytes > 0 ? ` / ${formatBytesArabic(storage.quotaBytes)}` : ""}
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all"
                  style={{ width: `${Math.max(2, storage.usagePercent)}%` }}
                />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleRequestPersist}
                  className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg border transition ${
                    storage.isPersisted
                      ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-300"
                      : "border-cyan-500/35 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20"
                  }`}
                >
                  <ShieldCheck size={12} />
                  <span>
                    {storage.isPersisted ? "التخزين الدائم مُفعّل" : "تفعيل التخزين الدائم"}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={handleCleanupTemp}
                  className="text-[11px] font-semibold text-slate-400 hover:text-cyan-300 transition"
                >
                  تنظيف الملفات المؤقتة
                </button>
              </div>
            </div>

            {/* Download All Action */}
            <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-cyan-950/35 to-blue-950/25 p-3.5 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h3 className="text-xs sm:text-sm font-extrabold text-white">
                    تجهيز المنصة بالكامل دون إنترنت
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    يشمل الـ 52 درساً + الشروحات الصوتية + كتابي الوزارة PDF (~65 MB إجمالاً)
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadAll}
                  className={`flex-1 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-xs font-extrabold text-white transition active:scale-95 ${
                    isDownloadingAll
                      ? "bg-amber-600 hover:bg-amber-500"
                      : "bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 shadow-md"
                  }`}
                >
                  {isDownloadingAll ? <Pause size={14} /> : <Download size={14} />}
                  <span>
                    {isDownloadingAll
                      ? `إيقاف التنزيل الشامل (${overallProgress.percent}%)`
                      : "تنزيل جميع المحتويات"}
                  </span>
                </button>

                {confirmDeleteId === "ALL_PACKS" ? (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={handleClearAllContent}
                      className="rounded-xl bg-rose-600 px-3 py-2 text-xs font-bold text-white"
                    >
                      تأكيد حذف الكل
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(null)}
                      className="rounded-xl bg-slate-800 px-2.5 py-2 text-xs font-bold text-slate-300"
                    >
                      إلغاء
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteId("ALL_PACKS")}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/35 bg-rose-500/10 hover:bg-rose-500/20 px-3 py-2 text-xs font-bold text-rose-300 transition"
                  >
                    <Trash2 size={13} />
                    <span>تفريغ الحزم</span>
                  </button>
                )}
              </div>

              {isDownloadingAll && (
                <p className="text-[11px] font-mono text-cyan-300 truncate">
                  جارٍ التجهيز: {overallProgress.label}
                </p>
              )}
            </div>
          </div>

          {!isOnline && (
            <div className="flex items-center gap-2 rounded-xl border border-amber-500/35 bg-amber-500/10 px-3.5 py-2 text-xs font-bold text-amber-300">
              <WifiOff size={15} className="shrink-0" />
              <span>
                أنت تعمل الآن دون إنترنت — يمكنك تشغيل وحذف المحتوى المحفوظ مسبقاً، أما تنزيل الكتب PDF الجديدة فيتطلب عودة الاتصال.
              </span>
            </div>
          )}

          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: "parts" as const, label: "الأجزاء الكاملة", icon: <Layers size={14} /> },
              { id: "chapters" as const, label: "فصول ودروس محددة", icon: <BookOpen size={14} /> },
              { id: "audio" as const, label: "الشروحات الصوتية", icon: <Headphones size={14} /> },
              { id: "pdfs" as const, label: "كتب الوزارة PDF", icon: <FileText size={14} /> },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  playSound("click");
                  setActiveTab(tab.id);
                }}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                  activeTab === tab.id
                    ? "bg-cyan-600 text-white shadow-sm"
                    : "bg-slate-900 border border-slate-800 text-slate-300 hover:border-cyan-500/40"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {activeTab !== "chapters" ? (
            partAndAudioDescriptors.map(renderPackRow)
          ) : (
            <div className="space-y-4">
              {allChapters.map((ch) => {
                const chDesc = catalog.find((d) => d.id === `chapter_${ch.id}`);
                const isExp = expandedChapterId === ch.id;
                return (
                  <div key={ch.id} className="space-y-2">
                    {chDesc && renderPackRow(chDesc)}
                    <button
                      type="button"
                      onClick={() => setExpandedChapterId(isExp ? null : ch.id)}
                      className="flex items-center gap-1.5 text-xs font-bold text-cyan-400 hover:text-cyan-300 px-2"
                    >
                      {isExp ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      <span>
                        {isExp ? "إخفاء الدروس الفردية" : `اختيار درس محدد من ${ch.title} (${ch.lessons.length})`}
                      </span>
                    </button>

                    {isExp && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 ps-3 border-s-2 border-cyan-500/30">
                        {ch.lessons.map((lesson) => {
                          const lessonDesc: PackDescriptor = {
                            id: `lesson_${lesson.id}`,
                            category: "lesson",
                            partNumber: ch.partNumber,
                            title: `${lesson.lessonNumber}. ${lesson.title}`,
                            description: lesson.subtitle,
                            estimatedBytes: 42_000,
                            lessonIds: [lesson.id],
                          };
                          return renderPackRow(lessonDesc);
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
