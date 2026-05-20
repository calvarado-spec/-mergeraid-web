import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

function computeRisks(answers) {
  const a = {};
  for (const row of answers) a[row.question_id] = row.answer;
  const risks = [];
  const add = (category, text) => risks.push({ category, text });

  if (a.prior_diligence === "no")
    add("Federal Tax", "Potential Risk. Further diligence should be done to understand any potential risk (unpaid fees or taxes as a result of the acquisition or disposition).");
  if (a.erc_received_2yr === "yes" && a.erc_q3_2021 === "yes")
    add("Federal Tax", "Potential Risk in the amount of ERC received until the statute of limitations expires on 04/15/2027.");
  if (a.erc_received_2yr !== undefined && a.erc_claimed === "yes")
    add("Federal Tax", "Potential Risk in the amount of any credit received up until 2 years when the statute of limitations expires.");
  if (a.tax_exam_resolved === "no")
    add("Federal Tax", "Potential Risk, resulting in the amount of the examination. Monitor results.");
  if (a.related_party_fmv !== undefined)
    add("Federal Tax", "Potential Risk, resulting in the amount of the examination. Monitor results.");
  if (a.income_tax_nexus === "yes")
    add("State Income Tax", "Risk that the Company may have filing obligations in states where they have sales but do not currently file.");
  if (a.physical_nexus === "yes")
    add("State Income Tax", "Potential Risk. If physical presence: C corp - Blended rate. All others - use formula.");
  if (a.sales_tax_nexus === "yes")
    add("Sales & Use Tax", "Risk that the Company may have filing obligations in states where they have sales but do not currently file.");
  if (a.exemption_certs === "no")
    add("Sales & Use Tax", "Risk that lack of documentation will create taxable sales under audit.");
  if (a.use_tax_review === "no")
    add("Sales & Use Tax", "Risk of unpaid use tax on purchases.");
  if (a.employment_tax_states === "yes")
    add("Employment Tax", "Risk of employment tax due in those states.");
  if (a.contractor_classification === "no")
    add("Employment Tax", "Risk of employment tax exposure on independent contractor compensation.");
  if (a.property_tax === "no")
    add("Property Tax", "Property tax risk in states where they have property but are not filing.");
  if (a.unclaimed_property === "no")
    add("Unclaimed Property", "Risk of unclaimed property. Include procedural recommendation.");
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
    add("Federal Tax", "Risk of open adjustments from amended returns or AARs that may flow through to the buyer post-closing.");
  if (a.pship_bba_alloc === "no")
    add("Federal Tax", "Risk that the buyer may bear the economic burden of pre-closing audit adjustments with no contractual protection.");
  if (a.eq_open_years === "yes")
    add("Federal Tax", "Risk of exposure on open tax years. Recommend representations and warranties insurance coverage.");
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
      stateSales: salesResult.rows,
    });
  } catch (err) {
    console.error("Report data error:", err);
    return res.status(500).json({ error: "Database error" });
  }
}
