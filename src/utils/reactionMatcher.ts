/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Intelligent Chemical Reaction Matcher and Scientific Fallback Engine
 * Provides robust stoichiometric matching and guaranteed reaction resolution.
 */

import { Chemical, ReactionDetail } from "../types";
import { PREDEFINED_REACTIONS } from "../data";

/**
 * Searches for an authentic calibrated reaction in the PREDEFINED_REACTIONS database
 */
export function findPredefinedReaction(reactants: Chemical[]): ReactionDetail | null {
  if (reactants.length === 0) return null;

  const selectedIds = new Set(reactants.map((r) => r.id.toLowerCase().trim()));
  const sortedKey = Array.from(selectedIds).sort().join("+");

  // 1. Direct exact key match
  if (PREDEFINED_REACTIONS[sortedKey]) {
    return PREDEFINED_REACTIONS[sortedKey];
  }

  // 2. Direct permutation / subset match
  // If the user selected e.g. [HCl, NaOH, H2O], the active reaction is still HCl + NaOH
  for (const [key, reaction] of Object.entries(PREDEFINED_REACTIONS)) {
    const keyParts = key.split("+").map((k) => k.trim());
    if (keyParts.length > 0 && keyParts.every((partId) => selectedIds.has(partId))) {
      return reaction;
    }
  }

  // 3. Normalized formula matching
  const formulaSet = new Set(
    reactants.map((r) =>
      r.formula
        .replace(/\(.*?\)/g, "")
        .replace(/[\s\d]/g, "")
        .toUpperCase()
    )
  );

  for (const reaction of Object.values(PREDEFINED_REACTIONS)) {
    if (reaction.reactants && reaction.reactants.length > 0) {
      if (reaction.reactants.every((rId) => selectedIds.has(rId.toLowerCase()))) {
        return reaction;
      }
    }
  }

  return null;
}

/**
 * Generates an accurate, scientifically sound reaction outcome
 * when a novel combination is entered and server AI is unreachable or offline.
 */
