import React, { useEffect, useMemo, useState } from "react";
import {
  Atom,
  Check,
  FlaskConical,
  Grid,
  LayoutList,
  Plus,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import {
  ElementCategory,
  ElementProperty,
  PERIODIC_ELEMENTS,
} from "../periodicTableData";
import { CHEMICAL_DATABASE } from "../data";
import { Chemical } from "../types";
import { GlassIcon } from "./GlassIcon";
import { ChemicalFormula } from "./ChemicalFormula";
import { playSound } from "../utils/soundEngine";

interface PeriodicTableViewProps {
  mode?: "page" | "modal";
  onClose?: () => void;
  onAddElementToBeaker: (element: ElementProperty) => void;
  onAddChemicalToBeaker: (chemical: Chemical) => void;
  selectedReactants: Chemical[];
}

const CATEGORY_META: Record<
  ElementCategory,
  {
    labelAr: string;
    tileClass: string;
    dotClass: string;
  }
> = {
  "alkali-metal": {
    labelAr: "فلز قلوي",
    tileClass:
      "bg-rose-500/14 dark:bg-rose-500/18 border-rose-500/35 text-rose-900 dark:text-rose-200 hover:border-rose-400",
    dotClass: "bg-rose-500",
  },
  "alkaline-earth-metal": {
    labelAr: "فلز قلوي ترابي",
    tileClass:
      "bg-orange-500/14 dark:bg-orange-500/18 border-orange-500/35 text-orange-900 dark:text-orange-200 hover:border-orange-400",
    dotClass: "bg-orange-500",
  },
  "transition-metal": {
    labelAr: "فلز انتقالي",
    tileClass:
      "bg-blue-500/14 dark:bg-blue-500/18 border-blue-500/35 text-blue-900 dark:text-blue-200 hover:border-blue-400",
    dotClass: "bg-blue-500",
  },
  "post-transition-metal": {
    labelAr: "فلز بعد انتقالي",
    tileClass:
      "bg-teal-500/14 dark:bg-teal-500/18 border-teal-500/35 text-teal-900 dark:text-teal-200 hover:border-teal-400",
    dotClass: "bg-teal-500",
  },
  metalloid: {
    labelAr: "شبه فلز",
    tileClass:
      "bg-emerald-500/14 dark:bg-emerald-500/18 border-emerald-500/35 text-emerald-900 dark:text-emerald-200 hover:border-emerald-400",
    dotClass: "bg-emerald-500",
  },
  "reactive-nonmetal": {
    labelAr: "لافلز نشط",
    tileClass:
      "bg-cyan-500/14 dark:bg-cyan-500/18 border-cyan-500/35 text-cyan-900 dark:text-cyan-200 hover:border-cyan-400",
    dotClass: "bg-cyan-500",
  },
  halogen: {
    labelAr: "هالوجين",
    tileClass:
      "bg-indigo-500/14 dark:bg-indigo-500/18 border-indigo-500/35 text-indigo-900 dark:text-indigo-200 hover:border-indigo-400",
    dotClass: "bg-indigo-500",
  },
  "noble-gas": {
    labelAr: "غاز نبيل",
    tileClass:
      "bg-violet-500/14 dark:bg-violet-500/18 border-violet-500/35 text-violet-900 dark:text-violet-200 hover:border-violet-400",
    dotClass: "bg-violet-500",
  },
  lanthanide: {
    labelAr: "لانثانيد",
    tileClass:
      "bg-amber-500/14 dark:bg-amber-500/18 border-amber-500/35 text-amber-900 dark:text-amber-200 hover:border-amber-400",
    dotClass: "bg-amber-500",
  },
  actinide: {
    labelAr: "أكتينيد",
    tileClass:
      "bg-fuchsia-500/14 dark:bg-fuchsia-500/18 border-fuchsia-500/35 text-fuchsia-900 dark:text-fuchsia-200 hover:border-fuchsia-400",
    dotClass: "bg-fuchsia-500",
  },
};

const FILTER_GROUPS: { id: "all" | ElementCategory; label: string }[] = [
  { id: "all", label: "الكل (118)" },
  { id: "alkali-metal", label: "فلزات قلوية" },
  { id: "alkaline-earth-metal", label: "قلوية ترابية" },
  { id: "transition-metal", label: "فلزات انتقالية" },
  { id: "reactive-nonmetal", label: "لافلزات نشطة" },
  { id: "metalloid", label: "أشباه فلزات" },
  { id: "halogen", label: "هالوجينات" },
  { id: "noble-gas", label: "غازات نبيلة" },
  { id: "lanthanide", label: "لانثانيدات" },
  { id: "actinide", label: "أكتينيدات" },
];

const STATE_AR: Record<ElementProperty["standardState"], string> = {
  solid: "صلب (s)",
  liquid: "سائل (l)",
  gas: "غاز (g)",
};

export const PeriodicTableView: React.FC<PeriodicTableViewProps> = ({
  mode = "page",
  onClose,
  onAddElementToBeaker,
  onAddChemicalToBeaker,
  selectedReactants,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<"all" | ElementCategory>(
    "all"
  );
  const [selectedElement, setSelectedElement] = useState<ElementProperty>(
    PERIODIC_ELEMENTS.find((el) => el.atomicNumber === 11) ||
      PERIODIC_ELEMENTS[0]
  );
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);
  const [mobileViewStyle, setMobileViewStyle] = useState<"cards" | "matrix">(
    "cards"
  );

  // Escape key closes modal or mobile drawer
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (mobileDetailOpen) {
          setMobileDetailOpen(false);
        } else if (mode === "modal" && onClose) {
          onClose();
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileDetailOpen, mode, onClose]);

  const matchingAtomicNumbers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return new Set(
      PERIODIC_ELEMENTS.filter((el) => {
        if (activeCategory !== "all" && el.category !== activeCategory) {
          return false;
        }
        if (!q) return true;
        return (
          el.symbol.toLowerCase().includes(q) ||
          el.nameAr.includes(q) ||
          el.nameEn.toLowerCase().includes(q) ||
          String(el.atomicNumber) === q
        );
      }).map((e) => e.atomicNumber)
    );
  }, [searchQuery, activeCategory]);

  const filteredList = useMemo(
    () =>
      PERIODIC_ELEMENTS.filter((el) =>
        matchingAtomicNumbers.has(el.atomicNumber)
      ),
    [matchingAtomicNumbers]
  );

  // Fast lookup by (period, group) for 18-column grid
  const gridMap = useMemo(() => {
    const map = new Map<string, ElementProperty>();
    for (const el of PERIODIC_ELEMENTS) {
      map.set(`${el.period}-${el.group}`, el);
    }
    return map;
  }, []);

  const linkedReagents = useMemo(() => {
    return selectedElement.reagentsUsed
      .map((id) => CHEMICAL_DATABASE.find((c) => c.id === id))
      .filter((c): c is Chemical => Boolean(c));
  }, [selectedElement]);

  const isElementInBeaker = selectedReactants.some(
    (c) =>
      c.id === `el_${selectedElement.symbol.toLowerCase()}` ||
      (selectedElement.symbol === "Na" && c.id === "na_metal") ||
      (selectedElement.symbol === "Mg" && c.id === "mg_ribbon") ||
      (selectedElement.symbol === "Zn" && c.id === "zn_granules") ||
      (selectedElement.symbol === "Cu" && c.id === "cu_turnings")
  );

  const handleSelectElement = (el: ElementProperty, openDrawerOnMobile: boolean) => {
    playSound("select");
    setSelectedElement(el);
    if (openDrawerOnMobile) {
      playSound("modal_open");
      setMobileDetailOpen(true);
    }
  };

  const renderElementDetailContent = () => {
    const meta = CATEGORY_META[selectedElement.category];
    return (
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <div
              dir="ltr"
              className={`flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-2xl border font-mono ${meta.tileClass}`}
            >
              <span className="text-[10px] opacity-80 tabular-nums leading-none">
                {selectedElement.atomicNumber}
              </span>
              <span className="text-2xl font-extrabold leading-tight">
                {selectedElement.symbol}
              </span>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {meta.labelAr} · {STATE_AR[selectedElement.standardState]}
              </p>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                {selectedElement.nameAr}
              </h3>
              <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
                {selectedElement.nameEn}
              </p>
            </div>
          </div>
        </div>

        {/* Direct Add Element to Beaker CTA */}
        <button
          type="button"
          onClick={() => {
            playSound("select");
            onAddElementToBeaker(selectedElement);
            setMobileDetailOpen(false);
          }}
          className="inline-flex min-h-[46px] w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 px-4 py-2.5 text-sm font-bold text-white shadow-md transition active:scale-[0.98]"
        >
          {isElementInBeaker ? <Check size={17} /> : <Plus size={17} />}
          <span>
            إضافة عنصر {selectedElement.nameAr} ({selectedElement.symbol}) إلى
            الكأس
          </span>
        </button>

        <p className="text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          {selectedElement.descriptionAr}
        </p>

        {/* Atomic Telemetry Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="rounded-xl bg-slate-900/5 dark:bg-slate-950/55 p-3 border border-slate-200/70 dark:border-slate-800">
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              الكتلة الذرية القياسية
            </div>
            <div
              dir="ltr"
              className="mt-0.5 text-sm font-bold font-mono tabular-nums text-slate-900 dark:text-white text-end"
            >
              {selectedElement.atomicMass} u
            </div>
          </div>

          <div className="rounded-xl bg-slate-900/5 dark:bg-slate-950/55 p-3 border border-slate-200/70 dark:border-slate-800">
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              الكهرسلبية (باولنغ)
            </div>
            <div
              dir="ltr"
              className="mt-0.5 text-sm font-bold font-mono tabular-nums text-slate-900 dark:text-white text-end"
            >
              {selectedElement.electronegativity !== undefined
                ? selectedElement.electronegativity.toFixed(2)
                : "—"}
            </div>
          </div>

          <div className="col-span-2 rounded-xl bg-slate-900/5 dark:bg-slate-950/55 p-3 border border-slate-200/70 dark:border-slate-800">
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              التوزيع الإلكتروني المداري
            </div>
            <div
              dir="ltr"
              className="mt-1 text-xs sm:text-sm font-bold font-mono text-blue-700 dark:text-cyan-300"
            >
              {selectedElement.electronConfiguration}
            </div>
          </div>
        </div>

        {/* Linked Laboratory Compounds */}
        {linkedReagents.length > 0 && (
          <div className="space-y-2 pt-1">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <FlaskConical size={14} className="text-cyan-600 dark:text-cyan-400" />
              <span>مركبات مخبرية متوفرة تحتوي على {selectedElement.symbol}</span>
            </h4>
            <div className="space-y-1.5 max-h-44 overflow-y-auto pe-1">
              {linkedReagents.map((chem) => (
                <button
                  key={chem.id}
                  type="button"
                  onClick={() => {
                    onAddChemicalToBeaker(chem);
                    setMobileDetailOpen(false);
                  }}
                  className="flex min-h-[42px] w-full items-center justify-between gap-2 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/60 dark:bg-slate-900/50 hover:border-blue-500/45 px-3 py-2 text-start transition"
                >
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                    {chem.name}
                  </span>
                  <span className="shrink-0 flex items-center gap-1.5 text-xs text-blue-600 dark:text-cyan-300">
                    <ChemicalFormula formula={chem.formula} />
                    <Plus size={14} />
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const mainContent = (
    <div className="space-y-5">
      {/* Header + Search + Mobile View Switcher */}
      <div className="glass-panel rounded-2xl p-4 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <GlassIcon
              icon={<Atom size={22} />}
              tone="violet"
              shape="module"
              interactive={false}
            />
            <div>
              <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
                الجدول الدوري التفاعلي للعناصر (118 عنصراً)
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                اضغط على أي عنصر لعرض خصائصه الذرية أو إضافته مباشرة إلى كأس
                التفاعل
              </p>
            </div>
          </div>

          {mode === "modal" && onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="إغلاق نافذة الجدول الدوري"
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-300/70 dark:border-slate-700 bg-white/70 dark:bg-slate-900/70 text-slate-700 dark:text-slate-200 hover:border-rose-500/50 transition"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Search Input + Mobile Layout Toggle */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search
              size={17}
              className="pointer-events-none absolute top-1/2 -translate-y-1/2 start-3.5 text-slate-400"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث باسم العنصر بالعربية أو الإنجليزية، الرمز الكيميائي (Na, Fe, Au)، أو العدد الذري..."
              className="h-11 w-full rounded-xl border border-slate-300/80 dark:border-slate-700/80 bg-white/85 dark:bg-slate-950/65 ps-10 pe-4 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Mobile-only layout mode toggle */}
          <div className="flex md:hidden items-center gap-1.5 rounded-xl border border-slate-300/70 dark:border-slate-700/80 bg-white/70 dark:bg-slate-900/60 p-1">
            <button
              type="button"
              onClick={() => setMobileViewStyle("cards")}
              className={`flex-1 inline-flex min-h-[38px] items-center justify-center gap-1.5 rounded-lg px-3 text-xs font-bold transition ${
                mobileViewStyle === "cards"
                  ? "bg-blue-600 text-white"
                  : "text-slate-600 dark:text-slate-300"
              }`}
            >
              <LayoutList size={15} />
              <span>بطاقات واضحة</span>
            </button>
            <button
              type="button"
              onClick={() => setMobileViewStyle("matrix")}
              className={`flex-1 inline-flex min-h-[38px] items-center justify-center gap-1.5 rounded-lg px-3 text-xs font-bold transition ${
                mobileViewStyle === "matrix"
                  ? "bg-blue-600 text-white"
                  : "text-slate-600 dark:text-slate-300"
              }`}
            >
              <Grid size={15} />
              <span>الشبكة (18 عمود)</span>
            </button>
          </div>
        </div>

        {/* Category Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
          {FILTER_GROUPS.map((grp) => {
            const active = activeCategory === grp.id;
            const dotClass =
              grp.id === "all"
                ? "bg-blue-500"
                : CATEGORY_META[grp.id].dotClass;
            return (
              <button
                key={grp.id}
                type="button"
                onClick={() => setActiveCategory(grp.id)}
                className={`inline-flex min-h-[38px] shrink-0 items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-bold transition ${
                  active
                    ? "border-blue-500 bg-blue-600 text-white shadow-xs"
                    : "border-slate-300/70 dark:border-slate-700/80 bg-white/70 dark:bg-slate-900/55 text-slate-700 dark:text-slate-300 hover:border-blue-400"
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    active ? "bg-white" : dotClass
                  }`}
                />
                <span>{grp.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile Smart Card Grid (< 768px when "cards" active) */}
      {mobileViewStyle === "cards" && (
        <div className="md:hidden grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {filteredList.map((el) => {
            const meta = CATEGORY_META[el.category];
            return (
              <div
                key={el.atomicNumber}
                className="glass-card rounded-2xl p-3 flex flex-col justify-between gap-2.5"
              >
                <button
                  type="button"
                  onClick={() => handleSelectElement(el, true)}
                  className="flex items-start justify-between gap-2 text-start w-full"
                >
                  <div className="min-w-0">
                    <span className="text-[11px] font-mono tabular-nums text-slate-500 dark:text-slate-400">
                      #{el.atomicNumber} · {el.atomicMass}
                    </span>
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white truncate">
                      {el.nameAr}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {meta.labelAr}
                    </p>
                  </div>
                  <span
                    dir="ltr"
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border font-mono text-base font-extrabold ${meta.tileClass}`}
                  >
                    {el.symbol}
                  </span>
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onAddElementToBeaker(el)}
                    className="flex-1 inline-flex min-h-[38px] items-center justify-center gap-1 rounded-xl bg-blue-600/12 dark:bg-cyan-400/15 hover:bg-blue-600 hover:text-white text-xs font-bold text-blue-700 dark:text-cyan-300 transition"
                  >
                    <Plus size={14} />
                    <span>للكأس</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectElement(el, true)}
                    className="inline-flex min-h-[38px] items-center justify-center rounded-xl border border-slate-300/70 dark:border-slate-700 px-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300"
                  >
                    تفاصيل
                  </button>
                </div>
              </div>
            );
          })}
          {filteredList.length === 0 && (
            <div className="col-span-full glass-card rounded-2xl p-8 text-center text-sm text-slate-500 dark:text-slate-400">
              لا توجد عناصر مطابقة لعبارة البحث الحالية.
            </div>
          )}
        </div>
      )}

      {/* Spatial 18-Column Matrix + Desktop Inspector */}
      <div
        className={`${
          mobileViewStyle === "cards" ? "hidden md:grid" : "grid"
        } grid-cols-1 xl:grid-cols-12 gap-5 items-start`}
      >
        {/* 18-Column IUPAC Matrix */}
        <div className="xl:col-span-8 glass-panel rounded-2xl p-3 sm:p-4 overflow-x-auto">
          <div dir="ltr" className="min-w-[820px] space-y-3">
            {/* Periods 1..7 */}
            <div className="grid grid-cols-18 gap-1">
              {[1, 2, 3, 4, 5, 6, 7].map((period) =>
                Array.from({ length: 18 }, (_, i) => i + 1).map((group) => {
                  const el = gridMap.get(`${period}-${group}`);
                  if (!el) {
                    // Lanthanide / Actinide series placeholders at (6,3) and (7,3)
                    if (period === 6 && group === 3) {
                      return (
                        <div
                          key="lanth-marker"
                          className="flex h-12 flex-col items-center justify-center rounded-lg border border-dashed border-amber-500/40 bg-amber-500/8 text-[9px] font-mono text-amber-700 dark:text-amber-300"
                        >
                          <span>57–71</span>
                          <span>La–Lu</span>
                        </div>
                      );
                    }
                    if (period === 7 && group === 3) {
                      return (
                        <div
                          key="act-marker"
                          className="flex h-12 flex-col items-center justify-center rounded-lg border border-dashed border-fuchsia-500/40 bg-fuchsia-500/8 text-[9px] font-mono text-fuchsia-700 dark:text-fuchsia-300"
                        >
                          <span>89–103</span>
                          <span>Ac–Lr</span>
                        </div>
                      );
                    }
                    return <div key={`empty-${period}-${group}`} className="h-12" />;
                  }

                  const isMatched = matchingAtomicNumbers.has(el.atomicNumber);
                  const isSelected =
                    selectedElement.atomicNumber === el.atomicNumber;
                  const meta = CATEGORY_META[el.category];

                  return (
                    <button
                      key={el.atomicNumber}
                      type="button"
                      onClick={() =>
                        handleSelectElement(el, window.innerWidth < 1280)
                      }
                      onDoubleClick={() => onAddElementToBeaker(el)}
                      title={`${el.nameAr} (${el.symbol}) — نقرتان للإضافة السريعة للكأس`}
                      className={`group relative flex h-12 flex-col items-center justify-between rounded-lg border p-1 transition-all ${
                        meta.tileClass
                      } ${
                        isSelected
                          ? "ring-2 ring-blue-600 dark:ring-cyan-300 scale-105 z-10 shadow-md"
                          : ""
                      } ${
                        isMatched
                          ? "opacity-100"
                          : "opacity-20 grayscale pointer-events-none"
                      }`}
                    >
                      <span className="w-full text-start text-[8.5px] font-mono tabular-nums leading-none opacity-80">
                        {el.atomicNumber}
                      </span>
                      <span className="font-mono text-xs sm:text-sm font-extrabold leading-none">
                        {el.symbol}
                      </span>
                      <span className="w-full truncate text-center text-[8px] font-sans leading-none opacity-90">
                        {el.nameAr}
                      </span>
                    </button>
                  );
                })
              )}
            </div>

            {/* f-Block: Lanthanides (Period 8) & Actinides (Period 9) */}
            <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/80 space-y-1">
              {[8, 9].map((fRow) => (
                <div key={`frow-${fRow}`} className="grid grid-cols-18 gap-1">
                  <div className="col-span-3 flex items-center justify-end pe-2 text-[10px] font-bold text-slate-500 dark:text-slate-400">
                    {fRow === 8 ? "اللانثانيدات" : "الأكتينيدات"}
                  </div>
                  {Array.from({ length: 15 }, (_, idx) => idx + 4).map(
                    (col) => {
                      const el = gridMap.get(`${fRow}-${col}`);
                      if (!el) return <div key={`fempty-${fRow}-${col}`} />;
                      const isMatched = matchingAtomicNumbers.has(
                        el.atomicNumber
                      );
                      const isSelected =
                        selectedElement.atomicNumber === el.atomicNumber;
                      const meta = CATEGORY_META[el.category];

                      return (
                        <button
                          key={el.atomicNumber}
                          type="button"
                          onClick={() =>
                            handleSelectElement(el, window.innerWidth < 1280)
                          }
                          onDoubleClick={() => onAddElementToBeaker(el)}
                          className={`flex h-11 flex-col items-center justify-between rounded-lg border p-1 transition-all ${
                            meta.tileClass
                          } ${
                            isSelected
                              ? "ring-2 ring-blue-600 dark:ring-cyan-300 scale-105 z-10"
                              : ""
                          } ${
                            isMatched
                              ? "opacity-100"
                              : "opacity-20 grayscale pointer-events-none"
                          }`}
                        >
                          <span className="w-full text-start text-[8px] font-mono tabular-nums leading-none opacity-80">
                            {el.atomicNumber}
                          </span>
                          <span className="font-mono text-xs font-extrabold leading-none">
                            {el.symbol}
                          </span>
                          <span className="w-full truncate text-center text-[7.5px] leading-none">
                            {el.nameAr}
                          </span>
                        </button>
                      );
                    }
                  )}
                </div>
              ))}
            </div>
          </div>
          <p className="mt-2.5 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Sparkles size={13} className="text-cyan-500" />
            <span>
              تلميح علمي: انقر نقرة مزدوجة على أي عنصر لإضافته مباشرة إلى دورق
              التفاعل، أو اختره لاستعراض مركباته المخبرية.
            </span>
          </p>
        </div>

        {/* Desktop Atomic Inspector Panel (>= 1280px sticky side panel) */}
        <aside className="hidden xl:block xl:col-span-4 glass-panel rounded-2xl p-5 sticky top-20">
          {renderElementDetailContent()}
        </aside>
      </div>

      {/* Mobile & Tablet Bottom-Sheet Element Inspector (< 1280px) */}
      {mobileDetailOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`تفاصيل عنصر ${selectedElement.nameAr}`}
          className="xl:hidden fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/60 backdrop-blur-xs p-0 sm:p-4"
          onClick={() => setMobileDetailOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="glass-modal w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl p-5 max-h-[86vh] overflow-y-auto pb-safe"
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                بطاقة التحليل الذري
              </span>
              <button
                type="button"
                onClick={() => setMobileDetailOpen(false)}
                aria-label="إغلاق تفاصيل العنصر"
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-300/60 dark:border-slate-700 text-slate-600 dark:text-slate-300"
              >
                <X size={18} />
              </button>
            </div>
            {renderElementDetailContent()}
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
        aria-label="الجدول الدوري التفاعلي"
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-2 sm:p-5 overflow-y-auto"
        onClick={onClose}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="my-auto w-full max-w-[1360px] max-h-[92vh] overflow-y-auto rounded-3xl bg-[#f4f7fb] dark:bg-[#060b19] p-3 sm:p-5 border border-slate-300/70 dark:border-slate-800 shadow-2xl"
        >
          {mainContent}
        </div>
      </div>
    );
  }

  return mainContent;
};
