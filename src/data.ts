/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Chemical, ReactionDetail, ExperimentLesson, Badge } from "./types";

export const CHEMICAL_DATABASE: Chemical[] = [
  {
    id: "hcl",
    name: "حمض الهيدروكلوريك",
    formula: "HCl",
    state: "liquid",
    color: "bg-blue-50/70 border-blue-200",
    liquidColor: "rgba(224, 242, 254, 0.4)",
    ph: 1.0,
    category: "acid",
    description: "حمض معدني قوي، شديد التآكل، يستخدم بشكل شائع في علم الفلزات، معالجة الجلود، والمختبرات الكيميائية.",
    hazardText: "حمض قوي للغاية. شديد التآكل. يسبب حروقاً جلدية شديدة وتلفاً بالعين. تجنب استنشاق أبخرته المباشرة."
  },
  {
    id: "h2so4",
    name: "حمض الكبريتيك",
    formula: "H₂SO₄",
    state: "liquid",
    color: "bg-cyan-50/60 border-cyan-300",
    liquidColor: "rgba(207, 250, 254, 0.5)",
    ph: 0.5,
    category: "acid",
    description: "حمض معدني قوي للغاية ومزيل للماء بشكل مكثف. سائل لزج يتفاعل بشدة وحرارة مع جزيئات الماء.",
    hazardText: "حمض تآكلي شديد القوة. تفاعل طارد للحرارة عند ملامسته للماء (أضف الحمض دائماً إلى الماء، وليس العكس!)."
  },
  {
    id: "ch3cooh",
    name: "حمض الأسيتيك (الخل)",
    formula: "CH₃COOH",
    state: "liquid",
    color: "bg-yellow-50/50 border-amber-100",
    liquidColor: "rgba(254, 252, 232, 0.3)",
    ph: 3.0,
    category: "acid",
    description: "حمض عضوي ضعيف يمنح الخل طعمه الحامض ورائحته النفاذة المميزة. ممتاز للتفاعلات الدراسية الخفيفة.",
    hazardText: "حمض ضعيف. قد يسبب تهيجاً خفيفاً بتركيزات عالية جداً. آمن بالتركيزات المنزلية المنخفضة."
  },
  {
    id: "naoh",
    name: "هيدروكسيد الصوديوم",
    formula: "NaOH",
    state: "aqueous",
    color: "bg-rose-50/40 border-rose-200",
    liquidColor: "rgba(254, 242, 242, 0.4)",
    ph: 13.0,
    category: "base",
    description: "قاعدة معدنية قوية (الصودا الكاوية) تُستخدم في صناعة الورق، الصابون، ومنظفات المصارف الصحية.",
    hazardText: "قاعدة كاوية قوية جداً. تآكلية للغاية للجلد والعينين. يمكن أن تسبب تلفاً عميقاً وسريعاً في الأنسجة الحية."
  },
  {
    id: "nh3",
    name: "محلول الأمونيا (النشادر)",
    formula: "NH₃ (aq)",
    state: "liquid",
    color: "bg-purple-50/40 border-purple-200",
    liquidColor: "rgba(245, 243, 255, 0.3)",
    ph: 11.5,
    category: "base",
    description: "مركب متطاير من النيتروجين والهيدروجين يتميز برائحة نفاذة للغاية. يُستخدم كعامل تنظيف ومنشط للأسمدة.",
    hazardText: "قاعدة متطايرة برائحة قوية مهيجة. سامة للأحياء المائية. تحذير: لا تخلطها مع مبيضات الكلور المنزلية أبداً!"
  },
  {
    id: "naclo",
    name: "هيبوكلوريت الصوديوم (المبيض)",
    formula: "NaClO",
    state: "liquid",
    color: "bg-yellow-105/30 border-yellow-200",
    liquidColor: "rgba(254, 253, 230, 0.6)",
    ph: 11.0,
    category: "salt",
    description: "المكون النشط الأساسي في مبيضات الغسيل المنزلية. عامل مؤكسد قوي وفعال للغاية في التطهير والتعقيم.",
    hazardText: "مؤكسد قوي. مسبب للتآكل. يتفاعل بعنف شديد مع الأمونيا أو الأحماض مطلقاً غازات سامة وخانقة."
  },
  {
    id: "pb_no3_2",
    name: "نترات الرصاص الثنائي",
    formula: "Pb(NO₃)₂",
    state: "aqueous",
    color: "bg-slate-50/80 border-slate-200",
    liquidColor: "rgba(241, 145, 149, 0.2)",
    ph: 4.5,
    category: "salt",
    description: "مركب معدني غير عضوي يظهر كبلورات شفافة ذائبة في الماء. ملح معدني ثقيل وسام للغاية.",
    hazardText: "سم معدني ثقيل تراكمي. خطر الإصابة بالسرطان عند التعرض الطويل. يجب التعامل معه بحذر من البث واللمس."
  },
  {
    id: "ki",
    name: "يوديد البوتاسيوم",
    formula: "KI",
    state: "aqueous",
    color: "bg-amber-50/30 border-amber-200",
    liquidColor: "rgba(254, 251, 236, 0.2)",
    ph: 7.0,
    category: "salt",
    description: "ملح أيوني كلاسيكي بارز يُستخدم في عروض الكيمياء التفاعلية، الحماية من الإشعاع، وعلاجات الغدة الدرقية.",
    hazardText: "آمن نسبياً في سياقات المختبر الدراسي المفتوح. لا تبتلعه. يتأكسد بمرور الوقت معطياً لوناً أصفر خفيفاً."
  },
  {
    id: "cuso4",
    name: "كبريتات النحاس الثنائي",
    formula: "CuSO₄",
    state: "aqueous",
    color: "bg-sky-205/50 border-sky-400",
    liquidColor: "rgba(56, 189, 248, 0.6)",
    ph: 4.0,
    category: "salt",
    description: "ملح مائي ذو لون أزرق فيروزي ساطع رائع. يُستخدم كمبيد للفطريات وفي اختبارات ألوان البلازما واللهب.",
    hazardText: "ضار إذا تّم ابتلاعه. مهيج للجلد والعينين. سام ومضر جداً بالبيئة والأحياء المائية."
  },
  {
    id: "agno3",
    name: "نترات الفضة",
    formula: "AgNO₃",
    state: "aqueous",
    color: "bg-zinc-50 border-zinc-200",
    liquidColor: "rgba(250, 250, 250, 0.3)",
    ph: 6.0,
    category: "salt",
    description: "ملح فضي عالي الذوبان. يترك بقعاً داكنة سوداء على المواد العضوية والجلد عند تعرضه للضوء. فعال للكشف عن الكلور.",
    hazardText: "يسبب حروقاً وتصبغ الجلد باللون الأسود الداكن. مؤكسد قوي وتآكلي. تعامل معه ببطء لتجنب البقع الصعبة."
  },
  {
    id: "nacl",
    name: "محلول كلوريد الصوديوم",
    formula: "NaCl",
    state: "aqueous",
    color: "bg-white border-zinc-200",
    liquidColor: "rgba(255, 255, 255, 0.15)",
    ph: 7.0,
    category: "salt",
    description: "ملح الطعام العادي مذاباً في الماء النقي. بمثابة مصدر أساسي لأيونات الكلوريد والصوديوم الحرة بالمطحنة الكيميائية.",
    hazardText: "مادة آمنة تماماً وخالية من المخاطر. يمثل محلولاً ملحياً قياسياً متعادلاً."
  },
  {
    id: "na_metal",
    name: "معدن الصوديوم",
    formula: "Na",
    state: "solid",
    color: "bg-zinc-300 border-zinc-500 shadow-inner",
    category: "metal",
    description: "فلز قلوي ناعم فضي اللون نشط للغاية. يسهل قطعه كالزبدة الباردة. يجب حفظه مغموراً في زيت الكيروسين لمنع تفاعله مع رطوبة الهواء.",
    isWarning: true,
    hazardText: "معدن شديد التفاعل وعنيف للغاية! يتفاعل بتفجير فوري عند ملامسة الماء، مطلقاً غاز الهيدروجين القابل للاشتعال بفرقعة شديدة."
  },
  {
    id: "mg_ribbon",
    name: "شريط المغنيسيوم",
    formula: "Mg",
    state: "solid",
    color: "bg-slate-300 border-slate-400 font-mono",
    category: "metal",
    description: "شريط معدني رمادي لامع من الفلزات القلوية الترابية. ممتاز لإزاحة الأحماض الدراسية واختبارات الاحتراق والتوهج.",
    hazardText: "صلب قابل للاشتعال. يحترق بوهج أبيض ساطع جداً ومبهر يعمي العين مؤقتاً عند إشعاله في الأكسجين."
  },
  {
    id: "cu_foil",
    name: "معدن النحاس",
    formula: "Cu",
    state: "solid",
    color: "bg-amber-600/80 border-amber-700",
    category: "metal",
    description: "فلز برتقالي محمر مطيل ومرن، ذو جودة توصيل فائقة للحرارة والكهرباء. يعتبر مستقراً ومقاوماً للأحماض غير المؤكسدة المخففة.",
    hazardText: "فلز خامل ومستقر نسبياً. غير ضار بصفته الصلبة ومناسب للمشاهدة والأيدي الدراسية."
  },
  {
    id: "h2o2",
    name: "بيروكسيد الهيدروجين (ماء الأكسجين)",
    formula: "H₂O₂",
    state: "liquid",
    color: "bg-blue-50/30 border-cyan-100",
    liquidColor: "rgba(239, 246, 255, 0.35)",
    ph: 6.0,
    category: "other",
    description: "بيروكسيد سائل مطهر ذو تفاعلية أكسدة عالية. يزداد نشاطه في التركيزات العالية وتفككه ببطء من تلقاء نفسه لماء وأكسجين.",
    hazardText: "عامل مؤكسد نشط. يمكن للتركيزات العالية (أكثر من 10%) تبييض الأقمشة وتسبب حرقاً وبقعاً بيضاء لاسعة بالبشرة."
  },
  {
    id: "h2o",
    name: "الماء المقطر",
    formula: "H₂O",
    state: "liquid",
    color: "bg-sky-50/20 border-sky-100/50",
    liquidColor: "rgba(240, 249, 255, 0.1)",
    ph: 7.0,
    category: "other",
    description: "الماء المقطر المتعادل الخالي من الأملاح والشوائب، يمثل المذيب العام والنواة الأساسية لغالبية تفاعلات Beaker.",
    hazardText: "آمن وصحي وخالٍ من المخاطر تماماً. المذيب الطبيعي للأيونات."
  },
  {
    id: "phenolphthalein",
    name: "كاشف الفينول فثالين",
    formula: "C₂₀H₁₄O₄",
    state: "liquid",
    color: "bg-purple-100/40 border-pink-200",
    liquidColor: "rgba(253, 242, 248, 0.3)",
    ph: 8.2,
    category: "indicator",
    description: "كاشف كيميائي عضوي يستشعر قلوية المحاليل. يكون شفافاً عديم اللون في الأوساط الحمضية والمتعادلة، ويتحول لوردي فوشيا ساطع بالوسط القاعدي.",
    hazardText: "كاشف ألوان دراسي آمن في الكميات المخبرية الصغيرة المقننة. تجنب تذوقه أو ابتلاعه."
  },
  {
    id: "hno3",
    name: "حمض النيتريك",
    formula: "HNO₃",
    state: "liquid",
    color: "bg-amber-100/40 border-amber-300",
    liquidColor: "rgba(245, 240, 220, 0.4)",
    ph: 1.0,
    category: "acid",
    description: "حمض معدني قوي وعامل مؤكسد شديد الفعالية، يستخدم في تفاعلات إذابة النحاس لإنتاج غاز ثاني أكسيد النيتروجين بني اللون.",
    hazardText: "حمض تآكلي قوي للغاية وعامل مؤكسد معقم. يسبب حروقاً شديدة وتصاعد أبخرة سامة. تجنب ملامسة الجلد أو استنشاق الغاز المتصاعد."
  },
  {
    id: "ca_oh_2",
    name: "ماء الجير (هيدروكسيد الكالسيوم)",
    formula: "Ca(OH)₂",
    state: "aqueous",
    color: "bg-emerald-50/35 border-emerald-200",
    liquidColor: "rgba(240, 253, 244, 0.35)",
    ph: 12.4,
    category: "base",
    description: "محلول هيدروكسيد الكالسيوم المشبع (المعروف بماء الجير). يستخدم كاشفاً أساسياً في الكشف المائي عن غاز ثاني أكسيد الكربون حيث يتعكر لونه.",
    hazardText: "محلول قاعدي قوي مسبب لتهيج خفيف بالعينين والجلد. تعامل معه بحذر."
  },
  {
    id: "na2co3",
    name: "كربونات الصوديوم (رماد الصودا)",
    formula: "Na₂CO₃",
    state: "aqueous",
    color: "bg-indigo-50/30 border-blue-200",
    liquidColor: "rgba(238, 242, 255, 0.3)",
    ph: 11.0,
    category: "salt",
    description: "ملح كربونات قاعدي يذوب في الماء، يستخدم في الصناعات الكيميائية لضبط الحموضة وفي عمليات صب الصابون ومعالجة عسر الماء.",
    hazardText: "مهيج خفيف للأغشية المخاطية والعينين بسبب تأثيره القاعدي المعتدل."
  },
  {
    id: "nahco3",
    name: "بيكربونات الصوديوم",
    formula: "NaHCO₃",
    state: "aqueous",
    color: "bg-teal-50/30 border-teal-200",
    liquidColor: "rgba(240, 253, 250, 0.25)",
    ph: 8.3,
    category: "salt",
    description: "ملح هيدروجيني قلوي خفيف، يتفاعل بسرعة شديدة مع الأحماض ليحرر غاز ثاني أكسيد الكربون بفوران ملحوظ.",
    hazardText: "مادة تامة الأمان، وتستخدم في تجارب الفوران الجامعية والتحضير المنزلي."
  },
  {
    id: "caco3",
    name: "كربونات الكالسيوم (الرخام الكلسي)",
    formula: "CaCO₃",
    state: "solid",
    color: "bg-stone-200 border-stone-400 text-stone-700",
    category: "salt",
    description: "ملح صلب أبيض شحيح الذوبان في الماء، يوجد في الطبيعة على هيئة حجر جيري ورخام، ويتفاعل بنشاط مع حمض الهيدروكلوريك مطلقاً فقاعات CO₂.",
    hazardText: "مسحوق صلب آمن، يسبب تصاعد غازات عند التفاعل مع الأحماض."
  },
  {
    id: "bacl2",
    name: "كلوريد الباريوم",
    formula: "BaCl₂",
    state: "aqueous",
    color: "bg-white border-slate-300",
    liquidColor: "rgba(255, 255, 255, 0.25)",
    ph: 6.5,
    category: "salt",
    description: "ملح ذائب بارز في الكيمياء التحليلية المتقدمة، يستخدم للتحري والكشف عن أنيونات الكبريتات حيث يشكل معها راسباً أبيض كثيفاً من كبريتات الباريوم.",
    hazardText: "ملح باريوم ذائب وهو سام للغاية في حال الابتلاع. تجنب تذوقه أو ملامسة الجروح."
  },
  {
    id: "fecl3",
    name: "كلوريد الحديد الثلاثي",
    formula: "FeCl₃",
    state: "aqueous",
    color: "bg-orange-100/50 border-orange-300",
    liquidColor: "rgba(249, 115, 22, 0.4)",
    ph: 2.0,
    category: "salt",
    description: "محلول مائي حمضي للحديد الثلاثي ذو لون برتقالي مصفر، يستخدم على نطاق واسع في تنقية المياه، وتعتبر تفاعلاته مع ثيوسيانات البوتاسيوم كاشفاً معقداً بلون الدم الكرزي.",
    hazardText: "مادة حمضية تآكلية خفيفة وتترك بقعاً صفراء صعبة الإزالة. تجنب ملامسة الملابس."
  },
  {
    id: "kscn",
    name: "ثيوسيانات البوتاسيوم",
    formula: "KSCN",
    state: "aqueous",
    color: "bg-violet-50/25 border-violet-200",
    liquidColor: "rgba(245, 243, 255, 0.2)",
    ph: 6.0,
    category: "salt",
    description: "ملح بوتاسيوم ذائب يستخدم كاشفاً نوعياً بالغ الدقة للكشف عن أيونات الحديد الثلاثي Fe³⁺ حيث ينتج معاً معقداً أحمر دموي فاقع الجمال.",
    hazardText: "ضار في حال الابتلاع. تعامل معه بمسؤولية أكاديمية."
  },
  {
    id: "kmno4",
    name: "برمنجنات البوتاسيوم",
    formula: "KMnO₄",
    state: "aqueous",
    color: "bg-fuchsia-100 border-fuchsia-400",
    liquidColor: "rgba(217, 70, 239, 0.75)",
    ph: 7.0,
    category: "salt",
    description: "ملح بنفسجي داكن ذو قدرة أكسدة خارقة، يُستخدم في معايرات الأكسدة والاختزال الجامعية، ويزول لونه فوراً عند اختزاله في وسط حمضي.",
    hazardText: "عامل مؤكسد نشط وقوي، قد يتسبب في تبقيع اليدين بألوان بنية برية صعبة الزوال."
  },
  {
    id: "feso4",
    name: "كبريتات الحديد الثنائي",
    formula: "FeSO₄",
    state: "aqueous",
    color: "bg-green-50/30 border-green-200",
    liquidColor: "rgba(220, 252, 231, 0.25)",
    ph: 4.5,
    category: "salt",
    description: "ملح ذائب ذو لون أخضر فاتح، يمثل مصدراً شهيراً لأيونات الحديد الثنائي Fe²⁺ في تفاعلات معايرة الاختزال مع البرمنجنات الأرجوانية.",
    hazardText: "ملح آمن نسبياً في الفحص المخبري، يفضل عدم الابتلاع."
  },
  {
    id: "zn_granules",
    name: "حبيبات معدن الزنك",
    formula: "Zn",
    state: "solid",
    color: "bg-slate-400 border-slate-500",
    category: "metal",
    description: "قطع معدنية صلبة من الخارصين (الزنك) الفضي اللامع، تمتاز بتفاعلية عالية مع الأحماض المختلفة لإطلاق غاز الهيدروجين.",
    hazardText: "معدن آمن في المناولة الصلبة، شديد الاشتعال في هيئة مسحوق ناعم."
  },
  {
    id: "fe_powder",
    name: "مسحوق معدن الحديد",
    formula: "Fe",
    state: "solid",
    color: "bg-zinc-600 border-zinc-700",
    category: "metal",
    description: "برادة حديد رمادية نقية، تستخدم في دراسة تفاعلات الاستبدال والإزاحة مثل إزاحة النحاس من محاليله المائية لتشكيل كبريتات الحديد.",
    hazardText: "برادة معدنية صلبة آمنة، تجنب ملامسة الأغشية المخاطية للعينين."
  },
  {
    id: "methyl_orange",
    name: "كاشف الميثيل البرتقالي",
    formula: "C₁₄H₁₄N₃NaO₃S",
    state: "liquid",
    color: "bg-orange-100 border-orange-300",
    liquidColor: "rgba(249, 115, 22, 0.5)",
    ph: 3.7,
    category: "indicator",
    description: "مؤشر بيئي هيدروجيني بارز في المعايرات الصناعية، يمتلك لوناً أحمر قانياً في الأوساط الحمضية القوية، ويتحول إلى اللون الأصفر البرتقالي بالوسط القاعدي والضعيف.",
    hazardText: "كاشف دراسي آمن بجرعات صغيرة مصرحة."
  },
  {
    id: "litmus_blue",
    name: "كاشف عباد الشمس الأزرق",
    formula: "Litmus",
    state: "liquid",
    color: "bg-blue-100 border-blue-300",
    liquidColor: "rgba(37, 99, 235, 0.4)",
    ph: 7.0,
    category: "indicator",
    description: "الكاشف التاريخي والأبسط في المناهج المدرسية والجامعية، حساس للتغير الحمضي القاعدي حيث يعطي لوناً أحمر في الحمض ويبقى أزرق في السوائل القاعدية.",
    hazardText: "كاشف طبيعي آمن تماماً."
  },
  {
    id: "grignard",
    name: "كاشف غرينيار (بروميد ميثيل المغنيسيوم)",
    formula: "CH₃MgBr",
    state: "liquid",
    color: "bg-amber-100 border-amber-300",
    liquidColor: "rgba(245, 230, 200, 0.45)",
    ph: 10.0,
    category: "organic",
    description: "مُركب كيميائي عضوفلزي صيغته العادية (R-Mg-X) فائق الأهمية في الكيمياء العضوية لبناء الروابط الكربونية. يتفاعل بشدة شبه انفجارية مع الماء أو أي مصدر للمانحين البروتونيين مثل الأحماض لتوليد الألكانات الساخنة (غاز الميثان).",
    hazardText: "شديد التفاعل مع الماء والرطوبة والأحماض! يطلق غاز الميثان سريع الاشتعال بحرارة عالية صاعدة."
  },
  {
    id: "tollens",
    name: "كاشف تولنز (نترات الفضة الأمونيومية)",
    formula: "[Ag(NH₃)₂]⁺",
    state: "aqueous",
    color: "bg-slate-100 border-slate-300",
    liquidColor: "rgba(241, 245, 249, 0.4)",
    ph: 9.5,
    category: "organic",
    description: "كاشف جامعة كلاسيكي للتمييز بين الألدهيدات والكيتونات. يتفاعل مع الألدهيدات لترسيب مرآة الفضة البرّاقة الفاخرة على جدران الوعاء المخبري.",
    hazardText: "يحتوي على فضة وأمونيا مائية. تجنب تخزينه لفترات طويلة لتجنب تكون الفولمينات القابلة للانفجار."
  },
  {
    id: "benedict",
    name: "كاشف بندكت / فهلنغ",
    formula: "CuSO₄ + Na₂CO₃ + Citrate",
    state: "aqueous",
    color: "bg-blue-200 border-blue-400",
    liquidColor: "rgba(37, 99, 235, 0.6)",
    ph: 10.5,
    category: "organic",
    description: "كاشف أزرق ساطع للسكاكر المختزلة والألدهيدات بالجامعة. يتغير لونه من الأزرق للأخضر فالأصفر ثم البرتقالي إلى أكسيد النحاس الأحادي الأحمر الآجري عند التسخين.",
    hazardText: "محلول قراءات مائي آمن نسبياً، يحتوي على أملاح النحاس الثنائية القاعدية."
  },
  {
    id: "lucas",
    name: "كاشف لوكاس (كلوريد الزنك مع حمض HCl)",
    formula: "ZnCl₂ / HCl",
    state: "liquid",
    color: "bg-zinc-100 border-zinc-300",
    liquidColor: "rgba(228, 228, 231, 0.4)",
    ph: 0.8,
    category: "organic",
    description: "كاشف كيمياء عضوية جامعي بارز للتمييز بين الكحولات الأولية والثانوية والثالثية حسب سرعة ظهور التعكر الكثيف لمركبات ألكيل الكلوريد.",
    hazardText: "مزيج حمضي تآكلي قوي جداً ويحتوي على كلوريد الزنك المركز."
  },
  {
    id: "ninhydrin",
    name: "كاشف النينهيدرين",
    formula: "C₉H₆O₄",
    state: "aqueous",
    color: "bg-yellow-50 border-amber-200",
    liquidColor: "rgba(254, 252, 232, 0.3)",
    ph: 6.0,
    category: "organic",
    description: "كاشف الكيمياء الحيوية (البيوكيمياء) الجامعي للأحماض الأمينية والبروتينات، يعطي لون أرجواني روهمان (Ruhemann's Purple) البديع عند التسخين.",
    hazardText: "يصبغ الجلد بالألوان الداكنة. تجنب ملامسة البشرة مباشرة."
  },
  {
    id: "biuret",
    name: "كاشف البيوريت",
    formula: "CuSO₄ + NaOH",
    state: "aqueous",
    color: "bg-sky-100 border-sky-300",
    liquidColor: "rgba(186, 230, 253, 0.5)",
    ph: 12.0,
    category: "organic",
    description: "كاشف ببتيدي بروتيني جامعي يتحول من الأزرق السماوي إلى البنفسجي الغامق عند وجود الروابط الببتيدية بالبروتينات والبوليمرات الحيوية.",
    hazardText: "محلول قاعدي قوي مسبب للتآكل والتهيج."
  },
  {
    id: "k2cr2o7",
    name: "ثنائي كرومات البوتاسيوم الحمضية",
    formula: "K₂Cr₂O₇ / H⁺",
    state: "aqueous",
    color: "bg-orange-200 border-orange-400",
    liquidColor: "rgba(249, 115, 22, 0.7)",
    ph: 2.0,
    category: "organic",
    description: "عامل مؤكسد برتقالي زاهي بارز في معمل الكيمياء العضوية الجامعية، يتحول إلى الأخضر الزيتي (Cr³⁺) عند أكسدة الكحولات والألدهيدات.",
    hazardText: "مؤكسد قوي ويحتوي على الكروم السداسي. يتعين استخدام القفازات ومراعاة إجراءات السلامة."
  },
  {
    id: "acetone",
    name: "الأسيتون النقي",
    formula: "CH₃COCH₃",
    state: "liquid",
    color: "bg-[#FAFAFA] border-slate-200",
    liquidColor: "rgba(255, 255, 255, 0.2)",
    ph: 7.0,
    category: "organic",
    description: "مذيب عضوي متطاير وكيتون جامعي نموذجي، مستقر ضد المؤكسدات الضعيفة ويدخل في تفاعلات التكثيف والضم العضوي.",
    hazardText: "سائل سريع الاشتعال ومتطاير. تجنب قربه من ألسنة اللهب المباشرة."
  },
  {
    id: "ethanol",
    name: "الإيثانول النقي (الكحول الإيثيلي)",
    formula: "C₂H₅OH",
    state: "liquid",
    color: "bg-blue-50/20 border-slate-200",
    liquidColor: "rgba(239, 246, 255, 0.2)",
    ph: 7.0,
    category: "organic",
    description: "كحول أولي كلاسيكي في تجارب الأسترة مع الأحماض العضوية وتفاعلات الأكسدة والأسترة والتحليل الجامعي.",
    hazardText: "سائل عضوي سريع الاشتعال بلهب أزرق خافت."
  },
  {
    id: "salicylic_acid",
    name: "حمض الساليسليك",
    formula: "C₇H₆O₃",
    state: "solid",
    color: "bg-stone-100 border-stone-300",
    ph: 3.0,
    category: "organic",
    description: "حمض عضوي أروماثي، اللبنة الأساسية لتخليق الأسبرين (حمض أستيل الساليسليك) في معمل العضوية الجامعي عند التفاعل مع حمض الأسيتيك.",
    hazardText: "مسحوق بلوري أبيض. آمن نسبياً ويحذر من ملامسة العينين."
  },
  {
    id: "na2s2o3",
    name: "ثيوسولفات الصوديوم",
    formula: "Na₂S₂O₃",
    state: "aqueous",
    color: "bg-slate-50 border-slate-200",
    liquidColor: "rgba(248, 250, 252, 0.3)",
    ph: 7.5,
    category: "salt",
    description: "محلول قياسي لمعايرات الفولتمترية واليود المباشرة والكينتيكا في الكيمياء التحليلية الجامعية.",
    hazardText: "ملح آمن ومستقر في المعايرات الحجمية."
  },
  {
    id: "hf",
    name: "حمض الهيدروفلوريك",
    formula: "HF",
    state: "liquid",
    color: "bg-emerald-50/40 border-emerald-300",
    liquidColor: "rgba(236, 253, 245, 0.4)",
    ph: 2.0,
    category: "acid",
    description: "حمض خاص شديد الخبث والتآكل للزجاج، يتفاعل مع السيلكات (SiO₂) ويحفر الأواني الزجاجية في مختبرات الفلزات والجامعات.",
    hazardText: "شديد الخطورة جداً! يحفر الزجاج ويمتص عبر الجلد ليخترق العظام. يتطلب عناية فائقة وقوانين أمان جادة."
  },
  {
    id: "alcl3",
    name: "كلوريد الألومنيوم الجاف",
    formula: "AlCl₃",
    state: "solid",
    color: "bg-amber-50 border-amber-200",
    ph: 3.0,
    category: "salt",
    description: "حمض لويس القوي المستخدم كمحفز في تفاعلات فريدل كرافتس (Friedel-Crafts) للكيمياء العضوية المتقدمة.",
    hazardText: "يتفاعل بنشاط مع رطوبة الهواء مطلقاً أبخرة حمضية."
  }
];

