/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Egyptian Chemistry Baccalaureate Interactive Learning Platform
 * Comprehensive View for Part 1 (26 Lessons) and Part 2 (26 Lessons)
 * Integrated with 17-Section Detailed Unabridged Reader & 5-Mode Interactive Testing Suite
 */

import React, { useMemo, useState, useEffect } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  Bookmark,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  Circle,
  Clock,
  Compass,
  FileText,
  Filter,
  GraduationCap,
  HelpCircle,
  Layers,
  Lightbulb,
  Play,
  RotateCcw,
  Search,
  Sparkles,
  Timer,
  Trash2,
  X,
  XCircle,
  Zap,
} from "lucide-react";
import {
  BacChapter,
  BacLesson,
  BacLessonProgress,
  BacPart,
  BacProgressState,
} from "../types";
import { BACCALAUREATE_PART_1 } from "../data/baccalaureatePart1";
import { BACCALAUREATE_PART_2 } from "../data/baccalaureatePart2";
import { playSound } from "../utils/soundEngine";
import { DetailedLessonReader } from "./baccalaureate/DetailedLessonReader";
import { InteractiveQuizSuite } from "./baccalaureate/InteractiveQuizSuite";
import { getDetailedLessonSync } from "../curriculum/curriculumRegistry";
import {
  DetailedBacLesson,
  QuestionItem,
  StudentQuizAttempt,
} from "../curriculum/types";

interface BaccalaureateViewProps {
  progressState: BacProgressState;
  onUpdateProgress: (lessonId: string, completed: boolean, scorePercent?: number) => void;
  onAddXp: (amount: number) => void;
}

interface SavedHighlight {
  id: string;
  text: string;
  note?: string;
  lessonId?: string;
  lessonTitle?: string;
  timestamp: string;
}

