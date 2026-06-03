// Stripe webhook handler
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

function getPlanType(priceId) {
  if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_SINGLE) return "single";
  if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY) return "monthly";
  if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_ANNUAL) return "annual";
  return null;
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
    // Fired when a Stripe Checkout session finishes (both one-time and subscription)
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const customerId = session.customer;
      const userId = session.metadata?.userId;

      if (!userId) {
        console.warn("checkout.session.completed missing userId in metadata");
        return res.status(200).json({ received: true });
      }

      // Expand line items to resolve the price ID
      const full = await stripe.checkout.sessions.retrieve(session.id, {
        expand: ["line_items"],
      });
      const priceId = full.line_items?.data[0]?.price?.id ?? null;
      const planType = getPlanType(priceId);

      await pool.query(
        `UPDATE users
         SET subscription_status    = 'active',
             plan_type              = $1,
             stripe_customer_id     = $2,
             subscription_updated_at = NOW()
         WHERE id = $3::uuid`,
        [planType, customerId, userId]
      );
    }

    // ── customer.subscription.deleted ─────────────────────────────────────────
    // Fired when a subscription is cancelled or expires
    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object;
      const customerId = subscription.customer;

      await pool.query(
        `UPDATE users
         SET subscription_status    = 'inactive',
             plan_type              = NULL,
             subscription_updated_at = NOW()
         WHERE stripe_customer_id = $1`,
        [customerId]
      );
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error("Webhook handler error:", err);
    return res.status(500).json({ error: "Webhook handler failed" });
  }
}
