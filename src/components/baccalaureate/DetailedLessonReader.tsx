/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Detailed Unabridged Lesson Reader Component
 * Renders all 17 mandatory textbook sections with Table of Contents,
 * Equation Zoomer, Font Size Scaler, and Highlighter bookmarks.
 */

import React, { useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Bookmark,
  CheckCircle2,
  ChevronDown,
  Clock,
  Compass,
  Copy,
  ExternalLink,
  Eye,
  FileText,
  Flame,
  HelpCircle,
  Highlighter,
  Layers,
  Lightbulb,
  Maximize2,
  PenTool,
  RotateCcw,
  Scale,
  Search,
  Sparkles,
  Type,
  Wrench,
  Zap,
} from "lucide-react";
import { DetailedBacLesson } from "../../curriculum/types";
import { BaccalaureateSimulationEmbed } from "../BaccalaureateSimulationEmbed";
import { playSound } from "../../utils/soundEngine";

interface DetailedLessonReaderProps {
  lesson: DetailedBacLesson;
  isCompleted: boolean;
  onToggleComplete: () => void;
  onOpenQuizSuite: () => void;
  onBack: () => void;
  prevLessonTitle?: string;
  nextLessonTitle?: string;
  onNavigatePrev?: () => void;
  onNavigateNext?: () => void;
  savedHighlights: { id: string; text: string; note?: string }[];
  onAddHighlight: (text: string, note?: string) => void;
  onRemoveHighlight: (id: string) => void;
}

