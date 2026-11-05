import React from "react";
import { GraduationCap, BookOpen, ArrowRight } from "lucide-react";
import { playSound } from "../../utils/soundEngine";

interface PartSelectionViewProps {
  onSelectPart: (part: 1 | 2) => void;
  onOpenTextbook: () => void;
  part1CompletedCount: number;
  part2CompletedCount: number;
}

export const PartSelectionView: React.FC<PartSelectionViewProps> = ({
  onSelectPart,
  onOpenTextbook,
  part1CompletedCount,
  part2CompletedCount,
}) => {
  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-extrabold text-white">اختر الجزء الدراسي</h1>
        <p className="text-slate-400">ابدأ رحلتك التعليمية باختيار المنهج المعتمد</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Part 1 */}
        <button
          onClick={() => { onSelectPart(1); playSound("select"); }}
          className="group rounded-3xl p-6 text-start transition-all border border-blue-500/30 bg-slate-900/60 hover:bg-slate-800/80 hover:border-blue-500/50 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-500/20 text-blue-300">
              الجزء الأول
            </span>
            <span className="text-xs font-mono font-bold text-blue-400">
              {part1CompletedCount} / 26 مكتمل
            </span>
          </div>
          <h3 className="text-xl font-bold text-white mt-4">كيمياء البكالوريا Part 1</h3>
          <p className="text-sm text-slate-400 mt-2">حالات المادة والاتزان الكيميائي والحراري</p>
          <div className="mt-6 flex items-center text-blue-400 font-bold text-sm group-hover:translate-x-1 transition-transform">
            <span>تصفح الدروس</span>
            <ArrowRight size={16} className="ms-2" />
          </div>
        </button>

        {/* Part 2 */}
        <button
          onClick={() => { onSelectPart(2); playSound("select"); }}
          className="group rounded-3xl p-6 text-start transition-all border border-cyan-500/30 bg-slate-900/60 hover:bg-slate-800/80 hover:border-cyan-500/50 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300">
              الجزء الثاني
            </span>
            <span className="text-xs font-mono font-bold text-cyan-400">
              {part2CompletedCount} / 26 مكتمل
            </span>
          </div>
          <h3 className="text-xl font-bold text-white mt-4">كيمياء البكالوريا Part 2</h3>
          <p className="text-sm text-slate-400 mt-2">المواد غير العضوية والكيمياء العضوية</p>
          <div className="mt-6 flex items-center text-cyan-400 font-bold text-sm group-hover:translate-x-1 transition-transform">
            <span>تصفح الدروس</span>
            <ArrowRight size={16} className="ms-2" />
          </div>
        </button>

        {/* Official Textbook */}
        <button
          onClick={() => { onOpenTextbook(); playSound("modal_open"); }}
          className="group rounded-3xl p-6 text-start transition-all border border-emerald-500/30 bg-gradient-to-br from-emerald-950/30 via-slate-900/60 to-slate-900/90 hover:border-emerald-400 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300">
              الكتاب الأصلي
            </span>
            <BookOpen size={18} className="text-emerald-400" />
          </div>
          <h3 className="text-xl font-bold text-white mt-4">📚 الكتاب الأصلي للوزارة</h3>
          <p className="text-sm text-slate-400 mt-2">النسخة الرسمية المعتمدة للمنهج الدراسي</p>
          <div className="mt-6 flex items-center text-emerald-400 font-bold text-sm group-hover:translate-x-1 transition-transform">
            <span>فتح الكتاب</span>
            <ArrowRight size={16} className="ms-2" />
          </div>
        </button>
      </div>
    </div>
  );
};
