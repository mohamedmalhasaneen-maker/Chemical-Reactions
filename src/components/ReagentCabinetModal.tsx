/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Comprehensive Reagent Cabinet Modal Component (خزانة الكواشف)
 * Displays all chemical reagents with formulas, states, colors, uses,
 * chemical reactions, and scientific safety warnings, fully optimized for mobile.
 */

import React, { useState, useMemo } from "react";
import {
  FlaskConical,
  Search,
  X,
  ShieldAlert,
  Sparkles,
  Plus,
  CheckCircle2,
  Info,
  Droplets,
  Atom,
} from "lucide-react";
import { Chemical, ChemicalCategory } from "../types";
import { CHEMICAL_DATABASE } from "../data";
import { ChemicalFormula } from "./ChemicalFormula";
import { playSound } from "../utils/soundEngine";

interface ReagentCabinetModalProps {
  isOpen: boolean;
  onClose: () => void;
  customChemicals?: Chemical[];
  selectedReactants?: Chemical[];
  onAddChemical?: (chem: Chemical) => void;
}

const CATEGORY_FILTERS: { id: "all" | ChemicalCategory; label: string }[] = [
  { id: "all", label: "جميع الكواشف" },
  { id: "acid", label: "أحماض" },
  { id: "base", label: "قواعد" },
  { id: "salt", label: "أملاح" },
  { id: "metal", label: "فلزات" },
  { id: "indicator", label: "أدلة لونية" },
  { id: "oxidizer", label: "مؤكسدات" },
  { id: "organic", label: "عضوية وجامعية" },
];

