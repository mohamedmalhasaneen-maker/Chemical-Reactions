import React, { useEffect, useState } from "react";
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  Download,
  ExternalLink,
  HardDrive,
  Upload,
  WifiOff,
  X,
} from "lucide-react";
import { playSound } from "../../utils/soundEngine";
import { loadStudentKV, saveStudentKV } from "../../utils/offlineDb";
import {
  isPdfCachedOffline,
  OFFICIAL_PDF_SPECS,
  startOrResumePackDownload,
} from "../../utils/offlineContentManager";

interface OfficialTextbookModalProps {
  onClose: () => void;
}

interface TextbookItem {
  id: string;
  title: string;
  subtitle: string;
  semester: string;
  year: string;
  pages: string;
  size: string;
  url: string;
  isCustom?: boolean;
}

const DEFAULT_TEXTBOOKS: TextbookItem[] = [
  {
    id: "part2",
    title: "الكتاب الأصلي لوزارة التربية والتعليم - الجزء الثاني",
    subtitle: "كيمياء الثانوية العامة (الصف الثاني الثانوي) - الترم الثاني والمسار المتقدم",
    semester: "الترم الثاني",
    year: "2027",
    pages: "الكتاب الرسمي الكامل",
    size: "7.55 MB",
    url: "/assets/aistudio/_____________________________________________________2027________________________________________53bd65ca.pdf",
  },
  {
    id: "part1",
    title: "الكتاب الأصلي لوزارة التربية والتعليم - الجزء الأول",
    subtitle: "كيمياء الثانوية العامة (الصف الثاني الثانوي) - الترم الأول",
    semester: "الترم الأول",
    year: "2026/2027",
    pages: "الكتاب الرسمي الكامل",
    size: "19.68 MB",
    url: "/assets/aistudio/Chemistry-Ar-EB-part1__1__7dd275d6.pdf",
  },
];