export const DetailedLessonReader: React.FC<DetailedLessonReaderProps> = ({
  lesson,
  isCompleted,
  onToggleComplete,
  onOpenQuizSuite,
  onBack,
  prevLessonTitle,
  nextLessonTitle,
  onNavigatePrev,
  onNavigateNext,
  savedHighlights,
  onAddHighlight,
  onRemoveHighlight,
}) => {
  // Reading font size zoom: 0 = normal (100%), 1 = medium (115%), 2 = large (130%)
  const [fontSizeLevel, setFontSizeLevel] = useState<0 | 1 | 2>(0);
  const [zoomedEquation, setZoomedEquation] = useState<string | null>(null);
  const [selectedHighlightText, setSelectedHighlightText] = useState("");
  const [highlightNoteInput, setHighlightNoteInput] = useState("");
  const [isHighlightModalOpen, setIsHighlightModalOpen] = useState(false);
  const [activeTocSection, setActiveTocSection] = useState<string>("sec_orientation");

  const fontClasses =
    fontSizeLevel === 0
      ? "text-sm sm:text-base leading-relaxed"
      : fontSizeLevel === 1
      ? "text-base sm:text-lg leading-loose"
      : "text-lg sm:text-xl leading-loose";

  // Table of Contents 17 sections navigation list
  const TOC_ITEMS = [
    { id: "sec_orientation", label: "1. سؤال التوجيه والمقدمة" },
    { id: "sec_objectives", label: "2. أهداف التعلم" },
    { id: "sec_concepts", label: "3. الشرح المفاهيمي التفصيلي" },
    { id: "sec_definitions", label: "4. التعريفات والمصطلحات" },
    { id: "sec_formulas", label: "5. القوانين والمعادلات والرموز" },
    { id: "sec_methodology", label: "6. منهجية وخطوات حل المسائل" },
    { id: "sec_examples", label: "7. أمثلة محلولة خطوة بخطوة" },
    { id: "sec_applications", label: "8. التطبيقات العملية والحياتية" },
    { id: "sec_simulation", label: "9. المحاكاة والتجارب العلمية" },
    { id: "sec_misconceptions", label: "10. الأخطاء الشائعة وتصحيحها" },
    { id: "sec_think_scientist", label: "11. فكر كعالم وفكر كمهندس" },
    { id: "sec_focus_notes", label: "12. ملاحظات التركيز الذهبية" },
    { id: "sec_exercises", label: "13. التدريبات المنظمة" },
    { id: "sec_challenges", label: "14. تحديات تفكير المتفوقين" },
    { id: "sec_summary", label: "15. الملخص المنظم والمفاهيم" },
    { id: "sec_quiz_launcher", label: "16. بنك الأسئلة والاختبارات" },
  ];

  const scrollToSection = (id: string) => {
    setActiveTocSection(id);
    const elem = document.getElementById(id);
    if (elem) {
      elem.scrollIntoView({ behavior: "smooth", block: "start" });
      playSound("click");
    }
  };

  const handleTextSelection = () => {
    const sel = window.getSelection();
    const text = sel ? sel.toString().trim() : "";
    if (text.length > 5) {
      setSelectedHighlightText(text);
      setIsHighlightModalOpen(true);
    }
  };

  return (
    <div className="relative max-w-5xl mx-auto space-y-8 animate-fadeIn text-slate-100">
      {/* 1. Top Accessibility and Quick Actions Toolbar */}
      <div className="sticky top-16 z-30 flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl glass-panel border border-slate-800 shadow-md">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs font-bold text-slate-200 transition"
          >
            <ArrowRight size={15} />
            <span>قائمة الدروس</span>
          </button>

          <span className="text-xs text-slate-400 hidden sm:inline-block">
            الجزء {lesson.partNumber} / الفصل {lesson.chapterNumber} / الدرس {lesson.lessonNumber}
          </span>
        </div>

        {/* Reading Accessibility Controls */}
        <div className="flex items-center gap-2">
          {/* Font Scaler */}
          <div className="inline-flex items-center rounded-xl bg-slate-900 border border-slate-800 p-0.5 text-xs font-mono">
            <button
              type="button"
              onClick={() => {
                setFontSizeLevel(0);
                playSound("click");
              }}
              title="خط عادي (100%)"
              className={`px-2 py-1 rounded-lg ${fontSizeLevel === 0 ? "bg-cyan-500/20 text-cyan-300 font-bold" : "text-slate-400"}`}
            >
              A
            </button>
            <button
              type="button"
              onClick={() => {
                setFontSizeLevel(1);
                playSound("click");
              }}
              title="خط متوسط (115%)"
              className={`px-2 py-1 rounded-lg ${fontSizeLevel === 1 ? "bg-cyan-500/20 text-cyan-300 font-bold" : "text-slate-400"}`}
            >
              A+
            </button>
            <button
              type="button"
              onClick={() => {
                setFontSizeLevel(2);
                playSound("click");
              }}
              title="خط كبير مريح (130%)"
              className={`px-2 py-1 rounded-lg ${fontSizeLevel === 2 ? "bg-cyan-500/20 text-cyan-300 font-bold" : "text-slate-400"}`}
            >
              A++
            </button>
          </div>

          {/* Launch 5-mode Quiz Suite Button */}
          <button
            type="button"
            onClick={() => {
              onOpenQuizSuite();
              playSound("modal_open");
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:opacity-95 text-xs font-extrabold text-white shadow-md active:scale-95 transition"
          >
            <Sparkles size={15} />
            <span>بدء الاختبارات التفاعلية ({lesson.questionBank.length})</span>
          </button>

          {/* Mark Complete Toggle */}
          <button
            type="button"
            onClick={onToggleComplete}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              isCompleted
                ? "bg-emerald-500 text-slate-950 font-extrabold"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            <CheckCircle2 size={15} />
            <span>{isCompleted ? "منجز" : "تحديد كمنجز"}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* 2. Floating / Sticky Internal Table of Contents (Desktop sidebar) */}
        <aside className="hidden lg:block lg:col-span-1">
          <div className="sticky top-36 rounded-3xl border border-slate-800/80 bg-slate-950/70 p-4 space-y-3 shadow-md max-h-[80vh] overflow-y-auto">
            <h4 className="text-xs font-bold text-cyan-400 flex items-center gap-1.5 pb-2 border-b border-slate-800">
              <BookOpen size={15} />
              <span>فهرس أجزاء الدرس (17 قسماً)</span>
            </h4>
            <nav className="space-y-1">
              {TOC_ITEMS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => scrollToSection(item.id)}
                  className={`w-full text-start px-2.5 py-1.5 rounded-xl text-[11px] font-semibold transition line-clamp-1 ${
                    activeTocSection === item.id
                      ? "bg-cyan-500/15 text-cyan-300 font-bold border-s-2 border-cyan-400"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>

            {/* Saved Highlights Mini-widget */}
            {savedHighlights.length > 0 && (
              <div className="pt-3 border-t border-slate-800 space-y-2">
                <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1">
                  <Bookmark size={13} />
                  <span>ملاحظاتك المظللة ({savedHighlights.length})</span>
                </span>
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {savedHighlights.map((hl) => (
                    <div
                      key={hl.id}
                      className="p-2 rounded-lg bg-amber-950/20 border border-amber-500/30 text-[10px] space-y-1"
                    >
                      <p className="text-slate-300 line-clamp-2 italic">"{hl.text}"</p>
                      {hl.note && <p className="text-amber-200 font-bold">{hl.note}</p>}
                      <button
                        type="button"
                        onClick={() => onRemoveHighlight(hl.id)}
                        className="text-[9px] text-rose-400 hover:underline"
                      >
                        حذف
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* 3. Main Reading Content (Full 17 Sections) */}
        <div
          onMouseUp={handleTextSelection}
          className="lg:col-span-3 space-y-10"
        >
          {/* Section 1 & 2: Hero Header & Orientation Question */}
          <section id="sec_orientation" className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-6 sm:p-8 shadow-xl space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="rounded-full bg-cyan-500/20 px-3 py-1 font-mono text-xs font-bold text-cyan-300 border border-cyan-500/30">
                الدرس {lesson.lessonNumber} في المنهج الرسمي
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Clock size={13} />
                <span>{lesson.estimatedMinutes} دقيقة للقراءة المعمقة</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
              {lesson.title}
            </h1>
            {lesson.titleEn && (
              <p className="text-xs font-mono text-cyan-400">{lesson.titleEn}</p>
            )}
            <p className="text-sm text-slate-300 leading-relaxed font-semibold">
              {lesson.subtitle}
            </p>

            {/* Section 2: Orientation Question */}
            <div className="rounded-2xl border border-amber-500/40 bg-amber-950/25 p-4 sm:p-5 flex items-start gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/40 mt-0.5">
                <Compass size={20} />
              </div>
              <div className="space-y-1">
                <h3 className="text-xs font-extrabold text-amber-300 uppercase tracking-wide">
                  سؤال التمهيد والتفكير المنهجي (Orientation Question)
                </h3>
                <p className="text-sm sm:text-base font-bold text-white leading-relaxed">
                  {lesson.orientationQuestion}
                </p>
              </div>
            </div>

            {/* Section 3: Detailed Introductory Scenario */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-2">
              <span className="text-xs font-bold text-cyan-400 block">
                مقدمة تمهيدية وسياق واقعي:
              </span>
              <p className={`text-slate-300 ${fontClasses}`}>
                {lesson.introductoryScenario}
              </p>
            </div>
          </section>

          {/* Section 4: Learning Objectives */}
          <section id="sec_objectives" className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 space-y-4">
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Sparkles size={18} className="text-cyan-400" />
              <span>أهداف التعلم ومخرجات الفهم المستهدفة</span>
            </h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {lesson.learningObjectives.map((obj, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-950/60 border border-slate-800/60 text-xs sm:text-sm text-slate-200"
                >
                  <CheckCircle2 size={16} className="text-cyan-400 shrink-0 mt-0.5" />
                  <span>{obj}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Section 5: In-Depth Detailed Concept Sections */}
          <section id="sec_concepts" className="space-y-6">
            <div className="flex items-center gap-2">
              <FileText size={20} className="text-cyan-400" />
              <h2 className="text-xl font-black text-white">
                الشرح المفاهيمي التفصيلي المتدرج
              </h2>
            </div>

            {lesson.conceptSections.map((sec, idx) => (
              <article
                key={sec.id}
                className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 space-y-4 shadow-sm"
              >
                <div className="space-y-1">
                  <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-300 text-xs font-mono">
                      {idx + 1}
                    </span>
                    <span>{sec.heading}</span>
                  </h3>
                  {sec.subheading && (
                    <p className="text-xs text-cyan-400 font-semibold ps-8">
                      {sec.subheading}
                    </p>
                  )}
                </div>

                <div className="space-y-3 ps-2 sm:ps-4">
                  {sec.detailedText.map((para, pIdx) => (
                    <p key={pIdx} className={`text-slate-300 font-normal ${fontClasses}`}>
                      {para}
                    </p>
                  ))}
                </div>

                {sec.highlightBox && (
                  <div className="mt-4 rounded-2xl border border-blue-500/40 bg-blue-950/20 p-4 text-xs sm:text-sm font-semibold text-blue-200 leading-relaxed">
                    {sec.highlightBox}
                  </div>
                )}
              </article>
            ))}
          </section>

          {/* Section 6: Definitions and Terms */}
          <section id="sec_definitions" className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 space-y-4">
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Type size={18} className="text-indigo-400" />
              <span>التعريفات والمصطلحات العلمية الدقيقة</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {lesson.definitions.map((def, i) => (
                <div
                  key={i}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-cyan-300 text-sm">
                      {def.term}
                    </span>
                    {def.termEn && (
                      <span className="text-[10px] font-mono text-slate-500">
                        {def.termEn}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-normal">
                    {def.definition}
                  </p>
                  {def.contextNotes && (
                    <span className="text-[10.5px] text-slate-400 block pt-1 border-t border-slate-900">
                      💡 {def.contextNotes}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Section 7: Formulas and Equations */}
          <section id="sec_formulas" className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 space-y-5">
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Scale size={18} className="text-cyan-400" />
              <span>القوانين والمعادلات مع شرح الرموز ووحدات القياس</span>
            </h2>
            <div className="space-y-4">
              {lesson.formulasAndEquations.map((form, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-cyan-500/30 bg-slate-950 p-4 sm:p-5 space-y-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-300">
                      {form.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => setZoomedEquation(form.formula)}
                      className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                      title="تكبير المعادلة"
                    >
                      <Maximize2 size={14} />
                    </button>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 font-mono text-sm sm:text-base font-bold text-cyan-300 text-center border border-slate-800 overflow-x-auto">
                    {form.formula}
                  </div>

                  {/* Symbol Legends Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-start">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400">
                          <th className="py-1 px-2">الرمز</th>
                          <th className="py-1 px-2">الدلالة الفيزيائية</th>
                          <th className="py-1 px-2">وحدة القياس</th>
                        </tr>
                      </thead>
                      <tbody>
                        {form.symbolLegends.map((sym, sIdx) => (
                          <tr key={sIdx} className="border-b border-slate-900 text-slate-300">
                            <td className="py-1 px-2 font-mono font-bold text-cyan-400">
                              {sym.symbol}
                            </td>
                            <td className="py-1 px-2">{sym.meaning}</td>
                            <td className="py-1 px-2 font-mono text-amber-300">
                              {sym.unit}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <p className="text-[11px] text-slate-400">
                    <span className="font-bold text-slate-300">شروط التطبيق: </span>
                    {form.conditionsOfApplication}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Section 8: Problem Solving Methodology */}
          <section id="sec_methodology" className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 space-y-4">
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Wrench size={18} className="text-amber-400" />
              <span>منهجية وخطوات حل المسائل بالتفصيل</span>
            </h2>
            <div className="space-y-3">
              {lesson.problemSolvingMethodology.map((meth) => (
                <div
                  key={meth.stepNumber}
                  className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-1.5"
                >
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500/20 text-amber-300 text-xs font-mono font-bold">
                      {meth.stepNumber}
                    </span>
                    <h4 className="text-xs sm:text-sm font-bold text-white">
                      {meth.title}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-300 ps-7">{meth.instructions}</p>
                  {meth.commonPitfallWarning && (
                    <div className="ms-7 p-2 rounded-lg bg-rose-950/20 border border-rose-500/30 text-[11px] text-rose-300 font-semibold">
                      ⚠️ {meth.commonPitfallWarning}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Section 9: Worked Examples */}
          <section id="sec_examples" className="rounded-3xl border border-indigo-500/30 bg-slate-900/80 p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-2.5">
              <Sparkles size={20} className="text-indigo-400" />
              <h2 className="text-xl font-black text-white">
                أمثلة ومسائل محلولة خطوة بخطوة من كتاب الوزارة
              </h2>
            </div>

            {lesson.workedExamples.map((ex) => (
              <div
                key={ex.id}
                className="rounded-2xl border border-slate-800 bg-slate-950 p-5 space-y-4"
              >
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white">{ex.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed p-3 rounded-xl bg-slate-900 border border-slate-800/80">
                    <span className="font-bold text-indigo-400 block mb-1">المسألة:</span>
                    {ex.problem}
                  </p>
                </div>

                {/* Steps */}
                <div className="space-y-2.5">
                  <span className="text-xs font-bold text-slate-400 block">خطوات الحل المنهجي:</span>
                  {ex.steps.map((st) => (
                    <div
                      key={st.stepNumber}
                      className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1.5 text-xs"
                    >
                      <div className="flex items-center gap-2 font-bold text-white">
                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-mono">
                          {st.stepNumber}
                        </span>
                        <span>{st.label}</span>
                      </div>
                      {st.formula && (
                        <div className="font-mono text-cyan-300 bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
                          {st.formula}
                        </div>
                      )}
                      {st.mathCalculation && (
                        <div className="font-mono text-emerald-400 bg-slate-950 px-2.5 py-1 rounded border border-slate-800 font-bold">
                          {st.mathCalculation}
                        </div>
                      )}
                      <p className="text-slate-400">{st.explanation}</p>
                    </div>
                  ))}
                </div>

                <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-between text-xs">
                  <span className="font-bold text-emerald-300">الناتج المعتمد:</span>
                  <span className="font-mono font-black text-white text-sm">
                    {ex.finalAnswer}
                  </span>
                </div>
              </div>
            ))}
          </section>

          {/* Section 10: Practical and Industrial Applications */}
          <section id="sec_applications" className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 space-y-4">
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <GlobeIcon size={18} className="text-emerald-400" />
              <span>تطبيقات عملية وصناعية وحياتية</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {lesson.realWorldApplications.map((app, i) => (
                <div
                  key={i}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-white text-xs sm:text-sm">
                      {app.title}
                    </h4>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 font-semibold">
                      {app.domain}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-normal">
                    {app.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Section 11: Scientific Simulations & Explorations */}
          {lesson.simulationType && (
            <section id="sec_simulation" className="space-y-4">
              <div className="flex items-center gap-2">
                <Zap size={20} className="text-cyan-400" />
                <h2 className="text-xl font-black text-white">
                  المحاكاة والاستكشافات العلمية التفاعلية
                </h2>
              </div>
              <BaccalaureateSimulationEmbed
                config={{
                  type: lesson.simulationType,
                  title: `محاكي ${lesson.title}`,
                  hint: "تفاعل مع المتغيرات وشاهد التأثير الفوري على الجزيئات والبيانات البيانية.",
                }}
              />
            </section>
          )}

          {/* Section 12: Misconceptions & Scientific Corrections */}
          <section id="sec_misconceptions" className="rounded-3xl border border-rose-500/30 bg-slate-900/60 p-6 sm:p-8 space-y-4">
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <AlertCircle size={18} className="text-rose-400" />
              <span>الأخطاء والتصورات الشائعة وتصحيحها العلمي</span>
            </h2>
            <div className="space-y-3">
              {lesson.misconceptions.map((misc, i) => (
                <div
                  key={i}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs"
                >
                  <div className="text-rose-300 font-semibold flex items-start gap-2">
                    <span className="font-bold">❌ التصور الخاطئ:</span>
                    <span>{misc.misconception}</span>
                  </div>
                  <div className="text-emerald-300 font-bold flex items-start gap-2">
                    <span>✅ التصحيح العلمي:</span>
                    <span>{misc.scientificCorrection}</span>
                  </div>
                  <p className="text-slate-400 ps-6 text-[11px] leading-relaxed">
                    السبب: {misc.reasoning}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Section 13: Think like a Chemist & Engineer */}
          <section id="sec_think_scientist" className="rounded-3xl border border-purple-500/30 bg-slate-900/60 p-6 sm:p-8 space-y-4">
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Lightbulb size={18} className="text-purple-400" />
              <span>فكر كعالم كيمياء وفكر كمهندس (ص 10 و 14)</span>
            </h2>
            <div className="space-y-4">
              {lesson.thinkLikeScientistOrEngineer.map((item, i) => (
                <div
                  key={i}
                  className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-purple-300">
                      {item.title}
                    </span>
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-200 font-bold">
                      {item.role}
                    </span>
                  </div>
                  <p className="text-slate-300 font-semibold">{item.scenario}</p>
                  <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/20 text-purple-200 space-y-1">
                    <span className="font-bold block">التحدي: {item.inquiryPrompt}</span>
                    <p className="text-slate-300 leading-relaxed font-normal">
                      {item.guidedEvidenceAnalysis}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Section 14: Golden Focus Notes */}
          <section id="sec_focus_notes" className="rounded-3xl border border-amber-500/30 bg-gradient-to-r from-amber-950/20 to-slate-900 p-6 sm:p-8 space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-amber-300 flex items-center gap-2">
              <Sparkles size={18} />
              <span>ملاحظات التركيز الذهبية لامتحان البكالوريا</span>
            </h2>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-200 ps-5 list-disc">
              {lesson.criticalFocusNotes.map((note, i) => (
                <li key={i} className="leading-relaxed">
                  {note}
                </li>
              ))}
            </ul>
          </section>

          {/* Section 15: Guided Exercises */}
          <section id="sec_exercises" className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 space-y-4">
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <PenTool size={18} className="text-cyan-400" />
              <span>تدريبات متنوعة منظمة (حاول بنفسك وتدرب)</span>
            </h2>
            <div className="space-y-3.5">
              {lesson.guidedExercises.map((ex) => (
                <div
                  key={ex.id}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs"
                >
                  <h4 className="font-bold text-cyan-300 text-sm">{ex.title}</h4>
                  <p className="text-slate-200 whitespace-pre-line leading-relaxed">
                    {ex.task}
                  </p>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800/80 text-[11px] text-slate-400">
                    <span className="font-bold text-cyan-400 block mb-0.5">تلميح الحل: </span>
                    {ex.hint}
                  </div>
                  <details className="text-[11px] text-emerald-300 cursor-pointer">
                    <summary className="font-bold hover:underline">
                      عرض نموذج الإجابة المعتمد
                    </summary>
                    <div className="mt-2 p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 whitespace-pre-line text-slate-300 font-mono">
                      {ex.answerGuide}
                    </div>
                  </details>
                </div>
              ))}
            </div>
          </section>

          {/* Section 16: Thinking Challenges */}
          <section id="sec_challenges" className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 space-y-4">
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Zap size={18} className="text-purple-400" />
              <span>تحديات تفكير واستنتاج للمتفوقين</span>
            </h2>
            {lesson.thinkingChallenges.map((ch, i) => (
              <div
                key={i}
                className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-xs"
              >
                <span className="font-bold text-sm text-purple-300 block">
                  {ch.title}
                </span>
                <p className="text-slate-300 leading-relaxed">{ch.context}</p>
                <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/20 font-bold text-purple-200">
                  {ch.challengeQuestion}
                </div>
                <details className="text-[11px] text-purple-300 cursor-pointer">
                  <summary className="font-bold hover:underline">
                    استكشف الحل الاستنتاجي المتعمق
                  </summary>
                  <p className="mt-2 p-3 rounded-xl bg-slate-900 text-slate-300 leading-relaxed">
                    {ch.deepSolutionGuide}
                  </p>
                </details>
              </div>
            ))}
          </section>

          {/* Section 17: Structured Summary */}
          <section id="sec_summary" className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-950 to-slate-900 p-6 sm:p-8 space-y-4">
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <CheckCircle2 size={18} className="text-cyan-400" />
              <span>ملخص الدرس والمخططات المفاهيمية الشاملة</span>
            </h2>
            <div className="space-y-3 text-xs sm:text-sm">
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                <span className="font-bold text-cyan-300 block">المخططات المفاهيمية:</span>
                {lesson.structuredSummary.conceptMaps.map((map, i) => (
                  <p key={i} className="text-slate-300 font-mono text-xs">
                    {map}
                  </p>
                ))}
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                <span className="font-bold text-emerald-300 block">أهم الخلاصات:</span>
                <ul className="space-y-1 ps-5 list-disc text-slate-300">
                  {lesson.structuredSummary.coreTakeaways.map((takeaway, i) => (
                    <li key={i}>{takeaway}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* Quiz Suite Launch Section */}
          <section id="sec_quiz_launcher" className="rounded-3xl border border-cyan-500/40 bg-gradient-to-r from-cyan-950/30 via-slate-900 to-blue-950/30 p-6 sm:p-8 text-center space-y-4">
            <h2 className="text-xl sm:text-2xl font-black text-white">
              جاهز لاختبار فهمك؟ ({lesson.questionBank.length} سؤالاً متدرجاً)
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
              خُض اختبارات المستوى الأساسي، المتوسط، المتقدم، أو التحدي، مع مؤقت اختياري وتصحيح فوري وتشخيص نقاط الضعف
            </p>
            <button
              type="button"
              onClick={() => {
                onOpenQuizSuite();
                playSound("modal_open");
              }}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:opacity-95 text-white font-extrabold text-sm shadow-xl active:scale-95 transition inline-flex items-center gap-2"
            >
              <Sparkles size={18} />
              <span>فتح منظومة الاختبارات التفاعلية الآن</span>
            </button>
          </section>

          {/* Navigation Footer */}
          <footer className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            {onNavigatePrev && prevLessonTitle ? (
              <button
                type="button"
                onClick={onNavigatePrev}
                className="w-full sm:w-auto inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-900 text-xs font-bold text-slate-300 hover:bg-slate-800"
              >
                <ArrowRight size={15} />
                <span>الدرس السابق: {prevLessonTitle}</span>
              </button>
            ) : (
              <div />
            )}

            {onNavigateNext && nextLessonTitle ? (
              <button
                type="button"
                onClick={onNavigateNext}
                className="w-full sm:w-auto inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 text-slate-950 text-xs font-bold hover:bg-cyan-400"
              >
                <span>الدرس التالي: {nextLessonTitle}</span>
                <ArrowLeft size={15} />
              </button>
            ) : (
              <div />
            )}
          </footer>
        </div>
      </div>

      {/* Equation Zoom Modal */}
      {zoomedEquation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-lg rounded-3xl border border-cyan-500/40 bg-slate-900 p-6 space-y-4 shadow-2xl text-center">
            <span className="text-xs font-bold text-slate-400 block">معاينة المعادلة المكبرة</span>
            <div className="p-6 rounded-2xl bg-slate-950 font-mono text-xl sm:text-2xl font-black text-cyan-300 border border-slate-800 break-all">
              {zoomedEquation}
            </div>
            <button
              type="button"
              onClick={() => setZoomedEquation(null)}
              className="px-6 py-2 rounded-xl bg-slate-800 text-xs font-bold text-white hover:bg-slate-700"
            >
              إغلاق
            </button>
          </div>
        </div>
      )}

      {/* Highlighter Note Modal */}
      {isHighlightModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl border border-amber-500/40 bg-slate-900 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
              <Highlighter size={18} />
              <span>حفظ فقرة مظللة للمراجعة</span>
            </div>
            <p className="text-xs text-slate-300 p-3 rounded-xl bg-slate-950 border border-slate-800 italic line-clamp-3">
              "{selectedHighlightText}"
            </p>
            <input
              type="text"
              placeholder="أضف ملاحظة شخصية على هذه الفقرة (اختياري)..."
              value={highlightNoteInput}
              onChange={(e) => setHighlightNoteInput(e.target.value)}
              className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsHighlightModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-xs text-slate-400 hover:text-white"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={() => {
                  onAddHighlight(selectedHighlightText, highlightNoteInput);
                  setIsHighlightModalOpen(false);
                  setHighlightNoteInput("");
                  playSound("achievement");
                }}
                className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400"
              >
                حفظ في سجل المراجعة
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Simple globe icon fallback
const GlobeIcon: React.FC<{ size?: number; className?: string }> = ({
  size = 18,
  className = "",
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
    <path d="M2 12h20" />
  </svg>
);
