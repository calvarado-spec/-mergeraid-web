import bcrypt from "bcryptjs";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { token, password } = req.body || {};
  if (!token || !password) {
    return res.status(400).json({ error: "Token and password are required." });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters." });
  }

  const { rows } = await pool.query(
    `SELECT id FROM users
     WHERE reset_token = $1 AND reset_token_expires > NOW()`,
    [token]
  );
  if (rows.length === 0) {
    return res.status(400).json({ error: "This reset link is invalid or has expired." });
  }

  const hash = await bcrypt.hash(password, 12);

  await pool.query(
    `UPDATE users
     SET password_hash = $1, reset_token = NULL, reset_token_expires = NULL
     WHERE id = $2`,
    [hash, rows[0].id]
  );

  return res.status(200).json({ ok: true });
}
