import React, { useState } from "react";
import {
  Award,
  BookOpenCheck,
  CheckCircle2,
  Cloud,
  Flame,
  FlaskConical,
  History,
  LogIn,
  LogOut,
  Play,
  ShieldAlert,
  Sparkles,
  Trash2,
  Volume2,
  X,
} from "lucide-react";
import {
  ChemistryBadge,
  ExperimentLesson,
  ExperimentLogEntry,
  UserStats,
} from "../types";
import { CHEMISTRY_BADGES, EXPERIMENT_LESSONS } from "../data";
import { User } from "../firebase";
import { GlassIcon, GlassTone } from "./GlassIcon";
import { ChemicalEquation } from "./ChemicalFormula";
import { playSound } from "../utils/soundEngine";

export interface AudioMixerSettings {
  master: number;
  fizz: number;
  sizzle: number;
  ui: number;
}

interface CurriculumViewProps {
  userStats: UserStats;
  experimentLog: ExperimentLogEntry[];
  onClearLog: () => void;
  onStartLessonInLab: (lessonId: string) => void;
  onCompleteLessonQuiz: (lesson: ExperimentLesson) => void;
  audioSettings: AudioMixerSettings;
  onChangeAudioSettings: (next: AudioMixerSettings) => void;
  currentUser: User | null;
  isSyncingCloud: boolean;
  onSignInGoogle: () => void;
  onSignOutGoogle: () => void;
}

const BADGE_ICON_MAP: Record<
  ChemistryBadge["iconKey"],
  { tone: GlassTone; render: (s: number) => React.ReactNode }
> = {
  neutralizer: { tone: "blue", render: (s) => <FlaskConical size={s} /> },
  gold: { tone: "amber", render: (s) => <Award size={s} /> },
  catalyst: { tone: "cyan", render: (s) => <Flame size={s} /> },
  safety: { tone: "rose", render: (s) => <ShieldAlert size={s} /> },
  organic: { tone: "violet", render: (s) => <BookOpenCheck size={s} /> },
  ai: { tone: "emerald", render: (s) => <Sparkles size={s} /> },
};

