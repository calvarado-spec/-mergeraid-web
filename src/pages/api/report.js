import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

function computeRisks(answers) {
  const a = {};
  for (const row of answers) a[row.question_id] = row.answer;
  const risks = [];
  const add = (category, text) => risks.push({ category, text });

  if (a.prior_reorg === "yes" && a.prior_diligence === "no")
    add("Federal Tax", "Potential risk that tax liabilities from prior reorganizations or acquisitions were not identified prior to closing. Recommend reviewing prior transaction documents and any available tax diligence from that transaction.");
  if (a.erc_received_2yr === "yes" && a.erc_q3_2021 === "yes")
    add("Federal Tax", "Potential risk in the amount of ERC received. The statute of limitations for Q3 2021 credits runs through April 15, 2027, or 2 years from the date the credit was received, whichever is later.");
  if (a.erc_received_2yr !== undefined && a.erc_claimed === "yes")
    add("Federal Tax", "Potential Risk in the amount of any credit received up until 2 years when the statute of limitations expires.");
  if (a.tax_exam_resolved === "no")
    add("Federal Tax", "Low to moderate risk. The Company has been subject to a tax examination that has been resolved. Recommend confirming all assessments have been paid in full, that amended returns were filed where required, and that any procedural deficiencies identified during the audit have been addressed.");
  if (a.related_party === "yes" && a.related_party_fmv === "no")
    add("Federal Tax", "Elevated risk that related party transactions not conducted at fair market value may be recharacterized by the IRS, resulting in additional taxable income, denied deductions, or other adjustments. Recommend obtaining documentation supporting the pricing of all related party transactions.");
  if (a.related_party === "yes" && a.related_party_fmv === "yes")
    add("Federal Tax", "Low risk. The Company has related party transactions conducted at fair market value. Recommend confirming that contemporaneous documentation exists to support FMV pricing in the event of an audit.");
  if (a.income_tax_nexus === "yes")
    add("State Income Tax", "Risk that the Company may have state income tax filing obligations in states where it has sales. Applicability depends on the volume of sales, the nature of the business activity, and whether P.L. 86-272 protections apply. Review sales by state to assess nexus exposure and quantify potential liability.");
  if (a.physical_nexus === "yes")
    add("State Income Tax", "Risk that physical presence in states where the Company does not currently file may create state income tax filing obligations. For C corporations, exposure is estimated using a blended federal and state rate applied to apportioned income. For pass-through entities, exposure is estimated using an apportionment formula at the owner level. Recommend reviewing employee locations, contractor locations, and property situs by state.");
  if (a.sales_tax_nexus === "yes")
    add("Sales & Use Tax", "Risk that the Company may have sales and use tax filing obligations in states where it has sales. Applicability depends on whether the Company has crossed economic nexus thresholds, which vary by state but are commonly $100,000 in sales or 200 transactions annually. Review sales by state to identify states where nexus may exist.");
  if (a.exemption_certs === "no")
    add("Sales & Use Tax", "Risk that lack of documentation will create taxable sales under audit.");
  if (a.use_tax_review === "no")
    add("Sales & Use Tax", "Risk of unpaid use tax on purchases from vendors that did not collect sales tax. Exposure is generally limited to purchases from out-of-state vendors not registered in the Company's state. Purchases from major retailers that collect sales tax broadly present minimal risk. Recommend reviewing vendor invoices for instances where tax was not charged.");
  if (a.employment_tax_states === "yes")
    add("Employment Tax", "Risk of employment tax filing obligations in states where employees reside or travel to perform services. Employees who reside in another state create definitive nexus requiring payroll tax registration and filing. De minimis travel may not create an obligation depending on the state but should be monitored. Travel to perform services will generally create an employment tax filing obligation. Recommend reviewing employee rosters by state of residence and work location.");
  if (a.contractor_classification === "no")
    add("Employment Tax", "Risk of employment tax exposure on independent contractor compensation.");
  if (a.entity_type === "scorp") {
    const rawComp = a.officer_comp != null ? parseFloat(String(a.officer_comp).replace(/[^0-9.-]/g, "")) : NaN;
    if (!isNaN(rawComp) && rawComp < 150000)
      add("Employment Tax", "If officer/shareholder W-2 compensation is determined to be below a reasonable level, the IRS may recharacterize a portion of distributions as wages subject to employment tax. Recommend benchmarking officer compensation against industry comparables to assess exposure.");
  }
  if (a.property_tax === "no")
    add("Property Tax", "Risk of property tax liability in states where the Company owns or leases real or personal property but has not filed property tax returns. Note that not all states impose personal property tax — applicability varies by state. Recommend reviewing the Company's property locations and confirming filing obligations in each state.");
  if (a.unclaimed_property === "no")
    add("Unclaimed Property", "Recommendation: The Company does not appear to have formal processes in place to identify and remit unclaimed property. While this is not a confirmed liability, uncashed checks and unredeemed customer credits may be subject to state escheatment laws after a dormancy period of typically 3 to 5 years. Recommend implementing a process to identify, review, and remit unclaimed property to applicable states on an annual basis.");
  if (a.scorp_single_class === "no")
    add("Federal Tax", "Risk that S corporation eligibility may be invalid due to a second class of stock. Potential C corporation reclassification and corporate-level tax exposure.");
  if (a.scorp_shareholder_count === "yes")
    add("Federal Tax", "Risk that S corporation eligibility may be invalid due to exceeding the 100 shareholder limit.");
  if (a.scorp_eligible_shareholders === "yes")
    add("Federal Tax", "Risk that S corporation eligibility may be invalid due to a non-eligible shareholder. Recommend obtaining shareholder history and confirming IRS acceptance.");
  if (a.scorp_election_docs === "no")
    add("Federal Tax", "Risk that S corporation status may not be valid without documentation. Recommend obtaining IRS acceptance letter.");
  if (a.scorp_big_assets === "yes")
    add("Federal Tax", "Risk of built-in gains tax on appreciated assets at the highest corporate rate. Quantify appreciated assets at the time of conversion.");
  if (a.ccorp_ownership_change === "yes")
    add("Federal Tax", "Risk of Section 382 limitation on NOL and credit carryforwards due to ownership change exceeding 50%.");
  if (a.ccorp_nol === "yes")
    add("Federal Tax", "Risk that NOL carryforwards are subject to Section 382 annual limitation if an ownership change occurred. Limitation equals the value of the company multiplied by the long-term tax-exempt rate.");
  if (a.ccorp_credits === "yes")
    add("Federal Tax", "Risk that tax credit carryforwards are subject to Section 383 limitations following an ownership change.");
  if (a.pship_rep === "no")
    add("Federal Tax", "Risk that the IRS will appoint a Partnership Representative, causing the partnership to lose control over audit proceedings under the BBA regime.");
  if (a.pship_pushout === "no")
    add("Federal Tax", "Risk that audit adjustments will be assessed at the partnership level at the highest tax rate rather than flowing through to individual partners.");
  if (a.pship_aar === "yes")
    add("Federal Tax", "Risk of open adjustments from amended returns or Administrative Adjustment Requests that may flow through to partners post-closing. Recommend obtaining copies of all filed AARs and amended returns, identifying the nature and amount of any adjustments, and determining whether any amounts remain open or subject to partner-level flow-through after closing.");
  if (a.pship_bba_alloc === "no")
    add("Federal Tax", "Risk that the buyer may bear the economic burden of pre-closing audit adjustments with no contractual protection.");
  if (a.eq_open_years === "yes")
    add("Federal Tax", "Risk of exposure on open tax years where federal or state authorities may still assess additional tax. Recommend tax representation and indemnification provisions in the purchase agreement. For larger transactions, representations and warranties insurance may provide additional protection.");
  if (a.eq_notices === "yes")
    add("Federal Tax", "Risk of unresolved tax positions indicated by outstanding notices. Obtain copies and assess exposure.");
  if (a.eq_utp === "yes")
    add("Federal Tax", "Risk of uncertain tax positions on the balance sheet. Quantify ASC 740 reserves and assess likelihood of settlement.");

  return risks;
}

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();

  const { dealId } = req.query;
  if (!dealId) return res.status(400).json({ error: "dealId is required" });

  try {
    const [dealResult, answersResult, salesResult] = await Promise.all([
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
    ]);

    if (dealResult.rows.length === 0)
      return res.status(404).json({ error: "Deal not found" });

    return res.status(200).json({
      deal: dealResult.rows[0],
      risks: computeRisks(answersResult.rows),
      answers: answersResult.rows,
      stateSales: salesResult.rows,
    });
  } catch (err) {
    console.error("Report data error:", err);
    return res.status(500).json({ error: "Database error" });
  }
}