export const PREDEFINED_REACTIONS: { [key: string]: ReactionDetail } = {
  "hcl+naoh": {
    reactants: ["hcl", "naoh"],
    products: ["NaCl (كلوريد الصوديوم)", "H₂O (الماء متعادل)"],
    equation: "HCl + NaOH → NaCl + H₂O",
    reactionType: "neutralization",
    temperatureDelta: 16.5,
    colorChange: { from: "transparent", to: "rgba(255,255,255,0.1)" },
    isDangerous: false,
    dangerLevel: "safe",
    audioEffect: "sizzle",
    explanation: "تفاعل تعادل كلاسيكي بين حمض وقاعدة. يتفاعل حمض الهيدروكلوريك (حمض قوي) مع هيدروكسيد الصوديوم (قاعدة قوية) لينتج ملح الطعام العادي (NaCl) والماء المتعادل. هذا تفاعل طارد للحرارة ويرفع درجة حرارة الدورق الكيميائي بشكل ملحوظ.",
    molecularExplanation: "تتحد بروتونات الهيدروجين المباشرة (H⁺) القادمة من الحمض مع أيونات الهيدروكسيد الحرة (OH⁻) من القاعدة لتشكيل جزيئات الماء المستقرة مع إطلاق طاقة الرابطة الكيميائية في الوسط."
  },
  "hcl+naoh+phenolphthalein": {
    reactants: ["hcl", "naoh", "phenolphthalein"],
    products: ["NaCl (ملح)", "H₂O (ماء متعادل)", "تغير لون الكاشف لشفاف"],
    equation: "HCl + NaOH + Indicator → NaCl + H₂O",
    reactionType: "neutralization",
    temperatureDelta: 16.5,
    colorChange: { from: "rgba(236,72,153,0.7)", to: "rgba(255,255,255,0.1)" },
    isDangerous: false,
    dangerLevel: "safe",
    audioEffect: "sizzle",
    explanation: "تفاعل تعادل حمضي قاعدي واضح بمراقبة كواشف الألوان الكيميائية. في البداية عند غلبة الوسط القاعدي، يتميز المحلول بلون فوشيا وردي ساطع بسبب الفينول فثالين. بمجرد صب حمض HCl واستهلاك الهيدروكسيد وهبوط الرقم الهيدروجيني تحت 8.2، يزول اللون الوردي فوراً ويصبح المحلول في ثانية واحدة شفافاً تماماً كعلامة على نقطة انتهاء المعايرة التعادلية!",
    molecularExplanation: "يعيد الفينول فثالين تشكيل تركيبه البنائي استجابة لنطاقات الرقم الهيدروجيني. فبقوة الوسط القاعدي يفقد الهيدروجين ويتجه لتشكيل مركب ممتص للضوء يعطيه اللون الفوشيا، وحين يتعادل أو يصبح تراكب الحمض أعلى، يرتد لبنيته الأصلية عديمة اللون."
  },
  "agno3+nacl": {
    reactants: ["agno3", "nacl"],
    products: ["AgCl ↓ (كلوريد الفضة الراسب الأبيض)", "NaNO₃ (نترات الصوديوم)"],
    equation: "AgNO₃ + NaCl → AgCl ↓ + NaNO₃",
    reactionType: "precipitation",
    temperatureDelta: 0.5,
    colorChange: { from: "transparent", to: "rgba(255, 255, 255, 0.85)" },
    hasPrecipitate: true,
    precipitateColor: "rgba(255, 255, 255, 0.95)",
    isDangerous: false,
    dangerLevel: "safe",
    audioEffect: "none",
    explanation: "تفاعل ترسيب كلاسيكي يُستخدم مخبرياً بشكل متواتر للتعرف والكشف الاستباقي عن الكلوريد بالماء. تدمج الفضة الحرة Ag⁺ فوراً وبصعوبة وداع بالكلورCl⁻ لتكوين كتل نسيجية صلبة من كلوريد الفضة بيضاء زاهية تتأثر بالتدريج الضوئي لتتحول لغامقة.",
    molecularExplanation: "Ag⁺ (aq) + Cl⁻ (aq) → AgCl (s). تفوق طاقة الشبكة البلورية الصلبة لكلوريد الفضة الرغبة في التفكك والذوبان داخل الحيز المائي للأيونات المنعزلة، مبرهناً على التبلور الفوري."
  },
  "bacl2+h2so4": {
    reactants: ["bacl2", "h2so4"],
    products: ["BaSO₄ ↓ (راسب كبريتات الباريوم الأبيض)", "HCl (محلول حمض الهيدروكلوريك)"],
    equation: "BaCl₂ + H₂SO₄ → BaSO₄ ↓ + 2HCl",
    reactionType: "precipitation",
    temperatureDelta: 2.5,
    colorChange: { from: "transparent", to: "rgba(255, 255, 255, 0.9)" },
    hasPrecipitate: true,
    precipitateColor: "rgba(255, 255, 255, 0.98)",
    isDangerous: false,
    dangerLevel: "caution",
    audioEffect: "none",
    explanation: "تفاعل ترسيب تحليلي كلاسيكي لتحديد أيونات الكبريتات SO₄²⁻. ترتبط كاتيونات الباريوم Ba²⁺ بأنيونات الكبريتات لتُشكّل ملح كبريتات الباريوم BaSO₄ وهو مركب ذو شبكة بلورية فائقة القوة وشديد الاستقرار لا يذوب في الماء ولا حتى في الأحماض القوية.",
    molecularExplanation: "Ba²⁺ (aq) + SO₄²⁻ (aq) → BaSO₄ (s). الذوبانية المنخفضة جداً لكبريتات الباريوم تجعل هذا التفاعل معياراً رئيسياً للتحليل الكمي والوصفي بالمختبرات الجامعية."
  },
  "bacl2+cuso4": {
    reactants: ["bacl2", "cuso4"],
    products: ["BaSO₄ ↓ (راسب أبيض)", "CuCl₂ (كلوريد النحاس الثنائي الأزرق المخضر)"],
    equation: "BaCl₂ + CuSO₄ → BaSO₄ ↓ + CuCl₂",
    reactionType: "precipitation",
    temperatureDelta: 1.2,
    colorChange: { from: "rgba(56, 189, 248, 0.6)", to: "rgba(45, 212, 191, 0.5)" },
    hasPrecipitate: true,
    precipitateColor: "rgba(255, 255, 255, 0.95)",
    isDangerous: false,
    dangerLevel: "safe",
    audioEffect: "none",
    explanation: "تفاعل إحلال مزدوج ينتج عنه راسب وتغير في لون المحلول. تترسب كبريتات الباريوم كمسحوق أبيض بينما يتبدل لون النحاس المذاب المتبقي ليصبح ذو نبرة فيروزية (كلوريد النحاس).",
    molecularExplanation: "تنفصل قوى أيونات كبريتات النحاس الثنائي والكلوريد لتعيد ترتيب نفسها طاردة كبريتات الباريوم شديدة التماسك البلوري."
  },
  "fecl3+kscn": {
    reactants: ["fecl3", "kscn"],
    products: ["[Fe(SCN)]²⁺ (معقد ثيوسيانات الحديد الأحمر الدموي)", "KCl (كلوريد البوتاسيوم)"],
    equation: "FeCl₃ + KSCN → [Fe(SCN)]Cl₂ + KCl",
    reactionType: "other",
    temperatureDelta: 0.5,
    colorChange: { from: "rgba(249, 115, 22, 0.4)", to: "rgba(153, 27, 27, 0.95)" },
    isDangerous: false,
    dangerLevel: "safe",
    audioEffect: "none",
    explanation: "تفاعل تكوين معقد تناسقي شهير جداً في تجارب الاتزان الكيميائي والتحليل الوصفي الجامعي. تندمج ثيوسيانات SCN⁻ مع كاتيون الحديد الثلاثي Fe³⁺ ليتشكل معقد ذو لون أحمر كرزي/دموي حاد فاقع يسمى ثيوسيانات الحديد الثنائي، ويدرس الطلاب هذا التفاعل لمراقبة تأثير مبدأ لوشاتيليه.",
    molecularExplanation: "Fe³⁺ (aq) + SCN⁻ (aq) ⇌ [Fe(SCN)]²⁺ (aq). تشير القيمة العالية لثابت التوازن الكيميائي إلى كفاءة هذا التكوين المعقد وحساسيته الفائقة كمؤشر تحليلي."
  },
  "nahco3+hcl": {
    reactants: ["nahco3", "hcl"],
    products: ["NaCl (ملح)", "H₂O (ماء)", "CO₂ ↑ (غاز ثاني أكسيد الكربون الكثيف)"],
    equation: "NaHCO₃ + HCl → NaCl + H₂O + CO₂ ↑",
    reactionType: "gas-release",
    temperatureDelta: -2.0,
    colorChange: { from: "transparent", to: "rgba(255,255,255,0.15)" },
    hasGas: true,
    gasType: "ثاني أكسيد الكربون",
    bubblingRate: "rapid",
    isDangerous: false,
    dangerLevel: "safe",
    audioEffect: "fizz",
    explanation: "تفاعل فوران طارد للغاز مع انخفاض طفيف في درجات الحرارة (تفاعل ماص خفيف). تتفكك بيكربونات الصوديوم بواسطة حمض الهيدروكلوريك لتطلق غاز كتم الحرائق (ثاني أكسيد الكربون CO₂) مسببة رغوة غازية بيضاء متصاعدة ومبهجة وعنيفة الفوران.",
    molecularExplanation: "Acid-Base reaction: HCO₃⁻ + H⁺ → H₂CO₃ → H₂O + CO₂ (g). يتفكك حمض الكربونيك غير المستقر لحظياً لمياه والغاز المنطلق."
  },
  "caco3+hcl": {
    reactants: ["caco3", "hcl"],
    products: ["CaCl₂ (كلوريد الكالسيوم)", "H₂O (ماء)", "CO₂ ↑ (غاز ثاني أكسيد الكربون)"],
    equation: "CaCO₃ + 2HCl → CaCl₂ + H₂O + CO₂ ↑",
    reactionType: "gas-release",
    temperatureDelta: 4.5,
    colorChange: { from: "transparent", to: "rgba(255,255,255,0.1)" },
    hasGas: true,
    gasType: "ثاني أكسيد الكربون",
    bubblingRate: "rapid",
    isDangerous: false,
    dangerLevel: "safe",
    audioEffect: "fizz",
    explanation: "تفاعل ذوبان الصخور الكلسية تحت تأثير الأمطار الحمضية أو الأحماض المركزة. يتآكل الحجر الجيري CaCO₃ الصلب بفعل حمض الهيدروكلوريك ليتحول لغاز CO₂ متصاعد ومحلول كلوريد الكالسيوم الذائب.",
    molecularExplanation: "CaCO₃ (s) + 2 H⁺ (aq) → Ca²⁺ (aq) + H₂O (l) + CO₂ (g). يُستخدم هذا التفاعل مخبرياً للكشف عن الشق الحمضي للكربونات."
  },
  "fe_powder+cuso4": {
    reactants: ["fe_powder", "cuso4"],
    products: ["FeSO₄ (كبريتات الحديد الثنائي الخضراء الباهتة)", "Cu ↓ (النحاس المعدني الأحمر المترسب)"],
    equation: "Fe + CuSO₄ → FeSO₄ + Cu ↓",
    reactionType: "displacement",
    temperatureDelta: 14.0,
    colorChange: { from: "rgba(56, 189, 248, 0.6)", to: "rgba(147, 197, 253, 0.25)" },
    hasPrecipitate: true,
    precipitateColor: "rgba(185, 28, 28, 0.9)",
    isDangerous: false,
    dangerLevel: "safe",
    audioEffect: "none",
    explanation: "تفاعل إزاحة أحادي (أكسدة واختزال) كلاسيكي يعتمد على سلسلة النشاط الكيميائي. لكون الحديد Fe أكثر نشاطاً وكهروسلبية من النحاس Cu، فإنه ينتزع الكبريتات ويذوب كأيونات حديد ثنائي، بينما تختزل أيونات النحاس الثنائي وتترسب كفلز نحاس صلب ذو لون برتقالي محمر أسفل الكأس.",
    molecularExplanation: "Fe (s) + Cu²⁺ (aq) → Fe²⁺ (aq) + Cu (s). تفاعل أكسدة للحديد واختزال للنحاس تظهر تغيرات ألوانه بين زرقة المحلول واحمرار القاع بشكل خلاب."
  },
  "zn_granules+hcl": {
    reactants: ["zn_granules", "hcl"],
    products: ["ZnCl₂ (كلوريد الزنك)", "H₂ ↑ (غاز الهيدروجين الفوار المشتعل)"],
    equation: "Zn + 2HCl → ZnCl₂ + H₂ ↑",
    reactionType: "gas-release",
    temperatureDelta: 19.5,
    colorChange: { from: "transparent", to: "rgba(224, 231, 255, 0.15)" },
    hasGas: true,
    gasType: "الهيدروجين",
    bubblingRate: "rapid",
    isDangerous: false,
    dangerLevel: "caution",
    audioEffect: "fizz",
    explanation: "التفاعل القياسي في كليات العلوم لإنتاج غاز الهيدروجين H₂. تتفاعل حبيبات الخارصين (الزنك) بنشاط كبير مع حمض الهيدروكلوريك، مما ينتج تدفقاً مستمراً لفقاعات غاز الهيدروجين الخفيف مع ارتفاع ملحوظ في درجات الحرارة.",
    molecularExplanation: "Zn (s) + 2 H⁺ (aq) → Zn²⁺ (aq) + H₂ (g). يعكس هذا التفاعل قدرة المعادن فوق الهيدروجين في سلسلة الكهروسلبية على إزاحة الحموض."
  },
  "hno3+cu_foil": {
    reactants: ["hno3", "cu_foil"],
    products: ["Cu(NO₃)₂ (نترات النحاس الزرقاء الفيروزية)", "NO₂ ↑ (غاز ثاني أكسيد النيتروجين البني السام كثيفاً)"],
    equation: "Cu + 4HNO₃ → Cu(NO₃)₂ + 2NO₂ ↑ + 2H₂O",
    reactionType: "dangerous",
    temperatureDelta: 48.0,
    colorChange: { from: "transparent", to: "rgba(13, 148, 136, 0.65)" },
    hasGas: true,
    gasType: "ثاني أكسيد النيتروجين البني السام",
    bubblingRate: "rapid",
    isDangerous: true,
    dangerLevel: "extreme",
    audioEffect: "sizzle",
    safetyWarning: "تفاعل خطر للغاية وقاتل بالاستنشاق! يتفاعل النحاس مع حمض النيتريك المركز مطلقاً غاز ثاني أكسيد النيتروجين البني الكثيف السام للغاية والصادر بتهيج حاد للرئتين والعيون في المختبرات والساحات المفتوحة الكلية.",
    explanation: "تفاعل أكسدة واختزال عنيف ومشهور في الكيمياء غير العضوية. حمض النيتريك ليس حمضاً بسيطاً بل عامل مؤكسد قوي؛ يقوم بأكسدة النحاس Cu إلى أيونات النحاس الزرقاء الخلابة Cu²⁺، بينما يُختزل النيتروجين مطيراً الغاز البني المميز NO₂.",
    molecularExplanation: "Cu (s) + 4 H⁺ + 2 NO₃⁻ → Cu²⁺ + 2 NO₂ (g) + 2 H₂O. يعكس هذا التفاعل الفرق بين الأحماض المؤكسدة وغير المؤكسدة تجاه المعادن الخاملة نسبيًا كالنحاس."
  },
  "kmno4+feso4+h2so4": {
    reactants: ["kmno4", "feso4", "h2so4"],
    products: ["Fe₂(SO₄)₃ (كبريتات الحديد الثلاثي الباهتة)", "MnSO₄ (كبريتات المنجنيز عديمة اللون)", "تلاشي تام للون البرمنجنات الأرجواني"],
    equation: "2KMnO₄ + 10FeSO₄ + 8H₂SO₄ → 5Fe₂(SO₄)₃ + 2MnSO₄ + K₂SO₄ + 8H₂O",
    reactionType: "exothermic",
    temperatureDelta: 22.0,
    colorChange: { from: "rgba(217, 70, 239, 0.8)", to: "rgba(255,255,255,0.05)" },
    isDangerous: false,
    dangerLevel: "caution",
    audioEffect: "sizzle",
    explanation: "تفاعل معايرة الأكسدة والاختزال الأكثر تمثيلاً وشهرة في المناهج الجامعية! تعمل البرمنجنات KMnO₄ ذات اللون البنفسجي الساحر كعامل مؤكسد قوي في وجود حمض الكبريتيك، حيث تنتزع الإلكترونات من الحديد الثنائي Fe²⁺ وتحوله لحديد ثلاثي Fe³⁺، بينما ترتد البرمنجنات ذات اللون الأرجواني إلى أيونات منجنيز ثنائي Mn²⁺ عديمة اللون تماماً، مما يتسبب في زوال اللون البنفسجي فجأة وبشكل عجيب عند نقطة التكافؤ!",
    molecularExplanation: "MnO₄⁻ (purple) + 8H⁺ + 5Fe²⁺ → Mn²⁺ (colorless) + 5Fe³⁺ + 4H₂O. توضح هذه المعادلة التغير الشديد في البنية الإليكترونية للمنجنيز بين مدار d الخارجي الممتص للضوء وغير الممتص له."
  },
  "methyl_orange+hcl": {
    reactants: ["methyl_orange", "hcl"],
    products: ["تغير لون الكاشف إلى الأحمر القاني (وسط حمضي قوي)"],
    equation: "Methyl Orange + HCl → Red Solution",
    reactionType: "other",
    temperatureDelta: 0.2,
    colorChange: { from: "rgba(249, 115, 22, 0.5)", to: "rgba(220, 38, 38, 0.9)" },
    isDangerous: false,
    dangerLevel: "safe",
    explanation: "يتغير لون الميثيل البرتقالي فورا عند التعرض للأحماض القوية ذات الرقم الهيدروجيني الأقل من 3.1 ليعطي لونا أحمر قانيا واضحا، وهو كاشف مثالي للكشف السريع.",
    molecularExplanation: "تكتسب جزيئات الميثيل كفاءات هيدروجينية بروتونية متسلسلة تعيد تشكيل تآفلها الطيفي اللوني لتحد من مرور الحزم الضوئية عدا الطيف الأحمر."
  },
  "litmus_blue+hcl": {
    reactants: ["litmus_blue", "hcl"],
    products: ["تحول لون كاشف عباد الشمس للأحمر الحمضي الكلاسيكي"],
    equation: "Litmus + HCl → Red Solution",
    reactionType: "other",
    temperatureDelta: 0.1,
    colorChange: { from: "rgba(37, 99, 235, 0.4)", to: "rgba(239, 68, 68, 0.85)" },
    isDangerous: false,
    dangerLevel: "safe",
    explanation: "المظهر الدراسي المألوف: حمض الهيدروكلوريك يبرهن على حموضته العالية بتحويل صبغة عباد الشمس الزرقاء إلى اللون الأحمر الصريح.",
    molecularExplanation: "بروتونات الهيدروجين تحث الشق العضوي لصبغة عباد الشمس على إعادة الترابط المكتمل معيداً إبراز النطاق اللوني الأحمر."
  },
  "methyl_orange+naoh": {
    reactants: ["methyl_orange", "naoh"],
    products: ["ثبات اللون الأصفر البرتقالي للكاشف بالوسط القاعدي"],
    equation: "Methyl Orange + NaOH → Yellow Solution",
    reactionType: "other",
    temperatureDelta: 0.2,
    colorChange: { from: "rgba(249, 115, 22, 0.5)", to: "rgba(251, 191, 36, 0.85)" },
    isDangerous: false,
    dangerLevel: "safe",
    explanation: "في النطاقات القاعدية العالية pH > 4.4، يحتفظ كاشف الميثيل البرتقالي بلونه الكهرماني الأصفر الذهبي الثابت، مما يدل على خلو الوسط من البروتونات الحرة.",
    molecularExplanation: "فقدان البروتونات واستعادة أيون الصوديوم يثبت السحابة البنائية الرنينية للصبغة في هيئتها الصفراء."
  },
  "na_metal+h2o": {
    reactants: ["na_metal", "h2o"],
    products: ["NaOH (هيدروكسيد الصوديوم المائي)", "H₂ ↑ (غاز الهيدروجين سريعا)"],
    equation: "2Na + 2H₂O → 2NaOH + H₂ ↑",
    reactionType: "dangerous",
    temperatureDelta: 62.0,
    colorChange: { from: "transparent", to: "rgba(244, 63, 94, 0.1)" },
    hasGas: true,
    gasType: "الهيدروجين",
    bubblingRate: "explosive",
    flameColor: "yellow",
    isDangerous: true,
    dangerLevel: "extreme",
    audioEffect: "explosion",
    safetyWarning: "خطر جسيم للغاية على السلامة! يطفو صوديوم الصوديوم المعدني ويدور وينصهر في خرزة فضية على الماء ثم يشتعل بتلقائية بلهب أصفر حاد، تالياً قد ينفجر التفاعل. هذا يولد محلول الصودا الكاوية وتصاعداً لهيدروجين متأجج.",
    explanation: "تفاعل إزاحة أحادي ذو نشاط كيميائي فائق. تمتلك فلزات المجموعة الأولى (الصوديوم) إلكترون تكافؤ خارجي هش، تفقده بسرعة وعنف عالي للماء، مسببة فصلاً سريعاً لذرات الهيدروجين بالماء وتحويلها لهيدروجين متطاير فرزق تفجير هائل.",
    molecularExplanation: "تنتقل إلكترونات ذرات الصوديوم الصلبة للماء، مختزلة الهيدروجين إلى غاز الهيدروجين H₂ القابل للاشتعال. تتسبب الحرارة الضخمة الناتجة من تفكيك الروابط في التفجير الهيدروجيني بفرقعات متتالية."
  },
  "tollens+ethanol": {
    reactants: ["tollens", "ethanol"],
    products: ["Ag ↓ (راسب مرآة الفضة البرّاقة)", "CH₃COOH (حمض الأسيتيك)", "NH₃ (أمونيا)"],
    equation: "[Ag(NH₃)₂]⁺ + R-CHO + H₂O → Ag ↓ (Silver Mirror) + R-COOH",
    reactionType: "precipitation",
    temperatureDelta: 12.0,
    colorChange: { from: "rgba(241, 245, 249, 0.4)", to: "rgba(203, 213, 225, 0.9)" },
    hasPrecipitate: true,
    precipitateColor: "rgba(226, 232, 240, 0.98)",
    isDangerous: false,
    dangerLevel: "safe",
    audioEffect: "sizzle",
    explanation: "تفاعل مرآة الفضة (Silver Mirror Test) الفاخر بالجامعات! أكسدة الألدهيدات والمركبات العضوية المختزلة بكاشف تولنز تختزل أيونات الفضة Ag⁺ لترسب طلاءً صلبًاً فضياً لامعاً يكسو جدران الدورق الكيميائي كمرآة حقيقية مذهلة.",
    molecularExplanation: "2[Ag(NH₃)₂]⁺ + RCHO + 3OH⁻ → 2Ag(s) ↓ + RCOO⁻ + 4NH₃ + 2H₂O. تترسب ذرات الفضة المختزلة بنظام بلوري متراكم كمرآة على السطح الزجاجي الداخلي."
  },
  "benedict+ethanol": {
    reactants: ["benedict", "ethanol"],
    products: ["Cu₂O ↓ (أكسيد النحاس الأحادي الأحمر الآجري)", "حمض عضوي مؤكسد"],
    equation: "2Cu²⁺ (Benedict) + R-CHO + 5OH⁻ → Cu₂O ↓ (Brick Red) + R-COO⁻ + 3H₂O",
    reactionType: "precipitation",
    temperatureDelta: 18.0,
    colorChange: { from: "rgba(37, 99, 235, 0.6)", to: "rgba(185, 28, 28, 0.85)" },
    hasPrecipitate: true,
    precipitateColor: "rgba(220, 38, 38, 0.95)",
    isDangerous: false,
    dangerLevel: "safe",
    audioEffect: "none",
    explanation: "اختبار بندكت الكلاسيكي للكشف عن السكريات والألدهيدات. بتسخين الكاشف الأزرق مع المادة المختزلة، تُختزل أيونات النحاس الثنائي Cu²⁺ الزرقاء لتترسب كأكسيد النحاس الأحادي Cu₂O ذو اللون الأحمر الآجري المميز.",
    molecularExplanation: "تفاعل أكسدة واختزال عضوي حيوية بالجامعة: تتأكسد زمرة الألدهيد إلى كربوكسيلات بينما يُختزل النحاس الثنائي الداكن لأكسيد نحاس أحادي صلب."
  },
  "k2cr2o7+ethanol+h2so4": {
    reactants: ["k2cr2o7", "ethanol", "h2so4"],
    products: ["Cr₂(SO₄)₃ (كبريتات الكروم الثلاثي الخضراء)", "CH₃CHO (أسيستالدهيد)", "H₂O"],
    equation: "K₂Cr₂O₇ + 3C₂H₅OH + 4H₂SO₄ → Cr₂(SO₄)₃ (Green) + 3CH₃CHO + K₂SO₄ + 7H₂O",
    reactionType: "exothermic",
    temperatureDelta: 28.0,
    colorChange: { from: "rgba(249, 115, 22, 0.8)", to: "rgba(22, 163, 74, 0.85)" },
    isDangerous: false,
    dangerLevel: "caution",
    audioEffect: "sizzle",
    explanation: "أكسدة الكحولات الشهيرة في الكيمياء العضوية الجامعية! تتأكسد كحولات الإيثانول بواسطة ثنائي كرومات البوتاسيوم البرتقالية المحمضة بحمض الكبريتيك، حيث يتغير لون المحلول ببراعة من البرتقالي الزاهي إلى الأخضر الزيتي الجميل بفضل تكون أيونات الكروم الثلاثي Cr³⁺.",
    molecularExplanation: "Cr₂O₇²⁻ (Orange) + 8H⁺ + 3CH₃CH₂OH → 2Cr³⁺ (Green) + 3CH₃CHO + 7H₂O. تغير حالة أكسدة الكروم من +6 إلى +3 يرافقه تحول طيفي لون حاد."
  },
  "lucas+ethanol": {
    reactants: ["lucas", "ethanol"],
    products: ["C₂H₅Cl (كلوريد الإيثيل الطافي)", "تعكر المحلول وزيادة اللزوجة"],
    equation: "R-OH + HCl (ZnCl₂) → R-Cl ↓ + H₂O",
    reactionType: "precipitation",
    temperatureDelta: 5.0,
    colorChange: { from: "transparent", to: "rgba(241, 245, 249, 0.7)" },
    hasPrecipitate: true,
    precipitateColor: "rgba(255, 255, 255, 0.85)",
    isDangerous: false,
    dangerLevel: "caution",
    explanation: "اختبار لوكاس الجامعي للتمييز بين رتب الكحولات العضوية. يتفاعل كاشف لوكاس (ZnCl₂/HCl) مع الكحول ليستبدل زمرة الهيدروكسيل بحديث الكلوريد، متسبباً في ظهور تعكر وثقل زيتي أبيض خفيف بالمحلول.",
    molecularExplanation: "استبدال نيوكليوفيلي SN1 / SN2: يقوم حمض لوكاس بتحفيز خروج مجموعة الهيدروكسيل وتكوين ألكيل كلوريد غير ذائب بالماء يظهر كتعكر حليبي."
  },
  "salicylic_acid+ch3cooh": {
    reactants: ["salicylic_acid", "ch3cooh"],
    products: ["C₉H₈O₄ (حمض أستيل الساليسليك - الأسبرين)", "H₂O (ماء)"],
    equation: "C₇H₆O₃ (Salicylic Acid) + CH₃COOH → C₉H₈O₄ (Aspirin) + H₂O",
    reactionType: "other",
    temperatureDelta: 8.0,
    colorChange: { from: "transparent", to: "rgba(255, 255, 255, 0.5)" },
    hasPrecipitate: true,
    precipitateColor: "rgba(255, 255, 255, 0.95)",
    isDangerous: false,
    dangerLevel: "safe",
    explanation: "تخليق الأسبرين الدوائي الفاخر في معمل العضوية الجامعي! يتفاعل حمض الساليسليك مع حمض الأسيتيك لتتم أسترة زمرة الهيدروكسيل الفينولية وتشكل بلورات دواء الأسبرين (Aspirin) الناصعة البياض.",
    molecularExplanation: "تفاعل أسترة عضوي: تهاجم زمرة -OH الفينولية كربون الكربونيل في الحمض لتطرد جزيء ماء وتنشئ رابطة استر مستقرة تنفصل كبلورات صلبة."
  },
  "hf+caco3": {
    reactants: ["hf", "caco3"],
    products: ["CaF₂ ↓ (فلوريد الكالسيوم الصلب)", "H₂O", "CO₂ ↑ (غاز)"],
    equation: "CaCO₃ + 2HF → CaF₂ ↓ + H₂O + CO₂ ↑",
    reactionType: "dangerous",
    temperatureDelta: 32.0,
    colorChange: { from: "transparent", to: "rgba(236, 253, 245, 0.5)" },
    hasGas: true,
    gasType: "ثاني أكسيد الكربون مع حفر تآكلي",
    bubblingRate: "rapid",
    isDangerous: true,
    dangerLevel: "extreme",
    audioEffect: "fizz",
    safetyWarning: "حمض الهيدروفلوريك شديد الخطورة والتآكل! يذيب السليكون والرخام ويحفر الزجاج والعظام. يتطلب أدوات بلاستيكية خشنة خاصة وقوانين سلامة جامعية صرمة.",
    explanation: "تفاعل حفر تآكلي قوي. يحفر حمض الهيدروفلوريك الكربونات والزجاج بسرعة هائلة لينتج فلوريد الكالسيوم الشديد الصلابة مع انبعاث غازي وحرارة حارقة.",
    molecularExplanation: "الألفة الخارقة بين أيونات الفلوريد Ca²⁺ و F⁻ تخلق ملح الفلوريت CaF₂ غير الذائب إطلاقاً بطاقة شبكية بلورية استثنائية."
  },
  "ki+pb_no3_2": {
    reactants: ["ki", "pb_no3_2"],
    products: ["PbI₂ ↓ (يوديد الرصاص الصلب الأصفر)", "KNO₃ (محلول نترات البوتاسيوم)"],
    equation: "Pb(NO₃)₂ + 2KI → PbI₂ ↓ + 2KNO₃",
    reactionType: "precipitation",
    temperatureDelta: 0.8,
    colorChange: { from: "transparent", to: "rgba(234, 179, 8, 0.75)" },
    hasPrecipitate: true,
    precipitateColor: "rgba(234, 179, 8, 0.95)",
    isDangerous: false,
    dangerLevel: "caution",
    safetyWarning: "توليد راسب معدني ثقيل! أملاح الرصاص الذائبة تمثل مركبات سامة ومؤذية للجهاز العصبي. لا يلمس الراسب بالأيدي ويجب التخلص منه بطرق فرز آمنة ومدروسة كيميائياً.",
    audioEffect: "none",
    explanation: "وهو تجسيد كيميائي خلاب يدعى تفاعل 'المطر الذهبي'. تصطدم أيونات اليوديد من جهة مع الرصاص الثنائي من جهة فيستقران بالجاذبية الكيميائية على شكل يوديد الرصاص PbI₂ شحيح الذوبان جداً بالماء، متشكلاً بصفوف ورقات صفراء براقة تهبط كالذهب المتساقط بالدورق.",
    molecularExplanation: "Pb²⁺ (aq) + 2 I⁻ (aq) → PbI₂ (s). تتفوق قوى التجاذب والشبكة الأيونية يوديد الرصاص على حيوية قوى الإماهة والترابط بالماء، مسببة تبلوره وتكتله هابطاً للقاع."
  },
  "h2o2+ki": {
    reactants: ["h2o2", "ki"],
    products: ["H₂O (الماء المقطر)", "O₂ ↑ (غاز الأكسجين الصاعد)", "I₂ (اليود المتحرر الملون)"],
    equation: "2H₂O₂ (aq) + KI (cat.) → 2H₂O (l) + O₂ (g) ↑ + حرارة طاردة",
    reactionType: "gas-release",
    temperatureDelta: 41.5,
    colorChange: { from: "transparent", to: "rgba(180, 83, 9, 0.5)" },
    hasGas: true,
    gasType: "الأكسجين",
    bubblingRate: "rapid",
    isDangerous: false,
    dangerLevel: "caution",
    audioEffect: "fizz",
    explanation: "تفاعل تحلل بيروكسيد الهيدروجين بمساعدة عامل حافز (الشهير دراسياً بمعجون أسنان الفيل). يتبرع يوديد البوتاسيوم كعامل محفز مفرط ليسرّع انحلال ماء الأكسجين لماء وأكسجين بمليون ضعف، معطياً فقاعات أكسجين نشطة وحرارة طاردة متصاعدة.",
    molecularExplanation: "يتداخل اليوديد مؤقتاً لتشكيل وسيط IO⁻ النشط الذي يزول بتفككه مع جزيء بيروكسيد ثانٍ محرراً الأكسجين O₂ الغازي ومستعيداً أيون اليوديد I⁻ بالبيئة ثانياً ليدور بأمان دون استهلاك."
  },
  "hcl+mg_ribbon": {
    reactants: ["hcl", "mg_ribbon"],
    products: ["MgCl₂ (كلوريد المغنيسيوم)", "H₂ ↑ (غاز الهيدروجين)"],
    equation: "Mg + 2HCl → MgCl₂ + H₂ ↑",
    reactionType: "gas-release",
    temperatureDelta: 28.0,
    colorChange: { from: "transparent", to: "rgba(241, 145, 149, 0.3)" },
    hasGas: true,
    gasType: "الهيدروجين",
    bubblingRate: "rapid",
    isDangerous: false,
    dangerLevel: "caution",
    audioEffect: "fizz",
    explanation: "تفاعل إزاحة أحادي بين فلز نشط وحمض قوي. يذوب المغنيسيوم الصلب عند تعرضه للهيدروكلوريك، مختزلاً بروتونات الحمض ومحولاً إياها لفقاعات غاز الهيدروجين ومحافظاً على المغنيسيوم بكلوريد المغنيسيوم الذائب ذي تلون ملحي.",
    molecularExplanation: "Mg (s) + 2 H⁺ (aq) → Mg²⁺ (aq) + H₂ (g). تنقل ذرات المغنيسيوم إلكترونات المدارات الخارجية لأيونات الهيدروجين، مسببة اندماج الغاز H₂ الصاعد بقوة لسطح وعاء التجربة."
  },
  "naclo+nh3": {
    reactants: ["naclo", "nh3"],
    products: ["NH₂Cl (غاز الكلورامين السام)", "NaOH (الصودا الكاوية ببهوت)"],
    equation: "NaClO + NH₃ → NH₂Cl ↑ + NaOH",
    reactionType: "dangerous",
    temperatureDelta: 12.0,
    colorChange: { from: "transparent", to: "rgba(163, 230, 53, 0.2)" },
    hasGas: true,
    gasType: "الكلورامين السام",
    bubblingRate: "slow",
    isDangerous: true,
    dangerLevel: "hazard",
    audioEffect: "cabinet_shake",
    safetyWarning: "تحذير قصوى وعالي الخطورة! دمج المنظفات المنزلية ومبيضات الكلور (NaClO) مع محاليل الأمونيا والمطهرات المنزلية ينتج فوراً غاز أحادي كلورامين شديد السمية والمضر جداً للرئتين والجهاز التنفسي ويسبب الوفاة كيميائياً.",
    explanation: "تفاعل استبدال خطير يمثل أحد أهم توعية الأمان بالبيئة المنزلية. يتبادلNaClO مع NH₃ النيتروجين، مشكلين غاز الكلورامين NH₂Cl الخانق العابر السام الذي يتطاير بأبخرة كيميائية قاسية.",
    molecularExplanation: "يقوم هيبوكلوريت بنزع ذرة هيدروجين من الأمونيا وتلبيسها بالكلور، مما ينتج الغاز المتطاير القادر على الدخول والتفاعل مع رطوبة نسيج القصبة الرئوية للطلاب والحيوانات."
  }
};