export const CurriculumView: React.FC<CurriculumViewProps> = ({
  userStats,
  experimentLog,
  onClearLog,
  onStartLessonInLab,
  onCompleteLessonQuiz,
  audioSettings,
  onChangeAudioSettings,
  currentUser,
  isSyncingCloud,
  onSignInGoogle,
  onSignOutGoogle,
}) => {
  const [activeQuizLesson, setActiveQuizLesson] =
    useState<ExperimentLesson | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<string, number>
  >({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const openQuiz = (lesson: ExperimentLesson) => {
    playSound("modal_open");
    setActiveQuizLesson(lesson);
    setSelectedAnswers({});
    setQuizSubmitted(false);
  };

  const handleSubmitQuiz = () => {
    if (!activeQuizLesson) return;
    setQuizSubmitted(true);
    const allCorrect = activeQuizLesson.quiz.every(
      (q) => selectedAnswers[q.id] === q.correctAnswerIndex
    );
    if (allCorrect) {
      playSound("achievement");
      onCompleteLessonQuiz(activeQuizLesson);
    } else {
      playSound("error");
    }
  };

  return (
    <div className="space-y-8 pb-10">
      {/* 1. Student Progress & Cloud Sync Header */}
      <section className="glass-panel rounded-3xl p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="flex items-start sm:items-center gap-4">
          <GlassIcon
            icon={<BookOpenCheck size={26} />}
            tone="amber"
            shape="hero"
            interactive={false}
          />
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              المنهج الأكاديمي وسجل الإنجازات العلمية
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              نقاط الخبرة:{" "}
              <span className="font-mono tabular-nums font-bold text-blue-700 dark:text-cyan-300">
                {userStats.scorePoints} XP
              </span>{" "}
              · الدروس المكتملة:{" "}
              <span className="font-mono tabular-nums font-bold">
                {userStats.completedLessons.length}/{EXPERIMENT_LESSONS.length}
              </span>{" "}
              · التجارب المنفذة:{" "}
              <span className="font-mono tabular-nums font-bold">
                {userStats.experimentsRun}
              </span>
            </p>
          </div>
        </div>

        {/* Cloud Account Sync Box */}
        <div className="flex flex-wrap items-center gap-3">
          {currentUser ? (
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/65 dark:bg-slate-900/55 px-4 py-2.5">
              <Cloud
                size={18}
                className={
                  isSyncingCloud
                    ? "animate-pulse text-cyan-500"
                    : "text-emerald-500"
                }
              />
              <div className="text-xs">
                <div className="font-bold text-slate-900 dark:text-white">
                  {currentUser.displayName || "باحث كيميائي"}
                </div>
                <div className="text-slate-500 dark:text-slate-400">
                  {isSyncingCloud
                    ? "جاري المزامنة السحابية..."
                    : "متصل ومزامن سحابياً"}
                </div>
              </div>
              <button
                type="button"
                onClick={onSignOutGoogle}
                className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl border border-slate-300/70 dark:border-slate-700 px-3 text-xs font-bold text-slate-700 dark:text-slate-200 hover:border-rose-500/50 transition"
              >
                <LogOut size={14} />
                <span>خروج</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onSignInGoogle}
              className="inline-flex min-h-[46px] items-center gap-2.5 rounded-2xl bg-gradient-to-l from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md transition"
            >
              <LogIn size={17} />
              <span>تسجيل الدخول بحساب Google لمزامنة تقدمك</span>
            </button>
          )}
        </div>
      </section>

      {/* 2. Guided Lessons Grid */}
      <section className="space-y-4">
        <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
          الدروس العملية الموجهة
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {EXPERIMENT_LESSONS.map((lesson) => {
            const isCompleted = userStats.completedLessons.includes(lesson.id);
            return (
              <article
                key={lesson.id}
                className="glass-card rounded-2xl p-5 flex flex-col justify-between gap-4"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        {lesson.difficulty === "beginner"
                          ? "تأسيسي"
                          : lesson.difficulty === "intermediate"
                          ? "متوسط"
                          : "جامعي متقدم"}{" "}
                        ·{" "}
                        <span className="font-mono tabular-nums">
                          {lesson.durationMinutes}
                        </span>{" "}
                        دقائق
                      </p>
                      <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white mt-0.5">
                        {lesson.title}
                      </h3>
                    </div>
                    {isCompleted && (
                      <span
                        title="مكتمل"
                        className="text-emerald-600 dark:text-emerald-400 shrink-0"
                      >
                        <CheckCircle2 size={22} />
                      </span>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                    {lesson.subtitle}
                  </p>

                  <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-400 list-disc ps-4">
                    {lesson.objectives.map((obj, i) => (
                      <li key={i}>{obj}</li>
                    ))}
                  </ul>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200/70 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => onStartLessonInLab(lesson.id)}
                    className="flex-1 min-h-[44px] inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 px-4 py-2 text-xs font-bold text-white transition"
                  >
                    <Play size={14} className="fill-current" />
                    <span>تطبيق عملي في المختبر</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => openQuiz(lesson)}
                    className="min-h-[44px] inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-300/80 dark:border-slate-700 bg-white/70 dark:bg-slate-900/60 px-4 py-2 text-xs font-bold text-slate-800 dark:text-slate-100 hover:border-amber-500/50 transition"
                  >
                    <span>الاختبار التقييمي</span>
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* 3. Scientific Badges Showcase */}
      <section className="space-y-4">
        <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
          أوسمة التميز الكيميائي
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CHEMISTRY_BADGES.map((badge) => {
            const unlocked = userStats.unlockedBadges.includes(badge.id);
            const iconSpec = BADGE_ICON_MAP[badge.iconKey];
            return (
              <div
                key={badge.id}
                className={`glass-card rounded-2xl p-4 flex items-start gap-3.5 transition ${
                  unlocked ? "opacity-100" : "opacity-55 grayscale-[0.45]"
                }`}
              >
                <GlassIcon
                  icon={iconSpec.render(20)}
                  tone={unlocked ? iconSpec.tone : "slate"}
                  shape="module"
                  interactive={false}
                />
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {badge.title}
                    </h3>
                    <span className="font-mono tabular-nums text-xs font-bold text-amber-600 dark:text-amber-300 shrink-0">
                      +{badge.xpReward} XP
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                    {badge.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Experiment History Log + 4-Channel Audio Mixer */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Experiment History */}
        <div className="lg:col-span-7 glass-panel rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <GlassIcon
                icon={<History size={18} />}
                tone="cyan"
                shape="action"
                interactive={false}
              />
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                سجل التجارب المخبرية الأخيرة
              </h2>
            </div>
            {experimentLog.length > 0 && (
              <button
                type="button"
                onClick={onClearLog}
                className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl px-3 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition"
              >
                <Trash2 size={14} />
                <span>مسح السجل</span>
              </button>
            )}
          </div>

          {experimentLog.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
              لم تُسجل تجارب بعد — ابدأ بخلط الكواشف في المختبر التفاعلي لتوثيق
              تفاعلاتك تلقائياً.
            </p>
          ) : (
            <div className="space-y-2.5 max-h-80 overflow-y-auto pe-1">
              {experimentLog.map((entry) => (
                <div
                  key={entry.id}
                  className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/60 dark:bg-slate-950/50 p-3.5 space-y-2"
                >
                  <div className="flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {entry.reactantNames.join(" + ")}
                    </span>
                    <span className="font-mono tabular-nums">
                      ΔT {entry.temperatureDelta >= 0 ? "+" : ""}
                      {entry.temperatureDelta.toFixed(1)} °C ·{" "}
                      {entry.source === "ai" ? "استنتاج ذكي" : "معياري"}
                    </span>
                  </div>
                  <div className="overflow-x-auto scrollbar-none">
                    <ChemicalEquation
                      equation={entry.equation}
                      className="text-xs"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 4-Channel Audio Synthesizer Mixer */}
        <div className="lg:col-span-5 glass-panel rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2.5">
            <GlassIcon
              icon={<Volume2 size={18} />}
              tone="violet"
              shape="action"
              interactive={false}
            />
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                مازج الصوت الفيزيائي للمختبر
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                تحكم في قنوات التوليف الصوتي WebAudio للتفاعلات
              </p>
            </div>
          </div>

          {(
            [
              { key: "master", label: "مستوى الصوت الرئيسي" },
              { key: "fizz", label: "صوت الفوران وتصاعد الغازات" },
              { key: "sizzle", label: "صوت الغليان والحرارة الطاردة" },
              { key: "ui", label: "نقرات الأدوات والتنبيهات" },
            ] as const
          ).map((ch) => (
            <div key={ch.key} className="space-y-1">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-700 dark:text-slate-300">
                  {ch.label}
                </span>
                <span
                  dir="ltr"
                  className="font-mono tabular-nums text-blue-600 dark:text-cyan-300"
                >
                  {Math.round(audioSettings[ch.key] * 100)}%
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={audioSettings[ch.key]}
                onChange={(e) =>
                  onChangeAudioSettings({
                    ...audioSettings,
                    [ch.key]: Number(e.target.value),
                  })
                }
                className="w-full accent-blue-600 h-2 rounded-lg cursor-pointer"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Interactive Lesson Quiz Modal */}
      {activeQuizLesson && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`اختبار ${activeQuizLesson.title}`}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/70 backdrop-blur-xs p-0 sm:p-4"
          onClick={() => setActiveQuizLesson(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="glass-modal w-full sm:max-w-xl rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 max-h-[90vh] overflow-y-auto space-y-5 pb-safe"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-amber-600 dark:text-amber-300">
                  التقييم العلمي للدرس
                </p>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  {activeQuizLesson.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveQuizLesson(null)}
                aria-label="إغلاق الاختبار"
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-300/60 dark:border-slate-700 text-slate-600 dark:text-slate-300"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-5">
              {activeQuizLesson.quiz.map((q, qIdx) => {
                const chosen = selectedAnswers[q.id];
                const isCorrect = chosen === q.correctAnswerIndex;
                return (
                  <div key={q.id} className="space-y-2.5">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      {qIdx + 1}. {q.question}
                    </p>
                    <div className="space-y-2">
                      {q.options.map((opt, optIdx) => {
                        const isPicked = chosen === optIdx;
                        let optStyle =
                          "border-slate-300/70 dark:border-slate-700 bg-white/70 dark:bg-slate-900/55 text-slate-800 dark:text-slate-200";
                        if (quizSubmitted) {
                          if (optIdx === q.correctAnswerIndex) {
                            optStyle =
                              "border-emerald-500 bg-emerald-500/15 text-emerald-900 dark:text-emerald-200";
                          } else if (isPicked) {
                            optStyle =
                              "border-rose-500 bg-rose-500/15 text-rose-900 dark:text-rose-200";
                          }
                        } else if (isPicked) {
                          optStyle =
                            "border-blue-600 bg-blue-600/14 text-blue-900 dark:text-cyan-200";
                        }

                        return (
                          <button
                            key={optIdx}
                            type="button"
                            disabled={quizSubmitted}
                            onClick={() => {
                              playSound("select");
                              setSelectedAnswers((prev) => ({
                                ...prev,
                                [q.id]: optIdx,
                              }));
                            }}
                            className={`w-full min-h-[44px] rounded-xl border px-3.5 py-2.5 text-start text-xs sm:text-sm font-semibold transition active:scale-[0.99] ${optStyle}`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>

                    {quizSubmitted && (
                      <p
                        className={`text-xs rounded-xl p-3 ${
                          isCorrect
                            ? "bg-emerald-500/12 text-emerald-800 dark:text-emerald-300"
                            : "bg-amber-500/12 text-amber-800 dark:text-amber-300"
                        }`}
                      >
                        {q.explanation}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {!quizSubmitted ? (
              <button
                type="button"
                disabled={
                  Object.keys(selectedAnswers).length <
                  activeQuizLesson.quiz.length
                }
                onClick={handleSubmitQuiz}
                className="min-h-[46px] w-full rounded-xl bg-gradient-to-l from-blue-600 to-cyan-600 px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50 transition"
              >
                اعتماد الإجابات والتحقق العلمي
              </button>
            ) : (
              <div className="flex items-center justify-between gap-3 pt-2">
                <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                  {activeQuizLesson.quiz.every(
                    (q) => selectedAnswers[q.id] === q.correctAnswerIndex
                  )
                    ? activeQuizLesson.congratulationText
                    : "راجع التفسير العلمي أعلاه وحاول مجدداً لإتقان المفهوم بالكامل."}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    if (
                      activeQuizLesson.quiz.every(
                        (q) => selectedAnswers[q.id] === q.correctAnswerIndex
                      )
                    ) {
                      setActiveQuizLesson(null);
                    } else {
                      setQuizSubmitted(false);
                    }
                  }}
                  className="shrink-0 min-h-[42px] rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white"
                >
                  {activeQuizLesson.quiz.every(
                    (q) => selectedAnswers[q.id] === q.correctAnswerIndex
                  )
                    ? "تم"
                    : "إعادة المحاولة"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
