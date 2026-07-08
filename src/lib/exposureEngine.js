function parseNum(val) {
  if (val == null || val === "") return null;
  const n = parseFloat(String(val).replace(/[^0-9.-]/g, ""));
  return isNaN(n) ? null : n;
}

function fmt(n) {
  return "$" + Math.round(n).toLocaleString("en-US");
}

// stateSales    — all state_sales rows (used for Sales & Use Tax, Calc 1)
// incomeTaxSales — rows where question_id = 'income_tax_nexus' (used for State Income Tax, Calc 5)
export function calculateExposures(answers, stateSales, incomeTaxSales) {
  const a = {};
  for (const row of answers) a[row.question_id] = row.answer;

  const exposures = [];

  // ── 1. Sales & Use Tax — per-state totals ──────────────────────────────────
  if (stateSales && stateSales.length > 0) {
    let totalSales = 0;
    for (const row of stateSales) {
      totalSales += (parseNum(row.year_1) || 0) + (parseNum(row.year_2) || 0) + (parseNum(row.year_3) || 0);
    }
    if (totalSales > 0) {
      exposures.push({
        category: "Sales & Use Tax",
        description: `Estimated unremitted sales tax across ${stateSales.length} state${stateSales.length !== 1 ? "s" : ""} based on reported sales figures`,
        lowEstimate: totalSales * 0.02,
        highEstimate: totalSales * 0.06,
        basis: "2%–6% of total multi-state sales (blended effective rate)",
      });
    }
  }

  // ── 2. ERC Recapture ────────────────────────────────────────────────────────
  if (a.erc_claimed === "yes") {
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

  // ── 3. Reasonable Compensation (S Corp only) ────────────────────────────────
  if (a.entity_type === "scorp") {
    const comp = parseNum(a.officer_comp);
    if (comp !== null) {
      const lowShortfall = Math.max(0, 150000 - comp);
      const highShortfall = Math.max(0, 250000 - comp);
      const lowExposure = lowShortfall * 0.153;
      const highExposure = highShortfall * 0.153;
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

  // ── 4. Contractor Misclassification ────────────────────────────────────────
  if (a.contractor_usage === "yes" && a.contractor_classification === "no") {
    const count = parseNum(a.contractor_count);
    if (count !== null && count > 0) {
      exposures.push({
        category: "Employment Tax – Misclassification",
        description: "Estimated payroll tax exposure if independent contractors are reclassified as employees",
        lowEstimate: count * 45000 * 0.153 * 0.25,
        highEstimate: count * 85000 * 0.153 * 0.50,
        basis: `${Math.round(count)} contractors × avg comp × 15.3% FICA × 25%–50% audit adjustment factor`,
      });
    }
  }

  // ── 5. State Income Tax Nexus — apportionment-based ────────────────────────
  if (a.income_tax_nexus === "yes") {
    const itSales = incomeTaxSales || [];
    const y1GR = parseNum(a.gross_receipts_y1);
    const y2GR = parseNum(a.gross_receipts_y2);
    const y3GR = parseNum(a.gross_receipts_y3);
    const y1TI = parseNum(a.taxable_income_y1);
    const y2TI = parseNum(a.taxable_income_y2);
    const y3TI = parseNum(a.taxable_income_y3);

    const hasTaxableIncome = y1TI !== null || y2TI !== null || y3TI !== null;

    // Sum state sales by year across all income_tax_nexus states
    let itSalesY1 = 0, itSalesY2 = 0, itSalesY3 = 0;
    for (const row of itSales) {
      itSalesY1 += parseNum(row.year_1) || 0;
      itSalesY2 += parseNum(row.year_2) || 0;
      itSalesY3 += parseNum(row.year_3) || 0;
    }

    if (hasTaxableIncome) {
      // Real apportionment: attribute income to non-filing states via sales factor
      let totalAttrIncome = 0;
      let yearsUsed = 0;

      const applyYear = (stateSales, grossReceipts, taxableIncome) => {
        if (stateSales <= 0 || grossReceipts == null || grossReceipts <= 0 || taxableIncome == null) return;
        const factor = Math.min(1, stateSales / grossReceipts);
        const attributed = factor * Math.max(0, taxableIncome);
        totalAttrIncome += attributed;
        yearsUsed++;
      };

      applyYear(itSalesY1, y1GR, y1TI);
      applyYear(itSalesY2, y2GR, y2TI);
      applyYear(itSalesY3, y3GR, y3TI);

      if (yearsUsed > 0 && totalAttrIncome > 0) {
        exposures.push({
          category: "State Income Tax",
          description: "Estimated state income tax exposure in states where the company has nexus but has not filed returns",
          lowEstimate: totalAttrIncome * 0.05,
          highEstimate: totalAttrIncome * 0.09,
          basis: "Apportions reported taxable income to non-filing states using a sales factor (reported state sales over total gross receipts) and applies a blended state rate of 5% to 9%. Estimates reflect net income-based taxes only and exclude gross receipts taxes, franchise taxes, and minimum taxes imposed by certain states.",
        });
      }
    } else {
      // Fallback: use total state sales × assumed 7.5% pre-tax margin
      const totalItSales = itSalesY1 + itSalesY2 + itSalesY3;
      if (totalItSales > 0) {
        const assumedIncome = totalItSales * 0.075;
        exposures.push({
          category: "State Income Tax",
          description: "Estimated state income tax exposure in states where the company has nexus but has not filed returns",
          lowEstimate: assumedIncome * 0.05,
          highEstimate: assumedIncome * 0.09,
          basis: "Apportions reported taxable income to non-filing states using a sales factor (reported state sales over total gross receipts) and applies a blended state rate of 5% to 9%. Estimates reflect net income-based taxes only and exclude gross receipts taxes, franchise taxes, and minimum taxes imposed by certain states. Taxable income was not provided; a 7.5% assumed pre-tax margin was applied to reported state sales.",
        });
      }
    }
  }

  return exposures;
}