export const EXPERIMENT_LESSONS: ExperimentLesson[] = [
  {
    id: "lesson_neutralization",
    title: "موازنة الحموضة والقلوية",
    subtitle: "تفاعل التعادل الكيميائي",
    difficulty: "beginner",
    category: "الأحماض والقواعد",
    objectives: [
      "مراقبة التحول اللوني الرائع لمؤشر الرقم الهيدروجيني (pH)",
      "خلط حمض الهيدروكلوريك HCl مع هيدروكسيد الصوديوم NaOH لإنتاج الماء والملح",
      "قياس وتوثيق البصمة الحرارية الطاردة لتعادل الأحماض"
    ],
    targetReactants: ["hcl", "naoh", "phenolphthalein"],
    steps: [
      {
        number: 1,
        instruction: "صب كاشف الفينول فثالين أولاً إلى الدورق الكيميائي لمراقبة حالة السوائل وتغير لونها.",
        targetAction: "select"
      },
      {
        number: 2,
        instruction: "اسكب حمض الهيدروكلوريك (HCl - الحمض) وهيدروكسيد الصوديوم (NaOH - القاعدة) معاً في دورق الخلط النشط.",
        targetAction: "mix"
      },
      {
        number: 3,
        instruction: "شاهد مؤشر درجات الحرارة وتلاشي اللون الفوشيا بالتدريج ليختتم المحلول بالصفاء التام فور بلوغ التعادل!",
        targetAction: "analyze"
      }
    ],
    congratulationText: "تفاعل معايرة كيميائي ممتاز وناجح! قمت بدمج الأحماض والقواعد بنسب متكافئة وحققت الاتزان الهيدروجيني المثالي pH=7 مع مشاهدة تحرر الحرارة وتولد الماء والملح.",
    badgeId: "badge_neutralizer",
    quiz: [
      {
        id: "q_neut_1",
        question: "ما هي المنتجات الأساسية المتولدة عند تفاعل حمض الهيدروكلوريك HCl مع هيدروكسيد الصوديوم NaOH؟",
        options: [
          "غاز الكلور السام ومعدن الصوديوم",
          "ملح كلوريد الصوديوم والماء المتعادل",
          "غاز الهيدروجين والملح الجاف",
          "بيروكسيد الهيدروجين المركز"
        ],
        correctAnswerIndex: 1,
        explanation: "يتفاعل حمض قوي وقاعدة قوية كالتالي: HCl + NaOH → NaCl + H₂O ليعطيا ملح طعام عادي وماء متعادل."
      },
      {
        id: "q_neut_2",
        question: "ما الفائدة الأساسية من إضافة كاشف الفينول فثالين في هذه التجربة؟",
        options: [
          "توليد فقاعات غازية عند تفريغ الأوعية",
          "تخفيض درجة حرارة السائل الميكانيكي",
          "يتحول للون الفوشيا الوردي الزاهي في الوسط القاعدي ويصبح شفافاً في الوسطين الحمضي والمتعادل",
          "يتحول للأزرق الداكن فقط مع المحاليل عالية الحموضة"
        ],
        correctAnswerIndex: 2,
        explanation: "الفينول فثالين هو كاشف كيميائي عضوي يعطي لوناً وردياً خلاباً بزيادة القلويات (أعلى من pH 8.2)، ويفقد تلوينه مباشرة عند تحوله للحياد أو الحمضية."
      }
    ]
  },
  {
    id: "lesson_golden_rain",
    title: "راسب المطر الذهبي البراق",
    subtitle: "تفاعلات الإحلال المزدوج والذوبانية",
    difficulty: "intermediate",
    category: "الذوبانية والأملاح",
    objectives: [
      "فهم ديناميكية تفاعلات التبادل الثنائي للأيونات الذائبة",
      "مشاهدة ارتباط كاتيونات الرصاص مع أنيونات اليوديد بالمحلول",
      "رؤية وتوثيق الراسب الكريستالي الذهبي المدهش PbI₂ وتساقطه البطيء"
    ],
    targetReactants: ["ki", "pb_no3_2"],
    steps: [
      {
        number: 1,
        instruction: "جهّز الدورق لعملية الترسيب عبر صب محلول يوديد البوتاسيوم (KI) أولاً.",
        targetAction: "select"
      },
      {
        number: 2,
        instruction: "اسكب محلول نترات الرصاص الثنائي Pb(NO₃)₂ في نفس الدورق لتشويش الأيونات متفائلاً بالنتيجة.",
        targetAction: "mix"
      },
      {
        number: 3,
        instruction: "راقب وراجع تكون سحابة بلورية صفراء ذهبية فاقعة تمثل الرواسب الذائبة ليوديد الرصاص وهبوطها التدريجي.",
        targetAction: "analyze"
      }
    ],
    congratulationText: "تجارب ترسيب مبهرة ورائعة للغاية! قمت بتوليد بلورات يوديد الرصاص اللامعة، والتي تأخذ مظهر رقاقات ذهبية متساقطة بسبب انخفاض مستويات قابليتها للذوبان الكيميائي بالماء.",
    badgeId: "badge_gold_maker",
    quiz: [
      {
        id: "q_gold_1",
        question: "ما هي الطبيعة الفيزيائية التي تعرّف تفاعل 'الترسيب الكيميائي'؟",
        options: [
          "الغليان السريع المصحوب بتصاعد كتلي للبخار",
          "تشكل مادة صلبة غير قابلة للذوبان تستقر في قاع السائل نتيجة دمج محلولين شفافين مسبقاً",
          "توليد حريق عنيف ولهب فوري بالدورق",
          "حدوث وميض ذري نووي وانفجار"
        ],
        correctAnswerIndex: 1,
        explanation: "يحدث الترسيب عندما ترتبط الأيونات الذائبة ببعضها البعض بقوة لتكون مركباً غير قابل للذوبان بالماء يتشكل ككتلة صلبة معلقة تستقر أسفل الوعاء."
      },
      {
        id: "q_gold_2",
        question: "ملح نترات الرصاص الثنائي يُستخدم بأمان في هذا المحاكي الرقمي. ما سبب خطورته الكبيرة في المختبرات الواقعية؟",
        options: [
          "يعمل كعامل تجميد قارس يسبب تلف الأصابع",
          "يمثل مادة ذات نشاط إشعاعي عالي للغاية",
          "الرصاص معدن ثقيل سام يتراكم في العظام ويدمر الخلايا العصبية والدماغ",
          "يتحول لسكر طعام حلو سريع الذوبان"
        ],
        correctAnswerIndex: 2,
        explanation: "الرصاص معدن ثقيل يحل محل الكالسيوم بجسم الإنسان ويهاجم الأنسجة العصبية والدموية مما يسبب تسمماً مزيجاً مزمناً ولهذا فإن التجارب الرقمية كالأفاتار تحفظ سلامة الطلاب."
      }
    ]
  },
  {
    id: "lesson_elephants",
    title: "تفكك معجون أسنان الفيل",
    subtitle: "سرعة التفاعل الكيميائي ومفعول الحفاز",
    difficulty: "intermediate",
    category: "التحلل والتفكك",
    objectives: [
      "فهم دور العوامل المساعدة في خفض طاقة التنشيط وسرعة التفاعل",
      "تفكيك ماء الأكسجين H₂O₂ لماء وغاز الأكسجين النقي بسرعة هائلة",
      "استشعار الحرارة الكبيرة المتصاعدة بفضل تسارع التحلل الطارد للحرارة"
    ],
    targetReactants: ["h2o2", "ki"],
    steps: [
      {
        number: 1,
        instruction: "أضف بيروكسيد الهيدروجين (H₂O₂ - ماء الأكسجين) لتأسيس التفاعلات بالدورق.",
        targetAction: "select"
      },
      {
        number: 2,
        instruction: "اسكب محلول يوديد البوتاسيوم (KI) الذي سيعمل كعامل حافز مسرّع.",
        targetAction: "mix"
      },
      {
        number: 3,
        instruction: "شاهد الفوران الهائل والفقاعات السريعة المتصاعدة مع بخار ماء حار واندفاع رغوي كالأعمدة الكثيفة!",
        targetAction: "analyze"
      }
    ],
    congratulationText: "تفاعل تحفيزي ممتع وبصري ناجح! عملت أيونات اليوديد على تسريع تفكك ماء الأكسجين بما يفوق مليون ضعف، لينتج غاز الأكسجين الصاعد وحرارة ضخمة في ثوان معدودة.",
    badgeId: "badge_catalyst_guru",
    quiz: [
      {
        id: "q_eleph_1",
        question: "ما هو الدور الرئيسي ليوديد البوتاسيوم (KI) في هذه التجربة الرغوية؟",
        options: [
          "تخفيض درجات الحرارة وتجميد الغازات الصاعدة",
          "العمل كعامل مساعد وحافز يسرع التفاعل بشكل هائل دون أن يُستهلك كيميائياً في نهايته",
          "توفير الرائحة العطرية الوردية لفقاعات الصابون",
          "تقليص الحجم الإجمالي للمياه وتحويل السوائل لغازات"
        ],
        correctAnswerIndex: 1,
        explanation: "مادة KI هي عامل حافز (Catalyst)، تشارك بمركبات وسيطة لتبسيط طاقة التنشيط وتسريد التحلل الهيدروجيني ثم تخرج كما دخلت سليمة قابلة للعمل مجدداً."
      },
      {
        id: "q_eleph_2",
        question: "ما هو الغاز المنبعث والصاعد بكثافة أثناء تحلل بيروكسيد الهيدروجين الفجائي؟",
        options: [
          "غاز ثاني أكسيد الكربون",
          "غاز الكلور السام والأصفر",
          "غاز الأكسجين النقي",
          "غاز أكسيد النيتروز (غاز الضحك)"
        ],
        correctAnswerIndex: 2,
        explanation: "يتفكك كالتالي: 2 H₂O₂ → 2 H₂O + O₂ منتجاً ماءً وسجلاً متصاعداً من غاز الأكسجين O₂ الذي يحتبس في السوائل والمنظفات بفقاعات صاعدة."
      }
    ]
  },
  {
    id: "lesson_dangerous_mix",
    title: "مخاطر مزج المبيض بالمنظفات",
    subtitle: "أمن وسلامة المختبرات المنزلية والأكاديمية",
    difficulty: "advanced",
    category: "الأمن والسلامة",
    objectives: [
      "فهم مخاطر دمج المنتجات والمطهرات المنزلية العشوائي",
      "معاينة تفاعل مبيّض الكلور الغسيل مع منظفات ومحاليل الأمونيا المطهّرة",
      "فهم خطورة غاز الكلورامين السام على الجهاز التنفسي والبروتوكول الطارئ"
    ],
    targetReactants: ["naclo", "nh3"],
    steps: [
      {
        number: 1,
        instruction: "صب مبيض الغسيل المنزلي هيبوكلوريت الصوديوم (NaClO) في الدورق الهامشي للتجربة.",
        targetAction: "select"
      },
      {
        number: 2,
        instruction: "اسكب محلول الأمونيا (NH₃) المنظف لمشاهدة تفاعل الخطر ونتائجه التحررية.",
        targetAction: "mix"
      },
      {
        number: 3,
        instruction: "اقرأ شاشة التوعية من المخاطر بدقة متيقظاً للأسباب وأجب عن أسئلة تقييم خط السلامة.",
        targetAction: "analyze"
      }
    ],
    congratulationText: "ممتاز لقيامك بإنهاء هذه الوحدة الحيوية والمهمة للأمن والسلامة البيئية والمنزلية. التحذير والوعي لعدم دمج مبيضات الكلور مع محاليل الأمونيا بالمنزل ينقذ الأرواح من الاختناقات السامة.",
    badgeId: "badge_safety_warden",
    quiz: [
      {
        id: "q_danger_1",
        question: "ما الغاز عالي السمية المتولد فور مزج هيبوكلوريت الصوديوم بالكلور مع المطهر بالأمونيا؟",
        options: [
          "غاز الكلورامين السام شديد الضرر بالصدر والأغشية (NH₂Cl)",
          "غاز هواء عادي حميد للتنفس",
          "بخار برائحة الكرز أو الفواكه الفواحة",
          "غاز غاز الهيليوم الآمن لملء البالونات"
        ],
        correctAnswerIndex: 0,
        explanation: "ينتج تفاعلNaClO مع NH₃ غاز الكلورامين السريع التبخر والسام، والذي يتفاعل مع رطوبة نسيج القصبة الرئوية للطلاب والحيوانات مسبباً الاختناق والالتهاب الوعائي."
      },
      {
        id: "q_danger_2",
        question: "ما التصرف الأمثل والطارئ فور تسرب غازات خانقة ومستثيرة داخل المختبر أو المنزل؟",
        options: [
          "الاستمرار في تنفس المحلول لإكمال التقييم",
          "إخلاء المكان فوراً والاتجاه للهواء الطلق المنعش وتحذير الأجرام وتفعيل كشاف الحريق والإتصال بالطوارئ",
          "رش ملح طعام بكميات كبيرة لكتم الغاز",
          "شرب المحلول الكيميائي مباشرة من Beaker"
        ],
        correctAnswerIndex: 1,
        explanation: "إخلاء المكان وتنبيه المتواجدين والانتقال لتهوية صريحة طبيعية وغسل خلايا الوجه بالماء البارد هي الخطوة المهنية الأولى المنقذة للسلامة والتوعية الطارئة بالحرائق."
      }
    ]
  }
];

