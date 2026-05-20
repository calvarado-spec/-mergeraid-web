import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function PricingPage() {
  const router = useRouter();
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => { if (data?.user) setAuthed(true); })
      .catch(() => {});
  }, []);

  function handleGetStarted() {
    router.push(authed ? "/intake" : "/login?redirect=/intake");
  }

  return (
    <div className="min-h-screen bg-white text-gray-800 flex flex-col">
      <Navbar />
      <main className="flex-1 px-4 py-16 mt-20">
        <h1 className="text-4xl font-bold text-center mb-4 text-blue-700">Pricing Plans</h1>
        <p className="text-center text-gray-500 mb-12 max-w-xl mx-auto">
          Choose the plan that fits your deal volume. All plans include full access to asset and equity diligence flows.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">

          {/* Single Use Plan */}
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
            <button
              onClick={handleGetStarted}
              className="bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800 w-full"
            >
              Get Started
            </button>
          </div>

          {/* Monthly Plan */}
          <div className="border border-gray-200 rounded-2xl shadow p-6 flex flex-col justify-between">
            <div>
              <h2 className="text-2xl font-semibold mb-2">Monthly Access</h2>
              <p className="text-gray-600 mb-4">Unlimited reports and logic access for teams.</p>
              <p className="text-3xl font-bold mb-4">$9,000<span className="text-lg font-medium text-gray-600">/mo</span></p>
              <ul className="text-sm text-gray-700 space-y-2 mb-6">
                <li>✓ Unlimited due diligence reports</li>
                <li>✓ Best for short-term projects</li>
                <li>✓ Ideal for busy deal months</li>
              </ul>
            </div>
            <a href="mailto:sales@mergeraid.com" className="block">
              <button className="bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800 w-full">
                Contact Sales
              </button>
            </a>
          </div>

          {/* Annual Plan */}
          <div className="border-4 border-blue-600 rounded-2xl shadow-lg p-6 flex flex-col justify-between relative bg-blue-50">
            <div>
              <span className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-bl-lg">
                Most Popular
              </span>
              <h2 className="text-2xl font-semibold mb-2">Annual Access</h2>
              <p className="text-gray-700 mb-4">Unlimited access year-round at the best value.</p>
              <p className="text-3xl font-bold mb-4">$70,000<span className="text-lg font-medium text-gray-600">/yr</span></p>
              <ul className="text-sm text-gray-800 space-y-2 mb-6">
                <li>✓ Unlimited access all year</li>
                <li>✓ Priority support &amp; future upgrades</li>
                <li>✓ Early access to new features</li>
              </ul>
            </div>
            <a href="mailto:sales@mergeraid.com" className="block">
              <button className="bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800 w-full">
                Contact Sales
              </button>
            </a>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}
