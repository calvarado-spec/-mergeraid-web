import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function PricingPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => { if (data?.user) setUser(data.user); })
      .catch(() => {});
  }, []);

  async function handleCheckout() {
    setError("");
    if (!user) {
      router.push("/login?redirect=/pricing");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, email: user.email }),
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
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white text-gray-800 flex flex-col">
      <Navbar />
      <main className="flex-1 px-4 py-16 mt-20">
        <h1 className="text-4xl font-bold text-center mb-4 text-blue-700">Pricing</h1>
        <p className="text-center text-gray-500 mb-12 max-w-xl mx-auto">
          One flat price per report. No subscriptions, no seats.
        </p>

        {error && (
          <p className="text-center text-red-600 text-sm mb-8">{error}</p>
        )}

        <div className="flex justify-center">
          <div className="border-2 border-blue-600 rounded-2xl shadow-lg p-8 max-w-md w-full bg-blue-50">
            <h2 className="text-2xl font-semibold mb-2 text-blue-900">Tax Risk Screening Report</h2>
            <p className="text-3xl font-bold mb-5 text-blue-900">$2,500</p>
            <p className="text-gray-700 mb-6">
              One complete tax risk screening covering federal, state, employment,
              property, and unclaimed property tax risk, with a downloadable PDF
              report including estimated exposure ranges.
            </p>
            <ul className="text-sm text-gray-700 space-y-2 mb-8">
              <li>✓ Federal income tax risk assessment</li>
              <li>✓ State income &amp; sales tax nexus analysis</li>
              <li>✓ Employment tax &amp; contractor classification review</li>
              <li>✓ Unclaimed property risk flag</li>
              <li>✓ Estimated tax exposure ranges</li>
              <li>✓ Downloadable PDF report</li>
            </ul>
            <button
              onClick={handleCheckout}
              disabled={loading}
              className="bg-blue-700 text-white px-4 py-3 rounded-lg hover:bg-blue-800 w-full disabled:opacity-60 disabled:cursor-not-allowed transition-colors font-semibold text-base"
            >
              {loading ? "Redirecting…" : "Get Started"}
            </button>
          </div>
        </div>

        <p className="text-center text-gray-500 text-sm mt-10">
          Need unlimited access for your team?{" "}
          <a href="mailto:sales@mergeraid.com" className="text-blue-600 hover:underline">
            Contact us at sales@mergeraid.com
          </a>{" "}
          for enterprise pricing.
        </p>
      </main>
      <Footer />
    </div>
  );
}
