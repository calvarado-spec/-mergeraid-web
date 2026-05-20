import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const VALID_QUESTION_IDS = new Set([
  // asset questions
  "prior_reorg", "prior_diligence",
  "erc_claimed", "erc_q3_2021", "erc_received_2yr",
  "tax_exam", "tax_exam_resolved",
  "related_party", "related_party_fmv",
  "income_tax_nexus", "physical_nexus",
  "taxable_sales", "sales_tax_nexus",
  "exemption_certs", "use_tax_review",
  "employment_tax_states", "contractor_classification",
  "property_tax", "unclaimed_property",
  // equity questions
  "entity_type",
  "scorp_single_class", "scorp_shareholder_count", "scorp_eligible_shareholders",
  "scorp_election_docs", "scorp_converted_from_c", "scorp_big_assets",
  "ccorp_ownership_change", "ccorp_nol", "ccorp_nol_amount", "ccorp_credits",
  "pship_rep", "pship_pushout", "pship_aar", "pship_bba_alloc",
  "eq_open_years", "eq_notices", "eq_utp",
]);
const VALID_ANSWERS = new Set(["yes", "no", "na", "scorp", "ccorp", "pship"]);
// ccorp_nol_amount accepts a free-form dollar string; skip the enum check for it
const FREE_FORM_QUESTIONS = new Set(["ccorp_nol_amount"]);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { dealId, questionId, answer } = req.body;

  if (!dealId) {
    return res.status(400).json({ error: "dealId is required" });
  }
  if (!questionId || !VALID_QUESTION_IDS.has(questionId)) {
    return res.status(400).json({ error: "Invalid questionId" });
  }
  if (!FREE_FORM_QUESTIONS.has(questionId) && (!answer || !VALID_ANSWERS.has(answer))) {
    return res.status(400).json({ error: "Invalid answer" });
  }
  if (FREE_FORM_QUESTIONS.has(questionId) && !answer) {
    return res.status(400).json({ error: "answer is required" });
  }

  try {
    await pool.query(
      `INSERT INTO answers (deal_id, question_id, answer, created_at)
       VALUES ($1, $2, $3, NOW())`,
      [dealId, questionId, answer]
    );

    return res.status(201).json({ ok: true });
  } catch (err) {
    console.error("DB error:", err);
    return res.status(500).json({ error: "Database error" });
  }
}
