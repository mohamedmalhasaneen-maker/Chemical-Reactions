/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Comprehensive Egyptian Chemistry Baccalaureate Curriculum Types
 * Enforces the complete 17-section lesson structure and 4-level graduated question bank.
 */

import { BacSimType } from "../types";

export type QuestionLevel = "basic" | "intermediate" | "advanced" | "challenge";
export type QuestionType = "mcq" | "true_false" | "fill_blank" | "calculation";

export interface QuestionItem {
  id: string;
  type: QuestionType;
  level: QuestionLevel;
  question: string;
  options?: string[];
  correctAnswer: number | string | boolean;
  explanation: string;
  stepByStepSolution?: string[];
  conceptTested: string;
  textbookPageRef?: string;
  auditStatus?: "reviewed_verified" | "corrected";
}

export interface SymbolLegend {
  symbol: string;
  meaning: string;
  unit: string;
}

export interface FormulaItem {
  name: string;
  formula: string;
  symbolLegends: SymbolLegend[];
  conditionsOfApplication: string;
}

export interface WorkedStep {
  stepNumber: number;
  label: string;
  formula?: string;
  mathCalculation?: string;
  explanation: string;
}

export interface WorkedExampleItem {
  id: string;
  title: string;
  problem: string;
  given: string[];
  steps: WorkedStep[];
  finalAnswer: string;
  alternativeVerificationMethod?: string;
}

export interface ConceptSection {
  id: string;
  heading: string;
  subheading?: string;
  detailedText: string[];
  visualDiagramDescription?: string;
  highlightBox?: string;
}

export interface DefinitionItem {
  term: string;
  termEn?: string;
  definition: string;
  contextNotes?: string;
}

export interface MisconceptionItem {
  misconception: string;
  scientificCorrection: string;
  reasoning: string;
}

export interface RealWorldAppItem {
  title: string;
  domain: "صناعة وتكنولوجيا" | "بيئة وطاقة" | "طب وصحة" | "حياة يومية";
  description: string;
}

export interface ScientificExplorationItem {
  title: string;
  purpose: string;
  materials: string[];
  procedureSteps: string[];
  observations: string[];
  conclusion: string;
}

export interface ThinkLikeChemistOrEngineerItem {
  role: "عالم كيمياء" | "مهندس كيميائي";
  title: string;
  scenario: string;
  inquiryPrompt: string;
  guidedEvidenceAnalysis: string;
}

export interface GuidedExerciseItem {
  id: string;
  title: string;
  task: string;
  hint: string;
  answerGuide: string;
}

export interface ThinkingChallengeItem {
  title: string;
  context: string;
  challengeQuestion: string;
  deepSolutionGuide: string;
}

export interface LessonAuditMetadata {
  auditStatus: "reviewed_verified" | "corrected" | "requires_review";
  pageRange: string;
  textbookSource: string;
  lastAuditedDate: string;
  auditorNotes: string;
}

export interface DetailedBacLesson {
  id: string;
  lessonNumber: number;
  chapterNumber: number;
  partNumber: 1 | 2;
  title: string;
  titleEn?: string;
  subtitle: string;
  estimatedMinutes: number;
  difficulty: "أساسي" | "متوسط" | "متقدم";
  simulationType?: BacSimType;

  // توثيق المراجعة العلمية لصفحات كتاب الوزارة
  auditMetadata?: LessonAuditMetadata;

  // 1. عنوان ومقدمة
  // 2. سؤال توجيهي يثير تفكير الطالب
  orientationQuestion: string;

  // 3. مقدمة تمهيدية مفصلة
  introductoryScenario: string;

  // 4. أهداف التعلم
  learningObjectives: string[];

  // 5. شرح تفصيلي لجميع المفاهيم العلمية
  conceptSections: ConceptSection[];

  // 6. التعريفات والمصطلحات العلمية
  definitions: DefinitionItem[];

  // 7. القوانين والمعادلات مع شرح كل رمز
  formulasAndEquations: FormulaItem[];

  // 8. خطوات حل المسائل بالتفصيل
  problemSolvingMethodology: {
    stepNumber: number;
    title: string;
    instructions: string;
    commonPitfallWarning?: string;
  }[];

  // 9. أمثلة محلولة خطوة بخطوة
  workedExamples: WorkedExampleItem[];

  // 10. تطبيقات عملية وحياتية
  realWorldApplications: RealWorldAppItem[];

  // 11. تجارب واستكشافات علمية
  scientificExplorations: ScientificExplorationItem[];

  // 12. الأخطاء والتصورات العلمية الشائعة وتصحيحها
  misconceptions: MisconceptionItem[];

  // 13. فكر كعالم كيمياء وفكر كمهندس
  thinkLikeScientistOrEngineer: ThinkLikeChemistOrEngineerItem[];

  // 14. ملاحظات مهمة ونقاط تحتاج إلى التركيز
  criticalFocusNotes: string[];

  // 15. تدريبات متنوعة
  guidedExercises: GuidedExerciseItem[];

  // 16. تحديات تفكير وأسئلة استنتاجية
  thinkingChallenges: ThinkingChallengeItem[];

  // 17. ملخص منظم في نهاية الدرس
  structuredSummary: {
    conceptMaps: string[];
    coreTakeaways: string[];
  };

  // بنك الأسئلة المتدرج الضخم (40 إلى 60+ سؤالاً)
  questionBank: QuestionItem[];
}

export type QuizMode =
  | "basic"
  | "intermediate"
  | "advanced"
  | "challenge"
  | "comprehensive";

export interface StudentQuizAttempt {
  id: string;
  lessonId: string;
  mode: QuizMode;
  timestamp: string;
  totalQuestions: number;
  score: number;
  scorePercent: number;
  timeSpentSeconds: number;
  wrongQuestionIds: string[];
  weakConcepts: string[];
}

export interface StudentProgressAnalytics {
  completedLessonIds: string[];
  startedLessonIds: string[];
  lastReadLessonId?: string;
  scrollPositionByLesson: Record<string, number>;
  quizAttempts: StudentQuizAttempt[];
  wrongQuestionsBank: Record<
    string,
    {
      question: QuestionItem;
      lastAttemptedAnswer: any;
      failCount: number;
      resolved: boolean;
    }
  >;
  savedHighlights: Record<
    string,
    {
      id: string;
      lessonId: string;
      sectionHeading: string;
      selectedText: string;
      userNote?: string;
      color: "yellow" | "cyan" | "green" | "pink";
      timestamp: string;
    }[]
  >;
}
