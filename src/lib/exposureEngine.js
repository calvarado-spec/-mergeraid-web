import { getThreshold, NO_SALES_TAX_STATES } from "./nexusThresholds.js";

function parseNum(val) {
  if (val == null || val === "") return null;
  const n = parseFloat(String(val).replace(/[^0-9.-]/g, ""));
  return isNaN(n) ? null : n;
}

// stateSales      — all state_sales rows (includes question_id); Calc 1 filters to sales_tax_nexus
// incomeTaxSales  — rows where question_id = 'income_tax_nexus' (used for Calc 5)
export function calculateExposures(answers, stateSales, incomeTaxSales) {
  const a = {};
  for (const row of answers) a[row.question_id] = row.answer;

  const nexusDuration = Math.max(1, parseInt(a.nexus_duration) || 3);

  const exposures = [];

  // ── 1. Sales & Use Tax — threshold-based ─────────────────────────────────
  if (stateSales && stateSales.length > 0) {
    const stRows = stateSales.filter(
      (r) => (r.question_id ?? "sales_tax_nexus") === "sales_tax_nexus"
    );
    const individualRows = stRows.filter((r) => r.state !== "Other (combined)");
    const combinedRow    = stRows.find((r)  => r.state === "Other (combined)");

    let aboveTotal = 0;
    let statesAbove = 0;
    for (const row of individualRows) {
      if (NO_SALES_TAX_STATES.has(row.state)) continue;
      const amount = parseNum(row.year_1) || 0;
      if (amount >= getThreshold(row.state)) {
        aboveTotal += amount;
        statesAbove++;
      }
    }
    const combinedAmount = combinedRow ? (parseNum(combinedRow.year_1) || 0) : 0;

    const totalLow  = aboveTotal * nexusDuration * 0.02 + combinedAmount * 0.50 * nexusDuration * 0.02;
    const totalHigh = aboveTotal * nexusDuration * 0.06 + combinedAmount * 1.00 * nexusDuration * 0.06;

    if (totalLow > 0 || totalHigh > 0) {
      const descParts = [];
      if (statesAbove > 0) descParts.push(`${statesAbove} state${statesAbove !== 1 ? "s" : ""} meeting economic nexus threshold`);
      if (combinedRow) descParts.push("probability-adjusted combined estimate");
      exposures.push({
        category: "Sales & Use Tax",
        description: `Estimated unremitted sales tax based on reported sales in ${descParts.join(" and ")}`,
        lowEstimate: totalLow,
        highEstimate: totalHigh,
        basis: `Applies 2%–6% blended effective rate to annual sales in threshold-crossing states over a ${nexusDuration}-year exposure period per management's representation of sales history. Combined-estimate bucket discounted at 50% (low) to 100% (high) for threshold uncertainty.`,
      });
    }
  }

  // ── 2. ERC Recapture — only when statute is still open ───────────────────
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
        basis: "Assumes partial disallowance of 10% to 30% of total credits claimed. Full disallowance is possible where eligibility is not supportable.",
      });
    }
  }

  // ── 3. Reasonable Compensation (S Corp only) ──────────────────────────────
  if (a.entity_type === "scorp") {
    const comp = parseNum(a.officer_comp);
    if (comp !== null && comp < 250000) {
      const lowShortfall  = Math.max(0, 150000 - comp);
      const highShortfall = Math.max(0, 250000 - comp);
      const lowExposure   = lowShortfall  * 0.153;
      const highExposure  = highShortfall * 0.153;
      if (highExposure > 0) {
        exposures.push({
          category: "Federal Tax – Reasonable Comp",
          description: "Payroll tax exposure from potential IRS recharacterization of S corp distributions as officer compensation",
          lowEstimate: lowExposure,
          highEstimate: highExposure,
          basis: `15.3% self-employment tax on shortfall vs. $150K–$250K reasonable comp benchmark`,
        });
      }
    }
  }

  // ── 4. Contractor Misclassification ───────────────────────────────────────
  if (a.contractor_usage === "yes" && a.contractor_classification === "no") {
    const comp  = parseNum(a.contractor_comp);
    const count = parseNum(a.contractor_count); // fallback for existing deals

    if (comp !== null && comp > 0) {
      exposures.push({
        category: "Employment Tax – Misclassification",
        description: "Estimated payroll tax exposure if independent contractors are reclassified as employees",
        lowEstimate: comp * 0.153 * 0.25,
        highEstimate: comp * 0.153 * 0.50,
        basis: "Calculated on the most recent year's reported individual contractor compensation × 15.3% employment taxes × 25%–50% audit adjustment factor. Assessments typically cover a 3-year lookback; cumulative exposure may be proportionally higher where the arrangement is longstanding.",
      });
    } else if (count !== null && count > 0) {
      exposures.push({
        category: "Employment Tax – Misclassification",
        description: "Estimated payroll tax exposure if independent contractors are reclassified as employees",
        lowEstimate: count * 45000 * 0.153 * 0.25,
        highEstimate: count * 85000 * 0.153 * 0.50,
        basis: `${Math.round(count)} contractors × avg comp × 15.3% FICA × 25%–50% audit adjustment factor`,
      });
    }
  }

  // ── 5. State Income Tax — apportionment-based ─────────────────────────────
  if (a.income_tax_nexus === "yes") {
    const itSales = incomeTaxSales || [];
    const y1GR = parseNum(a.gross_receipts_y1);
    const y2GR = parseNum(a.gross_receipts_y2);
    const y3GR = parseNum(a.gross_receipts_y3);
    const y1TI = parseNum(a.taxable_income_y1);
    const y2TI = parseNum(a.taxable_income_y2);
    const y3TI = parseNum(a.taxable_income_y3);
    const hasTaxableIncome = y1TI !== null || y2TI !== null || y3TI !== null;

    // Single annual estimate across all income_tax_nexus states
    const totalItSales = itSales.reduce((sum, row) => sum + (parseNum(row.year_1) || 0), 0);

    // P.L. 86-272 protects tangible goods sellers from state income tax when sole activity is solicitation
    const pl272Factor = a.revenue_type === "goods" ? 0.5 : 1;

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

      if (yearsUsed > 0 && totalAttrIncome > 0) {
        const basisSuffix = pl272Factor < 1
          ? " Estimate reduced by 50% to reflect potential P.L. 86-272 protection for tangible goods sellers. Estimates reflect net income-based taxes only and exclude gross receipts taxes, franchise taxes, and minimum taxes."
          : " Estimates reflect net income-based taxes only and exclude gross receipts taxes, franchise taxes, and minimum taxes.";
        exposures.push({
          category: "State Income Tax",
          description: "Estimated state income tax exposure in states where the company has nexus but has not filed returns",
          lowEstimate: totalAttrIncome * 0.05 * pl272Factor,
          highEstimate: totalAttrIncome * 0.09 * pl272Factor,
          basis: `Apportions reported taxable income to non-filing states using a sales factor (reported state sales over total gross receipts) across ${yearsUsed} year${yearsUsed !== 1 ? "s" : ""} of reported data per management's representation of sales history, and applies a blended state rate of 5% to 9%.` + basisSuffix,
        });
      }
    } else if (totalItSales > 0) {
      const assumedIncome = totalItSales * 0.075;
      const basisSuffix = pl272Factor < 1
        ? " Reduced by 50% for potential P.L. 86-272 protection. Taxable income was not provided; a 7.5% assumed pre-tax margin was applied to reported state sales."
        : " Taxable income was not provided; a 7.5% assumed pre-tax margin was applied to reported state sales.";
      exposures.push({
        category: "State Income Tax",
        description: "Estimated state income tax exposure in states where the company has nexus but has not filed returns",
        lowEstimate: assumedIncome * 0.05 * pl272Factor * nexusDuration,
        highEstimate: assumedIncome * 0.09 * pl272Factor * nexusDuration,
        basis: `Apportions taxable income to non-filing states using a sales factor and applies a blended state rate of 5% to 9% over a ${nexusDuration}-year exposure period per management's representation of sales history.` + basisSuffix,
      });
    }
  }

  return exposures;
}
