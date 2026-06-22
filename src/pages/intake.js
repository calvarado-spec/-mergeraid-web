import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import FlowHeader from "../components/FlowHeader";
import FlowStepper from "../components/FlowStepper";

export default function Intake() {
  const router = useRouter();
  const [form, setForm] = useState({
    dealName: "",
    clientName: "",
    targetName: "",
    dealType: "asset",
    agreedToTerms: false,
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => {
        if (r.status === 401) {
          router.push("/login?redirect=/intake");
          return null;
        }
        return r.json();
      })
      .then((data) => {
        if (!data) return;
        if (data.user?.subscription_status !== "active") {
          router.push("/pricing");
        }
      })
      .catch(() => router.push("/login?redirect=/intake"))
      .finally(() => setAuthChecked(true));
  }, []);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!form.dealName.trim()) {
      setError("Please enter a deal or project name.");
      return;
    }
    if (!form.clientName.trim() || !form.targetName.trim()) {
      setError("Please fill in all required fields.");
      return;
    }
    if (!form.agreedToTerms) {
      setError("You must agree to the terms to continue.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/deals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }
      router.push(`/questionnaire?dealId=${data.dealId}`);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-blue-400 text-sm">Loading…</p>
      </div>
    );
  }

  const inputClass =
    "w-full border border-blue-200 rounded-lg px-4 py-2 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400";

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <FlowHeader />
      <FlowStepper activeStep={0} />

      <div className="flex flex-col items-center justify-center flex-1 px-4 py-8">
        <div className="w-full max-w-lg">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-blue-700">Start Your Deal</h2>
            <p className="mt-1 text-gray-500 text-sm">
              Enter deal details below to begin the questionnaire.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-white border border-blue-100 rounded-2xl shadow-md p-8 space-y-6"
          >
            <div>
              <label className="block text-sm font-medium text-blue-800 mb-1">
                Deal / Project Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="dealName"
                value={form.dealName}
                onChange={handleChange}
                placeholder="e.g. Project Atlas"
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-blue-800 mb-1">
                Client Firm Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="clientName"
                value={form.clientName}
                onChange={handleChange}
                placeholder="e.g. Apex Capital Partners"
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-blue-800 mb-1">
                Target Company Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="targetName"
                value={form.targetName}
                onChange={handleChange}
                placeholder="e.g. Acme Industries"
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-blue-800 mb-1">
                Deal Type <span className="text-red-500">*</span>
              </label>
              <select
                name="dealType"
                value={form.dealType}
                onChange={handleChange}
                className="w-full border border-blue-200 rounded-lg px-4 py-2 text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="asset">Asset Acquisition</option>
                <option value="equity">Equity Purchase</option>
              </select>
            </div>

            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                name="agreedToTerms"
                id="agreedToTerms"
                checked={form.agreedToTerms}
                onChange={handleChange}
                className="mt-1 h-4 w-4 accent-blue-600"
              />
              <label htmlFor="agreedToTerms" className="text-sm text-gray-600">
                I agree to the{" "}
                <span className="text-blue-600 underline cursor-pointer">Terms of Service</span>{" "}
                and confirm the information provided is accurate.
              </label>
            </div>
            <p className="text-xs text-gray-400">
              MergerAid is a preliminary screening tool only. It does not perform tax due diligence and does
              not constitute tax or legal advice.
            </p>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-2.5 rounded-lg transition-colors"
            >
              {submitting ? "Submitting…" : "Start Deal →"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