export const CHEMISTRY_BADGES: Badge[] = [
  {
    id: "badge_neutralizer",
    title: "خبير التعادل الكيميائي",
    icon: "Activity",
    description: "نجحت في تفاعل تعادل الأحماض والقلويات القوية وبلوغ نقطة توازن الرقم الهيدروجيني pH=7 بدقة.",
    color: "bg-emerald-100 text-emerald-800 border-emerald-300"
  },
  {
    id: "badge_gold_maker",
    title: "خيميائي الفضة والذهب",
    icon: "Compass",
    description: "قمت بتركيب وتوليد معلق بلوري أصفر رائع مشابهاً للمطر الذهبي اللامع عبر يوديد الرصاص شحيح الذوبان.",
    color: "bg-yellow-100 text-yellow-800 border-yellow-300"
  },
  {
    id: "badge_catalyst_guru",
    title: "سيد العوامل الحافزة",
    icon: "Zap",
    description: "حققت تسارعاً فجائياً لتفاعلات التحلل لحيويات الأكسجين بفضل عامل يوديد البوتاسيوم المساعد.",
    color: "bg-rose-100 text-rose-800 border-rose-300"
  },
  {
    id: "badge_safety_warden",
    title: "حارس أمن وسلامة المختبر",
    icon: "ShieldAlert",
    description: "أتممت وحدات التوعية بمخاطر التآكل واستنشاق الغازات المتصاعدة وحررت كفاءة الوعي التحذيري.",
    color: "bg-purple-100 text-purple-800 border-purple-300"
  },
  {
    id: "badge_ai_explorer",
    title: "رائد كيمياء المستقبل بالذكاء الاصطناعي",
    icon: "Sparkles",
    description: "استعملت محاكي الذكاء الاصطناعي الذري للتجوال في تفاعلات ونظم تفكير كيميائي مستحدث ومحسوب.",
    color: "bg-blue-100 text-blue-800 border-blue-200"
  }
];
