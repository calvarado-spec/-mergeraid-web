// SQL MIGRATION — run manually in Supabase before deploying:
//
//   ALTER TABLE users ADD COLUMN report_credits INTEGER NOT NULL DEFAULT 0;
//

import Stripe from "stripe";
import { Pool } from "pg";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Stripe requires the raw body to verify the webhook signature
export const config = {
  api: { bodyParser: false },
};

function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const sig = req.headers["stripe-signature"];
  let event;

  try {
    const rawBody = await getRawBody(req);
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).json({ error: `Webhook error: ${err.message}` });
  }

  try {
    // ── checkout.session.completed ────────────────────────────────────────────
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const userId = session.metadata?.userId;

      if (!userId) {
        console.warn("checkout.session.completed missing userId in metadata");
        return res.status(200).json({ received: true });
      }

      // One-time payment sessions may not attach a customer — create one so we
      // always have a stripe_customer_id to store.
      let resolvedCustomerId = session.customer;
      if (!resolvedCustomerId) {
        const details = session.customer_details ?? {};
        const created = await stripe.customers.create({
          email: details.email ?? undefined,
          name: details.name ?? undefined,
          metadata: { userId },
        });
        resolvedCustomerId = created.id;
      }

      await pool.query(
        `UPDATE users
         SET report_credits          = report_credits + 1,
             stripe_customer_id      = $1,
             subscription_updated_at = NOW()
         WHERE id = $2::uuid`,
        [resolvedCustomerId, userId]
      );
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error("Webhook handler error:", err);
    return res.status(500).json({ error: "Webhook handler failed" });
  }
}
