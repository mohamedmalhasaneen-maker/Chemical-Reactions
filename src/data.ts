/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Chemical,
  ReactionDetail,
  ExperimentLesson,
  ChemistryBadge,
  QuickExperimentPreset,
} from "./types";

export const CHEMICAL_DATABASE: Chemical[] = [
  // Acids
  {
    id: "hcl",
    name: "حمض الهيدروكلوريك",
    nameEn: "Hydrochloric Acid",
    formula: "HCl(aq)",
    molarMass: 36.46,
    state: "aqueous",
    color: "bg-rose-500/15 border-rose-500/40",
    liquidColor: "rgba(248, 250, 252, 0.22)",
    ph: 1.0,
    category: "acid",
    hazardLabel: "أكّال قوي",
    description: "حمض معدني قوي أحادي البروتون يتأين كلياً في الماء منتجاً أيونات الهيدرونيوم والكلوريد."
  },
  {
    id: "h2so4",
    name: "حمض الكبريتيك المركز",
    nameEn: "Sulfuric Acid",
    formula: "H₂SO₄(aq)",
    molarMass: 98.08,
    state: "aqueous",
    color: "bg-rose-600/20 border-rose-500/50",
    liquidColor: "rgba(254, 243, 199, 0.26)",
    ph: 0.5,
    category: "acid",
    hazardLabel: "أكّال ومجفف شديد",
    description: "حمض ثنائي البروتون كثيف ولزج يتميز بقدرة عالية على نزع الماء وطرد الحرارة عند التخفيف."
  },
  {
    id: "hno3",
    name: "حمض النيتريك",
    nameEn: "Nitric Acid",
    formula: "HNO₃(aq)",
    molarMass: 63.01,
    state: "aqueous",
    color: "bg-orange-500/15 border-orange-500/40",
    liquidColor: "rgba(254, 249, 195, 0.24)",
    ph: 1.1,
    category: "acid",
    hazardLabel: "مؤكسد وأكّال",
    description: "حمض معدني قوي وعامل مؤكسد فعّال يدخل في تفاعلات النترتة وإذابة الفلزات الانتقالية."
  },
  {
    id: "ch3cooh",
    name: "حمض الأسيتيك (الخليك)",
    nameEn: "Acetic Acid",
    formula: "CH₃COOH(aq)",
    molarMass: 60.05,
    state: "aqueous",
    color: "bg-amber-500/15 border-amber-500/35",
    liquidColor: "rgba(241, 245, 249, 0.20)",
    ph: 2.9,
    category: "acid",
    hazardLabel: "حمض عضوي ضعيف",
    description: "حمض كربوكسيلي عضوي ضعيف يتأين جزئياً في المحاليل المائية ويُستخدم في المحاليل المنظمة."
  },

  // Bases
  {
    id: "naoh",
    name: "هيدروكسيد الصوديوم",
    nameEn: "Sodium Hydroxide",
    formula: "NaOH(aq)",
    molarMass: 40.00,
    state: "aqueous",
    color: "bg-sky-500/15 border-sky-500/40",
    liquidColor: "rgba(224, 242, 254, 0.24)",
    ph: 13.5,
    category: "base",
    hazardLabel: "قلوي كاوٍ",
    description: "قاعدة قوية أحادية الهيدروكسيد تتفكك كلياً في الماء وتُستخدم قياسياً في معايرات الأحماض."
  },
  {
    id: "koh",
    name: "هيدروكسيد البوتاسيوم",
    nameEn: "Potassium Hydroxide",
    formula: "KOH(aq)",
    molarMass: 56.11,
    state: "aqueous",
    color: "bg-cyan-500/15 border-cyan-500/40",
    liquidColor: "rgba(207, 250, 254, 0.24)",
    ph: 13.6,
    category: "base",
    hazardLabel: "قلوي كاوٍ",
    description: "قاعدة قلوية قوية سريعة الذوبان في الماء والكحول وتدخل في تفاعلات التصبن العضوية."
  },
  {
    id: "nh3",
    name: "محلول الأمونيا (النشادر)",
    nameEn: "Aqueous Ammonia",
    formula: "NH₃(aq)",
    molarMass: 17.03,
    state: "aqueous",
    color: "bg-indigo-500/15 border-indigo-500/40",
    liquidColor: "rgba(224, 231, 255, 0.22)",
    ph: 11.4,
    category: "base",
    hazardLabel: "أبخرة نفاذة",
    description: "قاعدة نيتروجينية ضعيفة تكوّن معقدات تناسقية مميزة مع أيونات النحاس والفضة."
  },
  {
    id: "ca_oh_2",
    name: "هيدروكسيد الكالسيوم (ماء الجير)",
    nameEn: "Calcium Hydroxide",
    formula: "Ca(OH)₂(aq)",
    molarMass: 74.09,
    state: "aqueous",
    color: "bg-teal-500/15 border-teal-500/40",
    liquidColor: "rgba(241, 245, 249, 0.28)",
    ph: 12.4,
    category: "base",
    hazardLabel: "مهيج قلوي",
    description: "محلول قلوي رائق يتعكر عند إمرار غاز ثاني أكسيد الكربون لتكوّن راسب كربونات الكالسيوم."
  },

  // Salts & Oxidizers
  {
    id: "nacl",
    name: "كلوريد الصوديوم",
    nameEn: "Sodium Chloride",
    formula: "NaCl(aq)",
    molarMass: 58.44,
    state: "aqueous",
    color: "bg-slate-500/15 border-slate-400/35",
    liquidColor: "rgba(241, 245, 249, 0.18)",
    ph: 7.0,
    category: "salt",
    hazardLabel: "آمن",
    description: "ملح أيوني متعادل تام التأين يُستخدم كمرجع إلكتروليتي وفي الكشف عن أيونات الفضة."
  },
  {
    id: "pb_no3_2",
    name: "نترات الرصاص الثنائي",
    nameEn: "Lead(II) Nitrate",
    formula: "Pb(NO₃)₂(aq)",
    molarMass: 331.2,
    state: "aqueous",
    color: "bg-slate-400/15 border-slate-400/40",
    liquidColor: "rgba(248, 250, 252, 0.22)",
    ph: 5.5,
    category: "salt",
    hazardLabel: "ملح فلز ثقيل سام",
    description: "ملح لا عضوي ذواب في الماء يُعد الكاشف القياسي لتفاعل المطر الذهبي مع يوديد البوتاسيوم."
  },
  {
    id: "ki",
    name: "يوديد البوتاسيوم",
    nameEn: "Potassium Iodide",
    formula: "KI(aq)",
    molarMass: 166.0,
    state: "aqueous",
    color: "bg-violet-500/15 border-violet-500/40",
    liquidColor: "rgba(248, 250, 252, 0.20)",
    ph: 7.0,
    category: "salt",
    hazardLabel: "آمن مخبرياً",
    description: "ملح هاليدي يعمل ككاشف ترسيب لأيونات الرصاص والفضة وكحفّاز لتفكك فوق أكسيد الهيدروجين."
  },
  {
    id: "cuso4",
    name: "كبريتات النحاس الثنائي",
    nameEn: "Copper(II) Sulfate",
    formula: "CuSO₄(aq)",
    molarMass: 159.61,
    state: "aqueous",
    color: "bg-sky-500/25 border-sky-400/50",
    liquidColor: "rgba(14, 165, 233, 0.48)",
    ph: 4.8,
    category: "salt",
    hazardLabel: "مهيج متوسط",
    description: "محلول أزرق سماوي مميز لأيونات النحاس المميهة، مثالي لدراسة تفاعلات الإحلال والتناسق والطيف الضوئي."
  },
  {
    id: "ag_no3",
    name: "نترات الفضة",
    nameEn: "Silver Nitrate",
    formula: "AgNO₃(aq)",
    molarMass: 169.87,
    state: "aqueous",
    color: "bg-slate-300/15 border-slate-300/40",
    liquidColor: "rgba(248, 250, 252, 0.22)",
    ph: 6.0,
    category: "salt",
    hazardLabel: "مؤكسد حساس للضوء",
    description: "الكاشف التحليلي الأول للكشف عن الهاليدات (الكلوريد، البروميد، اليوديد) عبر تكوين رواسب فورية."
  },
  {
    id: "fecl3",
    name: "كلوريد الحديد الثلاثي",
    nameEn: "Iron(III) Chloride",
    formula: "FeCl₃(aq)",
    molarMass: 162.2,
    state: "aqueous",
    color: "bg-amber-500/25 border-amber-400/50",
    liquidColor: "rgba(245, 158, 11, 0.45)",
    ph: 2.5,
    category: "salt",
    hazardLabel: "حمضي التميؤ",
    description: "محلول أصفر كهرماني لحمض لويس، يكوّن معقدات حمراء دموية فائقة الحساسية مع أيونات الثيوسيانات."
  },
  {
    id: "kscn",
    name: "ثيوسيانات البوتاسيوم",
    nameEn: "Potassium Thiocyanate",
    formula: "KSCN(aq)",
    molarMass: 97.18,
    state: "aqueous",
    color: "bg-rose-400/15 border-rose-400/35",
    liquidColor: "rgba(248, 250, 252, 0.18)",
    ph: 7.0,
    category: "salt",
    hazardLabel: "حذر قياسي",
    description: "ليكاند تحليلي متخصص يكشف عن آثار أيون الحديد الثلاثي Fe³⁺ بتكوين معقد ثيوسيانات الحديد الأحمر."
  },
  {
    id: "nahco3",
    name: "بيكربونات الصوديوم",
    nameEn: "Sodium Bicarbonate",
    formula: "NaHCO₃(aq)",
    molarMass: 84.01,
    state: "aqueous",
    color: "bg-emerald-500/15 border-emerald-500/35",
    liquidColor: "rgba(241, 245, 249, 0.24)",
    ph: 8.3,
    category: "salt",
    hazardLabel: "آمن تماماً",
    description: "ملح قاعدي ضعيف وأمفوتيري يتفاعل فورياً مع الأحماض محرراً فوراناً كثيفاً من غاز ثاني أكسيد الكربون."
  },
  {
    id: "ba_cl2",
    name: "كلوريد الباريوم",
    nameEn: "Barium Chloride",
    formula: "BaCl₂(aq)",
    molarMass: 208.23,
    state: "aqueous",
    color: "bg-cyan-400/15 border-cyan-400/35",
    liquidColor: "rgba(248, 250, 252, 0.20)",
    ph: 7.0,
    category: "salt",
    hazardLabel: "سام عند الابتلاع",
    description: "كاشف نوعي دقيق للكشف عن أنيونات الكبريتات SO₄²⁻ عبر ترسيب كبريتات الباريوم البيضاء غير الذوابة."
  },
  {
    id: "kmno4",
    name: "برمنغنات البوتاسيوم",
    nameEn: "Potassium Permanganate",
    formula: "KMnO₄(aq)",
    molarMass: 158.03,
    state: "aqueous",
    color: "bg-purple-600/30 border-purple-400/50",
    liquidColor: "rgba(147, 51, 234, 0.62)",
    ph: 7.2,
    category: "oxidizer",
    hazardLabel: "مؤكسد قوي",
    description: "عامل مؤكسد قوي ذو لون بنفسجي داكن مميز يمتص الضوء عند 525 nm ويُستخدم في معايرات الأكسدة والاختزال."
  },
  {
    id: "k2cr2o7",
    name: "ثنائي كرومات البوتاسيوم",
    nameEn: "Potassium Dichromate",
    formula: "K₂Cr₂O₇(aq)",
    molarMass: 294.18,
    state: "aqueous",
    color: "bg-orange-500/30 border-orange-400/50",
    liquidColor: "rgba(249, 115, 22, 0.55)",
    ph: 4.2,
    category: "oxidizer",
    hazardLabel: "مؤكسد خطر",
    description: "ملح برتقالي زاهٍ يعمل كمؤكسد قياسي للكحولات الأولية والثانوية متحولاً إلى أيونات الكروم الثلاثي الخضراء."
  },
  {
    id: "h2o2",
    name: "فوق أكسيد الهيدروجين (30%)",
    nameEn: "Hydrogen Peroxide",
    formula: "H₂O₂(aq)",
    molarMass: 34.01,
    state: "aqueous",
    color: "bg-cyan-400/20 border-cyan-400/40",
    liquidColor: "rgba(224, 242, 254, 0.25)",
    ph: 5.2,
    category: "oxidizer",
    hazardLabel: "مؤكسد نشط",
    description: "مركب بيروكسيدي غني بالأكسجين يتفكك ببطء تلقائياً وبسرعة هائلة بوجود الحفّازات محرراً غاز الأكسجين."
  },
  {
    id: "naclo",
    name: "هيبوكلوريت الصوديوم (المبيّض)",
    nameEn: "Sodium Hypochlorite",
    formula: "NaClO(aq)",
    molarMass: 74.44,
    state: "aqueous",
    color: "bg-lime-500/15 border-lime-400/40",
    liquidColor: "rgba(236, 252, 203, 0.28)",
    ph: 11.2,
    category: "oxidizer",
    hazardLabel: "خطر عند الخلط بالأحماض أو الأمونيا",
    description: "محلول مؤكسد ومطهر قلوي، يُحظر خلطه مع الأمونيا أو الأحماض لتجنب انبعاث غازات الكلور والكلورامين السامة."
  },
  {
    id: "h2o",
    name: "ماء مقطر منزوع الأيونات",
    nameEn: "Deionized Water",
    formula: "H₂O(l)",
    molarMass: 18.015,
    state: "liquid",
    color: "bg-sky-400/15 border-sky-400/30",
    liquidColor: "rgba(186, 230, 253, 0.22)",
    ph: 7.0,
    category: "other",
    hazardLabel: "مذيب قياسي آمن",
    description: "المذيب القطبي العالمي المتعادل (pH = 7.00 عند 25 °C)، وسط أساسي للتفاعلات الأيونية والتميؤ."
  },

  // Active & Transition Metals
  {
    id: "na_metal",
    name: "فلز الصوديوم النقي",
    nameEn: "Sodium Metal",
    formula: "Na(s)",
    molarMass: 22.99,
    state: "solid",
    color: "bg-amber-400/20 border-amber-400/50",
    liquidColor: "rgba(251, 191, 36, 0.22)",
    ph: 7.0,
    category: "metal",
    hazardLabel: "شديد الاشتعال بالماء",
    description: "فلز قلوي لين شديد الفعالية يُحفظ تحت الكيروسين ويتفاعل انفجارياً مع الماء مطلقاً غاز الهيدروجين."
  },
  {
    id: "mg_ribbon",
    name: "شريط المغنيسيوم",
    nameEn: "Magnesium Ribbon",
    formula: "Mg(s)",
    molarMass: 24.305,
    state: "solid",
    color: "bg-slate-300/20 border-slate-300/50",
    liquidColor: "rgba(226, 232, 240, 0.24)",
    ph: 7.0,
    category: "metal",
    hazardLabel: "سريع التفاعل مع الأحماض",
    description: "فلز قلوي ترابي نشط يحل محل هيدروجين الأحماض بسرعة عالية مع فوران كثيف وطرد حراري واضح."
  },
  {
    id: "zn_granules",
    name: "حبيبات الخارصين (الزنك)",
    nameEn: "Zinc Granules",
    formula: "Zn(s)",
    molarMass: 65.38,
    state: "solid",
    color: "bg-indigo-400/20 border-indigo-400/40",
    liquidColor: "rgba(203, 213, 225, 0.24)",
    ph: 7.0,
    category: "metal",
    hazardLabel: "فلز مختزل نشط",
    description: "فلز انتقالي يُستخدم مخبرياً لتحضير غاز الهيدروجين النقي وإزاحة النحاس من محاليله الملحية."
  },
  {
    id: "fe_powder",
    name: "برادة الحديد النقية",
    nameEn: "Iron Filings",
    formula: "Fe(s)",
    molarMass: 55.845,
    state: "solid",
    color: "bg-stone-400/20 border-stone-400/40",
    liquidColor: "rgba(214, 211, 209, 0.25)",
    ph: 7.0,
    category: "metal",
    hazardLabel: "قابل للأكسدة",
    description: "فلز انتقالي مغناطيسي يتأكسد في الأحماض المخففة إلى أيونات الحديدوز Fe²⁺ ويحل محل أيونات النحاس."
  },
  {
    id: "cu_foil",
    name: "رقائق النحاس الأحمر",
    nameEn: "Copper Foil",
    formula: "Cu(s)",
    molarMass: 63.546,
    state: "solid",
    color: "bg-orange-400/20 border-orange-400/45",
    liquidColor: "rgba(251, 146, 60, 0.22)",
    ph: 7.0,
    category: "metal",
    hazardLabel: "فلز نبيل نسبياً",
    description: "فلز انتقالي يلي الهيدروجين في متسلسلة النشاط الكيميائي، لا يتفاعل مع HCl المخفف بل يتأكسد بحمض النيتريك."
  },

  // Indicators
  {
    id: "phenolphthalein",
    name: "كاشف الفينولفثالين",
    nameEn: "Phenolphthalein Indicator",
    formula: "C₂₀H₁₄O₄(aq)",
    molarMass: 318.32,
    state: "aqueous",
    color: "bg-pink-500/20 border-pink-400/50",
    liquidColor: "rgba(255, 255, 255, 0.12)",
    ph: 7.0,
    category: "indicator",
    hazardLabel: "دليل معايرة",
    description: "دليل حمضي-قاعدي عديم اللون في الأوساط الحمضية والمتعادلة، ينقلب إلى الوردي الأرجواني عند pH ≥ 8.2."
  },
  {
    id: "methyl_orange",
    name: "كاشف الميثيل البرتقالي",
    nameEn: "Methyl Orange",
    formula: "C₁₄H₁₄N₃NaO₃S(aq)",
    molarMass: 327.33,
    state: "aqueous",
    color: "bg-amber-500/20 border-amber-400/50",
    liquidColor: "rgba(251, 146, 60, 0.42)",
    ph: 7.0,
    category: "indicator",
    hazardLabel: "دليل معايرة",
    description: "دليل لوني يتحول إلى الأحمر في الوسط الحمضي القوي (pH < 3.1) وإلى الأصفر في الوسط المتعادل والقاعدي."
  },

  // Organic & University Reagents
  {
    id: "grignard",
    name: "كاشف غرينيار (بروميد ميثيل المغنيسيوم)",
    nameEn: "Methylmagnesium Bromide",
    formula: "CH₃MgBr",
    molarMass: 119.24,
    state: "liquid",
    color: "bg-violet-500/20 border-violet-400/50",
    liquidColor: "rgba(221, 214, 254, 0.30)",
    ph: 13.8,
    category: "organic",
    hazardLabel: "شديد التفاعل مع الرطوبة",
    description: "مركب عضوفلزي جامعي فائق الأهمية لبناء روابط كربون-كربون؛ يتفكك بعنف شديد عند ملامسة الماء أو البروتونات."
  },
  {
    id: "ethanol",
    name: "الإيثانول النقي",
    nameEn: "Absolute Ethanol",
    formula: "C₂H₅OH(l)",
    molarMass: 46.07,
    state: "liquid",
    color: "bg-teal-400/15 border-teal-400/40",
    liquidColor: "rgba(240, 253, 250, 0.20)",
    ph: 7.0,
    category: "organic",
    hazardLabel: "سائل قابل للاشتعال",
    description: "كحول أولي قطبي يُستخدم كمذيب عضوي ويتأكسد بالمؤكسدات القوية إلى الأسيتالدهيد ثم حمض الأسيتيك."
  }
];

