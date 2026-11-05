import React from "react";
import { ArrowLeft, Search, BookOpen, ChevronUp, ChevronDown, CheckCircle2, Clock } from "lucide-react";
import { BacChapter, BacLesson, BacProgressState } from "../../types";
import { playSound } from "../../utils/soundEngine";

interface ChapterCardSectionProps {
  chapter: BacChapter;
  progressState: BacProgressState;
  onSelectLesson: (lesson: BacLesson) => void;
}

const ChapterCardSection: React.FC<ChapterCardSectionProps> = ({
  chapter,
  progressState,
  onSelectLesson,
}) => {
  const [isOpen, setIsOpen] = React.useState(true);

  const completedInChapter = chapter.lessons.filter(
    (l) => progressState[l.id]?.completed
  ).length;

  return (
    <div className="rounded-3xl border border-slate-800/80 bg-slate-900/50 backdrop-blur-md overflow-hidden transition-all shadow-md">
      <div
        onClick={() => {
          setIsOpen((o) => !o);
          playSound("click");
        }}
        className="flex cursor-pointer items-center justify-between p-5 sm:p-6 hover:bg-slate-800/40 transition"
      >
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
            <BookOpen size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-white">{chapter.title}</h2>
              <span className="text-xs font-mono text-cyan-400">({chapter.lessons.length} درساً)</span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl line-clamp-1">{chapter.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono font-bold text-slate-400 hidden sm:inline-block">
            {completedInChapter} / {chapter.lessons.length} منجز
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-800 text-slate-400">
            {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="border-t border-slate-800/80 p-5 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {chapter.lessons.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 col-span-2 text-center">لا توجد دروس تطابق خيارات البحث الحالية.</p>
          ) : (
            chapter.lessons.map((lesson) => {
              const isDone = Boolean(progressState[lesson.id]?.completed);
              return (
                <div
                  key={lesson.id}
                  onClick={() => onSelectLesson(lesson)}
                  className={`group relative flex flex-col justify-between rounded-2xl border p-4 sm:p-5 transition-all cursor-pointer ${
                    isDone
                      ? "border-emerald-500/30 bg-emerald-950/10 hover:border-emerald-500/50"
                      : "border-slate-800 bg-slate-950/60 hover:border-cyan-500/50 hover:bg-slate-900/60 shadow-sm"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 font-mono text-[11px] font-bold text-cyan-400">{lesson.lessonNumber}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${lesson.difficulty === "أساسي" ? "bg-blue-500/15 text-blue-300" : lesson.difficulty === "متوسط" ? "bg-amber-500/15 text-amber-300" : "bg-purple-500/15 text-purple-300"}`}>{lesson.difficulty}</span>
                      </div>
                      {isDone ? (
                        <div className="flex items-center gap-1 text-emerald-400 text-xs font-bold"><CheckCircle2 size={16} /><span>مكتمل</span></div>
                      ) : (
                        <div className="flex items-center gap-1 text-slate-500 text-xs"><Clock size={13} /><span>{lesson.estimatedMinutes} دقيقة</span></div>
                      )}
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-cyan-300 transition-colors">{lesson.title}</h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">{lesson.subtitle}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 font-mono">40+ سؤالاً تدريبياً</span>
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-cyan-400 group-hover:translate-x-[-3px] transition-transform">
                      <span>عرض الدرس</span>
                      <ArrowLeft size={14} />
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

interface LessonListViewProps {
  partNum: 1 | 2;
  progressState: BacProgressState;
  onSelectLesson: (lesson: BacLesson) => void;
  onBack: () => void;
  filteredChapters: BacChapter[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedDifficulty: string;
  setSelectedDifficulty: (d: string) => void;
  selectedChapterId: string;
  setSelectedChapterId: (id: string) => void;
}

export const LessonListView: React.FC<LessonListViewProps> = ({
  partNum,
  progressState,
  onSelectLesson,
  onBack,
  filteredChapters,
  searchQuery,
  setSearchQuery,
  selectedDifficulty,
  setSelectedDifficulty,
  selectedChapterId,
  setSelectedChapterId,
}) => {
  return (
    <div className="space-y-6 animate-fadeIn">
      <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-white transition">
        <ArrowLeft size={18} />
        <span>العودة إلى اختيار الجزء</span>
      </button>

      <div className="text-center sm:text-start space-y-1">
        <h1 className="text-2xl font-extrabold text-white">دروس الجزء {partNum === 1 ? "الأول" : "الثاني"}</h1>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search size={18} className="absolute start-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="ابحث في الدروس، المفاهيم، المعادلات..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl bg-slate-950 border border-slate-800 py-2.5 ps-10 pe-4 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select
            value={selectedChapterId}
            onChange={(e) => { setSelectedChapterId(e.target.value); playSound("select"); }}
            className="rounded-xl bg-slate-950 border border-slate-800 px-3 py-2.5 text-xs text-slate-300"
          >
            <option value="all">جميع الفصول</option>
            {/* Chapters logic would be passed if needed, keeping it simple for now */}
          </select>
          <select
            value={selectedDifficulty}
            onChange={(e) => { setSelectedDifficulty(e.target.value); playSound("select"); }}
            className="rounded-xl bg-slate-950 border border-slate-800 px-3 py-2.5 text-xs text-slate-300"
          >
            <option value="all">كل الصعوبات</option>
            <option value="أساسي">أساسي</option>
            <option value="متوسط">متوسط</option>
            <option value="متقدم">متقدم</option>
          </select>
        </div>
      </div>

      {/* Chapters */}
      <div className="space-y-8">
        {filteredChapters.map((chapter) => (
          <ChapterCardSection
            key={chapter.id}
            chapter={chapter}
            progressState={progressState}
            onSelectLesson={onSelectLesson}
          />
        ))}
      </div>
    </div>
  );
};
