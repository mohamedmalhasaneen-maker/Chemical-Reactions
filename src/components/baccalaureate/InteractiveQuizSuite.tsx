/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Comprehensive 5-Mode Interactive Testing Suite
 * Supports Basic, Intermediate, Advanced, Challenge, and Comprehensive exams
 * with optional timer, instant/post grading, weakness diagnosis, and re-test.
 */

import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Award,
  CheckCircle2,
  Clock,
  HelpCircle,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Timer,
  XCircle,
  Zap,
} from "lucide-react";
import {
  QuestionItem,
  QuestionLevel,
  QuizMode,
  StudentQuizAttempt,
} from "../../curriculum/types";
import { playSound } from "../../utils/soundEngine";

interface InteractiveQuizSuiteProps {
  lessonTitle: string;
  lessonId: string;
  questionBank: QuestionItem[];
  onSaveAttempt: (attempt: StudentQuizAttempt) => void;
  onRecordWrongQuestions: (questions: QuestionItem[], answers: any) => void;
  onClose: () => void;
}

export const InteractiveQuizSuite: React.FC<InteractiveQuizSuiteProps> = ({
  lessonTitle,
  lessonId,
  questionBank,
  onSaveAttempt,
  onRecordWrongQuestions,
  onClose,
}) => {
  // Quiz Configuration
  const [selectedMode, setSelectedMode] = useState<QuizMode>("comprehensive");
  const [isExamStarted, setIsExamStarted] = useState(false);
  const [isInstantFeedback, setIsInstantFeedback] = useState(true);
  const [isTimerEnabled, setIsTimerEnabled] = useState(true);
  const [timerSecondsLeft, setTimerSecondsLeft] = useState(600); // 10 minutes default
  const [isTimerPaused, setIsTimerPaused] = useState(false);

  // Active Questions for this attempt
  const [activeQuestions, setActiveQuestions] = useState<QuestionItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, any>>({});
  const [submittedAnswers, setSubmittedAnswers] = useState<Record<string, boolean>>({});
  const [isExamFinished, setIsExamFinished] = useState(false);
  const [elapsedTimeSeconds, setElapsedTimeSeconds] = useState(0);

  // Filter questions based on selected mode
  const filteredBank = useMemo(() => {
    if (selectedMode === "comprehensive") return questionBank;
    const levelMap: Record<QuizMode, QuestionLevel> = {
      basic: "basic",
      intermediate: "intermediate",
      advanced: "advanced",
      challenge: "challenge",
      comprehensive: "basic",
    };
    return questionBank.filter((q) => q.level === levelMap[selectedMode]);
  }, [selectedMode, questionBank]);

  // Start the quiz
  const handleStartQuiz = () => {
    // Shuffle and pick questions (up to 15-20 per quiz session)
    const shuffled = [...filteredBank].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(shuffled.length, 15));
    setActiveQuestions(selected);
    setCurrentIndex(0);
    setUserAnswers({});
    setSubmittedAnswers({});
    setIsExamStarted(true);
    setIsExamFinished(false);
    setElapsedTimeSeconds(0);
    setTimerSecondsLeft(selected.length * 90); // 90 seconds per question
    playSound("simulation_start");
  };

  // Timer Tick Effect
  useEffect(() => {
    if (!isExamStarted || isExamFinished || isTimerPaused || !isTimerEnabled) return;

    const timer = setInterval(() => {
      setElapsedTimeSeconds((prev) => prev + 1);
      setTimerSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinishExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isExamStarted, isExamFinished, isTimerPaused, isTimerEnabled]);

  const currentQuestion = activeQuestions[currentIndex];

  // Answer handler
  const handleAnswer = (ans: any) => {
    if (submittedAnswers[currentQuestion.id] && !isExamFinished) return;

    setUserAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: ans,
    }));
    playSound("select");

    if (isInstantFeedback) {
      setSubmittedAnswers((prev) => ({ ...prev, [currentQuestion.id]: true }));
      // Check if correct
      const isCorrect = checkAnswerCorrectness(currentQuestion, ans);
      playSound(isCorrect ? "success" : "error");
    }
  };

  // Helper to check answer correctness
  const checkAnswerCorrectness = (q: QuestionItem, ans: any): boolean => {
    if (ans === undefined || ans === null || ans === "") return false;
    if (q.type === "mcq") {
      return Number(ans) === Number(q.correctAnswer);
    }
    if (q.type === "true_false") {
      return Boolean(ans) === Boolean(q.correctAnswer);
    }
    if (q.type === "fill_blank") {
      const normalizedUser = String(ans).trim().toLowerCase();
      const normalizedCorrect = String(q.correctAnswer).trim().toLowerCase();
      return (
        normalizedUser === normalizedCorrect ||
        normalizedCorrect.includes(normalizedUser)
      );
    }
    if (q.type === "calculation") {
      const userNum = parseFloat(String(ans));
      const targetNum = parseFloat(String(q.correctAnswer));
      if (isNaN(userNum) || isNaN(targetNum)) return false;
      return Math.abs(userNum - targetNum) <= Math.max(0.2, targetNum * 0.05); // 5% tolerance
    }
    return false;
  };

  // Finish exam and calculate results
  const handleFinishExam = () => {
    setIsExamFinished(true);
    playSound("achievement");

    let correctCount = 0;
    const wrongQuestions: QuestionItem[] = [];
    const weakConceptsSet = new Set<string>();

    activeQuestions.forEach((q) => {
      const isCorrect = checkAnswerCorrectness(q, userAnswers[q.id]);
      if (isCorrect) {
        correctCount++;
      } else {
        wrongQuestions.push(q);
        weakConceptsSet.add(q.conceptTested);
      }
    });

    const scorePercent = Math.round(
      (correctCount / (activeQuestions.length || 1)) * 100
    );

    const attempt: StudentQuizAttempt = {
      id: "attempt_" + Date.now(),
      lessonId,
      mode: selectedMode,
      timestamp: new Date().toISOString(),
      totalQuestions: activeQuestions.length,
      score: correctCount,
      scorePercent,
      timeSpentSeconds: elapsedTimeSeconds,
      wrongQuestionIds: wrongQuestions.map((q) => q.id),
      weakConcepts: Array.from(weakConceptsSet),
    };

    onSaveAttempt(attempt);
    if (wrongQuestions.length > 0) {
      onRecordWrongQuestions(wrongQuestions, userAnswers);
    }
  };

  // Re-test wrong questions only
  const handleRetestWrongOnly = () => {
    const wrong = activeQuestions.filter(
      (q) => !checkAnswerCorrectness(q, userAnswers[q.id])
    );
    if (wrong.length === 0) return;

    setActiveQuestions(wrong);
    setCurrentIndex(0);
    setUserAnswers({});
    setSubmittedAnswers({});
    setIsExamFinished(false);
    setElapsedTimeSeconds(0);
    setTimerSecondsLeft(wrong.length * 90);
    playSound("simulation_start");
  };

  // Format timer
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-xl animate-fadeIn">
      <div className="relative flex flex-col w-full max-w-3xl max-h-[92vh] rounded-3xl border border-cyan-500/30 bg-slate-900/95 shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Zap size={20} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>منظومة الاختبارات التفاعلية المتقدمة</span>
              </h2>
              <p className="text-xs text-slate-400 line-clamp-1">{lessonTitle}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white transition"
          >
            ✕
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {!isExamStarted ? (
            /* Mode Selection Screen */
            <div className="space-y-6 max-w-xl mx-auto py-4">
              <div className="text-center space-y-2">
                <h3 className="text-xl font-black text-white">
                  اختر نمط الاختبار المطلوب
                </h3>
                <p className="text-xs sm:text-sm text-slate-400">
                  بنك أسئلة متدرج يختبر الاستيعاب المفاهيمي، التطبيق الحسابي، والتفكير النقدي
                </p>
              </div>

              {/* Quiz Modes Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  {
                    id: "basic",
                    title: "1. اختبار المستوى الأساسي",
                    desc: "قياس فهم المصطلحات والتعريفات والأسئلة المباشرة",
                    tone: "border-blue-500/40 bg-blue-950/20 text-blue-300",
                    count: questionBank.filter((q) => q.level === "basic").length,
                  },
                  {
                    id: "intermediate",
                    title: "2. اختبار المستوى المتوسط",
                    desc: "ربط المفاهيم وتفسير الظواهر والمسائل المتدرجة",
                    tone: "border-cyan-500/40 bg-cyan-950/20 text-cyan-300",
                    count: questionBank.filter((q) => q.level === "intermediate").length,
                  },
                  {
                    id: "advanced",
                    title: "3. اختبار المستوى المتقدم",
                    desc: "مسائل متعددة الخطوات واستنتاج العلاقات والقوانين",
                    tone: "border-indigo-500/40 bg-indigo-950/20 text-indigo-300",
                    count: questionBank.filter((q) => q.level === "advanced").length,
                  },
                  {
                    id: "challenge",
                    title: "4. اختبار التحدي والتفوق",
                    desc: "مسائل مركبة وحجج علمية وتفكير نقدي عالي المستوى",
                    tone: "border-purple-500/40 bg-purple-950/20 text-purple-300",
                    count: questionBank.filter((q) => q.level === "challenge").length,
                  },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => {
                      setSelectedMode(mode.id as QuizMode);
                      playSound("select");
                    }}
                    className={`text-start p-4 rounded-2xl border transition-all ${
                      selectedMode === mode.id
                        ? `${mode.tone} ring-2 ring-cyan-500/50 shadow-lg`
                        : "border-slate-800 bg-slate-950/60 hover:bg-slate-800/60 text-slate-400"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm text-white">{mode.title}</span>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                        {mode.count} سؤالاً متاحاً
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{mode.desc}</p>
                  </button>
                ))}

                {/* Comprehensive Mode Button */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedMode("comprehensive");
                    playSound("select");
                  }}
                  className={`sm:col-span-2 text-start p-4 rounded-2xl border transition-all ${
                    selectedMode === "comprehensive"
                      ? "border-emerald-500/50 bg-emerald-950/30 ring-2 ring-emerald-500/50 text-emerald-300 shadow-lg"
                      : "border-slate-800 bg-slate-950/60 hover:bg-slate-800/60 text-slate-400"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm text-white flex items-center gap-2">
                      <Sparkles size={16} className="text-emerald-400" />
                      <span>5. الاختبار الشامل الكامل للدرس (موصى به)</span>
                    </span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-emerald-400 font-bold">
                      {questionBank.length} سؤالاً في البنك
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    نموذج امتحاني يحاكي مواصفات امتحان البكالوريا ويخلط عشوائياً بين جميع المستويات
                  </p>
                </button>
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isInstantFeedback}
                    onChange={(e) => setIsInstantFeedback(e.target.checked)}
                    className="accent-cyan-500 rounded h-4 w-4"
                  />
                  <span>تصحيح فوري وعرض التفسير بعد كل إجابة</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isTimerEnabled}
                    onChange={(e) => setIsTimerEnabled(e.target.checked)}
                    className="accent-cyan-500 rounded h-4 w-4"
                  />
                  <span>تفعيل المؤقت الزمني لتدريب السرعة</span>
                </label>
              </div>

              {/* Start Button */}
              <button
                type="button"
                onClick={handleStartQuiz}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-500 hover:opacity-95 text-white font-extrabold text-sm sm:text-base shadow-lg transition active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <Play size={18} />
                <span>بدء الاختبار الآن</span>
              </button>
            </div>
          ) : !isExamFinished ? (
            /* Active Exam Questions Screen */
            <div className="space-y-6">
              {/* Progress and Timer Strip */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400">السؤال:</span>
                  <span className="font-mono text-sm font-black text-cyan-400">
                    {currentIndex + 1} / {activeQuestions.length}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {isTimerEnabled && (
                    <div className="flex items-center gap-1.5 font-mono text-xs font-bold px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 text-amber-400">
                      <Clock size={14} />
                      <span>{formatTime(timerSecondsLeft)}</span>
                    </div>
                  )}

                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300">
                    المستوى: {currentQuestion.level}
                  </span>
                </div>
              </div>

              {/* Question Card */}
              <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-5 sm:p-7 space-y-4">
                <div className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-xs font-bold mt-0.5">
                    {currentIndex + 1}
                  </span>
                  <div className="space-y-1">
                    <span className="text-[11px] text-cyan-400 font-mono font-semibold block">
                      [المفهوم المقاس: {currentQuestion.conceptTested}]
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-white leading-relaxed">
                      {currentQuestion.question}
                    </h3>
                  </div>
                </div>

                {/* Question Types Rendering */}
                {currentQuestion.type === "mcq" && currentQuestion.options && (
                  <div className="space-y-2.5 pt-2">
                    {currentQuestion.options.map((opt, oIdx) => {
                      const isSelected = userAnswers[currentQuestion.id] === oIdx;
                      const isSubmitted = submittedAnswers[currentQuestion.id];
                      let classes =
                        "border-slate-800 bg-slate-900/80 text-slate-200 hover:bg-slate-800/80";

                      if (isSubmitted) {
                        if (oIdx === Number(currentQuestion.correctAnswer)) {
                          classes =
                            "border-emerald-500 bg-emerald-950/40 text-emerald-200 font-bold";
                        } else if (isSelected) {
                          classes = "border-rose-500 bg-rose-950/40 text-rose-200";
                        }
                      } else if (isSelected) {
                        classes =
                          "border-cyan-500 bg-cyan-950/40 text-cyan-200 font-semibold";
                      }

                      return (
                        <button
                          key={oIdx}
                          type="button"
                          onClick={() => handleAnswer(oIdx)}
                          className={`w-full text-start p-3.5 rounded-xl border text-xs sm:text-sm transition flex items-center gap-3 ${classes}`}
                        >
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-current font-mono text-[10px]">
                            {["أ", "ب", "ج", "د"][oIdx]}
                          </span>
                          <span>{opt}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {currentQuestion.type === "true_false" && (
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    {[
                      { val: true, label: "صحيح (True)" },
                      { val: false, label: "خطأ (False)" },
                    ].map((btn) => {
                      const isSelected =
                        userAnswers[currentQuestion.id] === btn.val;
                      const isSubmitted = submittedAnswers[currentQuestion.id];
                      let classes =
                        "border-slate-800 bg-slate-900 text-slate-200 hover:bg-slate-800";

                      if (isSubmitted) {
                        if (btn.val === Boolean(currentQuestion.correctAnswer)) {
                          classes =
                            "border-emerald-500 bg-emerald-950/40 text-emerald-200 font-bold";
                        } else if (isSelected) {
                          classes = "border-rose-500 bg-rose-950/40 text-rose-200";
                        }
                      } else if (isSelected) {
                        classes = "border-cyan-500 bg-cyan-950/40 text-cyan-200";
                      }

                      return (
                        <button
                          key={String(btn.val)}
                          type="button"
                          onClick={() => handleAnswer(btn.val)}
                          className={`p-3.5 rounded-xl border text-sm font-bold text-center transition ${classes}`}
                        >
                          {btn.label}
                        </button>
                      );
                    })}
                  </div>
                )}

                {(currentQuestion.type === "fill_blank" ||
                  currentQuestion.type === "calculation") && (
                  <div className="pt-2 space-y-2">
                    <input
                      type={currentQuestion.type === "calculation" ? "text" : "text"}
                      placeholder={
                        currentQuestion.type === "calculation"
                          ? "أدخل القيمة العددية الناتجة (مثال: 109.2)..."
                          : "اكتب المصطلح أو الكلمة العلمية المفقودة..."
                      }
                      value={userAnswers[currentQuestion.id] || ""}
                      onChange={(e) =>
                        setUserAnswers((p) => ({
                          ...p,
                          [currentQuestion.id]: e.target.value,
                        }))
                      }
                      className="w-full rounded-xl bg-slate-900 border border-slate-800 p-3 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                    />
                    {!submittedAnswers[currentQuestion.id] && (
                      <button
                        type="button"
                        onClick={() =>
                          handleAnswer(userAnswers[currentQuestion.id])
                        }
                        className="px-4 py-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-bold hover:bg-cyan-500/30"
                      >
                        تأكيد الإجابة
                      </button>
                    )}
                  </div>
                )}

                {/* Instant Feedback Drawer */}
                {submittedAnswers[currentQuestion.id] && (
                  <div
                    className={`rounded-2xl p-4 text-xs leading-relaxed border animate-fadeIn ${
                      checkAnswerCorrectness(
                        currentQuestion,
                        userAnswers[currentQuestion.id]
                      )
                        ? "bg-emerald-950/30 border-emerald-500/40 text-emerald-200"
                        : "bg-rose-950/30 border-rose-500/40 text-rose-200"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5 font-bold text-sm">
                      {checkAnswerCorrectness(
                        currentQuestion,
                        userAnswers[currentQuestion.id]
                      ) ? (
                        <>
                          <CheckCircle2 size={16} className="text-emerald-400" />
                          <span>إجابة صحيحة ومتقنة!</span>
                        </>
                      ) : (
                        <>
                          <XCircle size={16} className="text-rose-400" />
                          <span>إجابة خاطئة! التفسير النموذجي:</span>
                        </>
                      )}
                    </div>
                    <p>{currentQuestion.explanation}</p>
                    {currentQuestion.stepByStepSolution && (
                      <div className="mt-2.5 pt-2 border-t border-current/20 space-y-1 font-mono text-[11px]">
                        <span className="font-bold block">خطوات الحل التفصيلية:</span>
                        {currentQuestion.stepByStepSolution.map((st, i) => (
                          <div key={i}>{st}</div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Navigation controls */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  disabled={currentIndex === 0}
                  onClick={() => {
                    setCurrentIndex((i) => i - 1);
                    playSound("click");
                  }}
                  className="px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-900 text-xs font-bold text-slate-300 disabled:opacity-30"
                >
                  السابق
                </button>

                {currentIndex < activeQuestions.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentIndex((i) => i + 1);
                      playSound("click");
                    }}
                    className="px-5 py-2.5 rounded-xl bg-cyan-500 text-slate-950 text-xs font-bold hover:bg-cyan-400"
                  >
                    السؤال التالي
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleFinishExam}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 text-xs font-extrabold shadow-md hover:opacity-95"
                  >
                    تسليم الاختبار وإنهاء المحاولة
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Results & Weakness Diagnostic Screen */
            <div className="space-y-6 max-w-xl mx-auto py-2">
              <div className="text-center space-y-2">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 mb-2">
                  <Award size={32} />
                </div>
                <h3 className="text-2xl font-black text-white">
                  نتيجة التقييم النهائي
                </h3>
                <p className="text-xs text-slate-400">{lessonTitle}</p>
              </div>

              {/* Score summary cards */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-xs text-slate-400 block mb-1">الدرجة المئوية</span>
                  <span className="text-2xl font-black font-mono text-cyan-400">
                    {Math.round(
                      (activeQuestions.filter((q) =>
                        checkAnswerCorrectness(q, userAnswers[q.id])
                      ).length /
                        (activeQuestions.length || 1)) *
                        100
                    )}
                    %
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-xs text-slate-400 block mb-1">الإجابات الصحيحة</span>
                  <span className="text-2xl font-black font-mono text-emerald-400">
                    {
                      activeQuestions.filter((q) =>
                        checkAnswerCorrectness(q, userAnswers[q.id])
                      ).length
                    }{" "}
                    / {activeQuestions.length}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-xs text-slate-400 block mb-1">الوقت المستغرق</span>
                  <span className="text-2xl font-black font-mono text-amber-400">
                    {formatTime(elapsedTimeSeconds)}
                  </span>
                </div>
              </div>

              {/* Weakness Diagnostic Breakdown */}
              {activeQuestions.some(
                (q) => !checkAnswerCorrectness(q, userAnswers[q.id])
              ) && (
                <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/40 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                    <AlertTriangle size={16} />
                    <span>تقرير تشخيص نقاط الضعف والمفاهيم التي تحتاج مراجعة:</span>
                  </div>
                  <ul className="text-xs text-slate-300 space-y-1 ps-5 list-disc">
                    {Array.from(
                      new Set(
                        activeQuestions
                          .filter(
                            (q) => !checkAnswerCorrectness(q, userAnswers[q.id])
                          )
                          .map((q) => q.conceptTested)
                      )
                    ).map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                {activeQuestions.some(
                  (q) => !checkAnswerCorrectness(q, userAnswers[q.id])
                ) && (
                  <button
                    type="button"
                    onClick={handleRetestWrongOnly}
                    className="flex-1 py-3 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold hover:bg-amber-500/30 flex items-center justify-center gap-2"
                  >
                    <RotateCcw size={15} />
                    <span>إعادة اختبار الأسئلة الخاطئة فقط</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleStartQuiz}
                  className="flex-1 py-3 rounded-xl bg-cyan-500 text-slate-950 text-xs font-bold hover:bg-cyan-400 flex items-center justify-center gap-2"
                >
                  <Sparkles size={15} />
                  <span>إعادة الاختبار بنموذج جديد</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-3 rounded-xl border border-slate-800 bg-slate-900 text-xs font-bold text-slate-300 hover:bg-slate-800"
                >
                  العودة للشرح
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
