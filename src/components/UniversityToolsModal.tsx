import React, { useEffect, useMemo, useState } from "react";
import {
  Activity,
  Droplets,
  Layers,
  Microscope,
  RefreshCw,
  RotateCw,
  Scale,
  X,
} from "lucide-react";
import { Chemical, ReactionDetail } from "../types";
import { CHEMICAL_DATABASE } from "../data";
import { GlassIcon, GlassTone } from "./GlassIcon";
import { ChemicalFormula } from "./ChemicalFormula";
import { playSound } from "../utils/soundEngine";

interface UniversityToolsModalProps {
  mode?: "page" | "modal";
  isOpen?: boolean;
  onClose?: () => void;
  selectedReactants: Chemical[];
  activeReaction: ReactionDetail | null;
}

type InstrumentTab =
  | "uvvis"
  | "centrifuge"
  | "titration"
  | "tlc"
  | "balance";

const INSTRUMENT_TABS: {
  id: InstrumentTab;
  title: string;
  shortTitle: string;
  tone: GlassTone;
  renderIcon: (s: number) => React.ReactNode;
}[] = [
  {
    id: "uvvis",
    title: "مطياف الأشعة UV-Vis",
    shortTitle: "مطياف UV-Vis",
    tone: "cyan",
    renderIcon: (s) => <Activity size={s} />,
  },
  {
    id: "centrifuge",
    title: "الطرد المركزي المخبري",
    shortTitle: "طرد مركزي",
    tone: "blue",
    renderIcon: (s) => <RotateCw size={s} />,
  },
  {
    id: "titration",
    title: "سحاحة المعايرة الحجمية",
    shortTitle: "المعايرة",
    tone: "violet",
    renderIcon: (s) => <Droplets size={s} />,
  },
  {
    id: "tlc",
    title: "كروماتوغرافيا الطبقة الرقيقة TLC",
    shortTitle: "تحليل TLC",
    tone: "emerald",
    renderIcon: (s) => <Layers size={s} />,
  },
  {
    id: "balance",
    title: "الميزان التحليلي 0.0001 g",
    shortTitle: "الميزان",
    tone: "amber",
    renderIcon: (s) => <Scale size={s} />,
  },
];

function wavelengthToCssColor(nm: number): string {
  if (nm < 420) return "#8b5cf6";
  if (nm < 485) return "#3b82f6";
  if (nm < 515) return "#06b6d4";
  if (nm < 565) return "#10b981";
  if (nm < 590) return "#eab308";
  if (nm < 625) return "#f97316";
  return "#ef4444";
}

