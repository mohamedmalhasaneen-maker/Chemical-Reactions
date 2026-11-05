/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Interactive Baccalaureate Simulation Widgets
 * Provides real-time physics and chemistry simulations for textbook lessons
 */

import React, { useEffect, useRef, useState } from "react";
import {
  Activity,
  CheckCircle2,
  Flame,
  Layers,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Thermometer,
  Zap,
} from "lucide-react";
import { BacLessonSimulationConfig, BacSimType } from "../types";
import { playSound } from "../utils/soundEngine";

interface BaccalaureateSimulationEmbedProps {
  config: BacLessonSimulationConfig;
}

export const BaccalaureateSimulationEmbed: React.FC<BaccalaureateSimulationEmbedProps> = ({
  config,
}) => {
  const { type, title, hint } = config;

  return (
    <div className="rounded-2xl border border-cyan-500/30 bg-slate-900/80 backdrop-blur-md p-4 sm:p-6 shadow-xl relative overflow-hidden">
      {/* Background glow accent */}
      <div className="absolute -top-16 -end-16 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
            <Zap size={18} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <span>{title}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                محاكاة تفاعلية حية
              </span>
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">{hint}</p>
          </div>
        </div>
      </div>

      {/* Render specialized widget */}
      <div className="relative">
        {type === "phase_diagram" && <PhaseDiagramSim />}
        {type === "gas_laws" && <GasLawsSim />}
        {type === "colligative" && <ColligativeSim />}
        {type === "daniell_cell" && <DaniellCellSim />}
        {type === "electrolysis" && <ElectrolysisSim />}
        {type === "reaction_rate" && <ReactionRateSim />}
        {type === "le_chatelier" && <LeChatelierSim />}
        {type === "ph_titration" && <PhTitrationSim />}
        {type === "organic_functional" && <OrganicFunctionalSim />}
        {type === "precipitation" && <PrecipitationSim />}
        {type === "flame_test" && <FlameTestSim />}
      </div>
    </div>
  );
};

// 1. Phase Diagram Interactive Explorer
const PhaseDiagramSim: React.FC = () => {
  const [temp, setTemp] = useState(25); // -100 to 150 C
  const [pressure, setPressure] = useState(1.0); // 0.001 to 5.0 atm

  // Determine state of water
  let state = "سائل (Liquid)";
  let stateColor = "text-cyan-400";
  let explanation = "جزيئات الماء متراصة في حالة سيولة دائمة مع حركة انزلاقية مستمرة.";

  if (temp < 0.01 && pressure >= 0.006) {
    state = "صلب (جليد - Ice)";
    stateColor = "text-sky-300";
    explanation = "الماء في الحالة الصلبة؛ شبكة بلورية سداسية مستقرة بروابط هيدروجينية.";
  } else if (pressure < 0.006 && temp < 0.01) {
    state = "صلب (منطقة التسامي المباشر)";
    stateColor = "text-indigo-300";
    explanation = "الضغط منخفض جداً دون النقطة الثلاثية؛ يتحول الجليد مباشرة إلى بخار بالتسامي.";
  } else if (temp > 100 * Math.pow(pressure, 0.28) || pressure < 0.02) {
    state = "غاز (بخار ماء - Vapor)";
    stateColor = "text-amber-400";
    explanation = "جزيئات حرة الحركة تغلبت على قوى التجاذب بالكامل.";
  } else if (temp > 374 && pressure > 218) {
    state = "مائع فوق حرج (Supercritical Fluid)";
    stateColor = "text-purple-400";
    explanation = "تجاوزت العينة النقطة الحرجة؛ لا يوجد تمييز بين السائل والغاز!";
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
      <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
        <div>
          <div className="flex justify-between text-xs text-slate-300 mb-1">
            <span>درجة الحرارة (Temperature)</span>
            <span className="font-mono font-bold text-cyan-400">{temp} °C</span>
          </div>
          <input
            type="range"
            min={-50}
            max={150}
            value={temp}
            onChange={(e) => {
              setTemp(Number(e.target.value));
              playSound("click");
            }}
            className="w-full accent-cyan-500 cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs text-slate-300 mb-1">
            <span>الضغط المؤثر (Pressure)</span>
            <span className="font-mono font-bold text-cyan-400">{pressure.toFixed(2)} atm</span>
          </div>
          <input
            type="range"
            min={0.01}
            max={3.0}
            step={0.05}
            value={pressure}
            onChange={(e) => {
              setPressure(Number(e.target.value));
              playSound("click");
            }}
            className="w-full accent-cyan-500 cursor-pointer"
          />
        </div>

        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
          <span className="text-xs text-slate-400">نقطة الغليان عند هذا الضغط:</span>
          <span className="text-xs font-mono font-bold text-amber-300">
            {(100 * Math.pow(pressure, 0.28)).toFixed(1)} °C
          </span>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col justify-center items-center text-center min-h-[140px]">
        <span className="text-xs text-slate-400 mb-1">الحالة الفيزيائية المتزنة:</span>
        <span className={`text-xl font-extrabold ${stateColor} mb-2`}>{state}</span>
        <p className="text-xs text-slate-300 leading-relaxed max-w-sm">{explanation}</p>
      </div>
    </div>
  );
};

