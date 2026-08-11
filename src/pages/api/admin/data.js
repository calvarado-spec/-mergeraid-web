import { Pool } from "pg";
import jwt from "jsonwebtoken";
import { parse } from "cookie";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const ALLOWED_TABLES = new Set(["users", "deals", "contact_submissions"]);

function verifySession(req) {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return false;
  const token = parse(cookieHeader).admin_session;
  if (!token) return false;
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    return payload.isAdmin === true;
  } catch {
    return false;
  }
}

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();

  if (!verifySession(req)) {
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