export function generateScientificFallbackReaction(reactants: Chemical[]): ReactionDetail {
  if (reactants.length === 0) {
    return {
      equation: "لا توجد مواد في الكأس",
      products: [],
      reactionType: "other",
      temperatureDelta: 0,
      liquidColor: "rgba(224, 242, 254, 0.20)",
      hasPrecipitate: false,
      hasGas: false,
      bubblingRate: "none",
      flameColor: "none",
      isDangerous: false,
      dangerLevel: "safe",
      audioEffect: "none",
      explanation: "الكأس المخبري فارغ حالياً.",
      molecularExplanation: "أضف مواد كيميائية من القائمة الجانبية لبدء التفاعل.",
    };
  }

  const hasAcid = reactants.some((r) => r.category === "acid");
  const hasBase = reactants.some((r) => r.category === "base");
  const hasMetal = reactants.some((r) => r.category === "metal");
  const hasSalt = reactants.some((r) => r.category === "salt");
  const hasOxidizer = reactants.some((r) => r.category === "oxidizer");

  // Single Reactant inspection / thermal behavior
  if (reactants.length === 1) {
    const r = reactants[0];
    if (r.id === "h2o2") {
      return {
        equation: "2H₂O₂(aq) → 2H₂O(l) + O₂(g) ↑",
        products: ["H₂O(l)", "O₂(g)"],
        reactionType: "gas-release",
        temperatureDelta: 8.5,
        liquidColor: "rgba(224, 242, 254, 0.25)",
        hasPrecipitate: false,
        hasGas: true,
        gasType: "غاز الأكسجين O₂",
        bubblingRate: "slow",
        flameColor: "none",
        isDangerous: false,
        dangerLevel: "safe",
        audioEffect: "fizz",
        explanation: "انحلال حراري بطيء لفوق أكسيد الهيدروجين إلى ماء وغاز الأكسجين.",
        molecularExplanation: "تتفكك الروابط التساهمية الأكسيجينية الضعيفة (-O-O-) تدريجياً محررةً جزيئات الأكسجين ثنائية الذرة.",
      };
    }

    if (r.id === "na_metal" || r.id === "k_metal") {
      return {
        equation: `${r.formula} + رطوبة الهواء → هيدروكسيد قلوي + H₂(g) ↑ + حرارة`,
        products: ["NaOH/KOH", "H₂(g)"],
        reactionType: "exothermic",
        temperatureDelta: 25.0,
        liquidColor: "rgba(254, 240, 138, 0.35)",
        hasPrecipitate: false,
        hasGas: true,
        gasType: "غاز الهيدروجين H₂",
        bubblingRate: "rapid",
        flameColor: r.id === "k_metal" ? "purple" : "yellow",
        isDangerous: true,
        dangerLevel: "hazard",
        audioEffect: "pop",
        explanation: `فلز ${r.name} عالي النشاط الكيميائي يتفاعل بشدة مع الرطوبة وبخار الماء الجوي محرراً غاز الهيدروجين وطاقة حرارية عالية.`,
        molecularExplanation: "يفقد الفلز إلكترون التكافؤ الخارجي بسهولة فائقة (جهد تأكسد قياسي مرتفع جداً) مختزلاً بروتونات الماء.",
      };
    }

    return {
      equation: `${r.formula} (حالة فيزيائية نقية مستقرة)`,
      products: [r.formula],
      reactionType: "other",
      temperatureDelta: 0,
      liquidColor: r.liquidColor || "rgba(224, 242, 254, 0.28)",
      hasPrecipitate: r.state === "solid",
      precipitateColor: r.color?.includes("amber") ? "#f59e0b" : "#e2e8f0",
      hasGas: false,
      bubblingRate: "none",
      flameColor: "none",
      isDangerous: false,
      dangerLevel: "safe",
      audioEffect: "none",
      explanation: `عينة نقية من ${r.name} (${r.formula}) مستقرة كيميائياً في الظروف المخبرية القياسية.`,
      molecularExplanation: `تتحرك جسيمات ${r.formula} في حالة توازن حركي مستقر يتأثر بتسخين السخان الحراري أو التقليب المغناطيسي.`,
    };
  }

  // 1. Acid + Base Neutralization
  if (hasAcid && hasBase) {
    const acid = reactants.find((r) => r.category === "acid")!;
    const base = reactants.find((r) => r.category === "base")!;
    return {
      equation: `${acid.formula} + ${base.formula} → ملح ذائب(aq) + H₂O(l) + Heat`,
      products: ["ملح ذائب(aq)", "H₂O(l)"],
      reactionType: "neutralization",
      temperatureDelta: 14.5,
      liquidColor: "rgba(224, 242, 254, 0.20)",
      hasPrecipitate: false,
      hasGas: false,
      bubblingRate: "none",
      flameColor: "none",
      isDangerous: false,
      dangerLevel: "safe",
      audioEffect: "sizzle",
      explanation: `تفاعل تعادل كلاسيكي بين الحمض ${acid.name} والقاعدة ${base.name} لتكوين ملح وماء مع انطلاق طاقة حرارية.`,
      molecularExplanation: "اتحاد أيونات H⁺(aq) مع أيونات OH⁻(aq) لتكوين جزيئات ماء H₂O تساهمية مستقرة مع انطلاق حرارة التعادل القياسية.",
    };
  }

  // 2. Acid + Active Metal
  if (hasAcid && hasMetal) {
    const acid = reactants.find((r) => r.category === "acid")!;
    const metal = reactants.find((r) => r.category === "metal")!;
    return {
      equation: `${metal.formula} + ${acid.formula} → كلوريد/كبريتات الفلز(aq) + H₂(g) ↑`,
      products: ["ملح الفلز(aq)", "H₂(g)"],
      reactionType: "displacement",
      temperatureDelta: 18.0,
      liquidColor: "rgba(224, 242, 254, 0.30)",
      hasPrecipitate: false,
      hasGas: true,
      gasType: "غاز الهيدروجين H₂",
      bubblingRate: "rapid",
      flameColor: "none",
      isDangerous: false,
      dangerLevel: "caution",
      audioEffect: "fizz",
      explanation: `يحل الفلز النشط ${metal.name} محل هيدروجين الحمض ${acid.name} محرراً فقاعات كثيفة من غاز الهيدروجين القابل للاشتعال.`,
      molecularExplanation: "تأكسد ذرات الفلز إلى كاتيونات موجبة تذوب في المحلول، واختزال بروتونات الحمض H⁺ إلى غاز الهيدروجين H₂.",
    };
  }

  // 3. Acid + Carbonate / Bicarbonate
  const hasCarbonate = reactants.some(
    (r) =>
      r.id.includes("co3") ||
      r.id.includes("nahco3") ||
      r.formula.includes("CO₃") ||
      r.formula.includes("HCO₃")
  );
  if (hasAcid && hasCarbonate) {
    return {
      equation: "حمض + كربونات → ملح(aq) + H₂O(l) + CO₂(g) ↑ (فوران كثيف)",
      products: ["ملح(aq)", "H₂O(l)", "CO₂(g)"],
      reactionType: "gas-release",
      temperatureDelta: -2.0,
      liquidColor: "rgba(241, 245, 249, 0.22)",
      hasPrecipitate: false,
      hasGas: true,
      gasType: "غاز ثاني أكسيد الكربون CO₂",
      bubblingRate: "rapid",
      flameColor: "none",
      isDangerous: false,
      dangerLevel: "safe",
      audioEffect: "fizz",
      explanation: "تفاعل تحرير غازي نشط يُنتج فوراناً سريعاً لغاز ثاني أكسيد الكربون مع تشكل ملح ذائب وماء.",
      molecularExplanation: "يتكون حمض الكربونيك H₂CO₃ غير المستقر لحظياً، والذي ينحل فورياً إلى ماء وغاز CO₂ المتصاعد.",
    };
  }

  // 4. Precipitation Double Displacement
  if (hasSalt && (reactants.some((r) => r.id.includes("ag") || r.id.includes("ba") || r.id.includes("pb")))) {
    return {
      equation: `${reactants.map((r) => r.formula).join(" + ")} → راسب غير ذائب ↓ + محلول متوازن`,
      products: ["راسب صلب ↓", "محلول أيوني"],
      reactionType: "precipitation",
      temperatureDelta: 1.5,
      liquidColor: "rgba(241, 245, 249, 0.35)",
      hasPrecipitate: true,
      precipitateColor: "#f8fafc",
      hasGas: false,
      bubblingRate: "none",
      flameColor: "none",
      isDangerous: false,
      dangerLevel: "safe",
      audioEffect: "fizz",
      explanation: "تفاعل تبادل مزدوج بين الأملاح الأيونية أدى إلى تكوين راسب صلب غير قابل للذوبان استقر في قاع الكأس.",
      molecularExplanation: "تتخطى قيمة الحاصل الأيوني Qsp قيمة ثابت حاصل الإذابة Ksp للملح المتكون، مما يجبر الأيونات على التبلور والترسيب.",
    };
  }

  // 5. General Homogeneous Ionic Solution
  return {
    equation: `${reactants.map((r) => r.formula).join(" + ")} → محلول أيوني مائي متوازن`,
    products: reactants.map((r) => r.formula),
    reactionType: "other",
    temperatureDelta: 0.5,
    liquidColor: reactants[0]?.liquidColor || "rgba(186, 230, 253, 0.28)",
    hasPrecipitate: false,
    hasGas: false,
    bubblingRate: "none",
    flameColor: "none",
    isDangerous: false,
    dangerLevel: "safe",
    audioEffect: "beep",
    explanation: "تتوزع الأيونات والجزيئات بانتظام في الطور السائل لتكوين مزيج متجانس ومستقر ديناميكياً.",
    molecularExplanation: "تحاط الأيونات بأغلفة إماهة من جزيئات الماء القطبية دون حدوث كسر للروابط التساهمية الأولية.",
  };
}
