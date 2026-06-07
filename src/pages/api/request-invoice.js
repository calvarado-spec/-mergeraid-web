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

import Stripe from "stripe";
import { Pool } from "pg";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const PLAN_PRICES = {
  single:  { label: "MergerAid — Single Use",      amount: 250000  },
  monthly: { label: "MergerAid — Monthly Access",   amount: 900000  },
  annual:  { label: "MergerAid — Annual Access",    amount: 7000000 },
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { firstName, lastName, firmName, email, plan } = req.body || {};
  if (!firstName || !lastName || !firmName || !email || !plan) {
    return res.status(400).json({ error: "All fields are required." });
  }
  if (!PLAN_PRICES[plan]) {
    return res.status(400).json({ error: "Invalid plan." });
  }

  const { label, amount } = PLAN_PRICES[plan];

  try {
    // 1. Create Stripe customer
    const customer = await stripe.customers.create({
      name: `${firstName} ${lastName}`,
      email,
      metadata: { firm_name: firmName },
    });

    // 2. Add an invoice item for the selected plan
    await stripe.invoiceItems.create({
      customer: customer.id,
      amount,
      currency: "usd",
      description: label,
    });

    // 3. Create the invoice (send_invoice = manual payment via email link)
    const invoice = await stripe.invoices.create({
      customer: customer.id,
      collection_method: "send_invoice",
      days_until_due: 30,
    });

    // 4. Finalize so it gets an invoice number and hosted URL
    const finalized = await stripe.invoices.finalizeInvoice(invoice.id);

    // 5. Send — Stripe emails the customer a payment link automatically
    const sent = await stripe.invoices.sendInvoice(finalized.id);

    // 6. Record in Supabase
    await pool.query(
      `INSERT INTO invoice_requests (first_name, last_name, firm_name, email, plan)
       VALUES ($1, $2, $3, $4, $5)`,
      [firstName, lastName, firmName, email, plan]
    );

    return res.status(200).json({ ok: true, invoiceUrl: sent.hosted_invoice_url });
  } catch (err) {
    console.error("request-invoice error:", err);
    return res.status(500).json({ error: "Failed to create invoice. Please try again." });
  }
}