// 2. Gas Laws Piston & PV=nRT Simulator
const GasLawsSim: React.FC = () => {
  const [volume, setVolume] = useState(2.0); // Liters
  const [temp, setTemp] = useState(300); // Kelvin
  const [moles, setMoles] = useState(1.0); // mol

  // Ideal Gas Law: P = n R T / V (R = 0.08206)
  const pressure = (moles * 0.08206 * temp) / volume;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
          <div className="flex justify-between text-xs text-slate-300 mb-1">
            <span>حجم الأسطوانة (V)</span>
            <span className="font-mono text-cyan-400 font-bold">{volume.toFixed(2)} L</span>
          </div>
          <input
            type="range"
            min={0.5}
            max={5.0}
            step={0.1}
            value={volume}
            onChange={(e) => {
              setVolume(Number(e.target.value));
              playSound("click");
            }}
            className="w-full accent-cyan-500 cursor-pointer"
          />
        </div>

        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
          <div className="flex justify-between text-xs text-slate-300 mb-1">
            <span>درجة الحرارة (T)</span>
            <span className="font-mono text-cyan-400 font-bold">{temp} K ({temp - 273}°C)</span>
          </div>
          <input
            type="range"
            min={200}
            max={600}
            step={10}
            value={temp}
            onChange={(e) => {
              setTemp(Number(e.target.value));
              playSound("click");
            }}
            className="w-full accent-cyan-500 cursor-pointer"
          />
        </div>

        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
          <div className="flex justify-between text-xs text-slate-300 mb-1">
            <span>كمية المادة (n)</span>
            <span className="font-mono text-cyan-400 font-bold">{moles.toFixed(2)} mol</span>
          </div>
          <input
            type="range"
            min={0.2}
            max={3.0}
            step={0.1}
            value={moles}
            onChange={(e) => {
              setMoles(Number(e.target.value));
              playSound("click");
            }}
            className="w-full accent-cyan-500 cursor-pointer"
          />
        </div>
      </div>

      <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/30 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs text-slate-400 block">قراءة مانومتر الضغط المحسوب (P = nRT / V):</span>
          <span className="text-2xl font-black font-mono text-cyan-300">
            {pressure.toFixed(2)} atm
          </span>
          <span className="text-xs text-slate-400 ms-2 font-mono">
            ({(pressure * 760).toFixed(0)} mmHg)
          </span>
        </div>
        <div className="text-xs text-slate-300 border-s border-cyan-500/30 ps-4">
          <p>
            تأكيد قانون بويل: عند ثبوت T، حاصل ضرب <span className="font-mono text-cyan-400 font-bold">P × V = {(pressure * volume).toFixed(2)} atm·L</span> يظل ثابتاً!
          </p>
        </div>
      </div>
    </div>
  );
};

