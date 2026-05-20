import { Pool } from "pg";
import { hashPassword, generateToken } from "../../../lib/auth";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }
  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters" });
  }

  try {
    const existing = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email.toLowerCase()]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: "An account with this email already exists" });
    }

    const passwordHash = await hashPassword(password);
    const result = await pool.query(
      "INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id",
      [email.toLowerCase(), passwordHash]
    );

    const userId = String(result.rows[0].id);
    const token = generateToken(userId);

    res.setHeader("Set-Cookie", `auth_token=${token}; HttpOnly; Path=/; Max-Age=${7 * 24 * 60 * 60}; SameSite=Lax`);

    return res.status(201).json({ success: true, userId });
  } catch (err) {
    console.error("Register error:", err.message);
    return res.status(500).json({ error: err.message ?? "Database error" });
  }
}
