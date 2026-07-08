import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

function computeRisks(answers) {
  const a = {};
  for (const row of answers) a[row.question_id] = row.answer;

  const risks = [];
  const add = (category, text, severity) => risks.push({ category, text, severity });

  // ── Federal Tax ──────────────────────────────────────────────────────────
  if (a.prior_reorg === "yes" && a.prior_diligence === "no")
    add("Federal Tax", "Potential risk that tax liabilities from prior reorganizations or acquisitions were not identified prior to closing. Recommend reviewing prior transaction documents and any available tax diligence from that transaction.", "moderate");

  // ERC — single consolidated finding
  if (a.erc_claimed === "yes") {
    if (a.erc_q3_2021 === "yes") {
      add("Federal Tax", "Potential risk of IRS disallowance of Employee Retention Credits claimed. The statute of limitations for Q3 2021 credits runs through April 15, 2027, or 2 years from the date the credit was received, whichever is later. Recommend reviewing eligibility documentation supporting the claim.", "moderate");
    } else if (a.erc_q3_2021 === "no" && a.erc_received_2yr === "yes") {
      add("Federal Tax", "Potential risk of IRS disallowance of a portion or all of Employee Retention Credits claimed. Credits received within the past 2 years remain within the assessment window. Recommend reviewing eligibility documentation supporting the claim.", "moderate");
    } else if (a.erc_q3_2021 === "no" && a.erc_received_2yr === "no") {
      add("Federal Tax", "Low risk. Employee Retention Credits were claimed for quarters where the statute of limitations may have lapsed. Recommend confirming filing and receipt dates to verify the assessment window has closed.", "low");
    }
  }

  // Q4/Q4a — split unresolved vs. resolved examination
  if (a.tax_exam === "yes" && a.tax_exam_resolved === "no")
    add("Federal Tax", "Elevated risk. The Company is subject to an open or unresolved tax examination. The outcome may result in additional tax, penalties, and interest. Recommend obtaining all examination correspondence, understanding the issues under review, and quantifying any proposed adjustments prior to closing.", "high");
  if (a.tax_exam === "yes" && a.tax_exam_resolved === "yes")
    add("Federal Tax", "Low risk. The Company has been subject to a tax examination that has been resolved. Recommend confirming all assessments have been paid in full, that amended returns were filed where required, and that any procedural deficiencies identified during the audit have been addressed.", "low");

  if (a.related_party === "yes" && a.related_party_fmv === "no")
    add("Federal Tax", "Elevated risk that related party transactions not conducted at fair market value may be recharacterized by the IRS, resulting in additional taxable income, denied deductions, or other adjustments. Recommend obtaining documentation supporting the pricing of all related party transactions.", "high");
  if (a.related_party === "yes" && a.related_party_fmv === "yes")
    add("Federal Tax", "Low risk. The Company has related party transactions conducted at fair market value. Recommend confirming that contemporaneous documentation exists to support FMV pricing in the event of an audit.", "low");

  // ── State Income Tax ─────────────────────────────────────────────────────
  if (a.income_tax_nexus === "yes")
    add("State Income Tax", "Risk that the Company may have state income tax filing obligations in states where it has sales. Applicability depends on the volume of sales, the nature of the business activity, and whether P.L. 86-272 protections apply. Review sales by state to assess nexus exposure and quantify potential liability.", "moderate");

  if (a.physical_nexus === "yes")
    add("State Income Tax", "Risk that physical presence in states where the Company does not currently file may create state income tax filing obligations. For C corporations, exposure is estimated using a blended state rate applied to apportioned income. For pass-through entities, exposure is estimated using an apportionment formula at the owner level. Recommend reviewing employee locations, contractor locations, and property situs by state.", "moderate");

  // ── Sales & Use Tax ──────────────────────────────────────────────────────
  if (a.sales_tax_nexus === "yes")
    add("Sales & Use Tax", "Risk that the Company may have sales and use tax filing obligations in states where it has sales. Applicability depends on whether the Company has crossed economic nexus thresholds, which vary by state but are commonly $100,000 in sales or 200 transactions annually. Review sales by state to identify states where nexus may exist.", "moderate");

  if (a.exemption_certs === "no")
    add("Sales & Use Tax", "Risk that undocumented exempt sales will be presumed taxable under audit and assessed against the Company with penalties and interest. Recommend implementing a process to collect and periodically refresh exemption certificates from all customers claiming exemption.", "moderate");

  if (a.use_tax_review === "no")
    add("Sales & Use Tax", "Risk of unpaid use tax on purchases from vendors that did not collect sales tax. Exposure is generally limited to purchases from out-of-state vendors not registered in the Company's state. Purchases from major retailers that collect sales tax broadly present minimal risk. Recommend reviewing vendor invoices for instances where tax was not charged.", "low");

  // ── Employment Tax ───────────────────────────────────────────────────────
  if (a.employment_tax_states === "yes")
    add("Employment Tax", "Risk of employment tax filing obligations in states where employees reside or travel to perform services. Employees who reside in another state create definitive nexus requiring payroll tax registration and filing. De minimis travel may not create an obligation depending on the state but should be monitored. Travel to perform services will generally create an employment tax filing obligation. Recommend reviewing employee rosters by state of residence and work location.", "moderate");

  if (a.contractor_usage === "yes" && a.contractor_classification === "no")
    add("Employment Tax", "Risk of employment tax exposure on independent contractor compensation. Without a documented classification process, contractors performing employee-equivalent functions may be reclassified under audit, resulting in back payroll taxes, penalties, and interest.", "moderate");

  if (a.entity_type === "scorp") {
    const rawComp = a.officer_comp != null ? parseFloat(String(a.officer_comp).replace(/[^0-9.-]/g, "")) : NaN;
    if (!isNaN(rawComp) && rawComp < 150000)
      add("Employment Tax", "If officer/shareholder W-2 compensation is determined to be below a reasonable level, the IRS may recharacterize a portion of distributions as wages subject to employment tax. Recommend benchmarking officer compensation against industry comparables to assess exposure.", "moderate");
  }

  // ── Property Tax ─────────────────────────────────────────────────────────
  if (a.property_tax === "no")
    add("Property Tax", "Risk of property tax liability in states where the Company owns or leases real or personal property but has not filed property tax returns. Note that not all states impose personal property tax — applicability varies by state. Recommend reviewing the Company's property locations and confirming filing obligations in each state.", "low");

  // ── Unclaimed Property ───────────────────────────────────────────────────
  if (a.unclaimed_property === "no")
    add("Unclaimed Property", "Recommendation: The Company does not appear to have formal processes in place to identify and remit unclaimed property. While this is not a confirmed liability, uncashed checks and unredeemed customer credits may be subject to state escheatment laws after a dormancy period of typically 3 to 5 years. Recommend implementing a process to identify, review, and remit unclaimed property to applicable states on an annual basis.", "recommendation");

  // ── Equity deal risks ─────────────────────────────────────────────────────
  // S Corporation
  if (a.scorp_single_class === "no")
    add("Federal Tax", "Risk that S corporation eligibility may be invalid due to a second class of stock. Potential C corporation reclassification and corporate-level tax exposure.", "high");
  if (a.scorp_shareholder_count === "yes")
    add("Federal Tax", "Risk that S corporation eligibility may be invalid due to exceeding the 100 shareholder limit.", "high");
  if (a.scorp_eligible_shareholders === "yes")
    add("Federal Tax", "Risk that S corporation eligibility may be invalid due to a non-eligible shareholder. Recommend obtaining shareholder history and confirming IRS acceptance.", "high");
  if (a.scorp_election_docs === "no")
    add("Federal Tax", "Risk that S corporation status may not be valid without documentation. Recommend obtaining IRS acceptance letter.", "high");
  if (a.scorp_big_assets === "yes")
    add("Federal Tax", "Risk of built-in gains tax on appreciated assets at the highest corporate rate. Quantify appreciated assets at the time of conversion.", "high");

  // C Corporation
  if (a.ccorp_ownership_change === "yes")
    add("Federal Tax", "Risk of Section 382 limitation on NOL and credit carryforwards due to ownership change exceeding 50%.", "moderate");
  if (a.ccorp_nol === "yes") {
    const nolAmt = a.ccorp_nol_amount ? a.ccorp_nol_amount.trim() : null;
    const nolText = (nolAmt ? `Management represented NOL carryforwards of approximately ${nolAmt}. ` : "") +
      "Note that the contemplated equity acquisition will itself generally constitute a Section 382 ownership change, subjecting the NOLs to an annual usage limitation post-closing equal to the equity value of the company multiplied by the long-term tax-exempt rate. The economic value of the NOL carryforwards should be discounted accordingly. Recommend a Section 382 study to quantify the annual limitation.";
    add("Federal Tax", nolText, "moderate");
  }
  if (a.ccorp_credits === "yes")
    add("Federal Tax", "Risk that tax credit carryforwards are subject to Section 383 limitations following an ownership change.", "low");

  // Partnership / LLC
  if (a.pship_rep === "no")
    add("Federal Tax", "Risk that the IRS will appoint a Partnership Representative, causing the partnership to lose control over audit proceedings under the BBA regime.", "low");
  if (a.pship_pushout === "no")
    add("Federal Tax", "Risk that audit adjustments will be assessed at the partnership level at the highest tax rate rather than flowing through to individual partners.", "moderate");
  if (a.pship_aar === "yes")
    add("Federal Tax", "Risk of open adjustments from amended returns or Administrative Adjustment Requests that may flow through to partners post-closing. Recommend obtaining copies of all filed AARs and amended returns, identifying the nature and amount of any adjustments, and determining whether any amounts remain open or subject to partner-level flow-through after closing.", "moderate");
  if (a.pship_bba_alloc === "no")
    add("Federal Tax", "Risk that the buyer may bear the economic burden of pre-closing audit adjustments with no contractual protection.", "moderate");

  // Common equity questions
  if (a.eq_open_years === "yes")
    add("Federal Tax", "As is typical in most transactions, risk of exposure on open tax years where federal or state authorities may still assess additional tax. Recommend tax representation and indemnification provisions in the purchase agreement. For larger transactions, representations and warranties insurance may provide additional protection.", "low");
  if (a.eq_notices === "yes")
    add("Federal Tax", "Risk of unresolved tax positions indicated by outstanding notices. Obtain copies and assess exposure.", "moderate");
  if (a.eq_utp === "yes")
    add("Federal Tax", "Risk of uncertain tax positions on the balance sheet. Quantify ASC 740 reserves and assess likelihood of settlement.", "moderate");

  return risks;
}

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();

  const { dealId } = req.query;
  if (!dealId) return res.status(400).json({ error: "dealId is required" });

  try {
    const [dealResult, answersResult, salesResult, incomeTaxSalesResult] = await Promise.all([
      pool.query(
        "SELECT id, client_name, target_name, deal_name, deal_type FROM deals WHERE id = $1",
        [dealId]
      ),
      pool.query(
        "SELECT question_id, answer FROM answers WHERE deal_id = $1",
        [dealId]
      ),
      pool.query(
        "SELECT state, year_1, year_2, year_3 FROM state_sales WHERE deal_id = $1 ORDER BY state ASC",
        [dealId]
      ),
      pool.query(
        "SELECT state, year_1, year_2, year_3 FROM state_sales WHERE deal_id = $1 AND question_id = 'income_tax_nexus' ORDER BY state ASC",
        [dealId]
      ),
    ]);

    if (dealResult.rows.length === 0)
      return res.status(404).json({ error: "Deal not found" });

    return res.status(200).json({
      deal: dealResult.rows[0],
      risks: computeRisks(answersResult.rows),
      answers: answersResult.rows,
      stateSales: salesResult.rows,
      incomeTaxSales: incomeTaxSalesResult.rows,
    });
  } catch (err) {
    console.error("Report data error:", err);
    return res.status(500).json({ error: "Database error" });
  }
}
