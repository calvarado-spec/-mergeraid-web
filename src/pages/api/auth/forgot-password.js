/*
  Run this SQL in Supabase before deploying:

  ALTER TABLE users
    ADD COLUMN reset_token         TEXT,
    ADD COLUMN reset_token_expires TIMESTAMPTZ;
*/

import crypto from "crypto";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { email } = req.body || {};
  if (!email) return res.status(400).json({ error: "Email is required." });

  // Always return 200 — never reveal whether an email is registered
  const { rows } = await pool.query(
    "SELECT id FROM users WHERE email = $1",
    [email.toLowerCase().trim()]
  );
  if (rows.length === 0) return res.status(200).json({ ok: true });

  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await pool.query(
    `UPDATE users
     SET reset_token = $1, reset_token_expires = $2
     WHERE id = $3`,
    [token, expires, rows[0].id]
  );

  console.log(
    `[forgot-password] Reset link: https://mergeraid.com/reset-password?token=${token}`
  );

  return res.status(200).json({ ok: true });
}