export const PREDEFINED_REACTIONS: Record<string, ReactionDetail> = {
  "hcl+naoh": {
    reactants: ["hcl", "naoh"],
    products: ["NaCl(aq)", "H₂O(l)"],
    equation: "HCl(aq) + NaOH(aq) → NaCl(aq) + H₂O(l)",
    reactionType: "neutralization",
    temperatureDelta: 13.4,
    enthalpyKjMol: -57.3,
    liquidColor: "rgba(226, 232, 240, 0.18)",
    colorChange: { from: "rgba(248, 250, 252, 0.2)", to: "rgba(226, 232, 240, 0.18)" },
    hasPrecipitate: false,
    hasGas: false,
    bubblingRate: "none",
    flameColor: "none",
    isDangerous: false,
    dangerLevel: "safe",
    audioEffect: "sizzle",
    safetyWarning: "تفاعل تعادل قياسي آمن يصاحبه ارتفاع حراري طفيف بمقدار +13.4 °C.",
    explanation: "يتفاعل حمض الهيدروكلوريك القوي مع هيدروكسيد الصوديوم القوي بنسبة مولية 1:1 لتكوين محلول متعادل من كلوريد الصوديوم والماء النقي عند pH = 7.0.",
    molecularExplanation: "تندمج أيونات الهيدرونيوم H₃O⁺ مع أيونات الهيدروكسيد OH⁻ لتشكيل جزيئات ماء تساهمية مستقرة (ΔH° = -57.3 kJ/mol)، بينما تبقى أيونات Na⁺ و Cl⁻ كأيونات متفرجة."
  },
  "hcl+naoh+phenolphthalein": {
    reactants: ["hcl", "naoh", "phenolphthalein"],
    products: ["NaCl(aq)", "H₂O(l)", "C₂₀H₁₄O₄"],
    equation: "HCl(aq) + NaOH(aq) → NaCl(aq) + H₂O(l)",
    reactionType: "neutralization",
    temperatureDelta: 13.2,
    enthalpyKjMol: -57.3,
    liquidColor: "rgba(244, 114, 182, 0.16)",
    colorChange: { from: "rgba(236, 72, 153, 0.72)", to: "rgba(244, 114, 182, 0.14)" },
    hasPrecipitate: false,
    hasGas: false,
    bubblingRate: "none",
    flameColor: "none",
    isDangerous: false,
    dangerLevel: "safe",
    audioEffect: "sizzle",
    safetyWarning: "نقطة تكافؤ معايرة مثالية؛ تلاشى اللون الفوشي القاعدي عند الوصول إلى التعادل.",
    explanation: "تُظهر معايرة الحمض والقاعدة بوجود دليل الفينولفثالين اختفاء اللون الوردي عند نقطة التكافؤ نتيجة انخفاض الرقم الهيدروجيني إلى محيط 7.0.",
    molecularExplanation: "يعود جزيء الفينولفثالين من صيغته الكينونويدية المشحونة الوردية إلى صيغته اللاكتونية المغلقة عديمة اللون فور استهلاك أيونات OH⁻ الفائضة."
  },
  "ki+pb_no3_2": {
    reactants: ["ki", "pb_no3_2"],
    products: ["PbI₂(s)↓", "2KNO₃(aq)"],
    equation: "Pb(NO₃)₂(aq) + 2KI(aq) → PbI₂(s)↓ + 2KNO₃(aq)",
    reactionType: "precipitation",
    temperatureDelta: 1.5,
    liquidColor: "rgba(253, 224, 71, 0.36)",
    colorChange: { from: "rgba(248, 250, 252, 0.2)", to: "rgba(253, 224, 71, 0.36)" },
    hasPrecipitate: true,
    precipitateColor: "#facc15",
    hasGas: false,
    bubblingRate: "none",
    flameColor: "none",
    isDangerous: true,
    dangerLevel: "hazard",
    audioEffect: "pop",
    safetyWarning: "يحتوي الراسب الأصفر على مركبات الرصاص الثنائي السامة؛ يُحظر لمسه ويجب التخلص منه في حاوية النفايات غير العضوية.",
    explanation: "تفاعل تبادل مزدوج كلاسيكي يُعرف بـ «المطر الذهبي»، حيث يترسب يوديد الرصاص الثنائي PbI₂ على هيئة بلورات صفراء ذهبية براقة شحيحة الذوبان في قاع الدورق.",
    molecularExplanation: "تتجاوز حاصل الإذابة الأيوني Ksp = 9.8 × 10⁻⁹ عند التقاء كاتيونات Pb²⁺ مع أنيونات اليوديد I⁻ فتنتظم الأيونات فوراً في شبكة بلورية سداسية صفراء."
  },
  "h2o2+ki": {
    reactants: ["h2o2", "ki"],
    products: ["2H₂O(l)", "O₂(g)↑"],
    equation: "2H₂O₂(aq) --(KI)--> 2H₂O(l) + O₂(g)↑",
    reactionType: "gas-release",
    temperatureDelta: 34.0,
    enthalpyKjMol: -196.1,
    liquidColor: "rgba(245, 158, 11, 0.34)",
    colorChange: { from: "rgba(224, 242, 254, 0.25)", to: "rgba(245, 158, 11, 0.34)" },
    hasPrecipitate: false,
    hasGas: true,
    gasType: "غاز الأكسجين النقي O₂",
    bubblingRate: "explosive",
    flameColor: "none",
    isDangerous: false,
    dangerLevel: "caution",
    audioEffect: "fizz",
    safetyWarning: "تفاعل طارد للحرارة بشدة مع تصاعد غزير للأكسجين؛ احذر من البخار الساخن وتجنب تقريب المواد المشتعلة.",
    explanation: "يعمل أيون اليوديد I⁻ كوسيط حفّاز متجانس يسرّع تفكك فوق أكسيد الهيدروجين آلاف المرات منتجاً غاز الأكسجين المتصاعد وبخار الماء الدافئ.",
    molecularExplanation: "يوفر أيون I⁻ مساراً بديلاً ذا طاقة تنشيط منخفضة عبر تكوين أيون الهيبويوديت الوسيط IO⁻ الذي يختزل جزيء H₂O₂ ثانياً ويعيد توليد الحفّاز دون استهلاكه."
  },
  "naclo+nh3": {
    reactants: ["naclo", "nh3"],
    products: ["NH₂Cl(g)↑", "NaOH(aq)"],
    equation: "NaClO(aq) + NH₃(aq) → NH₂Cl(g)↑ + NaOH(aq)",
    reactionType: "dangerous",
    temperatureDelta: 8.5,
    liquidColor: "rgba(190, 242, 100, 0.32)",
    colorChange: { from: "rgba(236, 252, 203, 0.25)", to: "rgba(190, 242, 100, 0.32)" },
    hasPrecipitate: false,
    hasGas: true,
    gasType: "أبخرة الكلورامين السامة NH₂Cl",
    bubblingRate: "rapid",
    flameColor: "none",
    isDangerous: true,
    dangerLevel: "extreme",
    audioEffect: "cabinet_shake",
    safetyWarning: "خطر اختناق شديد! ينبعث غاز أحادي كلورامين NH₂Cl السام المهيج للرئتين والأغشية المخاطية. يُجرى حصراً داخل خزانة سحب الغازات.",
    explanation: "يمثل هذا التفاعل أشهر الأخطار المنزلية والمخبرية عند خلط المبيّض مع محاليل الأمونيا، حيث ينطلق غاز الكلورامين الخانق ويتحول الوسط إلى قلوي كاوٍ.",
    molecularExplanation: "يهاجم زوج الإلكترونات الحر على ذرة نيتروجين الأمونيا ذرة الكلور الموجبة جزئياً في أيون الهيبوكلوريت ClO⁻ مطلقاً أيون الهيدروكسيد وجزيء NH₂Cl الطيار."
  },
  "h2o+na_metal": {
    reactants: ["h2o", "na_metal"],
    products: ["2NaOH(aq)", "H₂(g)↑"],
    equation: "2Na(s) + 2H₂O(l) → 2NaOH(aq) + H₂(g)↑",
    reactionType: "exothermic",
    temperatureDelta: 58.0,
    enthalpyKjMol: -368.6,
    liquidColor: "rgba(251, 146, 60, 0.32)",
    colorChange: { from: "rgba(186, 230, 253, 0.22)", to: "rgba(251, 146, 60, 0.32)" },
    hasPrecipitate: false,
    hasGas: true,
    gasType: "غاز الهيدروجين المشتعل H₂",
    bubblingRate: "explosive",
    flameColor: "yellow",
    isDangerous: true,
    dangerLevel: "extreme",
    audioEffect: "explosion",
    safetyWarning: "تفاعل انفجاري عنيف! ينصهر الصوديوم في كرة فضية ويشتعل غاز الهيدروجين بلهب أصفر صوديومي ساطع (589 nm).",
    explanation: "يختزل فلز الصوديوم القلوي الماء بعنف فائق محرراً غاز الهيدروجين وحرارة عالية تكفي لإشعال الغاز تلقائياً مع تحول المحلول إلى هيدروكسيد الصوديوم القلوي.",
    molecularExplanation: "يفقد كل ذرة صوديوم إلكترون التكافؤ 3s¹ بسهولة بالغة (جهد اختزال قياسي -2.71 V) لصالح بروتونات الماء، مما يسبب تنافراً كولومياً وانفجاراً حرارياً موضعياً."
  },
  "hcl+mg_ribbon": {
    reactants: ["hcl", "mg_ribbon"],
    products: ["MgCl₂(aq)", "H₂(g)↑"],
    equation: "Mg(s) + 2HCl(aq) → MgCl₂(aq) + H₂(g)↑",
    reactionType: "gas-release",
    temperatureDelta: 26.5,
    enthalpyKjMol: -462.0,
    liquidColor: "rgba(226, 232, 240, 0.26)",
    colorChange: { from: "rgba(248, 250, 252, 0.22)", to: "rgba(226, 232, 240, 0.26)" },
    hasPrecipitate: false,
    hasGas: true,
    gasType: "غاز الهيدروجين H₂",
    bubblingRate: "explosive",
    flameColor: "none",
    isDangerous: false,
    dangerLevel: "caution",
    audioEffect: "fizz",
    safetyWarning: "يتصاعد غاز الهيدروجين السريع الاشتعال بكثافة مع سخونة ملموسة لجدار الدورق.",
    explanation: "يذوب شريط المغنيسيوم سريعاً في حمض الهيدروكلوريك عبر تفاعل إحلال مفرد طارد للحرارة مصحوباً بسيل كثيف من فقاعات غاز الهيدروجين الدقيقة.",
    molecularExplanation: "تنتقل إلكترونات التكافؤ من ذرات المغنيسيوم الصلبة (Mg → Mg²⁺ + 2e⁻) إلى أيونات الهيدروجين المميهة لتكوين جزيئات H₂ الغازية غير القطبية."
  },
  "hcl+zn_granules": {
    reactants: ["hcl", "zn_granules"],
    products: ["ZnCl₂(aq)", "H₂(g)↑"],
    equation: "Zn(s) + 2HCl(aq) → ZnCl₂(aq) + H₂(g)↑",
    reactionType: "gas-release",
    temperatureDelta: 18.4,
    liquidColor: "rgba(226, 232, 240, 0.28)",
    colorChange: { from: "rgba(248, 250, 252, 0.22)", to: "rgba(226, 232, 240, 0.28)" },
    hasPrecipitate: false,
    hasGas: true,
    gasType: "غاز الهيدروجين H₂",
    bubblingRate: "rapid",
    flameColor: "none",
    isDangerous: false,
    dangerLevel: "caution",
    audioEffect: "fizz",
    safetyWarning: "الطريقة القياسية لتحضير غاز الهيدروجين مخبرياً؛ أبعد أي مصدر لهب مكشوف.",
    explanation: "يتآكل سطح حبيبات الخارصين تدريجياً في الحمض مطلقاً فقاعات منتظمة من غاز الهيدروجين مع تشكل محلول كلوريد الخارصين الشفاف.",
    molecularExplanation: "يمتلك الخارصين جهد اختزال قياسي سالب (-0.76 V) يجعله قادراً تلقائياً على اختزال بروتونات الحمض H⁺ إلى غاز هيدروجين ثنائي الذرة."
  },
  "fecl3+kscn": {
    reactants: ["fecl3", "kscn"],
    products: ["[Fe(SCN)]²⁺(aq)", "K⁺(aq)", "Cl⁻(aq)"],
    equation: "FeCl₃(aq) + KSCN(aq) ⇌ [Fe(SCN)]Cl₂(aq) + KCl(aq)",
    reactionType: "other",
    temperatureDelta: 0.8,
    liquidColor: "rgba(185, 28, 28, 0.82)",
    colorChange: { from: "rgba(245, 158, 11, 0.45)", to: "rgba(185, 28, 28, 0.82)" },
    hasPrecipitate: false,
    hasGas: false,
    bubblingRate: "none",
    flameColor: "none",
    isDangerous: false,
    dangerLevel: "safe",
    audioEffect: "beep",
    safetyWarning: "تفاعل اتزان تناسقي آمن يُستخدم في تجارب مبدأ لوشاتيليه والتحليل الطيفي عند 480 nm.",
    explanation: "يتحول اللون الأصفر الباهت لأيونات الحديد الثلاثي لحظياً إلى الأحمر الدموي العميق نتيجة تكوّن معقد ثيوسيانات الحديد التناسقي الذائب.",
    molecularExplanation: "يستبدل أيون الثيوسيانات SCN⁻ جزيء ماء واحد من كرة التميه السداسية [Fe(H₂O)₆]³⁺ مكوّناً رابطة تناسقية ذات انتقال شحنة طيفي قوي في المنطقة المرئية."
  },
  "ag_no3+nacl": {
    reactants: ["ag_no3", "nacl"],
    products: ["AgCl(s)↓", "NaNO₃(aq)"],
    equation: "AgNO₃(aq) + NaCl(aq) → AgCl(s)↓ + NaNO₃(aq)",
    reactionType: "precipitation",
    temperatureDelta: 1.1,
    liquidColor: "rgba(241, 245, 249, 0.55)",
    colorChange: { from: "rgba(248, 250, 252, 0.2)", to: "rgba(241, 245, 249, 0.55)" },
    hasPrecipitate: true,
    precipitateColor: "#f8fafc",
    hasGas: false,
    bubblingRate: "none",
    flameColor: "none",
    isDangerous: false,
    dangerLevel: "caution",
    audioEffect: "pop",
    safetyWarning: "تجنب ملامسة محلول نترات الفضة للجلد لأنه يترك بقعاً داكنة مؤقتة بفعل الاختزال الضوئي.",
    explanation: "يتشكل فوراً راسب أبيض متجبن من كلوريد الفضة غير الذواب في الماء وحمض النيتريك المخفف، وهو التفاعل المرجعي في معايرات مور.",
    molecularExplanation: "تتحد كاتيونات الفضة Ag⁺ بأنيونات الكلوريد Cl⁻ برابطة ذات طابع تساهمي جزئي عالي وطاقة شبكة بلورية تفوق طاقة التميه (Ksp = 1.8 × 10⁻¹⁰)."
  },
  "ba_cl2+h2so4": {
    reactants: ["ba_cl2", "h2so4"],
    products: ["BaSO₄(s)↓", "2HCl(aq)"],
    equation: "BaCl₂(aq) + H₂SO₄(aq) → BaSO₄(s)↓ + 2HCl(aq)",
    reactionType: "precipitation",
    temperatureDelta: 4.2,
    liquidColor: "rgba(248, 250, 252, 0.60)",
    colorChange: { from: "rgba(254, 243, 199, 0.25)", to: "rgba(248, 250, 252, 0.60)" },
    hasPrecipitate: true,
    precipitateColor: "#ffffff",
    hasGas: false,
    bubblingRate: "none",
    flameColor: "none",
    isDangerous: true,
    dangerLevel: "caution",
    audioEffect: "pop",
    safetyWarning: "يبقى الوسط حامضياً قوياً لوجود حمض الهيدروكلوريك الناتج في المحلول.",
    explanation: "تترسب كبريتات الباريوم البيضاء الكثيفة غير الذوابة في الأحماض المعدنية، مما يجعل هذا التفاعل الكشف النوعي الحاسم عن أيونات الكبريتات.",
    molecularExplanation: "تتجاذب أيونات Ba²⁺ ثنائية الشحنة بقوة كولومية عالية مع أيونات SO₄²⁻ رباعية الأكسجين لتكوين بلورات باريت خاملة كيميائياً."
  },
  "cuso4+zn_granules": {
    reactants: ["cuso4", "zn_granules"],
    products: ["ZnSO₄(aq)", "Cu(s)↓"],
    equation: "Zn(s) + CuSO₄(aq) → ZnSO₄(aq) + Cu(s)↓",
    reactionType: "displacement",
    temperatureDelta: 16.0,
    enthalpyKjMol: -217.0,
    liquidColor: "rgba(226, 232, 240, 0.22)",
    colorChange: { from: "rgba(14, 165, 233, 0.48)", to: "rgba(226, 232, 240, 0.22)" },
    hasPrecipitate: true,
    precipitateColor: "#c2410c",
    hasGas: false,
    bubblingRate: "none",
    flameColor: "none",
    isDangerous: false,
    dangerLevel: "safe",
    audioEffect: "sizzle",
    safetyWarning: "تفاعل أكسدة واختزال تلقائي آمن يمثل الأساس الكيميائي لخلية دانيال الجلفانية.",
    explanation: "يبهت اللون الأزرق لمحلول كبريتات النحاس تدريجياً حتى يزول، بينما تترسب طبقة إسفنجية بنية محمرة من فلز النحاس النقي فوق الخارصين.",
    molecularExplanation: "ينتقل إلكترونان مباشرة من ذرات الخارصين الأنشط (Zn → Zn²⁺ + 2e⁻) إلى كاتيونات النحاس المميهة (Cu²⁺ + 2e⁻ → Cu) بفرق جهد خليوي قدره +1.10 V."
  },
  "cuso4+naoh": {
    reactants: ["cuso4", "naoh"],
    products: ["Cu(OH)₂(s)↓", "Na₂SO₄(aq)"],
    equation: "CuSO₄(aq) + 2NaOH(aq) → Cu(OH)₂(s)↓ + Na₂SO₄(aq)",
    reactionType: "precipitation",
    temperatureDelta: 3.1,
    liquidColor: "rgba(56, 189, 248, 0.35)",
    colorChange: { from: "rgba(14, 165, 233, 0.48)", to: "rgba(56, 189, 248, 0.35)" },
    hasPrecipitate: true,
    precipitateColor: "#0284c7",
    hasGas: false,
    bubblingRate: "none",
    flameColor: "none",
    isDangerous: false,
    dangerLevel: "caution",
    audioEffect: "pop",
    safetyWarning: "تجنب ملامسة القلوي للجلد؛ التسخين المفرط يحوّل الراسب الأزرق إلى أكسيد النحاس الأسود CuO.",
    explanation: "يتكون راسب هلامي أزرق سماوي مميز من هيدروكسيد النحاس الثنائي غير الذواب في الماء.",
    molecularExplanation: "تحل أيونات الهيدروكسيد OH⁻ محل جزيئات الماء المرتبطة بأيون النحاس الثنائي لتشكيل شبكة هيدروكسيدية متعادلة الشحنة تترسب فوراً."
  },
  "ch3cooh+nahco3": {
    reactants: ["ch3cooh", "nahco3"],
    products: ["CH₃COONa(aq)", "H₂O(l)", "CO₂(g)↑"],
    equation: "CH₃COOH(aq) + NaHCO₃(aq) → CH₃COONa(aq) + H₂O(l) + CO₂(g)↑",
    reactionType: "gas-release",
    temperatureDelta: -3.2,
    liquidColor: "rgba(241, 245, 249, 0.25)",
    colorChange: { from: "rgba(241, 245, 249, 0.20)", to: "rgba(241, 245, 249, 0.25)" },
    hasPrecipitate: false,
    hasGas: true,
    gasType: "غاز ثاني أكسيد الكربون CO₂",
    bubblingRate: "rapid",
    flameColor: "none",
    isDangerous: false,
    dangerLevel: "safe",
    audioEffect: "fizz",
    safetyWarning: "تفاعل آمن تماماً وماص للحرارة بدرجة طفيفة مع فوران كثيف لغاز CO₂ غير السام.",
    explanation: "ينتقل بروتون حمض الأسيتيك إلى أيون البيكربونات مكوّناً حمض الكربونيك غير المستقر الذي يتفكك لحظياً إلى ماء وفقاعات غاز ثاني أكسيد الكربون.",
    molecularExplanation: "تتفكك جزيئات H₂CO₃ الوسيطة بسرعة فائقة مدفوعة بالزيادة الكبيرة في الإنتروبيا العشوائية (ΔS > 0) المصاحبة لتحرر الغاز."
  },
  "grignard+h2o": {
    reactants: ["grignard", "h2o"],
    products: ["CH₄(g)↑", "Mg(OH)Br(s)↓"],
    equation: "CH₃MgBr + H₂O(l) → CH₄(g)↑ + Mg(OH)Br(s)↓",
    reactionType: "dangerous",
    temperatureDelta: 45.0,
    liquidColor: "rgba(224, 242, 254, 0.38)",
    colorChange: { from: "rgba(221, 214, 254, 0.30)", to: "rgba(224, 242, 254, 0.38)" },
    hasPrecipitate: true,
    precipitateColor: "#f1f5f9",
    hasGas: true,
    gasType: "غاز الميثان القابل للاشتعال CH₄",
    bubblingRate: "rapid",
    flameColor: "blue",
    isDangerous: true,
    dangerLevel: "extreme",
    audioEffect: "explosion",
    safetyWarning: "خطر اشتعال مرتفع! يجب استخدام مذيبات لا مائية جافة تماماً (مثل الإيثر الجاف أو THF) عند التعامل مع كواشف غرينيار.",
    explanation: "يتدمر كاشف غرينيار العضوفلزي فور ملامسته للماء لأن ذرة الكربون السالبة جزئياً تسلك سلوك قاعدة خارقة تنتزع بروتون الماء منتجة غاز الميثان.",
    molecularExplanation: "قطبية الرابطة C⁻—Mg⁺Br تجعل مجموعة الميثيل نكليوفيلاً وقاعدة قوية جداً (pKa ≈ 50)، فتنتزع بروتون الماء بحركية شبه لحظية طاردة للحرارة."
  },
  "ethanol+k2cr2o7": {
    reactants: ["ethanol", "k2cr2o7"],
    products: ["CH₃COOH(aq)", "Cr³⁺(aq)"],
    equation: "3C₂H₅OH(l) + 2K₂Cr₂O₇(aq) + 8H₂SO₄ → 3CH₃COOH(aq) + 2Cr₂(SO₄)₃(aq) + 11H₂O",
    reactionType: "exothermic",
    temperatureDelta: 21.0,
    liquidColor: "rgba(16, 185, 129, 0.52)",
    colorChange: { from: "rgba(249, 115, 22, 0.55)", to: "rgba(16, 185, 129, 0.52)" },
    hasPrecipitate: false,
    hasGas: false,
    bubblingRate: "slow",
    flameColor: "none",
    isDangerous: true,
    dangerLevel: "hazard",
    audioEffect: "sizzle",
    safetyWarning: "أملاح الكروم السداسي مؤكسدة وسامة؛ ارتدِ القفازات ونظارات الحماية المخبرية.",
    explanation: "يتأكسد الإيثانول إلى حمض الأسيتيك بينما يُختزل أيون ثنائي الكرومات البرتقالي Cr₂O₇²⁻ إلى أيونات الكروم الثلاثي Cr³⁺ ذات اللون الأخضر الزمردي.",
    molecularExplanation: "ينخفض عدد تأكسد الكروم من +6 إلى +3 عبر اكتساب الإلكترونات من ذرة الكربون الكحولية الأولية، مما يغير طيف الامتصاص الضوئي للمحلول بالكامل."
  }
};

