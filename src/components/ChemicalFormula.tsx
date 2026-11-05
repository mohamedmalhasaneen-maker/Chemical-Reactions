import React from "react";

const SUBSCRIPT_MAP: Record<string, string> = {
  "₀": "0",
  "₁": "1",
  "₂": "2",
  "₃": "3",
  "₄": "4",
  "₅": "5",
  "₆": "6",
  "₇": "7",
  "₈": "8",
  "₉": "9",
};

const SUPERSCRIPT_MAP: Record<string, string> = {
  "⁰": "0",
  "¹": "1",
  "²": "2",
  "³": "3",
  "⁴": "4",
  "⁵": "5",
  "⁶": "6",
  "⁷": "7",
  "⁸": "8",
  "⁹": "9",
  "⁺": "+",
  "⁻": "−",
};

function normalizeUnicodeIndices(raw: string): string {
  let out = "";
  let i = 0;
  while (i < raw.length) {
    const ch = raw[i];
    if (SUBSCRIPT_MAP[ch]) {
      let sub = "";
      while (i < raw.length && SUBSCRIPT_MAP[raw[i]]) {
        sub += SUBSCRIPT_MAP[raw[i]];
        i++;
      }
      out += `_{${sub}}`;
      continue;
    }
    if (SUPERSCRIPT_MAP[ch]) {
      let sup = "";
      while (i < raw.length && SUPERSCRIPT_MAP[raw[i]]) {
        sup += SUPERSCRIPT_MAP[raw[i]];
        i++;
      }
      out += `^{${sup}}`;
      continue;
    }
    out += ch;
    i++;
  }
  return out;
}

interface ChemicalFormulaProps {
  formula: string;
  className?: string;
}

/**
 * Renders a single chemical species such as "2Pb(NO₃)₂(aq)" or "Cr₂O₇²⁻"
 * with true typographic <sub>, <sup>, and subtle physical phase indicators.
 */
export const ChemicalFormula: React.FC<ChemicalFormulaProps> = ({
  formula,
  className = "",
}) => {
  const trimmed = formula.trim();
  if (!trimmed) return null;

  // Separate trailing gas/precipitate arrow if present
  let core = trimmed;
  let trailingSymbol = "";
  if (core.endsWith("↑") || core.endsWith("↓")) {
    trailingSymbol = core.slice(-1);
    core = core.slice(0, -1).trim();
  }

  // Separate trailing physical state like (aq), (s), (l), (g)
  let stateSuffix = "";
  const stateMatch = core.match(/\((aq|s|l|g)\)$/i);
  if (stateMatch) {
    stateSuffix = stateMatch[0];
    core = core.slice(0, core.length - stateSuffix.length);
  }

  // Extract leading stoichiometric coefficient (e.g. "2" in "2H2O")
  let stoichCoeff = "";
  const coeffMatch = core.match(/^(\d+)(?=[A-Z(\[])/);
  if (coeffMatch) {
    stoichCoeff = coeffMatch[1];
    core = core.slice(stoichCoeff.length);
  }

  // Convert Unicode subscripts/superscripts into explicit _{...} and ^{...}
  let normalized = normalizeUnicodeIndices(core);

  // Also convert plain ASCII subscripts after letters/closing brackets, e.g., H2SO4 -> H_{2}SO_{4}
  normalized = normalized.replace(/([A-Za-z)\]])(\d+)/g, "$1_{$2}");

  // Tokenize _{...} and ^{...}
  const tokens: React.ReactNode[] = [];
  const tokenRegex = /(_\{[^}]+\}|\^\{[^}]+\})/g;
  let lastIdx = 0;
  let match: RegExpExecArray | null;
  let keyIdx = 0;

  while ((match = tokenRegex.exec(normalized)) !== null) {
    if (match.index > lastIdx) {
      tokens.push(
        <React.Fragment key={`t-${keyIdx++}`}>
          {normalized.slice(lastIdx, match.index)}
        </React.Fragment>
      );
    }
    const seg = match[0];
    if (seg.startsWith("_{")) {
      tokens.push(
        <sub
          key={`sub-${keyIdx++}`}
          className="text-[0.74em] leading-none font-semibold align-baseline relative -bottom-[0.18em]"
        >
          {seg.slice(2, -1)}
        </sub>
      );
    } else if (seg.startsWith("^{")) {
      tokens.push(
        <sup
          key={`sup-${keyIdx++}`}
          className="text-[0.72em] leading-none font-semibold text-cyan-600 dark:text-cyan-300 align-baseline relative -top-[0.38em]"
        >
          {seg.slice(2, -1)}
        </sup>
      );
    }
    lastIdx = match.index + seg.length;
  }

  if (lastIdx < normalized.length) {
    tokens.push(
      <React.Fragment key={`t-${keyIdx++}`}>
        {normalized.slice(lastIdx)}
      </React.Fragment>
    );
  }

  return (
    <span
      dir="ltr"
      className={`inline-flex items-baseline font-mono tabular-nums tracking-tight whitespace-nowrap ${className}`}
    >
      {stoichCoeff && (
        <span className="font-bold text-blue-600 dark:text-cyan-300 me-[1px]">
          {stoichCoeff}
        </span>
      )}
      <span>{tokens}</span>
      {stateSuffix && (
        <span className="text-[0.74em] font-normal text-slate-500 dark:text-slate-400 ms-[1px]">
          {stateSuffix}
        </span>
      )}
      {trailingSymbol && (
        <span
          className={`ms-0.5 text-[0.88em] font-bold ${
            trailingSymbol === "↑"
              ? "text-cyan-600 dark:text-cyan-300"
              : "text-amber-600 dark:text-amber-300"
          }`}
        >
          {trailingSymbol}
        </span>
      )}
    </span>
  );
};

