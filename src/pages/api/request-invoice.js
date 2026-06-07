/*
  Run this SQL in Supabase before deploying:

  CREATE TABLE invoice_requests (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name  TEXT        NOT NULL,
    last_name   TEXT        NOT NULL,
    firm_name   TEXT        NOT NULL,
    email       TEXT        NOT NULL,
    plan        TEXT        NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
*/

import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const PLAN_LABELS = {
  single: "Single Use — $2,500",
  monthly: "Monthly Access — $9,000/mo",
  annual: "Annual Access — $70,000/yr",
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { firstName, lastName, firmName, email, plan } = req.body || {};
  if (!firstName || !lastName || !firmName || !email || !plan) {
    return res.status(400).json({ error: "All fields are required." });
  }
  if (!PLAN_LABELS[plan]) {
    return res.status(400).json({ error: "Invalid plan." });
  }

  try {
    await pool.query(
      `INSERT INTO invoice_requests (first_name, last_name, firm_name, email, plan)
       VALUES ($1, $2, $3, $4, $5)`,
      [firstName, lastName, firmName, email, plan]
    );
  } catch (err) {
    console.error("invoice_requests insert error:", err);
    return res.status(500).json({ error: "Database error." });
  }

  const planLabel = PLAN_LABELS[plan];

  if (process.env.RESEND_API_KEY) {
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: "MergerAid <noreply@mergeraid.com>",
        to: "support@mergeraid.com",
        subject: `Invoice Request — ${planLabel}`,
        text: [
          "New invoice request received:",
          "",
          `Name:  ${firstName} ${lastName}`,
          `Firm:  ${firmName}`,
          `Email: ${email}`,
          `Plan:  ${planLabel}`,
        ].join("\n"),
      });
    } catch (err) {
      console.error("Resend email error:", err);
    }
  } else {
    console.log("[request-invoice] No RESEND_API_KEY — logging request:", {
      firstName,
      lastName,
      firmName,
      email,
      plan: planLabel,
    });
  }

  return res.status(200).json({ ok: true });
}