export const QUICK_EXPERIMENTS: QuickExperimentPreset[] = [
  {
    id: "quick_neutralization",
    title: "معايرة التعادل الحراري",
    categoryLabel: "أحماض وقواعد",
    equationPreview: "HCl(aq) + NaOH(aq) → NaCl(aq) + H₂O(l)",
    reactantIds: ["hcl", "naoh"],
    summary: "راقب استقرار الرقم الهيدروجيني عند 7.00 والارتفاع الحراري الناتج عن اتحاد أيونات الهيدرونيوم والهيدروكسيد.",
    accentTone: "blue"
  },
  {
    id: "quick_golden_rain",
    title: "تفاعل المطر الذهبي",
    categoryLabel: "ترسيب بلوري",
    equationPreview: "Pb(NO₃)₂(aq) + 2KI(aq) → PbI₂(s)↓ + 2KNO₃(aq)",
    reactantIds: ["pb_no3_2", "ki"],
    summary: "ترسيب فوري لبلورات يوديد الرصاص الصفراء الذهبية نتيجة تجاوز حاصل الإذابة الأيوني.",
    accentTone: "amber"
  },
  {
    id: "quick_catalyst",
    title: "التفكك الحفزي لبيروكسيد الهيدروجين",
    categoryLabel: "حركية وحفز",
    equationPreview: "2H₂O₂(aq) --(KI)--> 2H₂O(l) + O₂(g)↑",
    reactantIds: ["h2o2", "ki"],
    summary: "شاهد أثر الحفّاز في خفض طاقة التنشيط وتحرير سيل كثيف من فقاعات غاز الأكسجين النقي.",
    accentTone: "cyan"
  },
  {
    id: "quick_hydrogen",
    title: "إزاحة الهيدروجين بفلز نشط",
    categoryLabel: "أكسدة واختزال",
    equationPreview: "Mg(s) + 2HCl(aq) → MgCl₂(aq) + H₂(g)↑",
    reactantIds: ["mg_ribbon", "hcl"],
    summary: "تفاعل إحلال مفرد سريع يُظهر انتقال الإلكترونات من شريط المغنيسيوم إلى بروتونات الحمض.",
    accentTone: "emerald"
  },
  {
    id: "quick_iron_complex",
    title: "معقد ثيوسيانات الحديد الطيفي",
    categoryLabel: "كيمياء تناسقية",
    equationPreview: "FeCl₃(aq) + KSCN(aq) ⇌ [Fe(SCN)]Cl₂(aq) + KCl(aq)",
    reactantIds: ["fecl3", "kscn"],
    summary: "تكوين معقد أحمر دموي فائق الحساسية يمكن فحص طيف امتصاصه مباشرة في مطياف UV-Vis الجامعي.",
    accentTone: "violet"
  },
  {
    id: "quick_sodium_blast",
    title: "تفاعل فلز الصوديوم مع الماء",
    categoryLabel: "سلامة مخبرية قصوى",
    equationPreview: "2Na(s) + 2H₂O(l) → 2NaOH(aq) + H₂(g)↑",
    reactantIds: ["na_metal", "h2o"],
    summary: "محاكاة آمنة لتفاعل الفلزات القلوية شديدة النشاط مع الماء واشتعال الهيدروجين بلهب أصفر.",
    accentTone: "rose"
  }
];