export const UniversityToolsModal: React.FC<UniversityToolsModalProps> = ({
  mode = "page",
  isOpen = true,
  onClose,
  selectedReactants,
  activeReaction,
}) => {
  const [activeTab, setActiveTab] = useState<InstrumentTab>("uvvis");

  // 1. UV-Vis Spectrophotometer State
  const [wavelengthNm, setWavelengthNm] = useState(480);
  const [concentrationMol, setConcentrationMol] = useState(0.05);

  // 2. Centrifuge State
  const [rpm, setRpm] = useState(4000);
  const [isSpinning, setIsSpinning] = useState(false);
  const [separationDone, setSeparationDone] = useState(false);

  // 3. Volumetric Burette Titration State
  const [analyteAcid, setAnalyteAcid] = useState<"hcl" | "ch3cooh">("hcl");
  const [titrantVolumeMl, setTitrantVolumeMl] = useState(0);
  const [indicatorType, setIndicatorType] = useState<
    "phenolphthalein" | "methyl_orange"
  >("phenolphthalein");

  // 4. TLC State
  const [ethylAcetateRatio, setEthylAcetateRatio] = useState(35); // % in Hexane
  const [tlcDeveloped, setTlcDeveloped] = useState(true);

  // 5. Analytical Microbalance State
  const [selectedWeighChemId, setSelectedWeighChemId] = useState("cuso4");
  const [grossMassG, setGrossMassG] = useState(1.25); // includes 0.8500g boat
  const [tareOffsetG, setTareOffsetG] = useState(0.85);

  useEffect(() => {
    if (mode !== "modal" || !isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && onClose) onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [mode, isOpen, onClose]);

  useEffect(() => {
    if (!isSpinning) return;
    const timer = window.setTimeout(() => {
      setIsSpinning(false);
      setSeparationDone(true);
    }, 2400);
    return () => window.clearTimeout(timer);
  }, [isSpinning]);

  // Determine characteristic peak lambda_max based on beaker contents
  const sampleOpticalProfile = useMemo(() => {
    const ids = selectedReactants.map((r) => r.id);
    if (ids.includes("fecl3") && ids.includes("kscn")) {
      return {
        sampleName: "معقد ثيوسيانات الحديد [Fe(SCN)]²⁺",
        lambdaMax: 480,
        epsilon: 46,
      };
    }
    if (ids.includes("kmno4")) {
      return {
        sampleName: "محلول برمنغنات البوتاسيوم KMnO₄",
        lambdaMax: 525,
        epsilon: 42,
      };
    }
    if (ids.includes("cuso4")) {
      return {
        sampleName: "محلول كبريتات النحاس الثنائي CuSO₄",
        lambdaMax: 635,
        epsilon: 28,
      };
    }
    if (ids.includes("k2cr2o7")) {
      return {
        sampleName: "محلول ثنائي كرومات البوتاسيوم K₂Cr₂O₇",
        lambdaMax: 450,
        epsilon: 35,
      };
    }
    return {
      sampleName:
        selectedReactants.length > 0
          ? selectedReactants.map((c) => c.name).join(" + ")
          : "محلول قياسي مرجعي [Fe(SCN)]²⁺",
      lambdaMax: 480,
      epsilon: 34,
    };
  }, [selectedReactants]);

  // Beer-Lambert Law: A(lambda) = epsilon(lambda) * l(1cm) * c
  const calcAbsorbanceAt = (nm: number) => {
    const sigma = 42;
    const gaussian = Math.exp(
      -Math.pow(nm - sampleOpticalProfile.lambdaMax, 2) / (2 * sigma * sigma)
    );
    return Math.min(
      2.5,
      Number(
        (
          sampleOpticalProfile.epsilon *
          concentrationMol *
          (0.08 + 0.92 * gaussian)
        ).toFixed(3)
      )
    );
  };

  const currentAbsorbance = calcAbsorbanceAt(wavelengthNm);
  const transmittancePct = Math.pow(10, -currentAbsorbance) * 100;

  // RCF = 1.118e-5 * r(cm=10) * RPM^2
  const rcfValue = Math.round(1.118e-5 * 10 * rpm * rpm);

  // Titration pH curve (25.0 mL of 0.10 M Acid titrated with 0.10 M NaOH)
  const calcTitrationPh = (volNaohMl: number) => {
    const vAcid = 25.0;
    const c = 0.1;
    const molesAcid = (vAcid / 1000) * c;
    const molesBase = (volNaohMl / 1000) * c;
    const totalVolL = (vAcid + volNaohMl) / 1000;

    if (Math.abs(volNaohMl - 25.0) < 0.05) {
      return analyteAcid === "hcl" ? 7.0 : 8.72;
    }
    if (molesBase < molesAcid) {
      if (analyteAcid === "hcl") {
        const hPlus = (molesAcid - molesBase) / totalVolL;
        return Math.max(1.0, -Math.log10(hPlus));
      } else {
        // Henderson-Hasselbalch for CH3COOH (pKa = 4.76)
        if (volNaohMl <= 0.01) return 2.88;
        const ratio = molesBase / (molesAcid - molesBase);
        return 4.76 + Math.log10(ratio);
      }
    } else {
      const ohMinus = (molesBase - molesAcid) / totalVolL;
      const pOH = -Math.log10(ohMinus);
      return Math.min(13.2, 14 - pOH);
    }
  };

  const currentTitrationPh = calcTitrationPh(titrantVolumeMl);

  const titrationFlaskTint = useMemo(() => {
    if (indicatorType === "phenolphthalein") {
      if (currentTitrationPh >= 8.2) {
        return "rgba(236, 72, 153, 0.58)";
      }
      return "rgba(226, 232, 240, 0.25)";
    } else {
      if (currentTitrationPh < 3.2) return "rgba(244, 63, 94, 0.52)";
      if (currentTitrationPh < 4.4) return "rgba(251, 146, 60, 0.52)";
      return "rgba(250, 204, 21, 0.48)";
    }
  }, [indicatorType, currentTitrationPh]);

  // TLC Spots (3 components with distinct polarities)
  const tlcSpots = useMemo(() => {
    const polarityFactor = ethylAcetateRatio / 100;
    return [
      {
        name: "مركب غير قطبي (نفثالين)",
        color: "#38bdf8",
        rf: Math.min(0.92, Number((0.45 + polarityFactor * 0.45).toFixed(2))),
      },
      {
        name: "مركب متوسط القطبية (أسيتوفينون)",
        color: "#a855f7",
        rf: Math.min(0.84, Number((0.22 + polarityFactor * 0.56).toFixed(2))),
      },
      {
        name: "مركب قطبي (حمض البنزويك)",
        color: "#f43f5e",
        rf: Math.min(0.68, Number((0.06 + polarityFactor * 0.52).toFixed(2))),
      },
    ];
  }, [ethylAcetateRatio]);

  // Analytical Balance Calculations
  const weighedChemical =
    CHEMICAL_DATABASE.find((c) => c.id === selectedWeighChemId) ||
    CHEMICAL_DATABASE[0];
  const displayedNetMassG = Math.max(0, grossMassG - tareOffsetG);
  const molarMass = weighedChemical.molarMass || 58.44;
  const molesMmol = (displayedNetMassG / molarMass) * 1000;

  if (mode === "modal" && !isOpen) return null;

  const content = (
    <div className="space-y-5">
      {/* Header */}
      <div className="glass-panel rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <GlassIcon
            icon={<Microscope size={22} />}
            tone="emerald"
            shape="module"
            interactive={false}
          />
          <div>
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
              جناح الأجهزة التحليلية الجامعية
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              أدوات قياس طيفية، حجمية، ووزنية مرتبطة مباشرة بكواشف المختبر
            </p>
          </div>
        </div>

        {mode === "modal" && onClose && (
          <button
            type="button"
            onClick={() => {
              playSound("modal_close");
              onClose();
            }}
            aria-label="إغلاق جناح الأجهزة"
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-300/70 dark:border-slate-700 bg-white/75 dark:bg-slate-900/75 text-slate-700 dark:text-slate-200 hover:border-rose-500/50 transition active:scale-95"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Instrument Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
        {INSTRUMENT_TABS.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                playSound("select");
                setActiveTab(tab.id);
              }}
              className={`group inline-flex min-h-[46px] shrink-0 items-center gap-2.5 rounded-2xl border px-4 py-2 text-xs sm:text-sm font-bold transition-all active:scale-95 ${
                active
                  ? "border-blue-500/50 dark:border-cyan-400/50 bg-blue-600/12 dark:bg-cyan-400/15 text-blue-700 dark:text-cyan-300 shadow-xs"
                  : "glass-card text-slate-700 dark:text-slate-300 hover:border-blue-400/40"
              }`}
            >
              <GlassIcon
                icon={tab.renderIcon(16)}
                tone={tab.tone}
                shape="compact"
                active={active}
              />
              <span className="hidden sm:inline">{tab.title}</span>
              <span className="sm:hidden">{tab.shortTitle}</span>
            </button>
          );
        })}
      </div>

      {/* Instrument Active Workspace */}
      {activeTab === "uvvis" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-5 glass-panel rounded-2xl p-5 space-y-5">
            <div>
              <p className="text-xs font-semibold text-cyan-700 dark:text-cyan-300">
                قانون بير-لامبرت · A = ε · l · c
              </p>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white mt-0.5">
                {sampleOpticalProfile.sampleName}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                قمة الامتصاص المميزة λmax ={" "}
                <span className="font-mono tabular-nums font-bold">
                  {sampleOpticalProfile.lambdaMax} nm
                </span>
              </p>
            </div>

            {/* Wavelength Control */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-700 dark:text-slate-300">
                  الطول الموجي الساقط (λ)
                </span>
                <span
                  dir="ltr"
                  className="font-mono tabular-nums text-blue-700 dark:text-cyan-300"
                >
                  {wavelengthNm} nm
                </span>
              </div>
              <input
                type="range"
                min={380}
                max={750}
                step={5}
                value={wavelengthNm}
                onChange={(e) => setWavelengthNm(Number(e.target.value))}
                className="w-full accent-cyan-500 h-2 rounded-lg cursor-pointer"
              />
              <div
                aria-hidden="true"
                className="h-2.5 w-full rounded-full"
                style={{
                  background:
                    "linear-gradient(to left, #ef4444, #f97316, #eab308, #10b981, #06b6d4, #3b82f6, #8b5cf6)",
                }}
              />
            </div>

            {/* Molar Concentration Control */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-700 dark:text-slate-300">
                  التركيز المولاري للعينة (c)
                </span>
                <span
                  dir="ltr"
                  className="font-mono tabular-nums text-blue-700 dark:text-cyan-300"
                >
                  {concentrationMol.toFixed(3)} mol/L
                </span>
              </div>
              <input
                type="range"
                min={0.005}
                max={0.1}
                step={0.005}
                value={concentrationMol}
                onChange={(e) => setConcentrationMol(Number(e.target.value))}
                className="w-full accent-blue-600 h-2 rounded-lg cursor-pointer"
              />
            </div>

            {/* Digital Optical Readouts */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="rounded-xl bg-slate-900/5 dark:bg-slate-950/65 p-3.5 border border-slate-200/80 dark:border-slate-800">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  الامتصاصية الضوئية (A)
                </span>
                <div
                  dir="ltr"
                  className="mt-1 text-2xl font-extrabold font-mono tabular-nums text-slate-900 dark:text-white text-end"
                >
                  {currentAbsorbance.toFixed(3)}
                </div>
              </div>
              <div className="rounded-xl bg-slate-900/5 dark:bg-slate-950/65 p-3.5 border border-slate-200/80 dark:border-slate-800">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  النفاذية المئوية (%T)
                </span>
                <div
                  dir="ltr"
                  className="mt-1 text-2xl font-extrabold font-mono tabular-nums text-cyan-600 dark:text-cyan-300 text-end"
                >
                  {transmittancePct.toFixed(1)}%
                </div>
              </div>
            </div>
          </div>

          {/* Absorption Spectrum Plot */}
          <div className="lg:col-span-7 glass-panel rounded-2xl p-5 flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                منحنى طيف الامتصاص الجزيئي (380 – 750 nm)
              </h3>
              <span
                className="inline-block h-3.5 w-8 rounded-full border border-white/30"
                style={{ backgroundColor: wavelengthToCssColor(wavelengthNm) }}
              />
            </div>

            <div className="relative w-full overflow-hidden rounded-xl bg-slate-950/90 p-4 border border-slate-800">
              <svg
                viewBox="0 0 420 190"
                className="w-full h-52 overflow-visible"
                aria-label="منحنى الامتصاص الطيفي"
              >
                {/* Grid lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((frac, idx) => (
                  <line
                    key={idx}
                    x1={36}
                    x2={404}
                    y1={20 + frac * 140}
                    y2={20 + frac * 140}
                    stroke="rgba(148,163,184,0.16)"
                    strokeDasharray="3 3"
                  />
                ))}

                {/* Spectral Curve Path */}
                <path
                  d={Array.from({ length: 75 }, (_, i) => {
                    const nm = 380 + i * 5;
                    const abs = calcAbsorbanceAt(nm);
                    const x = 36 + ((nm - 380) / 370) * 368;
                    const y = 160 - Math.min(1, abs / 2.5) * 140;
                    return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(
                      1
                    )}`;
                  }).join(" ")}
                  fill="none"
                  stroke="#22d3ee"
                  strokeWidth="2.6"
                />

                {/* Active Wavelength Laser Marker */}
                {(() => {
                  const cx = 36 + ((wavelengthNm - 380) / 370) * 368;
                  const cy =
                    160 - Math.min(1, currentAbsorbance / 2.5) * 140;
                  return (
                    <>
                      <line
                        x1={cx}
                        x2={cx}
                        y1={20}
                        y2={160}
                        stroke={wavelengthToCssColor(wavelengthNm)}
                        strokeWidth="1.5"
                        strokeDasharray="4 3"
                      />
                      <circle
                        cx={cx}
                        cy={cy}
                        r="5.5"
                        fill={wavelengthToCssColor(wavelengthNm)}
                        stroke="#ffffff"
                        strokeWidth="1.8"
                      />
                    </>
                  );
                })()}

                <text
                  x="36"
                  y="178"
                  fill="#94a3b8"
                  fontSize="10"
                  fontFamily="JetBrains Mono"
                >
                  380 nm
                </text>
                <text
                  x="202"
                  y="178"
                  fill="#94a3b8"
                  fontSize="10"
                  fontFamily="JetBrains Mono"
                >
                  565 nm
                </text>
                <text
                  x="368"
                  y="178"
                  fill="#94a3b8"
                  fontSize="10"
                  fontFamily="JetBrains Mono"
                >
                  750 nm
                </text>
              </svg>
            </div>
          </div>
        </div>
      )}

      {activeTab === "centrifuge" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-6 glass-panel rounded-2xl p-5 space-y-5">
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
              فصل الرواسب والمعلقات بالطرد المركزي
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              يُسرّع الدوران العالي ترسيب الدقائق الصلبة غير الذوابة مثل{" "}
              <ChemicalFormula formula="PbI₂(s)" /> أو{" "}
              <ChemicalFormula formula="AgCl(s)" /> في قاع الأنبوب المخروطي.
            </p>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-700 dark:text-slate-300">
                  سرعة الدوران (RPM)
                </span>
                <span
                  dir="ltr"
                  className="font-mono tabular-nums text-blue-600 dark:text-cyan-300"
                >
                  {rpm} RPM · {rcfValue} ×g
                </span>
              </div>
              <input
                type="range"
                min={1000}
                max={8000}
                step={500}
                value={rpm}
                onChange={(e) => setRpm(Number(e.target.value))}
                className="w-full accent-blue-600 h-2 rounded-lg cursor-pointer"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                disabled={isSpinning}
                onClick={() => {
                  setSeparationDone(false);
                  setIsSpinning(true);
                }}
                className="flex-1 min-h-[46px] rounded-xl bg-gradient-to-l from-blue-600 to-cyan-600 px-5 py-2.5 text-sm font-bold text-white shadow-md disabled:opacity-60 transition"
              >
                {isSpinning ? "جاري الفصل الدوراني..." : "تشغيل الطرد المركزي"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsSpinning(false);
                  setSeparationDone(false);
                }}
                className="min-h-[46px] rounded-xl glass-card px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200"
              >
                إعادة خلط العينة
              </button>
            </div>
          </div>

          <div className="lg:col-span-6 glass-panel rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-around gap-6">
            {/* Rotor Visualization */}
            <div className="flex flex-col items-center gap-2">
              <div
                className={`relative flex h-36 w-36 items-center justify-center rounded-full border-4 border-slate-300 dark:border-slate-700 bg-slate-900/10 dark:bg-slate-950/80 ${
                  isSpinning ? "animate-spin" : ""
                }`}
              >
                {[0, 60, 120, 180, 240, 300].map((deg) => (
                  <span
                    key={deg}
                    style={{ transform: `rotate(${deg}deg) translateY(-46px)` }}
                    className="absolute h-4 w-4 rounded-full bg-cyan-500/80 border border-white/50"
                  />
                ))}
                <div className="h-10 w-10 rounded-full bg-slate-700 dark:bg-slate-800 border border-slate-500 flex items-center justify-center text-[10px] font-mono text-white">
                  RCF
                </div>
              </div>
              <span className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
                {rcfValue} ×g
              </span>
            </div>

            {/* Conical Centrifuge Tube Result */}
            <div className="flex flex-col items-center gap-2">
              <div className="relative h-44 w-16 rounded-b-3xl rounded-t-lg border-2 border-slate-400/70 dark:border-slate-600 bg-white/30 dark:bg-slate-950/60 overflow-hidden">
                {/* Supernatant */}
                <div
                  className="absolute inset-x-0 bottom-0 h-32 transition-all duration-700"
                  style={{
                    backgroundColor: separationDone
                      ? "rgba(186, 230, 253, 0.25)"
                      : activeReaction?.liquidColor ||
                        "rgba(250, 204, 21, 0.45)",
                  }}
                />
                {/* Compacted Pellet */}
                <div
                  className={`absolute inset-x-2 bottom-1 rounded-b-2xl transition-all duration-700 ${
                    separationDone ? "h-7 opacity-100" : "h-2 opacity-35"
                  }`}
                  style={{
                    backgroundColor:
                      activeReaction?.precipitateColor || "#facc15",
                  }}
                />
              </div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {separationDone
                  ? "انفصل الراسب الصلب (Pellet) عن الراشح الصافي"
                  : "أنبوب العينة المعلقة قبل الترسيب"}
              </span>
            </div>
          </div>
        </div>
      )}

      {activeTab === "titration" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-5 glass-panel rounded-2xl p-5 space-y-4">
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
              معايرة حجمية دقيقة (25.0 mL حمض 0.10 M)
            </h2>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setAnalyteAcid("hcl");
                  setTitrantVolumeMl(0);
                }}
                className={`min-h-[42px] rounded-xl border text-xs font-bold transition ${
                  analyteAcid === "hcl"
                    ? "bg-blue-600 text-white border-blue-600"
                    : "glass-card text-slate-700 dark:text-slate-300"
                }`}
              >
                حمض قوي HCl
              </button>
              <button
                type="button"
                onClick={() => {
                  setAnalyteAcid("ch3cooh");
                  setTitrantVolumeMl(0);
                }}
                className={`min-h-[42px] rounded-xl border text-xs font-bold transition ${
                  analyteAcid === "ch3cooh"
                    ? "bg-blue-600 text-white border-blue-600"
                    : "glass-card text-slate-700 dark:text-slate-300"
                }`}
              >
                حمض ضعيف CH₃COOH
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setIndicatorType("phenolphthalein")}
                className={`min-h-[40px] rounded-xl border text-xs font-bold transition ${
                  indicatorType === "phenolphthalein"
                    ? "bg-pink-600 text-white border-pink-600"
                    : "glass-card text-slate-700 dark:text-slate-300"
                }`}
              >
                دليل الفينولفثالين
              </button>
              <button
                type="button"
                onClick={() => setIndicatorType("methyl_orange")}
                className={`min-h-[40px] rounded-xl border text-xs font-bold transition ${
                  indicatorType === "methyl_orange"
                    ? "bg-amber-600 text-white border-amber-600"
                    : "glass-card text-slate-700 dark:text-slate-300"
                }`}
              >
                الميثيل البرتقالي
              </button>
            </div>

            {/* Precision Dropper Steppers */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-700 dark:text-slate-300">
                  حجم NaOH المضاف من السحاحة
                </span>
                <span
                  dir="ltr"
                  className="font-mono tabular-nums text-blue-700 dark:text-cyan-300"
                >
                  {titrantVolumeMl.toFixed(1)} mL
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={50}
                step={0.1}
                value={titrantVolumeMl}
                onChange={(e) => setTitrantVolumeMl(Number(e.target.value))}
                className="w-full accent-violet-600 h-2 rounded-lg cursor-pointer"
              />
              <div className="grid grid-cols-4 gap-2 pt-1">
                {[0.1, 1.0, 5.0].map((inc) => (
                  <button
                    key={inc}
                    type="button"
                    onClick={() =>
                      setTitrantVolumeMl((v) =>
                        Math.min(50, Number((v + inc).toFixed(1)))
                      )
                    }
                    className="min-h-[42px] rounded-xl glass-card text-xs font-mono font-bold text-slate-800 dark:text-slate-100 hover:border-blue-500"
                  >
                    +{inc} mL
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setTitrantVolumeMl(0)}
                  aria-label="تصفير السحاحة"
                  className="min-h-[42px] inline-flex items-center justify-center rounded-xl glass-card text-rose-600 dark:text-rose-300"
                >
                  <RefreshCw size={15} />
                </button>
              </div>
            </div>

            {/* Live pH & Flask Indicator Preview */}
            <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-900/5 dark:bg-slate-950/60 p-4">
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  قراءة مقياس pH الفورية
                </div>
                <div
                  dir="ltr"
                  className="text-2xl font-extrabold font-mono tabular-nums text-slate-900 dark:text-white text-start"
                >
                  pH {currentTitrationPh.toFixed(2)}
                </div>
                <div className="text-[11px] text-emerald-700 dark:text-emerald-300 font-semibold mt-0.5">
                  {Math.abs(titrantVolumeMl - 25.0) <= 0.2
                    ? "نقطة التكافؤ المولية (25.0 mL)"
                    : titrantVolumeMl < 25
                    ? "منطقة الفائض الحمضي"
                    : "منطقة الفائض القاعدي"}
                </div>
              </div>
              <div
                className="h-14 w-14 rounded-2xl border-2 border-slate-400/60 dark:border-slate-600 transition-colors duration-300"
                style={{ backgroundColor: titrationFlaskTint }}
                title="لون المحلول داخل الدورق المخروطي"
              />
            </div>
          </div>

          {/* Sigmoid Titration Curve */}
          <div className="lg:col-span-7 glass-panel rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              منحنى المعايرة الحجمي (pH مقابل حجم NaOH mL)
            </h3>
            <div className="rounded-xl bg-slate-950/90 p-4 border border-slate-800">
              <svg
                viewBox="0 0 420 190"
                className="w-full h-52"
                aria-label="منحنى المعايرة"
              >
                {[0, 7, 14].map((phMark) => {
                  const y = 160 - (phMark / 14) * 140;
                  return (
                    <g key={phMark}>
                      <line
                        x1={36}
                        x2={404}
                        y1={y}
                        y2={y}
                        stroke="rgba(148,163,184,0.18)"
                        strokeDasharray="3 3"
                      />
                      <text
                        x={8}
                        y={y + 3}
                        fill="#94a3b8"
                        fontSize="10"
                        fontFamily="JetBrains Mono"
                      >
                        pH {phMark}
                      </text>
                    </g>
                  );
                })}
                <path
                  d={Array.from({ length: 101 }, (_, idx) => {
                    const vol = idx * 0.5;
                    const ph = calcTitrationPh(vol);
                    const x = 36 + (vol / 50) * 368;
                    const y = 160 - (ph / 14) * 140;
                    return `${idx === 0 ? "M" : "L"} ${x.toFixed(
                      1
                    )} ${y.toFixed(1)}`;
                  }).join(" ")}
                  fill="none"
                  stroke="#a78bfa"
                  strokeWidth="2.5"
                />
                {(() => {
                  const cx = 36 + (titrantVolumeMl / 50) * 368;
                  const cy = 160 - (currentTitrationPh / 14) * 140;
                  return (
                    <circle
                      cx={cx}
                      cy={cy}
                      r="5.5"
                      fill="#22d3ee"
                      stroke="#ffffff"
                      strokeWidth="1.8"
                    />
                  );
                })()}
              </svg>
            </div>
          </div>
        </div>
      )}

      {activeTab === "tlc" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-6 glass-panel rounded-2xl p-5 space-y-4">
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
              كروماتوغرافيا الطبقة الرقيقة (Silica Gel TLC)
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              اضبط نسبة أسيتات الإيثيل القطبي في الهكسان لدراسة تغير معامل
              الإعاقة <span className="font-mono">Rf = d_spot / d_solvent</span>
              .
            </p>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-700 dark:text-slate-300">
                  نسبة أسيتات الإيثيل (الطور المتحرك)
                </span>
                <span
                  dir="ltr"
                  className="font-mono tabular-nums text-emerald-700 dark:text-emerald-300"
                >
                  {ethylAcetateRatio}% EtOAc : {100 - ethylAcetateRatio}% Hexane
                </span>
              </div>
              <input
                type="range"
                min={5}
                max={85}
                step={5}
                value={ethylAcetateRatio}
                onChange={(e) => {
                  setEthylAcetateRatio(Number(e.target.value));
                  setTlcDeveloped(true);
                }}
                className="w-full accent-emerald-600 h-2 rounded-lg cursor-pointer"
              />
            </div>

            <div className="space-y-2">
              {tlcSpots.map((spot) => (
                <div
                  key={spot.name}
                  className="flex items-center justify-between rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-900/5 dark:bg-slate-950/55 px-3.5 py-2.5 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: spot.color }}
                    />
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {spot.name}
                    </span>
                  </div>
                  <span
                    dir="ltr"
                    className="font-mono tabular-nums font-bold text-blue-700 dark:text-cyan-300"
                  >
                    Rf = {spot.rf.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-6 glass-panel rounded-2xl p-6 flex items-center justify-center">
            {/* Silica Plate Diagram */}
            <div className="relative h-64 w-48 rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 shadow-inner p-3">
              {/* Solvent Front Line */}
              <div className="absolute inset-x-3 top-6 border-b border-dashed border-cyan-500 text-[10px] font-mono text-cyan-600 dark:text-cyan-300">
                جبهة المذيب
              </div>
              {/* Baseline */}
              <div className="absolute inset-x-3 bottom-6 border-b border-slate-400 dark:border-slate-500 text-[10px] font-mono text-slate-500">
                خط البداية
              </div>

              {tlcSpots.map((spot, idx) => {
                const leftPct = 22 + idx * 28;
                const travelPx = tlcDeveloped ? spot.rf * 176 : 0;
                return (
                  <span
                    key={spot.name}
                    style={{
                      left: `${leftPct}%`,
                      bottom: `${24 + travelPx}px`,
                      backgroundColor: spot.color,
                    }}
                    className="absolute h-4 w-4 -translate-x-1/2 rounded-full shadow-md transition-all duration-500"
                  />
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === "balance" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-6 glass-panel rounded-2xl p-5 space-y-4">
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
              الميزان التحليلي الحساس (دقة 0.0001 g)
            </h2>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                اختر المادة لحساب عدد المولات المقابل للكتلة الموزونة
              </label>
              <select
                value={selectedWeighChemId}
                onChange={(e) => setSelectedWeighChemId(e.target.value)}
                className="h-11 w-full rounded-xl border border-slate-300/80 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm font-semibold text-slate-900 dark:text-white"
              >
                {CHEMICAL_DATABASE.map((chem) => (
                  <option key={chem.id} value={chem.id}>
                    {chem.name} ({chem.formula}) — {chem.molarMass || 58.44}{" "}
                    g/mol
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[0.05, 0.25, 1.0].map((addG) => (
                <button
                  key={addG}
                  type="button"
                  onClick={() =>
                    setGrossMassG((m) => Number((m + addG).toFixed(4)))
                  }
                  className="min-h-[44px] rounded-xl glass-card text-xs font-mono font-bold text-slate-800 dark:text-slate-100 hover:border-amber-500"
                >
                  +{addG.toFixed(2)} g
                </button>
              ))}
              <button
                type="button"
                onClick={() => setTareOffsetG(grossMassG)}
                className="min-h-[44px] rounded-xl bg-amber-500/18 border border-amber-500/40 text-xs font-extrabold text-amber-800 dark:text-amber-300 hover:bg-amber-500/28 transition"
              >
                تصفير (TARE)
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setGrossMassG(0.85);
                setTareOffsetG(0.85);
              }}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 underline"
            >
              إفراغ جفنة الوزن بالكامل
            </button>
          </div>

          <div className="lg:col-span-6 glass-panel rounded-2xl p-6 flex flex-col justify-between gap-4">
            <div className="rounded-2xl bg-slate-950 p-5 border border-slate-800 text-end">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>ANALYTICAL BALANCE · SHIELD CLOSED</span>
                <span>NET</span>
              </div>
              <div
                dir="ltr"
                className="text-3xl sm:text-4xl font-extrabold font-mono tabular-nums text-emerald-400 tracking-wider"
              >
                {displayedNetMassG.toFixed(4)} g
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-900/5 dark:bg-slate-950/55 p-3.5">
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  الكتلة المولية (Mw)
                </div>
                <div
                  dir="ltr"
                  className="mt-1 text-base font-bold font-mono tabular-nums text-slate-900 dark:text-white text-end"
                >
                  {molarMass.toFixed(2)} g/mol
                </div>
              </div>
              <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-900/5 dark:bg-slate-950/55 p-3.5">
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  كمية المادة المحسوبة (n)
                </div>
                <div
                  dir="ltr"
                  className="mt-1 text-base font-bold font-mono tabular-nums text-blue-700 dark:text-cyan-300 text-end"
                >
                  {molesMmol.toFixed(2)} mmol
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (mode === "modal") {
    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-label="جناح الأجهزة التحليلية الجامعية"
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-2 sm:p-5 overflow-y-auto"
        onClick={onClose}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="my-auto w-full max-w-5xl max-h-[92vh] overflow-y-auto rounded-3xl bg-[#f4f7fb] dark:bg-[#060b19] p-3 sm:p-5 border border-slate-300/70 dark:border-slate-800 shadow-2xl"
        >
          {content}
        </div>
      </div>
    );
  }

  return content;
};
