import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const VALID_QUESTION_IDS = new Set(["income_tax_nexus", "sales_tax_nexus"]);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { dealId, questionId, states } = req.body;

  if (!dealId) {
    return res.status(400).json({ error: "dealId is required" });
  }
  if (!questionId || !VALID_QUESTION_IDS.has(questionId)) {
    return res.status(400).json({ error: "Invalid questionId" });
  }
  if (!Array.isArray(states) || states.length === 0) {
    return res.status(400).json({ error: "states must be a non-empty array" });
  }

  try {
    await Promise.all(
      states.map(({ state, year1, year2, year3 }) =>
        pool.query(
          `INSERT INTO state_sales (deal_id, question_id, state, year_1, year_2, year_3, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
          [
            dealId,
            questionId,
            state,
            year1 !== "" && year1 != null ? Number(year1) : null,
            year2 !== "" && year2 != null ? Number(year2) : null,
            year3 !== "" && year3 != null ? Number(year3) : null,
          ]
        )
      )
    );

    return res.status(201).json({ ok: true });
  } catch (err) {
    console.error("DB error:", err);
    return res.status(500).json({ error: "Database error" });
  }
}
