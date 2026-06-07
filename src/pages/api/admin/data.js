import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const ALLOWED_TABLES = new Set(["users", "deals", "contact_submissions"]);

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();

  if (req.headers["x-admin-key"] !== process.env.ADMIN_SECRET_KEY) {
    return res.status(401).json({ error: "Unauthorized." });
  }

  const { table } = req.query;
  if (!table || !ALLOWED_TABLES.has(table)) {
    return res.status(400).json({ error: "Invalid table." });
  }

  try {
    const { rows } = await pool.query(
      `SELECT * FROM ${table} ORDER BY created_at DESC`
    );
    return res.status(200).json({ rows });
  } catch (err) {
    console.error("Admin data error:", err);
    return res.status(500).json({ error: "Database error." });
  }
}