// 3. Colligative Properties Simulator
const ColligativeSim: React.FC = () => {
  const [solute, setSolute] = useState<"glucose" | "nacl" | "cacl2">("nacl");
  const [molality, setMolality] = useState(1.0); // m

  const iFactor = solute === "glucose" ? 1 : solute === "nacl" ? 2 : 3;
  const deltaTb = iFactor * 0.512 * molality;
  const deltaTf = iFactor * 1.86 * molality;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-slate-400">نوع المذاب:</span>
        <button
          type="button"
          onClick={() => {
            setSolute("glucose");
            playSound("select");
          }}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
            solute === "glucose"
              ? "bg-amber-500/30 text-amber-300 border border-amber-500/50"
              : "bg-slate-800 text-slate-400 hover:bg-slate-700"
          }`}
        >
          جلوكوز C6H12O6 (i = 1)
        </button>
        <button
          type="button"
          onClick={() => {
            setSolute("nacl");
            playSound("select");
          }}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
            solute === "nacl"
              ? "bg-cyan-500/30 text-cyan-300 border border-cyan-500/50"
              : "bg-slate-800 text-slate-400 hover:bg-slate-700"
          }`}
        >
          ملح الطعام NaCl (i = 2)
        </button>
        <button
          type="button"
          onClick={() => {
            setSolute("cacl2");
            playSound("select");
          }}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
            solute === "cacl2"
              ? "bg-indigo-500/30 text-indigo-300 border border-indigo-500/50"
              : "bg-slate-800 text-slate-400 hover:bg-slate-700"
          }`}
        >
          كلوريد الكالسيوم CaCl2 (i = 3)
        </button>
      </div>

      <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
        <div className="flex justify-between text-xs text-slate-300 mb-1">
          <span>التركيز المولالي (Molality m)</span>
          <span className="font-mono text-cyan-400 font-bold">{molality.toFixed(1)} mol/kg</span>
        </div>
        <input
          type="range"
          min={0.1}
          max={3.0}
          step={0.1}
          value={molality}
          onChange={(e) => {
            setMolality(Number(e.target.value));
            playSound("click");
          }}
          className="w-full accent-cyan-500 cursor-pointer"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/30 text-center">
          <span className="text-xs text-rose-300 block">درجة الغليان الجديدة (ارتفاع ΔTb)</span>
          <span className="text-xl font-bold font-mono text-rose-400">
            {(100 + deltaTb).toFixed(2)} °C
          </span>
          <span className="text-[11px] text-slate-400 block mt-0.5">
            مقدار الارتفاع: +{deltaTb.toFixed(2)} °C
          </span>
        </div>

        <div className="p-3 rounded-xl bg-sky-950/20 border border-sky-500/30 text-center">
          <span className="text-xs text-sky-300 block">درجة التجمد الجديدة (انخفاض ΔTf)</span>
          <span className="text-xl font-bold font-mono text-sky-400">
            {(-deltaTf).toFixed(2)} °C
          </span>
          <span className="text-[11px] text-slate-400 block mt-0.5">
            مقدار الانخفاض: -{deltaTf.toFixed(2)} °C
          </span>
        </div>
      </div>
    </div>
  );
};

// 4. Daniell Cell Interactive Simulation
const DaniellCellSim: React.FC = () => {
  const [isRunning, setIsRunning] = useState(true);
  const [saltBridgeConnected, setSaltBridgeConnected] = useState(true);

  const emf = saltBridgeConnected ? 1.1 : 0.0;

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center text-center">
        {/* Anode */}
        <div className="p-3 rounded-lg bg-slate-900 border border-slate-700">
          <span className="text-xs text-amber-400 font-bold block">المصعد / الأنود (-)</span>
          <span className="text-sm font-bold text-white block mt-1">قطب الخارصين Zn</span>
          <span className="text-[11px] text-slate-400 font-mono block mt-1">
            Zn(s) → Zn²⁺ + 2e⁻
          </span>
          <span className="text-[10px] text-amber-300/80 block mt-1">يتآكل وتقل كتلته</span>
        </div>

        {/* Center Meter & Bridge */}
        <div className="flex flex-col items-center justify-center">
          <span className="text-xs text-slate-400 mb-1">قراءة الفولتميتر (E°cell):</span>
          <span
            className={`text-2xl font-black font-mono ${
              saltBridgeConnected ? "text-emerald-400 animate-pulse" : "text-rose-500"
            }`}
          >
            {emf.toFixed(2)} V
          </span>
          <button
            type="button"
            onClick={() => {
              setSaltBridgeConnected((s) => !s);
              playSound(saltBridgeConnected ? "error" : "success");
            }}
            className={`mt-2 px-2.5 py-1 rounded-lg text-xs font-bold transition ${
              saltBridgeConnected
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                : "bg-rose-500/20 text-rose-300 border border-rose-500/40"
            }`}
          >
            {saltBridgeConnected ? "القنطرة الملحية متصلة" : "تم فصل القنطرة (دائرة مفتوحة)"}
          </button>
        </div>

        {/* Cathode */}
        <div className="p-3 rounded-lg bg-slate-900 border border-slate-700">
          <span className="text-xs text-cyan-400 font-bold block">المهبط / الكاثود (+)</span>
          <span className="text-sm font-bold text-white block mt-1">قطب النحاس Cu</span>
          <span className="text-[11px] text-slate-400 font-mono block mt-1">
            Cu²⁺ + 2e⁻ → Cu(s)
          </span>
          <span className="text-[10px] text-cyan-300/80 block mt-1">يترسب وتزداد كتلته</span>
        </div>
      </div>
      <p className="text-xs text-slate-400 text-center">
        {saltBridgeConnected
          ? "تتدفق الإلكترونات عبر السلك الخارجي من لوح الخارصين إلى لوح النحاس بفرق جهد ثابت 1.10 V."
          : "تراكمت الأيونات في نصفي الخلية وانقطعت الدائرة الكهربية فتوقف التيار تماماً!"}
      </p>
    </div>
  );
};

// 5. Electrolysis & Faraday's Law Simulator
const ElectrolysisSim: React.FC = () => {
  const [currentA, setCurrentA] = useState(3.0);
  const [timeMin, setTimeMin] = useState(30);

  // Cu (equivalent mass = 63.5 / 2 = 31.75 g/eq)
  const totalSeconds = timeMin * 60;
  const coulombs = currentA * totalSeconds;
  const massGrams = (coulombs * 31.75) / 96500;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
          <div className="flex justify-between text-xs text-slate-300 mb-1">
            <span>شدة التيار الكهربائي (I)</span>
            <span className="font-mono text-cyan-400 font-bold">{currentA.toFixed(1)} A</span>
          </div>
          <input
            type="range"
            min={0.5}
            max={10.0}
            step={0.5}
            value={currentA}
            onChange={(e) => {
              setCurrentA(Number(e.target.value));
              playSound("click");
            }}
            className="w-full accent-cyan-500 cursor-pointer"
          />
        </div>

        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
          <div className="flex justify-between text-xs text-slate-300 mb-1">
            <span>زمن التحليل بالدقائق (t)</span>
            <span className="font-mono text-cyan-400 font-bold">{timeMin} دقيقة</span>
          </div>
          <input
            type="range"
            min={5}
            max={120}
            step={5}
            value={timeMin}
            onChange={(e) => {
              setTimeMin(Number(e.target.value));
              playSound("click");
            }}
            className="w-full accent-cyan-500 cursor-pointer"
          />
        </div>
      </div>

      <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs text-slate-400 block">كتلة فلز النحاس المترسبة على الكاثود:</span>
          <span className="text-2xl font-black font-mono text-cyan-300">
            {massGrams.toFixed(3)} g
          </span>
          <span className="text-xs text-slate-400 ms-2 font-mono">
            (شحنة كروية = {coulombs.toLocaleString()} C)
          </span>
        </div>
        <div className="text-xs text-slate-300 font-mono">
          <span>Q = {(coulombs / 96500).toFixed(3)} Faraday</span>
        </div>
      </div>
    </div>
  );
};

// 6. Reaction Rate & Catalyst Simulator with Full State Control
const ReactionRateSim: React.FC = () => {
  const [temp, setTemp] = useState(25);
  const [hasCatalyst, setHasCatalyst] = useState(false);
  const [simStatus, setSimStatus] = useState<"ready" | "running" | "paused" | "completed">("ready");
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<number | null>(null);

  // Rate factor
  const baseRate = Math.pow(2, (temp - 25) / 10);
  const effectiveRate = hasCatalyst ? baseRate * 5 : baseRate;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
    };
  }, []);

  const handleStart = () => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    playSound("simulation_start");
    setSimStatus("running");
    setProgress(5);

    let cur = 5;
    const intervalMs = Math.max(120, Math.floor(600 / effectiveRate));
    timerRef.current = window.setInterval(() => {
      cur += 5;
      if (cur >= 100) {
        setProgress(100);
        setSimStatus("completed");
        playSound("simulation_complete");
        if (timerRef.current) {
          window.clearInterval(timerRef.current);
          timerRef.current = null;
        }
      } else {
        setProgress(cur);
      }
    }, intervalMs);
  };

  const handlePause = () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setSimStatus("paused");
    playSound("click");
  };

  const handleResume = () => {
    playSound("simulation_start");
    setSimStatus("running");
    let cur = progress;
    const intervalMs = Math.max(120, Math.floor(600 / effectiveRate));
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      cur += 5;
      if (cur >= 100) {
        setProgress(100);
        setSimStatus("completed");
        playSound("simulation_complete");
        if (timerRef.current) {
          window.clearInterval(timerRef.current);
          timerRef.current = null;
        }
      } else {
        setProgress(cur);
      }
    }, intervalMs);
  };

  const handleReset = () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setProgress(0);
    setSimStatus("ready");
    playSound("click");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex-1 min-w-[200px] p-3 rounded-xl bg-slate-950/70 border border-slate-800">
          <div className="flex justify-between text-xs text-slate-300 mb-1">
            <span>درجة حرارة المفاعل (T)</span>
            <span className="font-mono text-cyan-400 font-bold">{temp} °C</span>
          </div>
          <input
            type="range"
            min={10}
            max={75}
            step={5}
            value={temp}
            onChange={(e) => {
              setTemp(Number(e.target.value));
              playSound("click");
            }}
            className="w-full accent-cyan-500 cursor-pointer"
          />
        </div>

        <button
          type="button"
          onClick={() => {
            setHasCatalyst((c) => !c);
            playSound(hasCatalyst ? "click" : "success");
          }}
          className={`h-14 px-4 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            hasCatalyst
              ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
              : "bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700"
          }`}
        >
          <Sparkles size={16} />
          <span>{hasCatalyst ? "العامل الحفاز مُفعل (Ea مخفوضة)" : "إضافة عامل حفاز"}</span>
        </button>
      </div>

      <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="text-xs text-slate-400 block">معدل سرعة التفاعل النسبي:</span>
          <span className="text-2xl font-black font-mono text-emerald-400">
            {effectiveRate.toFixed(1)} × السرعة المرجعية
          </span>
        </div>
        <div className="text-xs text-slate-300 text-end">
          <span className="block text-slate-400">طاقة التنشيط (Ea):</span>
          <span className="font-mono font-bold text-amber-300">
            {hasCatalyst ? "45 kJ/mol (حفزية)" : "90 kJ/mol (غير حفزية)"}
          </span>
        </div>
      </div>

      {/* Live Reaction Progress & Controls */}
      <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400 font-semibold">معدل تقدم التفاعل الحركي (A + B → C):</span>
          <div className="flex items-center gap-2 font-mono">
            {simStatus === "running" && (
              <span className="text-amber-400 flex items-center gap-1 font-bold">
                <Activity size={13} className="animate-pulse" />
                قيد التفاعل ({progress}%)
              </span>
            )}
            {simStatus === "paused" && (
              <span className="text-yellow-400 flex items-center gap-1 font-bold">
                <Pause size={13} />
                متوقف مؤقتاً ({progress}%)
              </span>
            )}
            {simStatus === "completed" && (
              <span className="text-emerald-400 flex items-center gap-1 font-bold">
                <CheckCircle2 size={13} />
                اكتمل بنجاح (100%)
              </span>
            )}
            {simStatus === "ready" && (
              <span className="text-cyan-400 font-bold">جاهز للبدء (0%)</span>
            )}
          </div>
        </div>

        <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
          <div
            className={`h-full transition-all duration-200 ${
              simStatus === "completed"
                ? "bg-emerald-500"
                : simStatus === "paused"
                ? "bg-yellow-400"
                : "bg-gradient-to-r from-cyan-500 to-emerald-400"
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Buttons Control Row */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {simStatus === "ready" && (
            <button
              type="button"
              onClick={handleStart}
              className="flex-1 py-2 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm"
            >
              <Play size={14} className="fill-current" />
              <span>بدء التفاعل والمحاكاة</span>
            </button>
          )}

          {simStatus === "running" && (
            <>
              <button
                type="button"
                onClick={handlePause}
                className="flex-1 py-2 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm"
              >
                <Pause size={14} />
                <span>إيقاف التفاعل مؤقتاً</span>
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition flex items-center gap-1.5"
              >
                <RotateCcw size={14} />
                <span>إعادة ضبط</span>
              </button>
            </>
          )}

          {simStatus === "paused" && (
            <>
              <button
                type="button"
                onClick={handleResume}
                className="flex-1 py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm"
              >
                <Play size={14} className="fill-current" />
                <span>استكمال التفاعل</span>
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition flex items-center gap-1.5"
              >
                <RotateCcw size={14} />
                <span>إعادة ضبط</span>
              </button>
            </>
          )}

          {simStatus === "completed" && (
            <button
              type="button"
              onClick={handleStart}
              className="flex-1 py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm"
            >
              <RotateCcw size={14} />
              <span>إعادة تشغيل التفاعل</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// 7. Le Chatelier Equilibrium Shift Simulator (2NO2 ⇌ N2O4)
const LeChatelierSim: React.FC = () => {
  const [pressureMultiplier, setPressureMultiplier] = useState(1); // 1 = 1x, 2 = 2x
  const [tempState, setTempState] = useState<"cold" | "room" | "hot">("room");

  // NO2 is brown (2 moles gas), N2O4 is colorless (1 mole gas). Reaction is exothermic.
  let no2Percentage = 50;
  if (tempState === "hot") no2Percentage += 35;
  if (tempState === "cold") no2Percentage -= 35;
  if (pressureMultiplier === 2) no2Percentage -= 20;

  no2Percentage = Math.max(5, Math.min(95, no2Percentage));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Temperature buttons */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">الحرارة:</span>
          <button
            type="button"
            onClick={() => {
              setTempState("cold");
              playSound("select");
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              tempState === "cold"
                ? "bg-sky-500/30 text-sky-300 border border-sky-500/50"
                : "bg-slate-800 text-slate-400"
            }`}
          >
            تبريد (حمام ثلجي 0°C)
          </button>
          <button
            type="button"
            onClick={() => {
              setTempState("room");
              playSound("select");
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              tempState === "room"
                ? "bg-slate-700 text-white border border-slate-600"
                : "bg-slate-800 text-slate-400"
            }`}
          >
            غرفة (25°C)
          </button>
          <button
            type="button"
            onClick={() => {
              setTempState("hot");
              playSound("select");
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              tempState === "hot"
                ? "bg-rose-500/30 text-rose-300 border border-rose-500/50"
                : "bg-slate-800 text-slate-400"
            }`}
          >
            تسخين (ماء مغلي 100°C)
          </button>
        </div>

        {/* Pressure button */}
        <button
          type="button"
          onClick={() => {
            setPressureMultiplier((p) => (p === 1 ? 2 : 1));
            playSound("click");
          }}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
            pressureMultiplier === 2
              ? "bg-amber-500/30 text-amber-300 border border-amber-500/50"
              : "bg-slate-800 text-slate-300"
          }`}
        >
          {pressureMultiplier === 2 ? "ضغط مضاعف (حجم النصف)" : "ضغط قياسي (1 atm)"}
        </button>
      </div>

      {/* Visual gas syringe color */}
      <div
        className="p-4 rounded-xl border border-slate-800 flex items-center justify-between transition-colors duration-500"
        style={{
          backgroundColor: `rgba(180, 83, 9, ${no2Percentage / 100})`,
        }}
      >
        <span className="text-xs font-bold text-white drop-shadow">
          لون الغاز داخل الأنبوب: {no2Percentage > 60 ? "بني محمر قاتم جداً (NO2 سائد)" : no2Percentage < 30 ? "شفاف عديم اللون تقريباً (N2O4 سائد)" : "بني فاتح متزن"}
        </span>
        <span className="text-xs font-mono font-bold text-white drop-shadow">
          نسبة غاز NO2 = {no2Percentage}%
        </span>
      </div>
    </div>
  );
};

// 8. pH Titration Simulator
const PhTitrationSim: React.FC = () => {
  const [addedBaseMl, setAddedBaseMl] = useState(20); // 0 to 50 mL

  // Titration of 25 mL 0.1M HCl with 0.1M NaOH
  let ph = 1.0;
  if (addedBaseMl < 25) {
    const remainingMoles = (25 - addedBaseMl) * 0.1 / 1000;
    const totalVolumeL = (25 + addedBaseMl) / 1000;
    ph = -Math.log10(remainingMoles / totalVolumeL);
  } else if (addedBaseMl === 25) {
    ph = 7.0; // Equivalence point
  } else {
    const excessMoles = (addedBaseMl - 25) * 0.1 / 1000;
    const totalVolumeL = (25 + addedBaseMl) / 1000;
    const pOH = -Math.log10(excessMoles / totalVolumeL);
    ph = 14.0 - pOH;
  }

  return (
    <div className="space-y-4">
      <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
        <div className="flex justify-between text-xs text-slate-300 mb-1">
          <span>حجم هيدروكسيد الصوديوم المضاف من السحاحة (mL)</span>
          <span className="font-mono text-cyan-400 font-bold">{addedBaseMl} mL</span>
        </div>
        <input
          type="range"
          min={0}
          max={50}
          step={1}
          value={addedBaseMl}
          onChange={(e) => {
            setAddedBaseMl(Number(e.target.value));
            playSound("click");
          }}
          className="w-full accent-cyan-500 cursor-pointer"
        />
      </div>

      <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
        <div>
          <span className="text-xs text-slate-400 block">قراءة مقياس الـ pH الرقمي:</span>
          <span
            className={`text-2xl font-black font-mono ${
              ph < 6 ? "text-rose-400" : ph > 8 ? "text-blue-400" : "text-emerald-400"
            }`}
          >
            pH = {ph.toFixed(2)}
          </span>
        </div>
        <div className="text-xs text-end">
          <span className="text-slate-400 block">لون دليل الفينولفثالين:</span>
          <span className="font-bold text-white">
            {ph >= 8.2 ? "وردي قرمزي (قاعدي)" : "عديم اللون (حمضي أو متعادل)"}
          </span>
        </div>
      </div>
    </div>
  );
};

// 9. Organic Functional Group Inspector
const OrganicFunctionalSim: React.FC = () => {
  const [selectedGroup, setSelectedGroup] = useState<"alkene" | "alcohol" | "aldehyde" | "acid" | "ester">("alcohol");

  const data = {
    alkene: {
      name: "الألكينات (Alkenes)",
      group: "رابطة كربون-كربون مزدوجة (C=C)",
      hybrid: "sp² (120° مثلث مستوٍ)",
      reaction: "تفاعلات الإضافة وإزالة لون ماء البروم الأحمر فورياً",
    },
    alcohol: {
      name: "الكحولات (Alcohols)",
      group: "مجموعة الهيدروكسيل (-OH)",
      hybrid: "sp³ على الأكسجين والكربون",
      reaction: "تتأكسد الأولية منها إلى ألدهيدات ثم أحماض وتتفاعل مع الصوديوم",
    },
    aldehyde: {
      name: "الألدهيدات (Aldehydes)",
      group: "مجموعة الكربونيل الطرفية (-CHO)",
      hybrid: "sp² على ذرة كربون الكربونيل",
      reaction: "تختزل كاشف تولن لتكوين مرآة الفضة البراقة وتتأكسد بسهولة",
    },
    acid: {
      name: "الأحماض الكربوكسيلية (Carboxylic Acids)",
      group: "مجموعة الكربوكسيل (-COOH)",
      hybrid: "sp² على كربون الكربوكسيل",
      reaction: "تحدث فوراناً مع بيكربونات الصوديوم وتتفاعل مع الكحولات لتكوين الإستر",
    },
    ester: {
      name: "الإسترات (Esters)",
      group: "مجموعة الإستر (-COO-)",
      hybrid: "sp² على كربون الكربونيل",
      reaction: "تتميز برائحة الفواكه العطرة وتتصبن بالصودا الكاوية لإنتاج الصابون",
    },
  };

  const current = data[selectedGroup];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-1.5">
        {(["alkene", "alcohol", "aldehyde", "acid", "ester"] as const).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => {
              setSelectedGroup(key);
              playSound("select");
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              selectedGroup === key
                ? "bg-cyan-500/30 text-cyan-300 border border-cyan-500/50"
                : "bg-slate-800 text-slate-400 hover:bg-slate-700"
            }`}
          >
            {data[key].name}
          </button>
        ))}
      </div>

      <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div>
          <span className="text-slate-400 block mb-0.5">المجموعة الوظيفية المميزة:</span>
          <span className="text-white font-bold font-mono text-sm">{current.group}</span>
        </div>
        <div>
          <span className="text-slate-400 block mb-0.5">نوع التهجين والزوايا:</span>
          <span className="text-cyan-300 font-bold">{current.hybrid}</span>
        </div>
        <div className="sm:col-span-2 pt-2 border-t border-slate-800">
          <span className="text-slate-400 block mb-0.5">السلوك الكيميائي والكشف النوعي:</span>
          <span className="text-amber-300 leading-relaxed">{current.reaction}</span>
        </div>
      </div>
    </div>
  );
};

// 10. Precipitation & Qualitative Analysis Tube Rack
const PrecipitationSim: React.FC = () => {
  const [precipitate, setPrecipitate] = useState<"agcl" | "cus" | "feoh3" | "baso4">("agcl");

  const colors = {
    agcl: {
      name: "كلوريد الفضة (AgCl)",
      color: "أبيض ناصع يتحول للبنفسجي بالضوء",
      style: "bg-white text-slate-950",
      reagent: "AgNO3 + NaCl",
      solubility: "يذوب في محلول النشادر المركز",
    },
    cus: {
      name: "كبريتيد النحاس (CuS)",
      color: "أسود داكن",
      style: "bg-slate-950 text-white border border-slate-700",
      reagent: "CuSO4 + H2S في وسط حمضي",
      solubility: "يذوب في حمض النيتريك الساخن",
    },
    feoh3: {
      name: "هيدروكسيد الحديد الثلاثي Fe(OH)3",
      color: "بني محمر جيلاتيني",
      style: "bg-amber-900 text-amber-100",
      reagent: "FeCl3 + NaOH",
      solubility: "يذوب في الأحماض ولا يذوب في القواعد",
    },
    baso4: {
      name: "كبريتات الباريوم (BaSO4)",
      color: "أبيض ثقيل لا يذوب في الأحماض",
      style: "bg-slate-200 text-slate-950",
      reagent: "BaCl2 + Na2SO4",
      solubility: "شديد الثبات لا يذوب في HCl المخفف",
    },
  };

  const curr = colors[precipitate];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {(["agcl", "cus", "feoh3", "baso4"] as const).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => {
              setPrecipitate(key);
              playSound("select");
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              precipitate === key
                ? "bg-cyan-500/30 text-cyan-300 border border-cyan-500/50"
                : "bg-slate-800 text-slate-400 hover:bg-slate-700"
            }`}
          >
            {colors[key].name}
          </button>
        ))}
      </div>

      <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-4">
        <div>
          <span className="text-xs text-slate-400 block">معادلة كاشف الترسيب:</span>
          <span className="text-sm font-bold font-mono text-cyan-300">{curr.reagent}</span>
          <span className="text-xs text-slate-400 block mt-1">{curr.solubility}</span>
        </div>
        <div className={`px-4 py-3 rounded-xl font-bold text-xs shadow-lg ${curr.style}`}>
          {curr.color}
        </div>
      </div>
    </div>
  );
};