export const OfficialTextbookModal: React.FC<OfficialTextbookModalProps> = ({
  onClose,
}) => {
  const [textbooks, setTextbooks] = useState<TextbookItem[]>(() => {
    try {
      const saved = localStorage.getItem("chem_custom_textbooks");
      if (saved) {
        const parsed = JSON.parse(saved);
        return [...DEFAULT_TEXTBOOKS, ...parsed];
      }
    } catch {
      // ignore
    }
    return DEFAULT_TEXTBOOKS;
  });

  const [cachedStatus, setCachedStatus] = useState<Record<string, boolean>>({});
  const [savingBookId, setSavingBookId] = useState<string | null>(null);
  const [savePct, setSavePct] = useState<number>(0);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  // Hydrate custom textbooks from IndexedDB and verify offline cache status
  useEffect(() => {
    let active = true;
    (async () => {
      const idbCustom = await loadStudentKV<TextbookItem[]>("custom_textbooks_idb");
      if (active && idbCustom && idbCustom.length > 0) {
        setTextbooks((prev) => {
          const existingIds = new Set(prev.map((b) => b.id));
          const mergedCustom = idbCustom.filter((b) => !existingIds.has(b.id));
          return mergedCustom.length > 0 ? [...mergedCustom, ...prev] : prev;
        });
      }

      const map: Record<string, boolean> = {};
      for (const b of DEFAULT_TEXTBOOKS) {
        map[b.id] = await isPdfCachedOffline(b.url);
      }
      if (active) setCachedStatus(map);
    })();
    return () => {
      active = false;
    };
  }, []);

  // Handle custom PDF upload (persisted durably in IndexedDB)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
      setStatusNotice("يرجى اختيار ملف بصيغة PDF صحيحة.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      if (!dataUrl) return;

      const newBook: TextbookItem = {
        id: "custom_" + Date.now(),
        title: file.name.replace(/\.[^/.]+$/, ""),
        subtitle: "ملف مرفوع بواسطة المستخدم (محفوظ محلياً في IndexedDB)",
        semester: "إضافي",
        year: "2027",
        pages: "مستند PDF",
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        url: dataUrl,
        isCustom: true,
      };

      const updated = [newBook, ...textbooks];
      setTextbooks(updated);
      setStatusNotice(null);
      playSound("success");

      const customOnly = updated.filter((b) => b.isCustom);
      try {
        await saveStudentKV("custom_textbooks_idb", customOnly);
      } catch {
        setStatusNotice("تعذر حفظ نسخة إضافية بسبب امتلاء مساحة التخزين على الجهاز.");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleOpenBook = async (book: TextbookItem) => {
    const isCached = book.isCustom || cachedStatus[book.id] || (await isPdfCachedOffline(book.url));
    if (!navigator.onLine && !isCached) {
      playSound("error");
      setStatusNotice(
        `كتاب «${book.title}» غير محفوظ دون إنترنت بعد. اتصل بالإنترنت واضغط «حفظ دون إنترنت» لتصفحه لاحقاً.`
      );
      return;
    }

    setStatusNotice(null);
    playSound("simulation_start");
    // Open directly in a new tab/window so the browser's native PDF viewer or Android PDF apps handle it
    window.open(book.url, "_blank", "noopener,noreferrer");
  };

  const handleSaveBookOffline = async (book: TextbookItem) => {
    const spec = OFFICIAL_PDF_SPECS.find((s) => s.url === book.url);
    if (!spec) return;
    if (!navigator.onLine) {
      setStatusNotice("يلزم الاتصال بالإنترنت لتنزيل ملف الكتاب PDF وحفظه دون إنترنت.");
      return;
    }

    setSavingBookId(book.id);
    setSavePct(0);
    setStatusNotice(null);
    playSound("select");

    const rec = await startOrResumePackDownload(
      {
        id: spec.packId,
        category: "pdf",
        title: spec.title,
        description: book.subtitle,
        estimatedBytes: spec.estimatedBytes,
        pdfUrl: spec.url,
      },
      (progressRec) => {
        if (progressRec.totalBytes > 0) {
          setSavePct(
            Math.min(100, Math.round((progressRec.bytesDownloaded / progressRec.totalBytes) * 100))
          );
        }
      }
    );

    setSavingBookId(null);
    if (rec.status === "downloaded") {
      setCachedStatus((prev) => ({ ...prev, [book.id]: true }));
      playSound("achievement");
    } else if (rec.errorMessage) {
      setStatusNotice(rec.errorMessage);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="الكتاب الأصلي لوزارة التربية والتعليم"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fadeIn overflow-y-auto"
    >
      <div className="relative w-full max-w-4xl max-h-[92vh] rounded-3xl border border-cyan-500/35 bg-slate-900 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 px-5 sm:px-6 py-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shadow-inner">
              <BookOpen size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-extrabold text-white">
                  الكتاب الأصلي لوزارة التربية والتعليم
                </h2>
                <span className="rounded-full bg-cyan-500/20 px-2.5 py-0.5 text-[10px] font-mono font-bold text-cyan-300 border border-cyan-500/30">
                  نسخة رسمية معتمدة
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                النسخة الكاملة للكتب المدرسية الرسمية لمادة الكيمياء (البكالوريا المصرية)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              onClose();
              playSound("modal_close");
            }}
            aria-label="إغلاق النافذة"
            className="h-9 w-9 flex items-center justify-center rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition active:scale-95"
          >
            <X size={18} />
          </button>
        </div>

        {/* Toolbar: Upload Custom Book */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 bg-slate-950/60 px-5 py-3">
          <span className="text-xs text-slate-400 font-medium">
            اختر الكتاب المدرسي لتصفحه في نافذة خارجية أو حفظه للعمل دون إنترنت:
          </span>
          <label className="group inline-flex items-center gap-2 rounded-xl border border-cyan-500/40 bg-cyan-500/10 hover:bg-cyan-500/20 px-3.5 py-2 text-xs font-bold text-cyan-300 cursor-pointer transition active:scale-95 shadow-xs">
            <Upload size={14} className="group-hover:-translate-y-0.5 transition-transform" />
            <span>رفع كتاب PDF جديد</span>
            <input
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>

        {statusNotice && (
          <div className="mx-5 mt-4 flex items-center gap-2 rounded-2xl border border-amber-500/40 bg-amber-500/10 px-4 py-2.5 text-xs font-bold text-amber-300">
            {!navigator.onLine ? <WifiOff size={15} /> : <AlertTriangle size={15} />}
            <span>{statusNotice}</span>
          </div>
        )}

        {/* Books List / Selection Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-950">
          {textbooks.map((book) => {
            const isOfflineReady = Boolean(book.isCustom || cachedStatus[book.id]);
            const isSavingThis = savingBookId === book.id;

            return (
              <div
                key={book.id}
                className="group relative rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-slate-950 p-5 sm:p-6 shadow-lg hover:border-cyan-500/50 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-5"
              >
                {/* Left side: Book Icon / Cover representation + Info */}
                <div className="flex items-start gap-4 min-w-0">
                  <div className="flex h-16 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-gradient-to-b from-cyan-500/20 to-blue-600/20 border border-cyan-500/35 text-cyan-300 shadow-inner">
                    <BookOpen size={26} />
                    <span className="text-[9px] font-mono font-bold mt-1 text-cyan-400">PDF</span>
                  </div>

                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-blue-500/15 px-2.5 py-0.5 text-[10px] font-bold text-blue-300 border border-blue-500/25">
                        {book.semester}
                      </span>
                      <span className="rounded-full bg-purple-500/15 px-2.5 py-0.5 text-[10px] font-bold text-purple-300 border border-purple-500/25">
                        عام {book.year}
                      </span>
                      {isOfflineReady && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/30">
                          <CheckCircle2 size={11} />
                          <span>متاح دون إنترنت</span>
                        </span>
                      )}
                      <span className="text-[11px] font-mono text-slate-400">
                        {book.pages} • {book.size}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {book.title}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {book.subtitle}
                    </p>
                  </div>
                </div>

                {/* Right side: Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-800">
                  <button
                    type="button"
                    onClick={() => handleOpenBook(book)}
                    className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 px-4 py-2.5 text-xs font-extrabold text-white shadow-md transition active:scale-95"
                  >
                    <ExternalLink size={15} />
                    <span>فتح الكتاب</span>
                  </button>

                  {!book.isCustom && !isOfflineReady && (
                    <button
                      type="button"
                      disabled={isSavingThis}
                      onClick={() => handleSaveBookOffline(book)}
                      className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/15 hover:bg-emerald-500/25 px-3.5 py-2.5 text-xs font-bold text-emerald-300 transition active:scale-95"
                    >
                      <HardDrive size={14} />
                      <span>
                        {isSavingThis ? `جارٍ الحفظ ${savePct}%` : "حفظ دون إنترنت"}
                      </span>
                    </button>
                  )}

                  <a
                    href={book.url}
                    download={`${book.title}.pdf`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => playSound("success")}
                    className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/90 hover:bg-slate-800 px-4 py-2.5 text-xs font-bold text-slate-200 hover:text-white transition active:scale-95 shadow-sm"
                  >
                    <Download size={15} />
                    <span>تحميل PDF</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-800 bg-slate-950 px-6 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
          <span>جميع الحقوق محفوظة © وزارة التربية والتعليم والتعليم الفني - البكالوريا المصرية 2027</span>
          <button
            type="button"
            onClick={() => {
              onClose();
              playSound("modal_close");
            }}
            className="rounded-xl bg-slate-800 border border-slate-700 px-5 py-2 text-xs font-bold text-white hover:bg-slate-700 transition active:scale-95"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