export const ReagentCabinetModal: React.FC<ReagentCabinetModalProps> = ({
  isOpen,
  onClose,
  customChemicals = [],
  selectedReactants = [],
  onAddChemical,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"all" | ChemicalCategory>("all");
  const [selectedChemDetails, setSelectedChemDetails] = useState<Chemical | null>(null);

  const allReagents = useMemo(
    () => [...CHEMICAL_DATABASE, ...customChemicals],
    [customChemicals]
  );

  const filteredReagents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return allReagents.filter((c) => {
      if (categoryFilter !== "all" && c.category !== categoryFilter) {
        return false;
      }
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        (c.nameEn && c.nameEn.toLowerCase().includes(q)) ||
        c.formula.toLowerCase().includes(q) ||
        (c.hazardLabel && c.hazardLabel.toLowerCase().includes(q)) ||
        (c.description && c.description.toLowerCase().includes(q))
      );
    });
  }, [allReagents, searchQuery, categoryFilter]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="خزانة الكواشف الكيميائية"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fadeIn overflow-y-auto"
    >
      <div className="relative w-full max-w-4xl max-h-[92vh] rounded-3xl border border-cyan-500/35 bg-slate-900 shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950 px-5 sm:px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/35">
              <FlaskConical size={22} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-white">
                خزانة الكواشف الكيميائية الشاملة
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                قاعدة بيانات الكواشف، الصيغ، الاستخدامات، وحالات الأطوار ({allReagents.length} كاشفاً متاحاً)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              playSound("modal_close");
              onClose();
            }}
            aria-label="إغلاق"
            className="h-9 w-9 flex items-center justify-center rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search & Category Filter Toolbar */}
        <div className="border-b border-slate-800 bg-slate-950/60 p-4 sm:px-6 space-y-3">
          <div className="relative">
            <Search
              size={17}
              className="pointer-events-none absolute top-1/2 -translate-y-1/2 start-3.5 text-slate-400"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث بالاسم، الصيغة الكيميائية، أو التصنيف..."
              className="h-11 w-full rounded-xl border border-slate-800 bg-slate-900 ps-10 pe-4 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
            {CATEGORY_FILTERS.map((cat) => {
              const active = categoryFilter === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    playSound("select");
                    setCategoryFilter(cat.id);
                  }}
                  className={`min-h-[36px] shrink-0 rounded-xl border px-3 py-1 text-xs font-bold transition active:scale-95 ${
                    active
                      ? "border-cyan-500 bg-cyan-600 text-white"
                      : "border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700"
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Reagents Grid / List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-3.5 bg-slate-950">
          {filteredReagents.length === 0 ? (
            <div className="py-16 text-center space-y-3 col-span-2">
              <FlaskConical size={32} className="mx-auto text-slate-600" />
              <h4 className="text-base font-bold text-white">لا توجد كواشف تطابق بحثك</h4>
              <p className="text-xs text-slate-400">جرب البحث بكلمة مفتاحية أخرى أو إعادة ضبط الفلتر.</p>
            </div>
          ) : (
            filteredReagents.map((chem) => {
              const inBeaker = selectedReactants.some((r) => r.id === chem.id);
              return (
                <div
                  key={chem.id}
                  onClick={() => {
                    playSound("select");
                    setSelectedChemDetails(chem);
                  }}
                  className="group rounded-2xl border border-slate-800 bg-slate-900/75 p-4 hover:border-cyan-500/50 transition-all cursor-pointer flex flex-col justify-between gap-3 shadow-sm"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-sm sm:text-base font-extrabold text-white truncate group-hover:text-cyan-300 transition-colors">
                          {chem.name}
                        </span>
                        {chem.nameEn && (
                          <span className="text-[10px] font-mono text-slate-400 truncate">
                            ({chem.nameEn})
                          </span>
                        )}
                      </div>
                      <ChemicalFormula
                        formula={chem.formula}
                        className="text-xs sm:text-sm font-bold text-cyan-300 shrink-0"
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                      <span className="rounded-full bg-blue-500/15 px-2.5 py-0.5 font-bold text-blue-300 border border-blue-500/25">
                        {chem.category}
                      </span>
                      <span className="rounded-full bg-slate-800 px-2.5 py-0.5 font-mono text-slate-300 border border-slate-700">
                        {chem.state === "aqueous" ? "محلول مائي aq" : chem.state === "solid" ? "صلب s" : chem.state === "liquid" ? "سائل l" : "غاز g"}
                      </span>
                      {chem.ph !== undefined && (
                        <span className="rounded-full bg-cyan-500/15 px-2 py-0.5 font-mono text-cyan-300 border border-cyan-500/25">
                          pH {chem.ph}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed pt-1">
                      {chem.description || chem.hazardLabel || "كاشف قياسي لتحليل التفاعلات"}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-[11px] text-cyan-400 font-semibold group-hover:underline">
                      عرض التفاصيل والتحذيرات العلمية ◄
                    </span>
                    {onAddChemical && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          playSound("success");
                          onAddChemical(chem);
                        }}
                        disabled={selectedReactants.length >= 3 && !inBeaker}
                        className="inline-flex items-center gap-1 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-4iles disabled:opacity-45 px-3 py-1.5 text-xs font-bold text-white transition active:scale-95"
                      >
                        <Plus size={13} />
                        <span>{inBeaker ? "مضاف للدورق" : "إضافة للدورق"}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Detailed Reagent Inspector Modal */}
        {selectedChemDetails && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label="تفاصيل الكاشف"
            className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn"
            onClick={() => setSelectedChemDetails(null)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-lg rounded-3xl border border-cyan-500/40 bg-slate-900 p-6 shadow-2xl space-y-4 text-slate-100 max-h-[88vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    <FlaskConical size={20} />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-extrabold text-white">
                      {selectedChemDetails.name}
                    </h3>
                    <p className="text-xs font-mono text-cyan-400">
                      {selectedChemDetails.nameEn || selectedChemDetails.formula}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedChemDetails(null)}
                  className="h-8 w-8 rounded-xl bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-3 text-xs sm:text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-0.5">
                    <span className="text-slate-400 text-[11px]">الصيغة الكيميائية</span>
                    <div className="font-mono font-bold text-cyan-300 text-sm">
                      {selectedChemDetails.formula}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-0.5">
                    <span className="text-slate-400 text-[11px]">الحالة الفيزيائية والـ pH</span>
                    <div className="font-bold text-white">
                      {selectedChemDetails.state} {selectedChemDetails.ph !== undefined ? `(pH ${selectedChemDetails.ph})` : ""}
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <span className="font-bold text-cyan-400 block">الوصف والاستخدامات العلمية:</span>
                  <p className="text-slate-300 leading-relaxed">
                    {selectedChemDetails.description || "كاشف مخبري أساسي يُستخدم في تفاعلات الكيمياء التحليلية والعضوية وغير العضوية."}
                  </p>
                </div>

                {selectedChemDetails.hazardLabel && (
                  <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/40 space-y-1 text-amber-200">
                    <span className="font-bold block flex items-center gap-1.5 text-amber-300">
                      <ShieldAlert size={15} />
                      <span>تصنيف الخطر والسلامة:</span>
                    </span>
                    <p className="text-xs leading-relaxed">{selectedChemDetails.hazardLabel}</p>
                  </div>
                )}

                {selectedChemDetails.safetyWarning && (
                  <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 space-y-1 text-rose-200">
                    <span className="font-bold block flex items-center gap-1.5 text-rose-300">
                      <ShieldAlert size={15} />
                      <span>إرشادات السلامة المخبرية:</span>
                    </span>
                    <p className="text-xs leading-relaxed">{selectedChemDetails.safetyWarning}</p>
                  </div>
                )}
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                {onAddChemical && (
                  <button
                    type="button"
                    onClick={() => {
                      playSound("success");
                      onAddChemical(selectedChemDetails);
                      setSelectedChemDetails(null);
                      onClose();
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 px-4 py-2 text-xs font-bold text-white shadow-md transition"
                  >
                    <Plus size={15} />
                    <span>إضافة الكاشف إلى دورق المختبر</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedChemDetails(null)}
                  className="rounded-xl bg-slate-800 hover:bg-slate-700 px-4 py-2 text-xs font-bold text-slate-200 transition"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-slate-800 bg-slate-950 px-6 py-3.5 flex items-center justify-between text-xs text-slate-400">
          <span>قاعدة بيانات الكواشف المعتمدة © المختبر الكيميائي الافتراضي</span>
          <button
            type="button"
            onClick={() => {
              playSound("modal_close");
              onClose();
            }}
            className="rounded-xl bg-slate-800 border border-slate-700 px-5 py-2 text-xs font-bold text-white hover:bg-slate-700 transition"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
