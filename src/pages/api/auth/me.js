import { Pool } from "pg";
import { getUserFromRequest } from "../../../lib/auth";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();

  const userId = getUserFromRequest(req);
  if (!userId) return res.status(401).json({ error: "Not authenticated" });

  try {
    const result = await pool.query(
      "SELECT id, email, created_at FROM users WHERE id = $1::uuid",
      [userId]
    );
    if (result.rows.length === 0) {
      return res.status(401).json({ error: "User not found" });
    }
    return res.status(200).json({ user: result.rows[0] });
  } catch (err) {
    console.error("Me error:", err);
    return res.status(500).json({ error: "Database error" });
  }
}