interface ChemicalEquationProps {
  equation: string;
  className?: string;
}

/**
 * Renders a complete balanced chemical equation in LTR scientific notation,
 * supporting catalysts over arrows (--(KI)-->), equilibrium (⇌), and standard arrows (→ / ->).
 */
export const ChemicalEquation: React.FC<ChemicalEquationProps> = ({
  equation,
  className = "",
}) => {
  const clean = equation.trim();
  if (!clean) return null;

  // Detect catalyst arrow e.g. --(KI)--> or --(MnO₂)-->
  let arrowLabel: string | null = null;
  let arrowSymbol = "⟶";
  let sides: string[] = [];

  const catalystMatch = clean.match(/--\(\s*([^)]+)\s*\)-->/);
  if (catalystMatch && catalystMatch.index !== undefined) {
    arrowLabel = catalystMatch[1];
    sides = [
      clean.slice(0, catalystMatch.index),
      clean.slice(catalystMatch.index + catalystMatch[0].length),
    ];
  } else if (clean.includes("⇌")) {
    arrowSymbol = "⇌";
    sides = clean.split("⇌");
  } else if (clean.includes("→")) {
    arrowSymbol = "⟶";
    sides = clean.split("→");
  } else if (clean.includes("->")) {
    arrowSymbol = "⟶";
    sides = clean.split("->");
  } else {
    return <ChemicalFormula formula={clean} className={className} />;
  }

  const renderSide = (sideStr: string, prefix: string) => {
    const terms = sideStr
      .split(/\s+\+\s+/)
      .map((s) => s.trim())
      .filter(Boolean);

    return terms.map((term, idx) => (
      <React.Fragment key={`${prefix}-${idx}`}>
        {idx > 0 && (
          <span className="mx-1.5 text-slate-400 dark:text-slate-500 font-sans font-medium">
            +
          </span>
        )}
        <ChemicalFormula formula={term} />
      </React.Fragment>
    ));
  };

  return (
    <div
      dir="ltr"
      className={`inline-flex flex-wrap items-center gap-y-1.5 font-mono text-slate-900 dark:text-slate-100 ${className}`}
    >
      <span className="inline-flex flex-wrap items-center gap-y-1">
        {renderSide(sides[0] || "", "lhs")}
      </span>

      <span className="mx-2.5 inline-flex flex-col items-center justify-center leading-none">
        {arrowLabel && (
          <span className="text-[0.68em] font-semibold text-violet-600 dark:text-violet-300 mb-0.5">
            <ChemicalFormula formula={arrowLabel} />
          </span>
        )}
        <span className="text-blue-600 dark:text-cyan-400 font-bold text-[1.12em]">
          {arrowSymbol}
        </span>
      </span>

      <span className="inline-flex flex-wrap items-center gap-y-1">
        {renderSide(sides.slice(1).join(" "), "rhs")}
      </span>
    </div>
  );
};
