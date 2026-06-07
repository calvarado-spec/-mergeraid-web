/*
  Run this SQL in Supabase before deploying:

  ALTER TABLE users
    ADD COLUMN reset_token         TEXT,
    ADD COLUMN reset_token_expires TIMESTAMPTZ;
*/

import crypto from "crypto";
import { Pool } from "pg";
import { Resend } from "resend";

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

  const resetLink = `https://mergeraid.com/reset-password?token=${token}`;

  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: "MergerAid <noreply@mergeraid.com>",
    to: email,
    subject: "Reset your MergerAid password",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;color:#1e293b;">
        <h2 style="margin:0 0 8px;font-size:20px;color:#1d4ed8;">Reset your password</h2>
        <p style="margin:0 0 24px;font-size:15px;color:#475569;">
          We received a request to reset the password for your MergerAid account.
          Click the button below to choose a new password. This link expires in 1 hour.
        </p>
        <a href="${resetLink}"
           style="display:inline-block;background:#1d4ed8;color:#fff;text-decoration:none;
                  font-size:15px;font-weight:600;padding:12px 28px;border-radius:8px;">
          Reset Password
        </a>
        <p style="margin:24px 0 0;font-size:13px;color:#94a3b8;">
          If you didn&rsquo;t request a password reset, you can safely ignore this email.
          Your password will not change.
        </p>
        <hr style="margin:24px 0;border:none;border-top:1px solid #e2e8f0;" />
        <p style="margin:0;font-size:12px;color:#cbd5e1;">
          &copy; 2025 MergerAid LLC &mdash; mergeraid.com
        </p>
      </div>
    `,
  });

  return res.status(200).json({ ok: true });
}
