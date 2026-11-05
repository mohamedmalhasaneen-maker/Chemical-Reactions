/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Lazily load the Gemini SDK to prevent crashes on startup if key is missing
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      throw new Error("GEMINI_API_KEY environment variable is not configured. Please add it to your Secrets or .env file.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Robust local chemistry simulation fallback if Gemini API models hit 503 or fail
function getLocalChemicalReactionFallback(reactants: any[]): any {
  const ids = reactants.map((r: any) => r.id.toLowerCase());
  
  // Grignard Reagent + Water
  if (ids.includes("grignard") && ids.includes("h2o")) {
    return {
      equation: "CH₃MgBr + H₂O -> CH₄↑ + Mg(OH)Br",
      products: ["CH₄", "Mg(OH)Br"],
      reactionType: "dangerous",
      temperatureDelta: 45,
      liquidColor: "rgba(224, 242, 254, 0.4)",
      hasPrecipitate: true,
      precipitateColor: "rgba(255, 255, 255, 0.8)",
      hasGas: true,
      gasType: "غاز الميثان CH₄ (سريع الاشتعال)",
      bubblingRate: "rapid",
      flameColor: "none",
      isDangerous: true,
      dangerLevel: "extreme",
      audioEffect: "fizz",
      safetyWarning: "احذر بشدة! كواشف غرينيار حساسة للرطوبة وتتفاعل بعنف فائق مع الماء لتُطلق غاز الميثان الهيدروكربوني سريع الاشتعال مصحوباً بحرارة مرتفعة.",
      explanation: "عند ملامسة كاشف غرينيار للماء، يسلك الجزء العضوي (مجموعة الميثيل النشطة ذات الشحنة السالبة الجزئية) كسلوك قاعدة قوية للغاية، وينتزع بروتون الهيدروجين من جزيء الماء منتجاً غاز الميثان الطائر ورواسب هيدروكسيد المغنيسيوم البرومي الصلب الأبيض الهادئ.",
      molecularExplanation: "الهجوم النكليوفيلي المباشر لكربانيون الميثيل (⁻CH₃) على الهيدروجين الحمضي للماء يؤدي لكسر سريع لرابطة O-H وتشكيل رابطة C-H مستقرة مع تحرر هائل للطاقة الحرارية العقدية."
    };
  }

  // Grignard Reagent + HCl
  if (ids.includes("grignard") && ids.includes("hcl")) {
    return {
      equation: "CH₃MgBr + HCl -> CH₄↑ + MgClBr",
      products: ["CH₄", "MgClBr"],
      reactionType: "dangerous",
      temperatureDelta: 65,
      liquidColor: "rgba(224, 242, 254, 0.3)",
      hasPrecipitate: false,
      precipitateColor: "transparent",
      hasGas: true,
      gasType: "غاز الميثان CH₄ (سريع الاشتعال)",
      bubblingRate: "explosive",
      flameColor: "yellow",
      isDangerous: true,
      dangerLevel: "extreme",
      audioEffect: "explosion",
      safetyWarning: "تفاعل فوق العادة العنيف والانفجاري! بروتونات الحمض القوي HCl تسبب التنشيط اللحظي لكربانيونات غرينيار منتجة اندفاعاً فجائياً لغاز الميثان مع انبعاث حراري حارق.",
      explanation: "تفاعل حمض الهيدروكلوريك القوي مع كاشف غرينيار يؤدي إلى تدمير الكاشف فورياً وبلحظة فائقة العنف، مغذياً إطلاق غاز الميثان وتكون ملح هاليد المغنيسيوم المشترك بالكامل.",
      molecularExplanation: "الألفة الشديدة والجاذبية بين أيون الهيدروجين الحر H⁺ والكربانيون السالب لكاشف غرينيار تتجاوز كل عتبات طاقة التنشيط، منتجة عاصفة تفاعل طاردة للحرارة بقوة تدمر الروابط العضوفلزية."
    };
  }

  // 1. HCl + NaOH
  if (ids.includes("hcl") && ids.includes("naoh")) {
    return {
      equation: "HCl + NaOH -> NaCl + H₂O",
      products: ["NaCl", "H₂O"],
      reactionType: "neutralization",
      temperatureDelta: 12,
      liquidColor: "rgba(255, 255, 255, 0.05)",
      hasPrecipitate: false,
      precipitateColor: "transparent",
      hasGas: false,
      gasType: "None",
      bubblingRate: "none",
      flameColor: "none",
      isDangerous: false,
      dangerLevel: "safe",
      audioEffect: "sizzle",
      safetyWarning: "محلول آمن ونموذجي. تفاعل تعادل طارد خفيف للحرارة وينشئ ملح الطعام والماء.",
      explanation: "عند خلط حمض الهيدروكلوريك HCl وهيدروكسيد الصوديوم NaOH، يتحد الكلور مع الصوديوم منتجاً ملح الطعام الذائب في مياه متعادلة التفاعل تماماً (pH = 7).",
      molecularExplanation: "تتحد أيونات الهيدروجين الموجبة لمركب الحمض مع هيدروكسيلات الصوديوم السالبة لتطلق رتبة مائية مستقرة كيميائياً مع تحرير يسير لصدمات حرارية."
    };
  }

  // 2. Lead Nitrate (pb_no3_2) + Potassium Iodide (ki)
  if (ids.includes("pb_no3_2") && ids.includes("ki")) {
    return {
      equation: "Pb(NO₃)₂ + 2KI -> PbI₂↓ + 2KNO₃",
      products: ["PbI₂", "KNO₃"],
      reactionType: "precipitation",
      temperatureDelta: 1,
      liquidColor: "rgba(254, 240, 138, 0.4)",
      hasPrecipitate: true,
      precipitateColor: "#facc15",
      hasGas: false,
      gasType: "None",
      bubblingRate: "none",
      flameColor: "none",
      isDangerous: true,
      dangerLevel: "hazard",
      audioEffect: "none",
      safetyWarning: "احرص على غسل اليدين جيداً. يحتوي المزيج على ملح رصاص ثقيل سام كلاسيكياً يفضل ارتداء القفازات معه.",
      explanation: "التقاء يوديد البوتاسيوم ونترات الرصاص يحرر ملح يوديد الرصاص المستقر في شبكة صلبة صفراء زاهية تسبح كالمطر الذهبي البراق المستقر بقاع الدورق الخلطي.",
      molecularExplanation: "تتقارب الأيونات المتعاكسة الشحنة ذات قنوات الجذب الكهربي العظمى (Pb²⁺ و I⁻) لتقوم بالتموضع البلوري والترسيب المكثف فورياً."
    };
  }

  // 3. Hydrogen peroxide (h2o2) + Potassium Iodide (ki) [or h2o2 + any catalyst]
  if (ids.includes("h2o2") && ids.includes("ki")) {
    return {
      equation: "2H₂O₂ --(KI)--> 2H₂O + O₂↑",
      products: ["H₂O", "O₂"],
      reactionType: "gas-release",
      temperatureDelta: 32,
      liquidColor: "rgba(239, 68, 68, 0.3)",
      hasPrecipitate: false,
      precipitateColor: "transparent",
      hasGas: true,
      gasType: "غاز الأكسجين O₂",
      bubblingRate: "rapid",
      flameColor: "none",
      isDangerous: true,
      dangerLevel: "caution",
      audioEffect: "fizz",
      safetyWarning: "تحرير غاز وسخونة متضاعفة. يُرجى استعمال دورق غازي متسع وتجنب ملامسة الرغوة الساخنة مباشرة لليدين.",
      explanation: "يقوم يوديد البوتاسيوم بدور العامل الحافز الذي يسرع هدم جزيئات فوق أكسيد الهيدروجين إلى عناصرها الأساسية لتتصاعد فقاعات ميكانيكية من غاز الأكسجين.",
      molecularExplanation: "يندفع اليوديد كمسرع ووسيط انتقالي ليخفض طاقة تنشيط الروابط البيروكسيدية الهشة وتأمين حرية تامة لربط ذرات الأكسجين ببعضها البعض."
    };
  }

  // 4. Bleach (naclo) + Ammonia (nh3)
  if (ids.includes("naclo") && ids.includes("nh3")) {
    return {
      equation: "NaOCl + NH₃ -> NH₂Cl + NaOH",
      products: ["NH₂Cl", "NaOH"],
      reactionType: "dangerous",
      temperatureDelta: 6,
      liquidColor: "rgba(220, 252, 231, 0.2)",
      hasPrecipitate: false,
      precipitateColor: "transparent",
      hasGas: true,
      gasType: "غاز الكلورامين السام NH₂Cl",
      bubblingRate: "slow",
      flameColor: "none",
      isDangerous: true,
      dangerLevel: "extreme",
      audioEffect: "cabinet_shake",
      safetyWarning: "خطر فوري بالغ! مزيج يطلق سحباً من مركبات الكلور الخانقة الممنوع استنشاقها تماماً بمحيط العمل والمنزل.",
      explanation: "يتفاعل الكلور الفعال المتواجد في مبيض الأقمشة مع غاز النشادر بالأمونيا لينطلق مركب الكلورامين السام والخانق في الهواء مباشرة كبخار كثيف ومحسوس.",
      molecularExplanation: "يتم استبدال هيدروجين الأمونيا بذرة كلور حرة بفعل الأكسدة القوية الناتجة لتوليد الغاز المهيج للأنسجة المخاطية للرئتين."
    };
  }

  // 5. Sodium Metal (na_metal) + Water (h2o)
  if (ids.includes("na_metal") && ids.includes("h2o")) {
    return {
      equation: "2Na + 2H₂O -> 2NaOH + H₂↑",
      products: ["NaOH", "H₂"],
      reactionType: "exothermic",
      temperatureDelta: 55,
      liquidColor: "rgba(239, 68, 68, 0.4)",
      hasPrecipitate: false,
      precipitateColor: "transparent",
      hasGas: true,
      gasType: "غاز الهيدروجين H₂",
      bubblingRate: "explosive",
      flameColor: "yellow",
      isDangerous: true,
      dangerLevel: "extreme",
      audioEffect: "explosion",
      safetyWarning: "خطر تفجيري واندلاع لهب أصفر ساطع فوري لقاعدية وبتروميتال الصوديوم النشط. يتطلب حماية قصوى ودرع زجاجي صامد.",
      explanation: "يتبرع فلز الصوديوم بإلكترونه الخارجي بعنف إلى جزيء الماء منتجاً كمية فائقة من غاز الهيدروجين الذي يشتعل تلقائياً بلهب لامع جذاب.",
      molecularExplanation: "انتقال بروتوني فوري ومتفجر محاط بجهد أكسدة سالب وقوي لفلز المجموعات القلوية النشطة."
    };
  }

  // 6. Zinc (zn_granules) or Iron (fe_powder) or Mg + HCl
  if ((ids.includes("zn_granules") || ids.includes("fe_powder") || ids.includes("mg_ribbon")) && ids.includes("hcl")) {
    const metalName = ids.includes("zn_granules") ? "الزنك" : ids.includes("fe_powder") ? "الحديد" : "المغنيسيوم";
    const metalFormula = ids.includes("zn_granules") ? "Zn" : ids.includes("fe_powder") ? "Fe" : "Mg";
    const productFormula = ids.includes("zn_granules") ? "ZnCl₂" : ids.includes("fe_powder") ? "FeCl₂" : "MgCl₂";
    return {
      equation: `${metalFormula} + 2HCl -> ${productFormula} + H₂↑`,
      products: [productFormula, "H₂"],
      reactionType: "gas-release",
      temperatureDelta: 18,
      liquidColor: "rgba(226, 232, 240, 0.3)",
      hasPrecipitate: false,
      precipitateColor: "transparent",
      hasGas: true,
      gasType: "غاز الهيدروجين H₂",
      bubblingRate: "rapid",
      flameColor: "none",
      isDangerous: false,
      dangerLevel: "caution",
      audioEffect: "pop",
      safetyWarning: "ينطلق غاز الهيدروجين القابل للاستشعال والفرقعة البسيطة. لا تقرب اللهب أو مصادر الشرر من الكأس.",
      explanation: `يتفاعل حمض الهيدروكلوريك مع معدن ${metalName} النشط حيث يحل المعدن محل هيدروجين الحمض منتجاً كلوريد المعدن الذائب وتصاعد فوري لفقاعات غاز الهيدروجين النقي.`,
      molecularExplanation: "يحدث تفاعل أكسدة واختزال بروتوني حيث يفقد المعدن إلكترونات التكافؤ لتستقبلها أيونات الهيدروجين لتتحول إلى جزيئات غاز الهيدروجين الثنائية الذرة."
    };
  }

  // Generic passive / no reaction
  const reactantNames = reactants.map((r: any) => r.name).join(" + ");
  const formulasCombined = reactants.map((r: any) => r.formula).join(" + ");
  return {
    equation: `${formulasCombined} -> خليط متجانس / غير متفاعل في هذه الظروف`,
    products: reactants.map((r: any) => r.formula),
    reactionType: "other",
    temperatureDelta: 0,
    liquidColor: reactants[0]?.liquidColor || "rgba(241, 245, 249, 0.4)",
    hasPrecipitate: false,
    precipitateColor: "transparent",
    hasGas: false,
    gasType: "None",
    bubblingRate: "none",
    flameColor: "none",
    isDangerous: false,
    dangerLevel: "safe",
    audioEffect: "none",
    safetyWarning: "مزيج مستقر وهادئ بدرجة حرارة الغرفة (25°م). لا توجد إرشادات استثنائية.",
    explanation: `تم خلط المواد بنجاح: (${reactantNames}). لا يُظهر هذا التركيب الكيميائي المختار تفاعلاً بصرياً ساطعاً أو انبعاثاً حرارياً جلياً بشكل فوري، وتبقى الجسيمات تائهة ومتعايشة بسلام داخل الوسط السائل.`,
    molecularExplanation: "تظل الأيونات والجزيئات في حالة حركة عشوائية مستمرة وتصادمات مرنة مستقرة، دون عبور حاجز طاقة التنشيط المطلوب لبناء روابط بديلة كيميائياً."
  };
}

// Robust helper function to execute generateContent with retry limits and automatic fallback to gemini-3.1-flash-lite & custom engine
async function generateGeminiContentWithFallback(
  ai: GoogleGenAI,
  promptMsg: string,
  systemPrompt: string,
  schema: any,
  reactantsSelected: any[]
): Promise<any> {
  const models = ["gemini-3.8-flash", "gemini-flash-latest", "gemini-3.1-flash-lite"];
  let lastError: any = null;

  for (const model of models) {
    const maxAttempts = model === "gemini-3.8-flash" ? 2 : 1;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        console.log(`[Gemini API] Trying model "${model}" - Attempt ${attempt}/${maxAttempts}`);
        const response = await ai.models.generateContent({
          model: model,
          contents: promptMsg,
          config: {
            systemInstruction: systemPrompt,
            responseMimeType: "application/json",
            responseSchema: schema,
          },
        });
        
        if (response && response.text) {
          console.log(`[Gemini API] Successfully generated response using model "${model}" on attempt ${attempt}`);
          return response;
        }
        
        throw new Error("Empty response received from Gemini API");
      } catch (error: any) {
        lastError = error;
        console.error(`[Gemini API] Error using model "${model}" on attempt ${attempt}:`, error.message || error);
        
        // Don't wait on the very last attempt overall
        if (model === models[models.length - 1] && attempt === maxAttempts) {
          break;
        }
        
        // Exponential backoff sleep: 1000ms, 2000ms, etc.
        const delay = Math.pow(2, attempt) * 400;
        console.log(`[Gemini API] Waiting ${delay}ms before next attempt...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }
  
  // LOGICAL LOCAL SHIM FALLBACK IF ALL MODELS FAIL WITH 503
  console.log("[Gemini API] All models exhausted or hit 503. Initiating resilient chemical reaction engine local fallback.");
  try {
    const localShim = getLocalChemicalReactionFallback(reactantsSelected);
    return {
      text: JSON.stringify(localShim)
    };
  } catch (fallbackError) {
    console.error("[Gemini API] Fallback engine also encountered error:", fallbackError);
    throw lastError;
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Endpoint to check system status
  app.get("/api/health", (req, res) => {
    res.json({
      status: "online",
      time: new Date().toISOString(),
      hasGeminiKey: !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY"
    });
  });

  // API Endpoint to predict reaction outcomes with AI
  app.post("/api/reaction/predict", async (req, res) => {
    try {
      const { reactantsSelected } = req.body; // Reactant objects list: { name: string, formula: string, id: string }[]
      
      if (!reactantsSelected || !Array.isArray(reactantsSelected) || reactantsSelected.length === 0) {
        return res.status(400).json({ error: "At least one reactant must be selected." });
      }

      const reactantsListStr = reactantsSelected.map((r: any) => `${r.name} (${r.formula})`).join(", ");

      const ai = getAiClient();

      const systemPrompt = `You are a Senior Chemistry Professor and Virtual Laboratory Simulator. 
Analyze the requested chemical mixture and predict the reaction outcome.
You MUST output your result STRICTLY in a valid JSON object matching the provided schema. 

IMPORTANT: Since the application has been translated to Arabic, you MUST explain the science and return text descriptions (explanation, molecularExplanation, safetyWarning) in elegant, scientific Arabic (باللغة العربية).

Rules for physical attributes:
- temperatureDelta: Return values in Celsius (exothermic reacts should be positive e.g., +15, endothermic should be negative e.g., -5, slow or inert should be 0).
- reactionType: Categorize as one of: "neutralization", "precipitation", "gas-release", "exothermic", "displacement", "dangerous", "other".
- liquidColor: Represent the visual color outcome of the mixture inside the beaker (e.g., "rgba(239, 68, 68, 0.4)" or transparent).
- hasPrecipitate: boolean if an insoluble solid is formed.
- precipitateColor: transparent or hex/rgba if formed.
- hasGas: boolean.
- gasType: name of the gas released in Arabic (e.g. "غاز الهيدروجين"), or "None".
- bubblingRate: "none", "slow", "rapid", "explosive".
- flameColor: "none" or visual color (e.g., "blue", "yellow", "green" for metals/combustions).
- isDangerous: boolean if the reaction is toxic, explosive, releases chloramines, splashes acid, or is otherwise dangerous.
- dangerLevel: "safe", "caution", "hazard", "extreme". Keep simple chemicals "safe".
- audioEffect: best acoustic match: "fizz", "sizzle", "pop", "cabinet_shake", "explosion", or "none".
- explanation: Clear, student-friendly explanation of why it occurred and the science, written in Arabic (باللغة العربية).
- molecularExplanation: What is happening at the atomic/molecular/ionic level, written in Arabic (باللغة العربية).`;

      const promptMsg = `Predict the chemical reaction when mixing the following substances in a laboratory beaker:
Reactants: ${reactantsListStr}

Consider factors like temperature spikes, color shifts, precipitate formation, gas discharge, flammability, safety levels, and general behavior. Provide chemical balanced equations.`;

      const schema = {
        type: Type.OBJECT,
        properties: {
          equation: {
            type: Type.STRING,
            description: "The balanced chemical equation of the primary reaction. E.g., 'A + B -> C + D' or indicate 'No Reaction' if completely inert."
          },
          products: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Array of chemical products generated by the reaction, with their formulas."
          },
          reactionType: {
            type: Type.STRING,
            description: "Type of reaction. Must be 'neutralization', 'precipitation', 'gas-release', 'exothermic', 'displacement', 'dangerous', or 'other'."
          },
          temperatureDelta: {
            type: Type.NUMBER,
            description: "Temperature change in °C relative to room temperature. Exothermic (+x), Endothermic (-x), inert (0)."
          },
          liquidColor: {
            type: Type.STRING,
            description: "Color of the chemical solution in RGBA, HEX, or Tailwind style string suitable for a transparent liquid. E.g., 'rgba(56, 189, 248, 0.4)' or 'transparent'."
          },
          hasPrecipitate: {
            type: Type.BOOLEAN,
            description: "True if a solid precipitate settles at the bottom of the solution."
          },
          precipitateColor: {
            type: Type.STRING,
            description: "Color of the precipitate solid particles in RGBA, HEX or transparent."
          },
          hasGas: {
            type: Type.BOOLEAN,
            description: "True if bubbles of gas are evolved."
          },
          gasType: {
            type: Type.STRING,
            description: "The name/chemical formula of the generated gas, or 'None'."
          },
          bubblingRate: {
            type: Type.STRING,
            description: "Rate of bubbles. Must be 'none', 'slow', 'rapid', or 'explosive'."
          },
          flameColor: {
            type: Type.STRING,
            description: "Color of spontaneous flame or sparks. Must be 'none', 'blue', 'green', 'yellow', 'purple', or 'red'."
          },
          isDangerous: {
            type: Type.BOOLEAN,
            description: "Indicator if the interaction poses any toxic, corrosiveness, or ignition threats."
          },
          dangerLevel: {
            type: Type.STRING,
            description: "Severity of danger. Must be 'safe', 'caution', 'hazard', or 'extreme'."
          },
          safetyWarning: {
            type: Type.STRING,
            description: "Clear hazard warning instructions or safety precautions written in Arabic (باللغة العربية). E.g., ارتداء نظارات السلامة, العمل في خزانة الغازات, or 'محلول آمن ونموذجي'."
          },
          audioEffect: {
            type: Type.STRING,
            description: "Audio sound mapping. Must be 'fizz', 'sizzle', 'pop', 'cabinet_shake', 'explosion', or 'none'."
          },
          explanation: {
            type: Type.STRING,
            description: "Comprehensive scientific explanation in Arabic (باللغة العربية), in clear, engaging, easy-to-understand educational terms."
          },
          molecularExplanation: {
            type: Type.STRING,
            description: "What takes place at the molecular, ionic, or electronic levels, written in Arabic (باللغة العربية) (e.g. transfers, collisions)."
          }
        },
        required: [
          "equation",
          "products",
          "reactionType",
          "temperatureDelta",
          "liquidColor",
          "hasPrecipitate",
          "hasGas",
          "isDangerous",
          "dangerLevel",
          "audioEffect",
          "explanation",
          "molecularExplanation"
        ]
      };

      const response = await generateGeminiContentWithFallback(ai, promptMsg, systemPrompt, schema, reactantsSelected);

      const responseText = response.text || "{}";
      const resultData = JSON.parse(responseText.trim());
      res.json(resultData);

    } catch (error: any) {
      console.error("AI chemical reaction predictor error:", error);
      res.status(500).json({
        error: error.message || "Failed to analyze chemical reaction with AI.",
        isMissingKey: error.message?.includes("GEMINI_API_KEY") || false
      });
    }
  });

  // Handle Vite Asset and SPA serving
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Virtual Lab Server] is running securely on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Fatal server startup crash:", err);
});
