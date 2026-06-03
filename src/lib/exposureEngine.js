function parseNum(val) {
  if (val == null || val === "") return null;
  const n = parseFloat(String(val).replace(/[^0-9.-]/g, ""));
  return isNaN(n) ? null : n;
}

function fmt(n) {
  return "$" + Math.round(n).toLocaleString("en-US");
}

export function calculateExposures(answers, stateSales) {
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
        basis: "10%–30% of total ERC claimed (IRS audit adjustment range)",
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
  if (a.contractor_classification === "yes") {
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

  // ── 5. State Income Tax Nexus ───────────────────────────────────────────────
  if (a.income_tax_nexus === "yes") {
    const y1 = parseNum(a.gross_receipts_y1);
    const y2 = parseNum(a.gross_receipts_y2);
    const y3 = parseNum(a.gross_receipts_y3);
    const provided = [y1, y2, y3].filter((v) => v !== null);
    if (provided.length > 0) {
      const avgReceipts = provided.reduce((s, v) => s + v, 0) / provided.length;
      exposures.push({
        category: "State Income Tax",
        description: "Estimated state income tax exposure in states where the company has nexus but has not filed returns",
        lowEstimate: avgReceipts * 0.02 * 0.05,
        highEstimate: avgReceipts * 0.04 * 0.09,
        basis: "Avg receipts × 2%–4% apportioned income rate × 5%–9% blended state tax rate",
      });
    }
  }

  return exposures;
}
