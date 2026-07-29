import { Pool } from "pg";
import { getUserFromRequest } from "../../lib/auth";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export default async function handler(req, res) {
  if (req.method === "GET") {
    const { dealId } = req.query;
    if (!dealId) return res.status(400).json({ error: "dealId is required" });
    try {
      const result = await pool.query(
        "SELECT id, client_name, target_name, deal_type FROM deals WHERE id = $1",
        [dealId]
      );
      if (result.rows.length === 0) return res.status(404).json({ error: "Deal not found" });
      return res.status(200).json(result.rows[0]);
    } catch (err) {
      console.error("DB error:", err);
      return res.status(500).json({ error: "Database error" });
    }
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { clientName, targetName, dealName, dealType, agreedToTerms } = req.body;

  if (!clientName || typeof clientName !== "string" || !clientName.trim()) {
    return res.status(400).json({ error: "clientName is required" });
  }
  if (!targetName || typeof targetName !== "string" || !targetName.trim()) {
    return res.status(400).json({ error: "targetName is required" });
  }
  if (dealType !== "asset" && dealType !== "equity") {
    return res.status(400).json({ error: "dealType must be 'asset' or 'equity'" });
  }
  if (agreedToTerms !== true) {
    return res.status(400).json({ error: "agreedToTerms must be true" });
  }

  const userId = getUserFromRequest(req);

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Atomically consume one credit — fails silently if none remain
    const decr = await client.query(
      "UPDATE users SET report_credits = report_credits - 1 WHERE id = $1::uuid AND report_credits > 0",
      [userId]
    );

    if (decr.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(402).json({
        error: "No report credits remaining. Please purchase a report to continue.",
      });
    }

    const result = await client.query(
      `INSERT INTO deals (client_name, target_name, deal_name, deal_type, agreed_to_terms, user_id, created_at)
       VALUES ($1, $2, $3, $4, $5, $6::uuid, NOW())
       RETURNING id`,
      [
        clientName.trim(),
        targetName.trim(),
        dealName?.trim() || null,
        dealType,
        true,
        userId,
      ]
    );

    await client.query("COMMIT");
    return res.status(201).json({ dealId: result.rows[0].id });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("DB error:", err.message);
    return res.status(500).json({ error: err.message ?? "Database error" });
  } finally {
    client.release();
  }
}
