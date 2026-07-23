/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Chemical {
  id: string;
  name: string;
  formula: string;
  state: "solid" | "liquid" | "gas" | "aqueous"; // Aqueous solutions are key in reactions
  color: string; // Tailwind bg-color or Hex string
  liquidColor?: string; // The color when dissolved/aqueous
  density?: number; // g/cm^3
  ph?: number; // pH value (for acids/bases/salts)
  isWarning?: boolean; // Highly volatile/hazardous on its own
  hazardText?: string; // High-level safety text
  category: "acid" | "base" | "salt" | "metal" | "oxide" | "indicator" | "organic" | "other";
  description: string;
  stateChangeText?: string;
}

export interface ReactionDetail {
  reactants: string[]; // Reactant IDs
  products: string[]; // Product names or formulas
  equation: string; // Balanced formula, e.g., "HCl + NaOH -> NaCl + H2O"
  reactionType: "neutralization" | "precipitation" | "gas-release" | "exothermic" | "displacement" | "dangerous" | "other";
  temperatureDelta: number; // in Celsius (positive = exothermic, negative = endothermic)
  colorChange?: {
    from: string;
    to: string;
  };
  hasPrecipitate?: boolean;
  precipitateColor?: string;
  hasGas?: boolean;
  gasType?: string; // e.g. "Hydrogen", "Carbon Dioxide", "Chloramine"
  bubblingRate?: "none" | "slow" | "rapid" | "explosive";
  flameColor?: "none" | "blue" | "green" | "yellow" | "purple" | "red"; // for flame tests or combustion
  isDangerous: boolean;
  dangerLevel: "safe" | "caution" | "hazard" | "extreme";
  safetyWarning?: string;
  audioEffect?: "fizz" | "sizzle" | "pop" | "cabinet_shake" | "explosion" | "none";
  explanation: string; // Brief scientific description
  molecularExplanation?: string; // Molecular context
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
  category: string;
  objectives: string[];
  targetReactants: string[]; // Chemical IDs required to complete
  targetConditions?: {
    heatRequired?: boolean;
    stirringRequired?: boolean;
    exactPHRange?: [number, number];
  };
  steps: {
    number: number;
    instruction: string;
    targetAction?: "select" | "mix" | "heat" | "analyze";
  }[];
  congratulationText: string;
  badgeId: string;
  quiz: QuizQuestion[];
}

export interface UserStats {
  completedLessons: string[]; // Lesson IDs
  unlockedBadges: string[]; // Badge IDs
  scorePoints: number;
  unlockedCustomMixing: boolean;
}

export interface Badge {
  id: string;
  title: string;
  icon: string; // Lucide icon name
  description: string;
  color: string;
}
