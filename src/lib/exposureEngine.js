import { getThreshold, NO_SALES_TAX_STATES } from "./nexusThresholds.js";
import { salesTaxCombinedRate } from "./stateRates.js";

const NATIONAL_AVG_SALES_TAX = 0.07;
const SS_WAGE_BASE = 184500; // 2026 Social Security wage base — update annually

function parseNum(val) {
  if (val == null || val === "") return null;
  const n = parseFloat(String(val).replace(/[^0-9.-]/g, ""));
  return isNaN(n) ? null : n;
}

// Employment tax on the gap from comp to benchmark using split SS/Medicare rates
function gapTax(comp, benchmark) {
  const gap = Math.max(0, benchmark - comp);
  if (gap === 0) return 0;
  const ssGap = Math.max(0, Math.min(benchmark, SS_WAGE_BASE) - Math.min(comp, SS_WAGE_BASE));
  return ssGap * 0.124 + gap * 0.029;
}

function isStateProtected(state, a, beyondSolicitationStates) {
  if (a.revenue_type !== "goods" && a.revenue_type !== "both") return false;
  const bsa = a.pl86272_beyond_solicitation;
  if (bsa === "no") return true;
  if (bsa === "yes") return !beyondSolicitationStates.has(state);
  return false;
}

// stateSales      — all state_sales rows (with question_id); Calc 1 filters to sales_tax_nexus
// incomeTaxSales  — rows where question_id = 'income_tax_nexus' (used for Calc 5)
export function calculateExposures(answers, stateSales, incomeTaxSales) {
  const a = {};
  for (const row of answers) a[row.question_id] = row.answer;
  const nexusDuration = Math.max(1, parseInt(a.nexus_duration) || 3);
  const exposures = [];

  // Extract pl86272_states from stateSales for Calc 5
  const pl86272StatesRows = (stateSales || []).filter(r => r.question_id === "pl86272_states");
  const beyondSolicitationStates = new Set(pl86272StatesRows.map(r => r.state));

  // ── 1. Sales & Use Tax ──────────────────────────────────────────────────────
  if (stateSales && stateSales.length > 0) {
    const stRows = stateSales.filter(
      (r) => (r.question_id ?? "sales_tax_nexus") === "sales_tax_nexus"
    );
    const individualRows = stRows.filter((r) => r.state !== "Other (combined)");
    const combinedRow    = stRows.find((r)  => r.state === "Other (combined)");

    const taxablePctRaw = parseNum(a.taxable_sales_pct);
    const taxableFactor = taxablePctRaw !== null
      ? Math.min(1, Math.max(0, taxablePctRaw / 100))
      : 1.0;
    const taxablePctDisplay = taxablePctRaw !== null ? Math.round(taxablePctRaw) : 100;

    let baseTax = 0;
    let statesAbove = 0;
    for (const row of individualRows) {
      if (NO_SALES_TAX_STATES.has(row.state)) continue;
      const amount = parseNum(row.year_1) || 0;
      if (amount >= getThreshold(row.state)) {
        const rate = salesTaxCombinedRate[row.state] ?? NATIONAL_AVG_SALES_TAX;
        baseTax += amount * taxableFactor * rate * nexusDuration;
        statesAbove++;
      }
    }
    const combinedAmount = combinedRow ? (parseNum(combinedRow.year_1) || 0) : 0;
    const taxableCombined = combinedAmount * taxableFactor;
    const lowCombined  = taxableCombined * NATIONAL_AVG_SALES_TAX * nexusDuration * 0.50;
    const highCombined = taxableCombined * NATIONAL_AVG_SALES_TAX * nexusDuration * 1.00;

    const totalLow  = baseTax * 0.9 + lowCombined;
    const totalHigh = baseTax * 1.1 + highCombined;

    if (totalLow > 0 || totalHigh > 0) {
      let description;
      if (statesAbove === 0 && combinedRow) {
        description = "Estimated unremitted sales tax based on a probability-adjusted combined multi-state estimate";
      } else {
        const descParts = [];
        if (statesAbove > 0) descParts.push(`${statesAbove} state${statesAbove !== 1 ? "s" : ""} meeting economic nexus threshold`);
        if (combinedRow) descParts.push("probability-adjusted combined estimate");
        description = `Estimated unremitted sales tax based on reported sales in ${descParts.join(" and ")}`;
      }
      exposures.push({
        category: "Sales & Use Tax",
        description,
        lowEstimate: totalLow,
        highEstimate: totalHigh,
        basis: `Applies each state's combined average state and local sales tax rate (per published Tax Foundation 2026 averages) to reported annual sales in threshold-crossing states over a ${nexusDuration}-year period per management's representation. Applies management's estimate that approximately ${taxablePctDisplay}% of sales are taxable. Estimates reflect tax only and exclude penalties and interest, which may be substantial — failure-to-file penalties alone commonly reach 25% of tax due, plus interest. The ±10% low/high band reflects local rate variation and rate movement. Combined-estimate bucket uses the national average combined rate (~7%) weighted at 50% (low) to 100% (high) for threshold uncertainty.`,
      });
    }
  }

  // ── 2. ERC Recapture ────────────────────────────────────────────────────────
  if (
    a.erc_claimed === "yes" &&
    (a.erc_q3_2021 === "yes" || a.erc_received_2yr === "yes")
  ) {
    const erc = parseNum(a.erc_amount);
    if (erc !== null && erc > 0) {
      exposures.push({
        category: "Federal Tax – ERC",
        description: "Potential IRS recapture of Employee Retention Credits claimed",
        lowEstimate: erc * 0.10,
        highEstimate: erc * 0.30,
        basis: "Assumes partial disallowance of 10% to 30% of total credits claimed. Full disallowance is possible where eligibility is not supportable. Excludes penalties and interest.",
      });
    }
  }

  // ── 3. Reasonable Compensation (S Corp only) ───────────────────────────────
  if (a.entity_type === "scorp") {
    const comp = parseNum(a.officer_comp);
    if (comp !== null && comp < 250000) {
      const distributions = parseNum(a.scorp_distributions);
      // If distributions explicitly 0, omit the calculation (no recharacterization risk)
      if (!(distributions !== null && distributions === 0)) {
        const lowExposure  = gapTax(comp, 150000);
        const highExposure = gapTax(comp, 250000);
        if (highExposure > 0) {
          const cappedLow  = distributions !== null ? Math.min(lowExposure,  distributions) : lowExposure;
          const cappedHigh = distributions !== null ? Math.min(highExposure, distributions) : highExposure;
          exposures.push({
            category: "Federal Tax – Reasonable Comp",
            description: "Payroll tax exposure from potential IRS recharacterization of S corp distributions as officer compensation",
            lowEstimate: cappedLow,
            highEstimate: cappedHigh,
            basis: `Employment tax on the gap between reported officer compensation and a $150,000–$250,000 reasonable compensation benchmark, applying 12.4% Social Security tax up to the 2026 wage base ($${SS_WAGE_BASE.toLocaleString()}) and 2.9% Medicare tax on the full gap, capped at reported distributions. Single-year estimate; a 3-year lookback is typical. Excludes penalties and interest. The benchmark is a screening convention — actual reasonable compensation depends on industry, role, and company size.`,
          });
        }
      }
    }
  }

  // ── 4. Contractor Misclassification ───────────────────────────────────────
  if (a.contractor_usage === "yes" && a.contractor_classification === "no") {
    const comp  = parseNum(a.contractor_comp);
    const count = parseNum(a.contractor_count);

    if (comp !== null && comp > 0) {
      exposures.push({
        category: "Employment Tax – Misclassification",
        description: "Estimated payroll tax exposure if independent contractors are reclassified as employees",
        lowEstimate: comp * 0.153 * 0.25,
        highEstimate: comp * 0.153 * 0.50,
        basis: "Calculated on the most recent year's reported individual contractor compensation × 15.3% employment taxes × 25%–50% audit adjustment factor. Assessments typically cover a 3-year lookback; cumulative exposure may be proportionally higher where the arrangement is longstanding. Excludes penalties and interest.",
      });
    } else if (count !== null && count > 0) {
      exposures.push({
        category: "Employment Tax – Misclassification",
        description: "Estimated payroll tax exposure if independent contractors are reclassified as employees",
        lowEstimate: count * 45000 * 0.153 * 0.25,
        highEstimate: count * 85000 * 0.153 * 0.50,
        basis: `${Math.round(count)} contractors × assumed $45,000–$85,000 average compensation × 15.3% × 25%–50% audit adjustment factor. Excludes penalties and interest.`,
      });
    }
  }

  // ── 5. State Income Tax — per-state allocation with P.L. 86-272 ───────────
  if (a.income_tax_nexus === "yes") {
    const itSales = incomeTaxSales || [];
    const y1GR = parseNum(a.gross_receipts_y1);
    const y2GR = parseNum(a.gross_receipts_y2);
    const y3GR = parseNum(a.gross_receipts_y3);
    const y1TI = parseNum(a.taxable_income_y1);
    const y2TI = parseNum(a.taxable_income_y2);
    const y3TI = parseNum(a.taxable_income_y3);
    const hasTaxableIncome = y1TI !== null || y2TI !== null || y3TI !== null;

    const totalItSales = itSales.reduce((sum, row) => sum + (parseNum(row.year_1) || 0), 0);

    const goodsPctRaw = a.revenue_type === "both"
      ? (parseNum(a.goods_revenue_pct) ?? 100)
      : 100;
    const goodsPct = Math.min(1, Math.max(0, goodsPctRaw / 100));

    if (hasTaxableIncome) {
      let totalAttrIncome = 0;
      let yearsUsed = 0;

      const applyYear = (grossReceipts, taxableIncome) => {
        if (totalItSales <= 0 || grossReceipts == null || grossReceipts <= 0 || taxableIncome == null) return;
        const factor = Math.min(1, totalItSales / grossReceipts);
        totalAttrIncome += factor * Math.max(0, taxableIncome);
        yearsUsed++;
      };

      if (nexusDuration >= 1) applyYear(y1GR, y1TI);
      if (nexusDuration >= 2) applyYear(y2GR, y2TI);
      if (nexusDuration >= 3) applyYear(y3GR, y3TI);

      if (yearsUsed > 0 && totalAttrIncome === 0) {
        // Taxable income was provided but every used year is zero
        exposures.push({
          category: "State Income Tax",
          description: "Estimated state income tax exposure in states where the Company has nexus but has not filed returns",
          lowEstimate: 0,
          highEstimate: 0,
          basis: "No net income-based exposure estimated because the Company reported no taxable income for the period. Minimum, franchise, and gross receipts taxes may still apply in non-filing states and are not estimated.",
        });
      } else if (yearsUsed > 0 && totalAttrIncome > 0) {
        // Allocate totalAttrIncome across states by proportional sales
        const itIndividualRows = itSales.filter(r => r.state !== "Other (combined)");
        const itCombinedRow    = itSales.find(r => r.state === "Other (combined)");

        let taxableIncome = 0;
        const protectedStatesList = [];
        const unprotectedStatesList = [];

        for (const row of itIndividualRows) {
          const stateSalesAmt = parseNum(row.year_1) || 0;
          const fraction = totalItSales > 0 ? stateSalesAmt / totalItSales : 0;
          const stateIncome = totalAttrIncome * fraction;
          if (isStateProtected(row.state, a, beyondSolicitationStates)) {
            // Protected: goods-only → 0; both → share × (1 - goodsPct)
            taxableIncome += stateIncome * (a.revenue_type === "both" ? (1 - goodsPct) : 0);
            protectedStatesList.push(row.state);
          } else {
            taxableIncome += stateIncome;
            unprotectedStatesList.push(row.state);
          }
        }
        if (itCombinedRow) {
          const combAmt = parseNum(itCombinedRow.year_1) || 0;
          const combFraction = totalItSales > 0 ? combAmt / totalItSales : 0;
          taxableIncome += totalAttrIncome * combFraction; // combined always unprotected
        }

        let basisText = `Apportions reported taxable income to non-filing states using a sales factor, allocates among states by relative sales, and applies a blended state corporate income tax rate of 5% to 9%. State sales reflect the most recent completed calendar year and are applied against the Company's most recently filed financial data. Estimates reflect net income-based taxes only and exclude penalties and interest, which may be substantial. Gross receipts, franchise, and minimum taxes are excluded.`;
        if (protectedStatesList.length > 0) {
          basisText += ` P.L. 86-272 protection was applied to ${protectedStatesList.join(", ")} based on management's representation that in-state activity is limited to solicitation of orders for tangible goods; these states carry no estimated net income tax exposure but may impose non-income-based taxes (e.g., Ohio CAT, Texas margin tax, Washington B&O) not estimated here.`;
        }

        exposures.push({
          category: "State Income Tax",
          description: "Estimated state income tax exposure in states where the Company has nexus but has not filed returns",
          lowEstimate: taxableIncome * 0.05,
          highEstimate: taxableIncome * 0.09,
          basis: basisText,
        });
      }
    } else if (totalItSales > 0) {
      // No taxable income provided — use 7.5% assumed margin
      let taxableBase = totalItSales * 0.075 * nexusDuration;

      // Apply per-state protection to the assumed-margin case
      const itIndividualRows = itSales.filter(r => r.state !== "Other (combined)");
      const itCombinedRow    = itSales.find(r => r.state === "Other (combined)");
      let taxableIncome = 0;
      const protectedStatesList = [];

      for (const row of itIndividualRows) {
        const stateSalesAmt = parseNum(row.year_1) || 0;
        const fraction = totalItSales > 0 ? stateSalesAmt / totalItSales : 0;
        const stateBase = taxableBase * fraction;
        if (isStateProtected(row.state, a, beyondSolicitationStates)) {
          taxableIncome += stateBase * (a.revenue_type === "both" ? (1 - goodsPct) : 0);
          protectedStatesList.push(row.state);
        } else {
          taxableIncome += stateBase;
        }
      }
      if (itCombinedRow) {
        const combAmt = parseNum(itCombinedRow.year_1) || 0;
        const combFraction = totalItSales > 0 ? combAmt / totalItSales : 0;
        taxableIncome += taxableBase * combFraction;
      }

      let basisText = `Apportions taxable income to non-filing states using a sales factor, allocates among states by relative sales, and applies a blended state corporate income tax rate of 5% to 9% over a ${nexusDuration}-year exposure period per management's representation. Estimates reflect net income-based taxes only and exclude penalties and interest, which may be substantial. Gross receipts, franchise, and minimum taxes are excluded. Taxable income was not provided; a 7.5% assumed pre-tax margin was applied to reported state sales.`;
      if (protectedStatesList.length > 0) {
        basisText += ` P.L. 86-272 protection was applied to ${protectedStatesList.join(", ")} based on management's representation that in-state activity is limited to solicitation of orders for tangible goods; these states carry no estimated net income tax exposure but may impose non-income-based taxes (e.g., Ohio CAT, Texas margin tax, Washington B&O) not estimated here.`;
      }

      exposures.push({
        category: "State Income Tax",
        description: "Estimated state income tax exposure in states where the Company has nexus but has not filed returns",
        lowEstimate: taxableIncome * 0.05,
        highEstimate: taxableIncome * 0.09,
        basis: basisText,
      });
    }
  }

  // ── 6. Uncertain Tax Positions ─────────────────────────────────────────────
  if (a.eq_utp === "yes") {
    const utpAmt = parseNum(a.eq_utp_amount);
    if (utpAmt !== null && utpAmt > 0) {
      exposures.push({
        category: "Federal Tax – UTP",
        description: "Quantified uncertain tax position reserve under ASC 740",
        lowEstimate: utpAmt * 0.50,
        highEstimate: utpAmt * 1.00,
        basis: "Management-reported ASC 740 reserve, presented at 50% to 100% to reflect the range of possible settlement outcomes. Excludes penalties and interest.",
      });
    }
  }

  // ── 7. Open Tax Examination ────────────────────────────────────────────────
  if (a.tax_exam === "yes" && a.tax_exam_resolved === "no") {
    const examAmt = parseNum(a.tax_exam_amount);
    if (examAmt !== null && examAmt > 0) {
      exposures.push({
        category: "Federal Tax – Open Examination",
        description: "Proposed or estimated adjustment under an open tax examination",
        lowEstimate: examAmt * 0.50,
        highEstimate: examAmt * 1.00,
        basis: "Management-reported proposed or estimated adjustment under an open examination, presented at 50% to 100% to reflect possible resolution outcomes. Excludes penalties and interest.",
      });
    }
  }

  return exposures;
}
