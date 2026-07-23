/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from "react";
import { Chemical, ReactionDetail } from "../types";
import { X, Activity, Zap, Play, RotateCcw, Sliders, Scale, Thermometer, ShieldAlert } from "lucide-react";

interface UniversityToolsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedReactants: Chemical[];
  activeReaction: ReactionDetail | null;
  currentPh: number;
  currentTemp: number;
  playSynthSound: (type: string) => void;
}

export default function UniversityToolsModal({
  isOpen,
  onClose,
  selectedReactants,
  activeReaction,
  currentPh,
  currentTemp,
  playSynthSound,
}: UniversityToolsModalProps) {
  const [activeTool, setActiveTool] = useState<"spectrometer" | "centrifuge" | "burette" | "tlc" | "balance">("spectrometer");

  // 1. Spectrophotometer state
  const [wavelength, setWavelength] = useState<number>(520); // nm
  const specCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // 2. Centrifuge state
  const [rpm, setRpm] = useState<number>(4000);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [centrifugeProgress, setCentrifugeProgress] = useState<number>(0);

  // 3. Titration state
  const [titrantVolume, setTitrantVolume] = useState<number>(0); // mL
  const [titrationCurve, setTitrationCurve] = useState<{ v: number; ph: number }[]>([
    { v: 0, ph: currentPh }
  ]);

  // 4. TLC state
  const [tlcRunning, setTlcRunning] = useState<boolean>(false);
  const [tlcProgress, setTlcProgress] = useState<number>(0);
  const [solventSystem, setSolventSystem] = useState<string>("hexane_etac");

  // 5. Analytical balance tare state
  const [tare, setTare] = useState<number>(0);

  // Reset titration curve when reactants change
  useEffect(() => {
    setTitrantVolume(0);
    setTitrationCurve([{ v: 0, ph: currentPh }]);
  }, [selectedReactants, currentPh]);

  // Draw UV-Vis Absorption Spectrum on Canvas
  useEffect(() => {
    if (!isOpen || activeTool !== "spectrometer") return;
    const canvas = specCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    // Grid lines
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.lineWidth = 1;
    for (let x = 0; x <= width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y <= height; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Determine peak based on reactants
    let peakNm = 520; // default green/yellow absorption
    if (selectedReactants.some(r => r.id === "kmno4")) peakNm = 525; // Purple
    else if (selectedReactants.some(r => r.id === "cuso4")) peakNm = 630; // Blue
    else if (selectedReactants.some(r => r.id === "k2cr2o7")) peakNm = 440; // Orange
    else if (selectedReactants.some(r => r.id === "phenolphthalein") && currentPh > 8) peakNm = 552; // Pink
    else if (selectedReactants.some(r => r.id === "kscn") && selectedReactants.some(r => r.id === "fecl3")) peakNm = 480; // Red

    // Draw Spectrum Curve
    ctx.beginPath();
    ctx.strokeStyle = "#818cf8";
    ctx.lineWidth = 3;

    for (let x = 0; x < width; x++) {
      const nm = 380 + (x / width) * (750 - 380);
      // Gaussian absorption peak curve calculation
      const dist = Math.abs(nm - peakNm);
      const absVal = Math.exp(-Math.pow(dist / 35, 2)) * 0.85 + 0.05;
      const y = height - (absVal * (height - 20) + 10);

      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Fill under curve
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fillStyle = "rgba(129, 140, 248, 0.15)";
    ctx.fill();

    // Current wavelength marker line
    const markX = ((wavelength - 380) / (750 - 380)) * width;
    ctx.beginPath();
    ctx.strokeStyle = "#f43f5e";
    ctx.setLineDash([4, 4]);
    ctx.moveTo(markX, 0);
    ctx.lineTo(markX, height);
    ctx.stroke();
    ctx.setLineDash([]);

  }, [isOpen, activeTool, wavelength, selectedReactants, currentPh]);

  if (!isOpen) return null;

  // Calculate Absorbance based on Beer-Lambert Law A = e * c * l
  const getAbsorbanceAtWavelength = () => {
    let peakNm = 520;
    if (selectedReactants.some(r => r.id === "kmno4")) peakNm = 525;
    else if (selectedReactants.some(r => r.id === "cuso4")) peakNm = 630;
    else if (selectedReactants.some(r => r.id === "k2cr2o7")) peakNm = 440;

    const dist = Math.abs(wavelength - peakNm);
    const conc = Math.max(0.01, selectedReactants.length * 0.05);
    const absorbance = Math.exp(-Math.pow(dist / 35, 2)) * conc * 18.5;
    const transmittance = Math.max(0.1, Math.min(99.9, Math.pow(10, -absorbance) * 100));
    return { absorbance: absorbance.toFixed(3), transmittance: transmittance.toFixed(1) };
  };

  // Run Centrifuge
  const handleStartCentrifuge = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setCentrifugeProgress(0);
    playSynthSound("sizzle");

    let p = 0;
    const interval = setInterval(() => {
      p += 5;
      setCentrifugeProgress(p);
      if (p >= 100) {
        clearInterval(interval);
        setIsSpinning(false);
        playSynthSound("beep");
      }
    }, 100);
  };

  // Add Titrant Drop in Burette
  const handleAddTitrant = (amountMl: number) => {
    const newVol = parseFloat((titrantVolume + amountMl).toFixed(1));
    setTitrantVolume(newVol);
    playSynthSound("fizz");

    // Calculate new pH based on titration equation
    let newPh = currentPh;
    if (currentPh < 7) {
      // Adding base titrant
      newPh = Math.min(13.5, currentPh + (newVol * 0.45) / (1 + Math.exp(-(newVol - 12) / 2)));
    } else {
      // Adding acid titrant
      newPh = Math.max(0.5, currentPh - (newVol * 0.45) / (1 + Math.exp(-(newVol - 12) / 2)));
    }

    setTitrationCurve(prev => [...prev, { v: newVol, ph: parseFloat(newPh.toFixed(2)) }]);
  };

  // Run TLC Chromatogram
  const handleRunTLC = () => {
    if (tlcRunning) return;
    setTlcRunning(true);
    setTlcProgress(0);
    playSynthSound("beep");

    let p = 0;
    const interval = setInterval(() => {
      p += 2;
      setTlcProgress(p);
      if (p >= 100) {
        clearInterval(interval);
        setTlcRunning(false);
        playSynthSound("completion");
      }
    }, 50);
  };

  // Calculate mass for analytical balance
  const calculateTotalMassGrams = () => {
    const baseMass = selectedReactants.length * 25.4 + (currentTemp > 30 ? 0.8 : 0);
    return Math.max(0, parseFloat((baseMass - tare).toFixed(4)));
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in" id="university-tools-modal">
      <div className="bg-[#101014] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        
        {/* Modal Header */}
        <div className="p-4 bg-[#14141a] border-b border-white/10 flex items-center justify-between flex-row-reverse">
          <div className="flex items-center gap-2 flex-row-reverse">
            <span className="p-2 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-xl text-lg">🎓</span>
            <div className="text-right">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">حقيبة معدات وأجهزة المختبر الجامعي</h2>
              <p className="text-[10px] text-slate-400 font-mono">أجهزة التحليل الطيفي والحجمي والفيزيائي لطلاب الكيمياء والعلوم</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white bg-white/5 rounded-lg hover:bg-white/10 transition-all cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tools Navigation Bar */}
        <div className="flex border-b border-white/10 bg-[#0c0c0f] p-2 gap-1 overflow-x-auto flex-row-reverse scrollbar-none" id="tools-nav-bar">
          {[
            { id: "spectrometer", name: "🔬 مطياف الامتصاص (UV-Vis)", desc: "تحليل الطيف وقانون بير-لامبرت" },
            { id: "centrifuge", name: "🌀 جهاز الطرد المركزي (Centrifuge)", desc: "فصل الرواسب بسرعة 4000 RPM" },
            { id: "burette", name: "💧 سحاحة المعايرة الحجمية", desc: "منحنى المعايرة الحجمية pH" },
            { id: "tlc", name: "📄 الكروماتوجرافيا الورقية (TLC)", desc: "حساب معامل الاحتفاظ Rf" },
            { id: "balance", name: "⚖️ الميزان التحليلي الدقيق", desc: "قياس الكتلة بدقة 0.0001g" },
          ].map(tool => (
            <button
              key={tool.id}
              onClick={() => {
                setActiveTool(tool.id as any);
                playSynthSound("beep");
              }}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 flex-shrink-0 flex-row-reverse cursor-pointer ${
                activeTool === tool.id
                  ? "bg-indigo-600 text-white border border-indigo-400 shadow-lg"
                  : "bg-white/5 text-slate-400 hover:text-slate-200 border border-transparent hover:bg-white/10"
              }`}
            >
              <span>{tool.name}</span>
            </button>
          ))}
        </div>

        {/* Modal Body Content */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4 text-right">

          {/* 1. UV-Vis Spectrophotometer Panel */}
          {activeTool === "spectrometer" && (
            <div className="space-y-4" id="spectrometer-panel">
              <div className="bg-[#16161d] p-4 rounded-xl border border-white/10 space-y-3">
                <div className="flex justify-between items-center flex-row-reverse">
                  <div>
                    <h3 className="text-xs font-bold text-white flex items-center gap-1.5 flex-row-reverse">
                      <span>🔬</span> جهاز المطياف الضوئي للمحاليل (UV-Vis Spectrophotometer)
                    </h3>
                    <p className="text-[10px] text-slate-400">يقيس مدى امتصاص ونفاذية الضوء عبر المادة بالنانومتر طبقاً لقانون بير-لامبرت (A = ε × c × l)</p>
                  </div>
                  <span className="text-[10px] text-indigo-400 font-mono bg-indigo-500/10 px-2 py-1 rounded border border-indigo-500/20">
                    أقصى امتصاص λ: {wavelength} nm
                  </span>
                </div>

                {/* Canvas Spectrum Plot */}
                <div className="relative bg-black rounded-xl p-2 border border-white/10 shadow-inner">
                  <canvas ref={specCanvasRef} width={650} height={180} className="w-full h-44 rounded" />
                  <div className="flex justify-between text-[9px] text-slate-500 font-mono px-2 mt-1 flex-row-reverse">
                    <span>380 nm (الأشعة فوق البنفسجية/بنفسجي)</span>
                    <span>550 nm (أخضر/أصفر)</span>
                    <span>750 nm (أحمر/تحت الحمراء)</span>
                  </div>
                </div>

                {/* Wavelength Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs text-slate-300 font-mono flex-row-reverse">
                    <label className="font-bold text-slate-400">تعديل الطول الموجي للشعاع ($\lambda$):</label>
                    <span className="text-indigo-400 font-bold">{wavelength} nm</span>
                  </div>
                  <input
                    type="range"
                    min="380"
                    max="750"
                    value={wavelength}
                    onChange={(e) => setWavelength(parseInt(e.target.value))}
                    className="w-full accent-indigo-500 cursor-pointer h-2"
                  />
                </div>

                {/* Absorbance & Transmittance Results */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 text-center" dir="rtl">
                  <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                    <span className="text-[9px] text-slate-400 uppercase block font-bold">امتصاص الضوء (Absorbance A)</span>
                    <span className="text-lg font-mono font-bold text-indigo-400">{getAbsorbanceAtWavelength().absorbance}</span>
                  </div>
                  <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                    <span className="text-[9px] text-slate-400 uppercase block font-bold">نفاذية الضوء (Transmittance T%)</span>
                    <span className="text-lg font-mono font-bold text-emerald-400">{getAbsorbanceAtWavelength().transmittance}%</span>
                  </div>
                  <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                    <span className="text-[9px] text-slate-400 uppercase block font-bold">معامل الامتصاص المولاري ($\epsilon$)</span>
                    <span className="text-lg font-mono font-bold text-cyan-400">18.5 L/mol·cm</span>
                  </div>
                  <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                    <span className="text-[9px] text-slate-400 uppercase block font-bold">طول مسار الخلية (l)</span>
                    <span className="text-lg font-mono font-bold text-amber-400">1.00 cm</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. Centrifuge Panel */}
          {activeTool === "centrifuge" && (
            <div className="space-y-4" id="centrifuge-panel">
              <div className="bg-[#16161d] p-4 rounded-xl border border-white/10 space-y-4">
                <div className="flex justify-between items-center flex-row-reverse">
                  <div>
                    <h3 className="text-xs font-bold text-white flex items-center gap-1.5 flex-row-reverse">
                      <span>🌀</span> جهاز الطرد المركزي الجامعي (High-Speed Centrifuge)
                    </h3>
                    <p className="text-[10px] text-slate-400">فصل المواد المعلقة والرواسب الصلبة عن السوائل بقوة التسارع المركزي المفرطة</p>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
                    السرعة: {rpm} RPM
                  </span>
                </div>

                {/* Centrifuge Rotor Simulation Display */}
                <div className="flex flex-col items-center justify-center p-6 bg-black/60 rounded-xl border border-white/10 relative">
                  <div className={`w-36 h-36 rounded-full border-4 border-slate-700 bg-slate-900 flex items-center justify-center relative shadow-2xl ${isSpinning ? "animate-spin" : ""}`}
                    style={{ animationDuration: isSpinning ? `${Math.max(0.1, 6000 / rpm)}s` : "0s" }}>
                    
                    {/* Rotor slots */}
                    <div className="absolute w-6 h-12 bg-indigo-500/40 rounded-full top-2 border border-indigo-400"></div>
                    <div className="absolute w-6 h-12 bg-indigo-500/40 rounded-full bottom-2 border border-indigo-400"></div>
                    <div className="absolute h-6 w-12 bg-indigo-500/40 rounded-full left-2 border border-indigo-400"></div>
                    <div className="absolute h-6 w-12 bg-indigo-500/40 rounded-full right-2 border border-indigo-400"></div>
                    
                    <div className="w-8 h-8 rounded-full bg-slate-800 border-2 border-slate-600 z-10 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  {isSpinning && (
                    <div className="w-full max-w-xs mt-4 space-y-1">
                      <div className="flex justify-between text-[10px] text-slate-400 font-mono flex-row-reverse">
                        <span>جاري فصل الرواسب بالطرد المركزي...</span>
                        <span>{centrifugeProgress}%</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full transition-all duration-100" style={{ width: `${centrifugeProgress}%` }}></div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Speed Controls */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono text-slate-300 flex-row-reverse">
                    <label className="font-bold text-slate-400">معدل الدوران بالدقيقة (RPM):</label>
                    <span className="text-emerald-400 font-bold">{rpm} RPM</span>
                  </div>
                  <input
                    type="range"
                    min="1000"
                    max="8000"
                    step="500"
                    value={rpm}
                    onChange={(e) => setRpm(parseInt(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer h-2"
                  />
                </div>

                <button
                  onClick={handleStartCentrifuge}
                  disabled={isSpinning}
                  className={`w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    isSpinning ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <Play className="w-4 h-4" />
                  بدء دورة الفصل بالطرد المركزي
                </button>
              </div>
            </div>
          )}

          {/* 3. Burette Titration Panel */}
          {activeTool === "burette" && (
            <div className="space-y-4" id="burette-panel">
              <div className="bg-[#16161d] p-4 rounded-xl border border-white/10 space-y-4">
                <div className="flex justify-between items-center flex-row-reverse">
                  <div>
                    <h3 className="text-xs font-bold text-white flex items-center gap-1.5 flex-row-reverse">
                      <span>💧</span> سحاحة المعايرة الحجمية الدقيقة (Precision Burette Unit)
                    </h3>
                    <p className="text-[10px] text-slate-400">إضافة المحلول القياسي بالقطرة ومراقبة تغيرات الرقم الهيدروجيني pH وانقلاب اللون</p>
                  </div>
                  <span className="text-[10px] text-cyan-400 font-mono bg-cyan-500/10 px-2 py-1 rounded border border-cyan-500/20">
                    الحجم المضاف: {titrantVolume} mL
                  </span>
                </div>

                {/* Titration Live pH Curve Graphic */}
                <div className="bg-black/60 p-3 rounded-xl border border-white/10 space-y-2">
                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono flex-row-reverse">
                    <span>منحنى المعايرة الحجمية (pH مقابل الحجم)</span>
                    <span className="text-emerald-400 font-bold">pH الحالي: {currentPh}</span>
                  </div>

                  <div className="h-32 w-full bg-slate-950 rounded-lg p-2 flex items-end gap-1 relative border border-white/5 overflow-hidden">
                    {titrationCurve.map((pt, idx) => {
                      const hPercent = (pt.ph / 14) * 100;
                      return (
                        <div
                          key={idx}
                          className={`flex-1 rounded-sm transition-all duration-300 ${
                            pt.ph < 6 ? "bg-red-400" : pt.ph > 8 ? "bg-pink-400" : "bg-emerald-400"
                          }`}
                          style={{ height: `${Math.max(5, hPercent)}%` }}
                          title={`حجم: ${pt.v}mL | pH: ${pt.ph}`}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* Titration Control Drop Buttons */}
                <div className="flex gap-2 flex-row-reverse">
                  <button
                    onClick={() => handleAddTitrant(0.1)}
                    className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
                  >
                    +0.1 mL (قطرة ميكرو)
                  </button>
                  <button
                    onClick={() => handleAddTitrant(0.5)}
                    className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
                  >
                    +0.5 mL (قطرتان)
                  </button>
                  <button
                    onClick={() => handleAddTitrant(1.0)}
                    className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
                  >
                    +1.0 mL (جرعة قياسية)
                  </button>
                  <button
                    onClick={() => {
                      setTitrantVolume(0);
                      setTitrationCurve([{ v: 0, ph: currentPh }]);
                      playSynthSound("beep");
                    }}
                    className="px-3 py-2.5 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    تصفير السحاحة
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 4. TLC Chromatography Panel */}
          {activeTool === "tlc" && (
            <div className="space-y-4" id="tlc-panel">
              <div className="bg-[#16161d] p-4 rounded-xl border border-white/10 space-y-4">
                <div className="flex justify-between items-center flex-row-reverse">
                  <div>
                    <h3 className="text-xs font-bold text-white flex items-center gap-1.5 flex-row-reverse">
                      <span>📄</span> الكروماتوجرافيا الورقية بالطبقة الرقيقة (TLC)
                    </h3>
                    <p className="text-[10px] text-slate-400">فصل المركبات العضوية على صفيحة السيليكا وحساب معامل الاحتفاظ (Rf = مسافة البقعة / مسافة المذيب)</p>
                  </div>
                  <span className="text-[10px] text-purple-400 font-mono bg-purple-500/10 px-2 py-1 rounded border border-purple-500/20">
                    معامل الاحتفاظ Rf: 0.64
                  </span>
                </div>

                {/* TLC Plate Simulation */}
                <div className="flex justify-center p-6 bg-black/60 rounded-xl border border-white/10">
                  <div className="w-32 h-52 bg-slate-200 rounded-sm border-2 border-slate-400 relative overflow-hidden flex flex-col justify-between p-2 shadow-2xl">
                    
                    {/* Solvent Front Line */}
                    <div
                      className="absolute left-0 right-0 border-b-2 border-dashed border-sky-600 transition-all duration-100"
                      style={{ bottom: `${tlcProgress}%` }}
                    >
                      <span className="text-[7px] text-sky-800 font-bold bg-white/80 px-1 rounded absolute -top-3 right-1">جبهة المذيب</span>
                    </div>

                    {/* Migrating Spots */}
                    {selectedReactants.map((chem, idx) => {
                      const rfFactor = 0.25 + (idx * 0.22) % 0.6;
                      const spotPos = tlcProgress * rfFactor;
                      return (
                        <div
                          key={chem.id}
                          className="absolute w-4 h-4 rounded-full blur-[1px] border transition-all duration-100 -translate-x-1/2"
                          style={{
                            bottom: `${spotPos}%`,
                            left: `${30 + idx * 25}%`,
                            backgroundColor: chem.category === "acid" ? "#f87171" : chem.category === "organic" ? "#f59e0b" : "#60a5fa",
                            borderColor: "rgba(0,0,0,0.3)"
                          }}
                          title={`بقعة ${chem.name} (Rf = ${rfFactor.toFixed(2)})`}
                        />
                      );
                    })}

                    {/* Baseline */}
                    <div className="w-full border-b border-slate-500 text-[8px] text-slate-600 font-mono text-center pb-0.5">
                      خط البداية (Origin)
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleRunTLC}
                  disabled={tlcRunning}
                  className={`w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    tlcRunning ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <Play className="w-4 h-4" />
                  تشغيل صفيحة الكروماتوجرافيا (TLC)
                </button>
              </div>
            </div>
          )}

          {/* 5. Analytical Balance Panel */}
          {activeTool === "balance" && (
            <div className="space-y-4" id="balance-panel">
              <div className="bg-[#16161d] p-4 rounded-xl border border-white/10 space-y-4">
                <div className="flex justify-between items-center flex-row-reverse">
                  <div>
                    <h3 className="text-xs font-bold text-white flex items-center gap-1.5 flex-row-reverse">
                      <span>⚖️</span> الميزان التحليلي الدقيق (Analytical Balance 0.0001g)
                    </h3>
                    <p className="text-[10px] text-slate-400">قياس الكتلة بدقة متناهية وحساب المولات والتركيز المولي</p>
                  </div>
                  <span className="text-[10px] text-amber-400 font-mono bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20">
                    الدقة: ±0.0001 g
                  </span>
                </div>

                {/* Digital Scale Readout LCD */}
                <div className="bg-black p-6 rounded-xl border-2 border-slate-700 font-mono text-center space-y-2 shadow-2xl">
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest block">قراءة الميزان الرقمي الكهرومغناطيسي</span>
                  <div className="text-4xl text-emerald-400 font-bold tracking-wider" dir="ltr">
                    {calculateTotalMassGrams().toFixed(4)} g
                  </div>
                </div>

                {/* Reactants Mass breakdown */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-300">تفاصيل كتل المواد المتفاعلة بالدورق:</h4>
                  {selectedReactants.map(chem => (
                    <div key={chem.id} className="flex justify-between items-center bg-black/30 p-2.5 rounded-lg border border-white/5 text-xs flex-row-reverse">
                      <span className="text-slate-200 font-medium">{chem.name} ({chem.formula})</span>
                      <span className="text-amber-400 font-mono font-bold" dir="ltr">25.4000 g (0.25 mol)</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => {
                    setTare(selectedReactants.length * 25.4);
                    playSynthSound("beep");
                  }}
                  className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-black font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  تصفير الميزان (Tare / Zero Scale)
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
