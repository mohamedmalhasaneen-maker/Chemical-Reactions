import React, { useState } from "react";
import {
  BookOpen,
  Download,
  ExternalLink,
  FileText,
  Plus,
  Sparkles,
  Upload,
  X,
  CheckCircle2,
  Layers,
} from "lucide-react";
import { playSound } from "../../utils/soundEngine";

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
    pages: "284 صفحة",
    size: "24.5 MB",
    url: "/assets/aistudio/_____________________________________________________2027________________________________________53bd65ca.pdf",
  },
  {
    id: "part1",
    title: "الكتاب الأصلي لوزارة التربية والتعليم - الجزء الأول",
    subtitle: "كيمياء الثانوية العامة (الصف الثاني الثانوي) - الترم الأول",
    semester: "الترم الأول",
    year: "2026/2027",
    pages: "240 صفحة",
    size: "18.2 MB",
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
    } catch (e) {
      console.warn("Could not load custom textbooks", e);
    }
    return DEFAULT_TEXTBOOKS;
  });

  // Handle custom PDF upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
      alert("يرجى اختيار ملف PDF صحيح.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (!dataUrl) return;

      const newBook: TextbookItem = {
        id: "custom_" + Date.now(),
        title: file.name.replace(/\.[^/.]+$/, ""),
        subtitle: "ملف مرفوع بواسطة المستخدم عبر المنصة الرسمية",
        semester: "إضافي",
        year: "2027",
        pages: "مستند PDF",
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        url: dataUrl,
        isCustom: true,
      };

      const updated = [newBook, ...textbooks];
      setTextbooks(updated);
      playSound("success");

      try {
        const customOnly = updated.filter((b) => b.isCustom);
        localStorage.setItem("chem_custom_textbooks", JSON.stringify(customOnly));
      } catch (err) {
        console.warn("Storage quota exceeded or error saving custom PDF", err);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleOpenBook = (url: string) => {
    playSound("simulation_start");
    // Open in a new tab/window outside the app directly using browser default PDF viewer
    window.open(url, "_blank", "noopener,noreferrer");
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
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/60 px-5 py-3">
          <span className="text-xs text-slate-400 font-medium">
            اختر الكتاب المدرسي المطلوب لتصفحه في نافذة خارجية أو تحميله على جهازك:
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

        {/* Books List / Selection Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-950">
          {textbooks.map((book) => (
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
              <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-800">
                <button
                  type="button"
                  onClick={() => handleOpenBook(book.url)}
                  className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 px-4.5 py-2.5 text-xs font-extrabold text-white shadow-md transition active:scale-95"
                >
                  <ExternalLink size={15} />
                  <span>فتح الكتاب</span>
                </button>

                <a
                  href={book.url}
                  download={`${book.title}.pdf`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => playSound("success")}
                  className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/90 hover:bg-slate-800 px-4.5 py-2.5 text-xs font-bold text-slate-200 hover:text-white transition active:scale-95 shadow-sm"
                >
                  <Download size={15} />
                  <span>تحميل PDF</span>
                </a>
              </div>
            </div>
          ))}
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