// 11. Flame Test Visualizer
const FlameTestSim: React.FC = () => {
  const [metal, setMetal] = useState<"na" | "k" | "li" | "cu" | "ca">("na");

  const flameColors = {
    na: { name: "الصوديوم (Na)", flame: "أصفر ذهبي ساطع", glow: "rgba(234, 179, 8, 0.85)" },
    k: { name: "البوتاسيوم (K)", flame: "بنفسجي فاتح (ليلكي)", glow: "rgba(192, 132, 252, 0.85)" },
    li: { name: "الليثيوم (Li)", flame: "أحمر قرمزي", glow: "rgba(244, 63, 94, 0.85)" },
    cu: { name: "النحاس (Cu)", flame: "أخضر مزرق", glow: "rgba(16, 185, 129, 0.85)" },
    ca: { name: "الكالسيوم (Ca)", flame: "أحمر طوبي", glow: "rgba(239, 68, 68, 0.85)" },
  };

  const curr = flameColors[metal];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {(["na", "k", "li", "cu", "ca"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => {
              setMetal(m);
              playSound("select");
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              metal === m
                ? "bg-amber-500/30 text-amber-300 border border-amber-500/50"
                : "bg-slate-800 text-slate-400 hover:bg-slate-700"
            }`}
          >
            {flameColors[m].name}
          </button>
        ))}
      </div>

      <div
        className="p-6 rounded-xl border border-slate-800 flex items-center justify-center gap-3 transition-all duration-500"
        style={{
          boxShadow: `inset 0 0 40px ${curr.glow}, 0 0 25px ${curr.glow}`,
          backgroundColor: "#030712",
        }}
      >
        <Flame size={28} style={{ color: curr.glow }} className="animate-bounce" />
        <span className="text-base font-extrabold text-white drop-shadow">
          لون لهب بنزن المميز: {curr.flame}
        </span>
      </div>
    </div>
  );
};
