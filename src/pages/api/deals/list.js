import { Pool } from "pg";
import { getUserFromRequest } from "../../../lib/auth";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();

  const userId = getUserFromRequest(req);
  if (!userId) return res.status(401).json({ error: "Not authenticated" });

  try {
    const result = await pool.query(
      `SELECT
         d.id,
         d.deal_name,
         d.target_name,
         d.client_name,
         d.deal_type,
         d.created_at,
         EXISTS(
           SELECT 1 FROM answers a
           WHERE a.deal_id = d.id AND a.question_id = 'unclaimed_property'
         ) AS is_complete
       FROM deals d
       WHERE d.user_id = $1::uuid
       ORDER BY d.created_at DESC`,
      [userId]
    );
    return res.status(200).json({ deals: result.rows });
  } catch (err) {
    console.error("Deals list error:", err);
    return res.status(500).json({ error: "Database error" });
  }
}
