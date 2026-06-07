import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const PLANS = {
  single:  { label: "Single Use",      price: "$2,500" },
  monthly: { label: "Monthly Access",  price: "$9,000/mo" },
  annual:  { label: "Annual Access",   price: "$70,000/yr" },
};

const EMPTY_FORM = { firstName: "", lastName: "", firmName: "", email: "" };

export default function PricingPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [error, setError] = useState("");

  const [invoiceModal, setInvoiceModal] = useState(null); // plan key or null
  const [invoiceForm, setInvoiceForm] = useState(EMPTY_FORM);
  const [invoiceSubmitting, setInvoiceSubmitting] = useState(false);
  const [invoiceError, setInvoiceError] = useState("");
  const [invoiceSuccess, setInvoiceSuccess] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => { if (data?.user) setUser(data.user); })
      .catch(() => {});
  }, []);

  function openInvoiceModal(planKey) {
    setInvoiceModal(planKey);
    setInvoiceForm(EMPTY_FORM);
    setInvoiceError("");
    setInvoiceSuccess(false);
  }

  function closeInvoiceModal() {
    setInvoiceModal(null);
    setInvoiceError("");
    setInvoiceSuccess(false);
  }

  async function handleInvoiceSubmit(e) {
    e.preventDefault();
    setInvoiceError("");
    setInvoiceSubmitting(true);
    try {
      const res = await fetch("/api/request-invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...invoiceForm, plan: invoiceModal }),
      });
      const data = await res.json();
      if (!res.ok) {
        setInvoiceError(data.error || "Something went wrong. Please try again.");
        return;
      }
      setInvoiceSuccess(true);
    } catch {
      setInvoiceError("Network error. Please try again.");
    } finally {
      setInvoiceSubmitting(false);
    }
  }

  async function handleCheckout(priceId, planKey) {
    setError("");
    if (!user) {
      router.push("/login?redirect=/pricing");
      return;
    }
    setLoadingPlan(planKey);
    try {
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId, userId: user.id, email: user.email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoadingPlan(null);
    }
  }

  const inputClass =
    "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400";

  return (
    <div className="min-h-screen bg-white text-gray-800 flex flex-col">
      <Navbar />
      <main className="flex-1 px-4 py-16 mt-20">
        <h1 className="text-4xl font-bold text-center mb-4 text-blue-700">Pricing Plans</h1>
        <p className="text-center text-gray-500 mb-12 max-w-xl mx-auto">
          Choose the plan that fits your deal volume. All plans include full access to asset and equity diligence flows.
        </p>

        {error && (
          <p className="text-center text-red-600 text-sm mb-8">{error}</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">

          {/* Single Use */}
          <div className="border border-gray-200 rounded-2xl shadow p-6 flex flex-col justify-between">
            <div>
              <h2 className="text-2xl font-semibold mb-2">Single Use</h2>
              <p className="text-gray-600 mb-4">Perfect for one-time due diligence reports.</p>
              <p className="text-3xl font-bold mb-4">$2,500</p>
              <ul className="text-sm text-gray-700 space-y-2 mb-6">
                <li>✓ One report per purchase</li>
                <li>✓ Limited to 1 every 3 months per company</li>
                <li>✓ Great for testing the platform</li>
              </ul>
            </div>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => handleCheckout(process.env.NEXT_PUBLIC_STRIPE_PRICE_SINGLE, "single")}
                disabled={loadingPlan === "single"}
                className="bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800 w-full disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                {loadingPlan === "single" ? "Redirecting…" : "Get Started"}
              </button>
              <button
                onClick={() => openInvoiceModal("single")}
                className="w-full border border-blue-600 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-50 text-sm font-medium transition-colors"
              >
                Request Invoice
              </button>
            </div>
          </div>

          {/* Monthly */}
          <div className="border border-gray-200 rounded-2xl shadow p-6 flex flex-col justify-between">
            <div>
              <h2 className="text-2xl font-semibold mb-2">Monthly Access</h2>
              <p className="text-gray-600 mb-4">Unlimited reports and logic access for teams.</p>
              <p className="text-3xl font-bold mb-4">
                $9,000<span className="text-lg font-medium text-gray-600">/mo</span>
              </p>
              <ul className="text-sm text-gray-700 space-y-2 mb-6">
                <li>✓ Unlimited due diligence reports</li>
                <li>✓ Best for short-term projects</li>
                <li>✓ Ideal for busy deal months</li>
              </ul>
            </div>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => handleCheckout(process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY, "monthly")}
                disabled={loadingPlan === "monthly"}
                className="bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800 w-full disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                {loadingPlan === "monthly" ? "Redirecting…" : "Get Started"}
              </button>
              <button
                onClick={() => openInvoiceModal("monthly")}
                className="w-full border border-blue-600 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-50 text-sm font-medium transition-colors"
              >
                Request Invoice
              </button>
            </div>
          </div>

          {/* Annual */}
          <div className="border-4 border-blue-600 rounded-2xl shadow-lg p-6 flex flex-col justify-between relative bg-blue-50">
            <div>
              <span className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-bl-lg">
                Most Popular
              </span>
              <h2 className="text-2xl font-semibold mb-2">Annual Access</h2>
              <p className="text-gray-700 mb-4">Unlimited access year-round at the best value.</p>
              <p className="text-3xl font-bold mb-4">
                $70,000<span className="text-lg font-medium text-gray-600">/yr</span>
              </p>
              <ul className="text-sm text-gray-800 space-y-2 mb-6">
                <li>✓ Unlimited access all year</li>
                <li>✓ Priority support &amp; future upgrades</li>
                <li>✓ Early access to new features</li>
              </ul>
            </div>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => handleCheckout(process.env.NEXT_PUBLIC_STRIPE_PRICE_ANNUAL, "annual")}
                disabled={loadingPlan === "annual"}
                className="bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800 w-full disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                {loadingPlan === "annual" ? "Redirecting…" : "Get Started"}
              </button>
              <button
                onClick={() => openInvoiceModal("annual")}
                className="w-full border border-blue-700 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-100 text-sm font-medium transition-colors"
              >
                Request Invoice
              </button>
            </div>
          </div>

        </div>
      </main>
      <Footer />

      {/* Invoice Request Modal */}
      {invoiceModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={(e) => { if (e.target === e.currentTarget) closeInvoiceModal(); }}
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
            {invoiceSuccess ? (
              <div className="text-center py-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Request Received</h3>
                <p className="text-sm text-gray-500 mb-6">
                  We&apos;ll send your invoice to <span className="font-medium text-gray-700">{invoiceForm.email}</span> shortly.
                </p>
                <button
                  onClick={closeInvoiceModal}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors"
                >
                  Done
                </button>
              </div>
            ) : (
              <>
                <h3 className="text-xl font-semibold text-gray-800 mb-1">Request Invoice</h3>
                <p className="text-sm text-gray-500 mb-6">
                  We&apos;ll send a formal invoice to your email within one business day.
                </p>
                <form onSubmit={handleInvoiceSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">First Name</label>
                      <input
                        type="text"
                        required
                        value={invoiceForm.firstName}
                        onChange={(e) => setInvoiceForm((f) => ({ ...f, firstName: e.target.value }))}
                        className={inputClass}
                        placeholder="Jane"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Last Name</label>
                      <input
                        type="text"
                        required
                        value={invoiceForm.lastName}
                        onChange={(e) => setInvoiceForm((f) => ({ ...f, lastName: e.target.value }))}
                        className={inputClass}
                        placeholder="Smith"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Firm Name</label>
                    <input
                      type="text"
                      required
                      value={invoiceForm.firmName}
                      onChange={(e) => setInvoiceForm((f) => ({ ...f, firmName: e.target.value }))}
                      className={inputClass}
                      placeholder="Acme Capital LLC"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                    <input
                      type="email"
                      required
                      value={invoiceForm.email}
                      onChange={(e) => setInvoiceForm((f) => ({ ...f, email: e.target.value }))}
                      className={inputClass}
                      placeholder="jane@acmecapital.com"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Plan</label>
                    <select
                      value={invoiceModal}
                      onChange={(e) => setInvoiceModal(e.target.value)}
                      className={inputClass}
                    >
                      {Object.entries(PLANS).map(([key, { label, price }]) => (
                        <option key={key} value={key}>
                          {label} — {price}
                        </option>
                      ))}
                    </select>
                  </div>

                  {invoiceError && (
                    <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
                      {invoiceError}
                    </p>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={closeInvoiceModal}
                      className="flex-1 border border-gray-300 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={invoiceSubmitting}
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-sm font-medium transition-colors"
                    >
                      {invoiceSubmitting ? "Sending…" : "Submit Request"}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
