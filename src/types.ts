/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type AppPage =
  | "home"
  | "lab"
  | "periodic"
  | "instruments"
  | "curriculum"
  | "baccalaureate";

export type SimulationStatus =
  | "ready"
  | "running"
  | "paused"
  | "completed"
  | "error";

export type ChemicalCategory =
  | "acid"
  | "base"
  | "salt"
  | "metal"
  | "indicator"
  | "organic"
  | "oxidizer"
  | "other";

export interface Chemical {
  id: string;
  name: string;
  nameEn?: string;
  formula: string;
  molarMass?: number; // g/mol
  state: "solid" | "liquid" | "gas" | "aqueous";
  color: string;
  liquidColor?: string;
  ph?: number;
  category: ChemicalCategory;
  hazardLabel?: string;
  description: string;
}

export type ReactionType =
  | "neutralization"
  | "precipitation"
  | "gas-release"
  | "exothermic"
  | "endothermic"
  | "displacement"
  | "redox"
  | "dangerous"
  | "other";

export type AudioEffectType =
  | "click"
  | "modal_open"
  | "modal_close"
  | "navigate"
  | "select"
  | "success"
  | "error"
  | "simulation_start"
  | "simulation_complete"
  | "beep"
  | "fizz"
  | "sizzle"
  | "pop"
  | "explosion"
  | "cabinet_shake"
  | "achievement"
  | "completion"
  | "none";

export interface ReactionDetail {
  reactants?: string[];
  products: string[];
  equation: string;
  reactionType: ReactionType;
  temperatureDelta: number;
  enthalpyKjMol?: number;
  liquidColor?: string;
  colorChange?: {
    from: string;
    to: string;
  };
  hasPrecipitate?: boolean;
  precipitateColor?: string;
  hasGas?: boolean;
  gasType?: string;
  bubblingRate?: "none" | "slow" | "rapid" | "explosive";
  flameColor?: "none" | "blue" | "green" | "yellow" | "purple" | "red";
  isDangerous: boolean;
  dangerLevel: "safe" | "caution" | "hazard" | "extreme";
  safetyWarning?: string;
  audioEffect: AudioEffectType;
  explanation: string;
  molecularExplanation?: string;
}

export interface LessonStep {
  instruction: string;
  hint?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface ExperimentLesson {
  id: string;
  title: string;
  subtitle: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  durationMinutes: number;
  objectives: string[];
  targetReactants: string[];
  steps: LessonStep[];
  quiz: QuizQuestion[];
  badgeId: string;
  congratulationText: string;
}

export interface ChemistryBadge {
  id: string;
  title: string;
  description: string;
  iconKey: "neutralizer" | "gold" | "catalyst" | "safety" | "organic" | "ai";
  xpReward: number;
}

export interface QuickExperimentPreset {
  id: string;
  title: string;
  categoryLabel: string;
  equationPreview: string;
  reactantIds: string[];
  summary: string;
  accentTone: "blue" | "cyan" | "violet" | "amber" | "emerald" | "rose";
}

export interface ExperimentLogEntry {
  id: string;
  timestamp: string;
  reactantNames: string[];
  equation: string;
  reactionType: ReactionType;
  temperatureDelta: number;
  source: "preset" | "ai" | "fallback";
}

export interface UserStats {
  completedLessons: string[];
  unlockedBadges: string[];
  scorePoints: number;
  experimentsRun: number;
  unlockedCustomMixing: boolean;
}

export interface BacLessonStepByStepExample {
  title: string;
  problem: string;
  given: string[];
  steps: {
    stepNumber: number;
    label: string;
    formula?: string;
    mathCalculation?: string;
    explanation: string;
  }[];
  finalAnswer: string;
}

export type BacSimType =
  | "phase_diagram"
  | "gas_laws"
  | "colligative"
  | "daniell_cell"
  | "electrolysis"
  | "reaction_rate"
  | "le_chatelier"
  | "ph_titration"
  | "organic_functional"
  | "precipitation"
  | "flame_test";

export interface BacLessonSimulationConfig {
  type: BacSimType;
  title: string;
  hint: string;
}

export interface BacQuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty: "أساسي" | "متوسط" | "متقدم";
}

export interface BacLesson {
  id: string;
  lessonNumber: number;
  chapterNumber: number;
  partNumber: 1 | 2;
  title: string;
  titleEn?: string;
  subtitle: string;
  estimatedMinutes: number;
  difficulty: "أساسي" | "متوسط" | "متقدم";
  orientationQuestion: string; // سؤال التمهيد والتفكير المنهجي
  coreConcepts: string[];
  theorySections: {
    heading: string;
    content: string; // Real textbook explanation
    highlightBox?: string;
    keyFormulas?: string[];
  }[];
  workedExample?: BacLessonStepByStepExample;
  simulation?: BacLessonSimulationConfig;
  practiceQuiz: BacQuizQuestion[];
  examTips: string;
}

export interface BacChapter {
  id: string;
  chapterNumber: number;
  partNumber: 1 | 2;
  title: string;
  titleEn?: string;
  description: string;
  badgeIcon: string;
  lessons: BacLesson[];
}

export interface BacPart {
  partNumber: 1 | 2;
  title: string;
  subtitle: string;
  badgeTitle: string;
  chapters: BacChapter[];
}

export interface BacLessonProgress {
  completed: boolean;
  quizScorePercent?: number;
  answers?: Record<string, number>;
  lastStudiedAt: string;
}

export type BacProgressState = Record<string, BacLessonProgress>;