export const EXPERIMENT_LESSONS: ExperimentLesson[] = [
  {
    id: "lesson_neutralization",
    title: "معايرة التعادل الحمضي القاعدي",
    subtitle: "فهم توازن أيونات الهيدرونيوم والهيدروكسيد وحرارة التعادل القياسية",
    difficulty: "beginner",
    durationMinutes: 6,
    objectives: [
      "رصد التغير الفوري في الرقم الهيدروجيني pH عند خلط حمض قوي بقاعدة قوية",
      "قياس الانبعاث الحراري المصاحب لتكون جزيئات الماء التساهمية",
      "كتابة المعادلة الأيونية الصافية لتفاعل التعادل"
    ],
    targetReactants: ["hcl", "naoh"],
    steps: [
      {
        instruction: "أضف حمض الهيدروكلوريك HCl(aq) من رف الأحماض إلى دورق التفاعل ولاحظ انخفاض قيمة pH إلى 1.0.",
        hint: "يمكنك البحث عن HCl أو اختيار تصنيف الأحماض."
      },
      {
        instruction: "أضف هيدروكسيد الصوديوم NaOH(aq) من رف القواعد ثم اضغط زر «خلط ومحاكاة التفاعل».",
        hint: "تأكد من وجود المادتين معاً في الدورق قبل بدء المحاكاة."
      }
    ],
    quiz: [
      {
        id: "q_neut_1",
        question: "ما المعادلة الأيونية الصافية لتفاعل حمض الهيدروكلوريك القوي مع هيدروكسيد الصوديوم القوي؟",
        options: [
          "H⁺(aq) + OH⁻(aq) → H₂O(l)",
          "Na⁺(aq) + Cl⁻(aq) → NaCl(s)↓",
          "2HCl(aq) → H₂(g)↑ + Cl₂(g)↑",
          "NaOH(aq) + H₂O(l) → NaH(s) + O₂(g)"
        ],
        correctAnswerIndex: 0,
        explanation: "يبقى كل من Na⁺ و Cl⁻ ذائبين كأيونات متفرجة، بينما يتحد H⁺ مع OH⁻ لتكوين جزيء الماء."
      },
      {
        id: "q_neut_2",
        question: "لماذا ترتفع درجة حرارة المحلول أثناء تفاعل التعادل بين HCl و NaOH؟",
        options: [
          "لأن تكوين رابطة O—H في الماء عملية طاردة للحرارة (ΔH = -57.3 kJ/mol)",
          "بسبب احتراق غاز الكلور داخل الدورق",
          "لأن ملح الطعام يمتص الضوء المحيط",
          "بسبب زيادة لزوجة المذيب"
        ],
        correctAnswerIndex: 0,
        explanation: "تفاعل اتحاد أيونات الهيدروجين والهيدروكسيد يطلق طاقة حرارية ثابتة تقريباً لجميع الأحماض والقواعد القوية."
      }
    ],
    badgeId: "badge_neutralizer",
    congratulationText: "أتممت تجربة التعادل القياسي بنجاح وأتقنت تحليل الرقم الهيدروجيني وحرارة التفاعل!"
  },
  {
    id: "lesson_golden_rain",
    title: "الترسيب البلوري والمطر الذهبي",
    subtitle: "دراسة تفاعلات التبادل المزدوج وحاصل الإذابة الأيوني Ksp",
    difficulty: "beginner",
    durationMinutes: 8,
    objectives: [
      "تمييز شروط تكون الرواسب الصلبة في المحاليل المائية",
      "ملاحظة تشكل بلورات يوديد الرصاص الثنائي PbI₂ الصفراء",
      "تطبيق إجراءات السلامة عند التعامل مع أملاح الفلزات الثقيلة"
    ],
    targetReactants: ["pb_no3_2", "ki"],
    steps: [
      {
        instruction: "اسكب محلول نترات الرصاص الثنائي Pb(NO₃)₂(aq) من قسم الأملاح في الدورق الزجاجي.",
        hint: "نترات الرصاص محلول شفاف عديم اللون قبل التفاعل."
      },
      {
        instruction: "أضف محلول يوديد البوتاسيوم KI(aq) إلى الدورق وشغّل المحاكاة لمراقبة الترسيب الذهبي.",
        hint: "راقب الطبقة البلورية الصفراء التي تستقر أسفل الدورق."
      }
    ],
    quiz: [
      {
        id: "q_gold_1",
        question: "ما المركب المسؤول عن الراسب الأصفر البراق في تجربة المطر الذهبي؟",
        options: [
          "يوديد الرصاص الثنائي PbI₂(s)",
          "نترات البوتاسيوم KNO₃(aq)",
          "أكسيد البوتاسيوم K₂O(s)",
          "فلز الرصاص الحر Pb(s)"
        ],
        correctAnswerIndex: 0,
        explanation: "نترات البوتاسيوم ملح شديد الذوبان في الماء، بينما يمتلك يوديد الرصاص الثنائي ذائبية منخفضة جداً فيترسب بلون أصفر زاهٍ."
      },
      {
        id: "q_gold_2",
        question: "ما نوع التفاعل الكيميائي الحادث بين Pb(NO₃)₂ و KI؟",
        options: [
          "تفاعل إحلال مزدوج وترسيب أيوني",
          "تفاعل احتراق عضوي",
          "تفاعل تفكك حراري",
          "تفاعل بلمرة إضافية"
        ],
        correctAnswerIndex: 0,
        explanation: "تتبادل الكاتيونات والأنيونات مواقعها في المحلول المائي دون تغير في أعداد التأكسد."
      }
    ],
    badgeId: "badge_gold_maker",
    congratulationText: "رائع! استطعت تحضير بلورات يوديد الرصاص الثنائي وتفسير آلية الترسيب الأيوني بدقة."
  },
  {
    id: "lesson_catalysis",
    title: "الحركية الكيميائية والعوامل الحفّازة",
    subtitle: "تسريع تفكك فوق أكسيد الهيدروجين وتحليل دور الوسيط الحفّاز",
    difficulty: "intermediate",
    durationMinutes: 10,
    objectives: [
      "فهم أثر العامل الحفّاز في خفض حاجز طاقة التنشيط Ea",
      "مراقبة معدل تصاعد فقاعات غاز الأكسجين والارتفاع الحراري",
      "التمييز بين المادة المتفاعلة والوسيط الحفّاز المتجدد"
    ],
    targetReactants: ["h2o2", "ki"],
    steps: [
      {
        instruction: "أضف محلول فوق أكسيد الهيدروجين H₂O₂(aq) من فئة المؤكسدات إلى الدورق الزجاجي.",
        hint: "يتفكك H₂O₂ ببطء شديد في الظروف العادية بدون حفّاز."
      },
      {
        instruction: "أضف يوديد البوتاسيوم KI(aq) كعامل حفّاز ثم اضغط «خلط ومحاكاة التفاعل» لمراقبة الفوران الحراري.",
        hint: "لاحظ سرعة الفقاعات وارتفاع قراءة ميزان الحرارة."
      }
    ],
    quiz: [
      {
        id: "q_cat_1",
        question: "كيف يسرّع أيون اليوديد I⁻ تفكك فوق أكسيد الهيدروجين علمياً؟",
        options: [
          "يوفر مساراً ميكانيكياً بديلاً ذا طاقة تنشيط أقل دون أن يُستهلك في المحصلة",
          "يزيد من قيمة المحتوى الحراري الكلي ΔH للتفاعل",
          "يرفع درجة تجمد الماء الناتج",
          "يتحول نهائياً إلى غاز الأكسجين"
        ],
        correctAnswerIndex: 0,
        explanation: "العامل الحفّاز يغير آلية التفاعل عبر تكوين مركب وسيط نشط (IO⁻) ثم يعود إلى حالته الأصلية في الخطوة الثانية."
      }
    ],
    badgeId: "badge_catalyst_guru",
    congratulationText: "ممتاز! أتقنت مبادئ الحركية الكيميائية ودور الحفّازات المتجانسة في التفاعلات الطاردة للحرارة."
  },
  {
    id: "lesson_safety_chloramine",
    title: "السلامة الكيميائية ومخاطر الخلط السام",
    subtitle: "محاكاة آمنة لتفاعل المبيّض مع الأمونيا وفهم سمّية غاز الكلورامين",
    difficulty: "intermediate",
    durationMinutes: 7,
    objectives: [
      "التعرف على مخاطر خلط هيبوكلوريت الصوديوم NaClO مع الأمونيا NH₃",
      "تفسير آلية تشكل غاز أحادي الكلورامين السام NH₂Cl",
      "الالتزام بقواعد العمل داخل خزانة الغازات السامة"
    ],
    targetReactants: ["naclo", "nh3"],
    steps: [
      {
        instruction: "اسكب هيبوكلوريت الصوديوم NaClO(aq) في الدورق الزجاجي داخل بيئة المحاكاة الآمنة.",
        hint: "ابحث عن المبيّض ضمن المؤكسدات."
      },
      {
        instruction: "أضف محلول الأمونيا NH₃(aq) ولاحظ تنبيهات السلامة الفورية قبل وبعد تشغيل المحاكاة.",
        hint: "اقرأ التحذير الأمني ومخرجات سحابة الغاز المتصاعدة."
      }
    ],
    quiz: [
      {
        id: "q_safe_1",
        question: "ما الغاز السام المنبعث فور خلط مبيّض الكلور مع منظفات الأمونيا؟",
        options: [
          "غاز الكلورامين NH₂Cl الخانق",
          "غاز النيتروجين الخامل N₂",
          "بخار الماء النقي H₂O",
          "غاز الهيليوم He"
        ],
        correctAnswerIndex: 0,
        explanation: "يتفاعل هيبوكلوريت الصوديوم مع الأمونيا منتجاً أحادي الكلورامين الطيار الذي يسبب تهيجاً حاداً للجهاز التنفسي."
      }
    ],
    badgeId: "badge_safety_warden",
    congratulationText: "أحسنت! الوعي الاستباقي بالتفاعلات الخطرة هو الركيزة الأولى لكل كيميائي محترف."
  },
  {
    id: "lesson_grignard_organometallic",
    title: "الكيمياء العضوفلزية وحساسية كاشف غرينيار",
    subtitle: "تجربة جامعية متقدمة حول سلوك الكربانيونات تجاه المذيبات البروتونية",
    difficulty: "advanced",
    durationMinutes: 12,
    objectives: [
      "تحليل قطبية الرابطة الكربونية-المغنيسيومية في CH₃MgBr",
      "تفسير سبب اشتراط خلو أواني تفاعل غرينيار من أي أثر للرطوبة",
      "استنتاج نواتج التميؤ القاعدي العنيف لكاشف غرينيار"
    ],
    targetReactants: ["grignard", "h2o"],
    steps: [
      {
        instruction: "أضف كاشف غرينيار CH₃MgBr من فئة المركبات العضوية الجامعية إلى الدورق.",
        hint: "يمكنك تصفية الرف باختيار فئة عضوية وجامعية."
      },
      {
        instruction: "أضف الماء المقطر H₂O(l) وشغّل المحاكاة لرصد انبعاث غاز الميثان وترسب ملح المغنيسيوم القاعدي.",
        hint: "راقب قفزة الحرارة السريعة وتكون الراسب الأبيض."
      }
    ],
    quiz: [
      {
        id: "q_grig_1",
        question: "لماذا يتلف كاشف غرينيار فور تعرضه لبخار الماء الجوي أو الماء السائل؟",
        options: [
          "لأن الكربون المرتبط بالمغنيسيوم يحمل شحنة سالبة جزئية قوية تنتزع بروتون الماء مكوّنة ألكاناً غازياً",
          "لأن المغنيسيوم يتبخر عند درجة حرارة الغرفة",
          "لأن الماء يتجمد داخل الإيثر الجاف",
          "لأن البروم يتحول إلى غاز خامل"
        ],
        correctAnswerIndex: 0,
        explanation: "يتصرف CH₃MgBr كقاعدة قوية جداً تحول مجموعة الميثيل إلى غاز الميثان CH₄ غير الفعال نكليوفيلياً."
      }
    ],
    badgeId: "badge_organic_master",
    congratulationText: "إنجاز جامعي متقدم! أتقنت كيمياء المركبات العضوفلزية وحساسيتها تجاه البروتونات."
  }
];