export const BaccalaureateView: React.FC<BaccalaureateViewProps> = ({
  progressState,
  onUpdateProgress,
  onAddXp,
}) => {
  // 1. Navigation state
  const [selectedPartNum, setSelectedPartNum] = useState<1 | 2>(1);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [selectedChapterId, setSelectedChapterId] = useState<string>("all");

  // 2. Exam and Interactive Suite state
  const [isQuizSuiteOpen, setIsQuizSuiteOpen] = useState(false);
  const [isWrongQuestionsModalOpen, setIsWrongQuestionsModalOpen] = useState(false);
  const [isHighlightsModalOpen, setIsHighlightsModalOpen] = useState(false);
  const [isRetestingWrongOnly, setIsRetestingWrongOnly] = useState(false);

  // 3. Persistent Analytics & Notes State
  const [savedHighlights, setSavedHighlights] = useState<SavedHighlight[]>(() => {
    try {
      const raw = localStorage.getItem("chem_lab_bac_highlights");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [wrongQuestionsBank, setWrongQuestionsBank] = useState<QuestionItem[]>(() => {
    try {
      const raw = localStorage.getItem("chem_lab_bac_wrong_questions");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // Save highlights to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("chem_lab_bac_highlights", JSON.stringify(savedHighlights));
    } catch (e) {
      console.warn("Could not save highlights to storage", e);
    }
  }, [savedHighlights]);

  // Save wrong questions to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("chem_lab_bac_wrong_questions", JSON.stringify(wrongQuestionsBank));
    } catch (e) {
      console.warn("Could not save wrong questions to storage", e);
    }
  }, [wrongQuestionsBank]);

  // Active Part Data
  const currentPart: BacPart =
    selectedPartNum === 1 ? BACCALAUREATE_PART_1 : BACCALAUREATE_PART_2;

  // Flattened list of all 52 lessons across both parts
  const allLessons = useMemo(() => {
    return [
      ...BACCALAUREATE_PART_1.chapters.flatMap((c) => c.lessons),
      ...BACCALAUREATE_PART_2.chapters.flatMap((c) => c.lessons),
    ];
  }, []);

  // Currently active lesson object
  const activeLesson = useMemo(() => {
    if (!activeLessonId) return null;
    return allLessons.find((l) => l.id === activeLessonId) || null;
  }, [activeLessonId, allLessons]);

  // Unabridged 17-section detailed lesson representation
  const detailedActiveLesson = useMemo<DetailedBacLesson | null>(() => {
    if (!activeLessonId) return null;
    return getDetailedLessonSync(activeLessonId);
  }, [activeLessonId]);

  // Overall Statistics
  const completedCount = useMemo(() => {
    return (Object.values(progressState) as BacLessonProgress[]).filter(
      (p) => p && p.completed
    ).length;
  }, [progressState]);

  const part1CompletedCount = useMemo(() => {
    const p1Ids = new Set(
      BACCALAUREATE_PART_1.chapters.flatMap((c) => c.lessons.map((l) => l.id))
    );
    return (Object.entries(progressState) as [string, BacLessonProgress][]).filter(
      ([id, p]) => p1Ids.has(id) && p && p.completed
    ).length;
  }, [progressState]);

  const part2CompletedCount = useMemo(() => {
    const p2Ids = new Set(
      BACCALAUREATE_PART_2.chapters.flatMap((c) => c.lessons.map((l) => l.id))
    );
    return (Object.entries(progressState) as [string, BacLessonProgress][]).filter(
      ([id, p]) => p2Ids.has(id) && p && p.completed
    ).length;
  }, [progressState]);

  const overallPercent = Math.round((completedCount / 52) * 100);

  // Filter lessons in active part
  const filteredChapters = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return currentPart.chapters.map((ch) => {
      if (selectedChapterId !== "all" && ch.id !== selectedChapterId) {
        return { ...ch, lessons: [] };
      }

      const matchedLessons = ch.lessons.filter((lesson) => {
        const matchesDiff =
          selectedDifficulty === "all" || lesson.difficulty === selectedDifficulty;

        if (!matchesDiff) return false;
        if (!q) return true;

        const inTitle = lesson.title.toLowerCase().includes(q);
        const inSubtitle = lesson.subtitle.toLowerCase().includes(q);
        const inConcepts = lesson.coreConcepts.some((c) =>
          c.toLowerCase().includes(q)
        );
        const inEnTitle = (lesson.titleEn || "").toLowerCase().includes(q);

        return inTitle || inSubtitle || inConcepts || inEnTitle;
      });

      return {
        ...ch,
        lessons: matchedLessons,
      };
    });
  }, [currentPart, searchQuery, selectedDifficulty, selectedChapterId]);

  // Handle lesson selection
  const handleSelectLesson = (lesson: BacLesson) => {
    setActiveLessonId(lesson.id);
    setIsQuizSuiteOpen(false);
    playSound("modal_open");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Close reader and return to catalog
  const handleBackToCatalog = () => {
    setActiveLessonId(null);
    setIsQuizSuiteOpen(false);
    playSound("modal_close");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Find next/prev lessons
  const { prevLesson, nextLesson } = useMemo(() => {
    if (!activeLesson) return { prevLesson: null, nextLesson: null };
    const currentIndex = allLessons.findIndex((l) => l.id === activeLesson.id);
    return {
      prevLesson: currentIndex > 0 ? allLessons[currentIndex - 1] : null,
      nextLesson: currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null,
    };
  }, [activeLesson, allLessons]);

  // Add / remove highlights
  const handleAddHighlight = (text: string, note?: string) => {
    if (!text.trim()) return;
    const newHighlight: SavedHighlight = {
      id: "hl_" + Date.now(),
      text,
      note,
      lessonId: activeLesson?.id,
      lessonTitle: activeLesson?.title,
      timestamp: new Date().toLocaleDateString("ar-EG"),
    };
    setSavedHighlights((prev) => [newHighlight, ...prev]);
    playSound("success");
  };

  const handleRemoveHighlight = (id: string) => {
    setSavedHighlights((prev) => prev.filter((h) => h.id !== id));
    playSound("click");
  };

  // Save quiz attempt and update wrong questions bank
  const handleSaveQuizAttempt = (attempt: StudentQuizAttempt) => {
    onUpdateProgress(attempt.lessonId, attempt.scorePercent >= 60, attempt.scorePercent);
    if (attempt.scorePercent >= 80) {
      onAddXp(100);
      playSound("achievement");
    } else {
      onAddXp(40);
      playSound("success");
    }
  };

  const handleRecordWrongQuestions = (questions: QuestionItem[], _answers: any) => {
    setWrongQuestionsBank((prev) => {
      const existingIds = new Set(prev.map((q) => q.id));
      const newlyAdded = questions.filter((q) => !existingIds.has(q.id));
      return [...newlyAdded, ...prev];
    });
  };

  const handleRemoveWrongQuestion = (qId: string) => {
    setWrongQuestionsBank((prev) => prev.filter((q) => q.id !== qId));
    playSound("click");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20 selection:bg-cyan-500 selection:text-black">
      {/* 1. Header Hero Banner */}
      <section className="relative overflow-hidden border-b border-slate-800 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 px-4 py-8 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(14,165,233,0.15),rgba(255,255,255,0))]" />

        <div className="relative mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-bold text-cyan-300">
                <GraduationCap size={15} />
                <span>منهج البكالوريا المصرية 2026/2027</span>
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-slate-400">شرح غير مختصر + بنك أسئلة متدرج</span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white mt-3">
                منصة كيمياء البكالوريا التفاعلية المتكاملة
              </h1>
              <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-3xl leading-relaxed">
                وحدات تعليمية مستقلة وشاملة بـ 17 قسماً تعليمياً معتمدة 100% من كتاب الوزارة الرسمي. تجارب معملية، بنك أسئلة متدرج عبر 4 مستويات، ونظام اختبارات ذكي مع تشخيص نقاط الضعف.
              </p>
            </div>

            {/* Quick Actions & Metric Badges */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsWrongQuestionsModalOpen(true);
                  playSound("modal_open");
                }}
                className="relative flex items-center gap-2.5 rounded-2xl border border-rose-500/30 bg-rose-950/20 px-4 py-3 hover:bg-rose-900/30 transition shadow-sm"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-500/20 text-rose-400">
                  <XCircle size={18} />
                </div>
                <div className="text-start">
                  <span className="text-[11px] text-slate-400 block font-semibold">سجل الأخطاء الذكي</span>
                  <span className="text-xs font-bold text-rose-300">
                    {wrongQuestionsBank.length} سؤال للمراجعة
                  </span>
                </div>
                {wrongQuestionsBank.length > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-mono font-bold text-white shadow-md">
                    {wrongQuestionsBank.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsHighlightsModalOpen(true);
                  playSound("modal_open");
                }}
                className="flex items-center gap-2.5 rounded-2xl border border-amber-500/30 bg-amber-950/20 px-4 py-3 hover:bg-amber-900/30 transition shadow-sm"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
                  <Bookmark size={18} />
                </div>
                <div className="text-start">
                  <span className="text-[11px] text-slate-400 block font-semibold">الملاحظات المحفوظة</span>
                  <span className="text-xs font-bold text-amber-300">
                    {savedHighlights.length} تمييز علمي
                  </span>
                </div>
              </button>

              <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/80 p-3 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <Award size={22} />
                </div>
                <div>
                  <span className="text-xs text-slate-400 block font-semibold">إجمالي الإنجاز في المنهج</span>
                  <span className="text-sm font-bold text-white block mt-0.5">
                    {completedCount} من 52 درساً ({overallPercent}%)
                  </span>
                  <div className="mt-1.5 h-1.5 w-32 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-700"
                      style={{ width: `${overallPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Part 1 vs Part 2 Switcher Tabs */}
          <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setSelectedPartNum(1);
                setSelectedChapterId("all");
                playSound("select");
              }}
              className={`flex-1 rounded-2xl p-4 text-start transition-all border ${
                selectedPartNum === 1
                  ? "bg-blue-600/15 border-blue-500/50 shadow-md ring-1 ring-blue-500/40"
                  : "bg-slate-900/60 border-slate-800/80 hover:bg-slate-800/60 text-slate-400"
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    selectedPartNum === 1
                      ? "bg-blue-500/20 text-blue-300"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  الجزء الأول
                </span>
                <span className="text-xs font-mono font-bold text-blue-400">
                  {part1CompletedCount} / 26 مكتمل
                </span>
              </div>
              <h3 className="text-base font-bold text-white mt-2">
                كيمياء البكالوريا Part 1
              </h3>
              <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                الفصل الأول: حالات المادة (13) + الفصل الثاني: التغير والاتزان (13)
              </p>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedPartNum(2);
                setSelectedChapterId("all");
                playSound("select");
              }}
              className={`flex-1 rounded-2xl p-4 text-start transition-all border ${
                selectedPartNum === 2
                  ? "bg-cyan-600/15 border-cyan-500/50 shadow-md ring-1 ring-cyan-500/40"
                  : "bg-slate-900/60 border-slate-800/80 hover:bg-slate-800/60 text-slate-400"
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    selectedPartNum === 2
                      ? "bg-cyan-500/20 text-cyan-300"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  الجزء الثاني
                </span>
                <span className="text-xs font-mono font-bold text-cyan-400">
                  {part2CompletedCount} / 26 مكتمل
                </span>
              </div>
              <h3 className="text-base font-bold text-white mt-2">
                كيمياء البكالوريا Part 2
              </h3>
              <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                الفصل الثالث: المواد غير العضوية (11) + الفصل الرابع: الكيمياء العضوية (15)
              </p>
            </button>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {activeLesson && detailedActiveLesson ? (
          /* 3. Detailed Unabridged 17-Section Reader View */
          <div>
            <DetailedLessonReader
              lesson={detailedActiveLesson}
              isCompleted={Boolean(progressState[activeLesson.id]?.completed)}
              onToggleComplete={() => {
                const current = Boolean(progressState[activeLesson.id]?.completed);
                onUpdateProgress(activeLesson.id, !current);
                if (!current) {
                  onAddXp(50);
                  playSound("achievement");
                } else {
                  playSound("click");
                }
              }}
              onOpenQuizSuite={() => {
                setIsQuizSuiteOpen(true);
                playSound("modal_open");
              }}
              onBack={handleBackToCatalog}
              prevLessonTitle={prevLesson?.title}
              nextLessonTitle={nextLesson?.title}
              onNavigatePrev={prevLesson ? () => handleSelectLesson(prevLesson) : undefined}
              onNavigateNext={nextLesson ? () => handleSelectLesson(nextLesson) : undefined}
              savedHighlights={savedHighlights.filter((h) => h.lessonId === activeLesson.id)}
              onAddHighlight={handleAddHighlight}
              onRemoveHighlight={handleRemoveHighlight}
            />
          </div>
        ) : (
          /* 4. Curriculum Chapters & Lessons Catalog View */
          <div className="space-y-6">
            {/* Filter and Search Bar */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 flex flex-col md:flex-row items-center gap-4">
              <div className="relative flex-1 w-full">
                <Search
                  size={18}
                  className="absolute start-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  placeholder="ابحث في الدروس، المفاهيم، المعادلات، أو أسماء العلماء..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 py-2.5 ps-10 pe-4 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                {/* Chapter Select */}
                <select
                  value={selectedChapterId}
                  onChange={(e) => {
                    setSelectedChapterId(e.target.value);
                    playSound("select");
                  }}
                  className="rounded-xl bg-slate-950 border border-slate-800 px-3 py-2.5 text-xs text-slate-300 focus:border-cyan-500 focus:outline-none"
                >
                  <option value="all">جميع فصول الجزء {selectedPartNum}</option>
                  {currentPart.chapters.map((ch) => (
                    <option key={ch.id} value={ch.id}>
                      {ch.title}
                    </option>
                  ))}
                </select>

                {/* Difficulty Select */}
                <select
                  value={selectedDifficulty}
                  onChange={(e) => {
                    setSelectedDifficulty(e.target.value);
                    playSound("select");
                  }}
                  className="rounded-xl bg-slate-950 border border-slate-800 px-3 py-2.5 text-xs text-slate-300 focus:border-cyan-500 focus:outline-none"
                >
                  <option value="all">كل مستويات الصعوبة</option>
                  <option value="أساسي">أساسي</option>
                  <option value="متوسط">متوسط</option>
                  <option value="متقدم">متقدم</option>
                </select>
              </div>
            </div>

            {/* Chapters with Lesson Cards */}
            <div className="space-y-8">
              {filteredChapters.map((chapter) => (
                <ChapterCardSection
                  key={chapter.id}
                  chapter={chapter}
                  progressState={progressState}
                  onSelectLesson={handleSelectLesson}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* 5. Interactive Quiz Suite Modal */}
      {isQuizSuiteOpen && detailedActiveLesson && (
        <InteractiveQuizSuite
          lessonTitle={detailedActiveLesson.title}
          lessonId={detailedActiveLesson.id}
          questionBank={detailedActiveLesson.questionBank}
          onSaveAttempt={handleSaveQuizAttempt}
          onRecordWrongQuestions={handleRecordWrongQuestions}
          onClose={() => {
            setIsQuizSuiteOpen(false);
            playSound("modal_close");
          }}
        />
      )}

      {/* 6. Retest Wrong Questions Quiz Suite Modal */}
      {isRetestingWrongOnly && wrongQuestionsBank.length > 0 && (
        <InteractiveQuizSuite
          lessonTitle="اختبار تصحيح الأخطاء الذكي"
          lessonId="retest_wrong_suite"
          questionBank={wrongQuestionsBank}
          onSaveAttempt={handleSaveQuizAttempt}
          onRecordWrongQuestions={handleRecordWrongQuestions}
          onClose={() => {
            setIsRetestingWrongOnly(false);
            playSound("modal_close");
          }}
        />
      )}

      {/* 7. Wrong Questions Notebook Modal */}
      {isWrongQuestionsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-3xl border border-rose-500/30 bg-slate-900 shadow-2xl flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  <XCircle size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">سجل الأخطاء وبنك المراجعة الذكي</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    الأسئلة التي تم حلها خطأً أثناء الاختبارات مع خطوات الحل الصحيحة
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsWrongQuestionsModalOpen(false);
                  playSound("modal_close");
                }}
                className="h-8 w-8 flex items-center justify-center rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {wrongQuestionsBank.length === 0 ? (
                <div className="py-16 text-center space-y-3">
                  <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
                    <CheckCircle2 size={32} />
                  </div>
                  <h4 className="text-base font-bold text-white">سجل الأخطاء فارغ تماماً!</h4>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    رائع! لم تسجل أي إجابات خاطئة، أو أنك قمت بمراجعة وتصحيح جميع الأسئلة السابقة بنجاح.
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between pb-2">
                    <span className="text-xs font-mono text-slate-400">
                      إجمالي الأسئلة المحفوظة: {wrongQuestionsBank.length}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsWrongQuestionsModalOpen(false);
                        setIsRetestingWrongOnly(true);
                        playSound("simulation_start");
                      }}
                      className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-rose-500 transition shadow-sm"
                    >
                      <RotateCcw size={14} />
                      <span>إعادة اختبار هذه الأسئلة فقط</span>
                    </button>
                  </div>

                  {wrongQuestionsBank.map((q, idx) => (
                    <div
                      key={q.id || idx}
                      className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-500/20 text-rose-300 font-mono text-[10px] font-bold">
                            {idx + 1}
                          </span>
                          <span className="text-xs font-bold text-white">{q.conceptTested}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveWrongQuestion(q.id)}
                          className="text-slate-500 hover:text-rose-400 transition"
                          title="حذف من سجل الأخطاء"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>

                      <p className="text-sm font-semibold text-slate-200">{q.question}</p>

                      {/* Options */}
                      {q.options && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          {q.options.map((opt, oIdx) => (
                            <div
                              key={oIdx}
                              className={`p-2 rounded-xl border ${
                                oIdx === q.correctAnswer
                                  ? "border-emerald-500/50 bg-emerald-950/20 text-emerald-300 font-bold"
                                  : "border-slate-800/60 bg-slate-900/40 text-slate-400"
                              }`}
                            >
                              <span>{String.fromCharCode(65 + oIdx)}. </span>
                              <span>{opt}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Explanation */}
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 space-y-1">
                        <span className="font-bold text-cyan-400 block">التفسير العلمي المعتمد:</span>
                        <p>{q.explanation}</p>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 8. Highlights & Notebook Modal */}
      {isHighlightsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-3xl border border-amber-500/30 bg-slate-900 shadow-2xl flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <Bookmark size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">دفتر الملاحظات والتمييزات العلمية</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    الفقرات والمعلومات الهامة التي قمت بتمييزها أثناء القراءة
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsHighlightsModalOpen(false);
                  playSound("modal_close");
                }}
                className="h-8 w-8 flex items-center justify-center rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              {savedHighlights.length === 0 ? (
                <div className="py-16 text-center space-y-3">
                  <Bookmark size={32} className="mx-auto text-slate-600" />
                  <h4 className="text-base font-bold text-white">لا توجد ملاحظات محفوظة بعد</h4>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    يمكنك تحديد أي نص علمي أثناء قراءة الدروس والضغط على أيقونة التمييز لإضافته إلى هذا الدفتر للرجوع إليه قبل الاختبار.
                  </p>
                </div>
              ) : (
                savedHighlights.map((hl) => (
                  <div
                    key={hl.id}
                    className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 space-y-2"
                  >
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span className="font-bold text-amber-400">{hl.lessonTitle || "درس كيمياء"}</span>
                      <div className="flex items-center gap-2">
                        <span>{hl.timestamp}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveHighlight(hl.id)}
                          className="text-slate-500 hover:text-rose-400 transition"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <blockquote className="border-s-2 border-amber-500 ps-3 text-xs sm:text-sm text-slate-200 italic leading-relaxed">
                      "{hl.text}"
                    </blockquote>
                    {hl.note && (
                      <div className="pt-2 text-xs text-cyan-300 font-sans">
                        <span className="text-slate-400 font-semibold">ملاحظتك: </span>
                        {hl.note}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Chapter Card Section (collapsible list of lessons with metrics)
// ---------------------------------------------------------------------------
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
  const [isOpen, setIsOpen] = useState(true);

  const completedInChapter = chapter.lessons.filter(
    (l) => progressState[l.id]?.completed
  ).length;

  return (
    <div className="rounded-3xl border border-slate-800/80 bg-slate-900/50 backdrop-blur-md overflow-hidden transition-all shadow-md">
      {/* Chapter Title Bar */}
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
              <h2 className="text-lg sm:text-xl font-bold text-white">
                {chapter.title}
              </h2>
              <span className="text-xs font-mono text-cyan-400">
                ({chapter.lessons.length} درساً)
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl line-clamp-1">
              {chapter.description}
            </p>
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

      {/* Lesson List Grid */}
      {isOpen && (
        <div className="border-t border-slate-800/80 p-5 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {chapter.lessons.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 col-span-2 text-center">
              لا توجد دروس تطابق خيارات البحث الحالية في هذا الفصل.
            </p>
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
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 font-mono text-[11px] font-bold text-cyan-400">
                          {lesson.lessonNumber}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            lesson.difficulty === "أساسي"
                              ? "bg-blue-500/15 text-blue-300"
                              : lesson.difficulty === "متوسط"
                              ? "bg-amber-500/15 text-amber-300"
                              : "bg-purple-500/15 text-purple-300"
                          }`}
                        >
                          {lesson.difficulty}
                        </span>
                      </div>

                      {isDone ? (
                        <div className="flex items-center gap-1 text-emerald-400 text-xs font-bold">
                          <CheckCircle2 size={16} />
                          <span>مكتمل</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-slate-500 text-xs">
                          <Clock size={13} />
                          <span>{lesson.estimatedMinutes} دقيقة</span>
                        </div>
                      )}
                    </div>

                    <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {lesson.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {lesson.subtitle}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 font-mono">
                      40+ سؤالاً تدريبياً بـ 4 مستويات
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-cyan-400 group-hover:translate-x-[-3px] transition-transform">
                      <span>عرض الدرس الكامل (17 قسماً)</span>
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