export const CHEMISTRY_BADGES: ChemistryBadge[] = [
  {
    id: "badge_neutralizer",
    title: "خبير الاتزان والتعادل",
    description: "إتمام معايرة الأحماض والقواعد القوية والوصول بدقة إلى نقطة التكافؤ المتعادلة.",
    iconKey: "neutralizer",
    xpReward: 150
  },
  {
    id: "badge_gold_maker",
    title: "مهندس البلورات والترسيب",
    description: "تحضير بلورات يوديد الرصاص الثنائي وإتقان حسابات حاصل الإذابة الأيوني.",
    iconKey: "gold",
    xpReward: 150
  },
  {
    id: "badge_catalyst_guru",
    title: "مستكشف الحركية والحفز",
    description: "تحليل مسارات طاقة التنشيط في التفكك الحفزي لفوق أكسيد الهيدروجين.",
    iconKey: "catalyst",
    xpReward: 200
  },
  {
    id: "badge_safety_warden",
    title: "حارس السلامة المخبرية",
    description: "إتقان بروتوكولات الوقاية من الغازات السامة والتفاعلات المنزلية والمخبرية الخطرة.",
    iconKey: "safety",
    xpReward: 175
  },
  {
    id: "badge_organic_master",
    title: "باحث الكيمياء العضوفلزية",
    description: "اجتياز مختبر كواشف غرينيار المتقدم وفهم ميكانيكية الكربانيونات.",
    iconKey: "organic",
    xpReward: 250
  },
  {
    id: "badge_ai_explorer",
    title: "مبتكر التفاعلات الذكية",
    description: "دمج تراكيب كيميائية حرة وتحليل نواتجها الجزيئية عبر محرك الاستنتاج الكيميائي.",
    iconKey: "ai",
    xpReward: 100
  }
];
