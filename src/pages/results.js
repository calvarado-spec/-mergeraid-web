import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import FlowHeader from "../components/FlowHeader";
import FlowStepper from "../components/FlowStepper";

const CATEGORIES = [
  "Federal Tax",
  "State Income Tax",
  "Sales & Use Tax",
  "Employment Tax",
  "Property Tax",
  "Unclaimed Property",
];

const SEVERITY_ORDER = { high: 0, moderate: 1, low: 2 };

const BORDER_COLOR = { high: "#ef4444", moderate: "#f59e0b", low: "#3b82f6" };
const BADGE_STYLE = {
  high: "text-red-700 bg-red-100",
  moderate: "text-amber-700 bg-amber-100",
  low: "text-blue-700 bg-blue-100",
};
const SEVERITY_LABEL = { high: "High", moderate: "Moderate", low: "Low" };

function Shell({ children }) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="print:hidden">
        <FlowHeader />
        <FlowStepper activeStep={2} />
      </div>
      {children}
    </div>
  );
}

export default function Results() {
  const router = useRouter();
  const { dealId } = router.query;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!dealId) return;
    fetch(`/api/results?dealId=${dealId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setData(d);
      })
      .catch(() => setError("Failed to load results."))
      .finally(() => setLoading(false));
  }, [dealId]);

  if (loading) {
    return (
      <Shell>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-blue-400 text-sm">Loading report…</p>
        </div>
      </Shell>
    );
  }

  if (error) {
    return (
      <Shell>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-red-500 text-sm">{error}</p>
        </div>
      </Shell>
    );
  }

  const { deal, risks } = data;

  const recommendations = risks.filter((r) => r.severity === "recommendation");
  const activeRisks = risks.filter((r) => r.severity !== "recommendation");

  const sortedActiveRisks = [...activeRisks].sort(
    (a, b) => (SEVERITY_ORDER[a.severity] ?? 3) - (SEVERITY_ORDER[b.severity] ?? 3)
  );

  const highCount     = activeRisks.filter((r) => r.severity === "high").length;
  const moderateCount = activeRisks.filter((r) => r.severity === "moderate").length;
  const lowCount      = activeRisks.filter((r) => r.severity === "low").length;

  const recsByCategory = {};
  for (const rec of recommendations) {
    if (!recsByCategory[rec.category]) recsByCategory[rec.category] = [];
    recsByCategory[rec.category].push(rec);
  }

  const riskCategorySet = new Set(activeRisks.map((r) => r.category));
  const recCategories   = CATEGORIES.filter((c) => recsByCategory[c] && !riskCategorySet.has(c));
  const cleanCategories = CATEGORIES.filter((c) => !riskCategorySet.has(c) && !recsByCategory[c]);

  return (
    <Shell>
      <div className="flex-1 px-4 py-10 print:py-4">
        <div className="w-full max-w-3xl mx-auto">

          {/* Report header */}
          <div className="mb-10 print:mb-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-5">
              <h2 className="text-xl font-semibold text-gray-800">
                Tax Risk Screening Summary
              </h2>
              <a
                href={`/report/${dealId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="print:hidden flex-shrink-0 text-sm text-white bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Download PDF Report
              </a>
            </div>
            <div className="space-y-1 text-sm text-gray-600">
              <p>
                <span className="font-medium text-gray-800">Target Company:</span>{" "}
                {deal.target_name}
              </p>
              <p>
                <span className="font-medium text-gray-800">Client Firm:</span>{" "}
                {deal.client_name}
              </p>
              <p>
                <span className="font-medium text-gray-800">Deal Type:</span>{" "}
                {deal.deal_type === "asset" ? "Asset Acquisition" : "Equity Purchase"}
              </p>
            </div>
            <div className="mt-6 border-t border-blue-100" />
          </div>

          {/* Disclaimer banner */}
          <div className="mb-8 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
            This screening report is based solely on self-reported information and does not constitute tax
            advice, legal advice, or professional due diligence. Engage a qualified tax advisor before making
            any transaction decisions.
          </div>

          {/* All-clean callout */}
          {activeRisks.length === 0 && recommendations.length === 0 && (
            <div className="text-center py-14">
              <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-blue-700 font-semibold text-lg">No risks identified</p>
              <p className="text-gray-400 text-sm mt-1">
                No risk indicators were identified based on the information provided. This is a preliminary
                screening result only and does not constitute a clean bill of health or tax clearance.
              </p>
            </div>
          )}

          {/* Risk cards — flat sorted list */}
          {sortedActiveRisks.length > 0 && (
            <div className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                  Identified Risks
                </h3>
                <p className="text-xs text-gray-500">
                  {highCount > 0 && (
                    <span className="text-red-600 font-semibold">{highCount} High</span>
                  )}
                  {highCount > 0 && (moderateCount > 0 || lowCount > 0) && (
                    <span className="text-gray-300 mx-1.5">·</span>
                  )}
                  {moderateCount > 0 && (
                    <span className="text-amber-600 font-semibold">{moderateCount} Moderate</span>
                  )}
                  {moderateCount > 0 && lowCount > 0 && (
                    <span className="text-gray-300 mx-1.5">·</span>
                  )}
                  {lowCount > 0 && (
                    <span className="text-blue-600 font-semibold">{lowCount} Low</span>
                  )}
                </p>
              </div>
              <div className="space-y-3">
                {sortedActiveRisks.map((risk, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 p-5"
                    style={{ borderLeft: `4px solid ${BORDER_COLOR[risk.severity] || "#3b82f6"}` }}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <p className="text-xs text-gray-400 mb-0.5">{risk.category}</p>
                        <p className="font-semibold text-gray-800 text-sm">{risk.title}</p>
                      </div>
                      <span className={`flex-shrink-0 inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full ${BADGE_STYLE[risk.severity] || BADGE_STYLE.low}`}>
                        {SEVERITY_LABEL[risk.severity] || risk.severity}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 leading-relaxed">{risk.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Exposure callout */}
          {activeRisks.length > 0 && (
            <p className="text-sm text-blue-600 mt-6 mb-2">
              See the full PDF report for estimated dollar exposure ranges.
            </p>
          )}

          {/* Recommendations section */}
          {recCategories.length > 0 && (
            <div className="mb-10 mt-10">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
                Recommendations
              </h3>
              <div className="space-y-3">
                {recCategories.flatMap((category) =>
                  recsByCategory[category].map((rec, i) => (
                    <div key={`${category}-rec-${i}`} className="border border-gray-200 rounded-xl p-5 bg-gray-50">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <p className="text-xs text-gray-400 mb-0.5">{category}</p>
                          <p className="font-semibold text-gray-700 text-sm">{rec.title}</p>
                        </div>
                        <span className="flex-shrink-0 inline-block text-xs font-semibold text-gray-600 bg-gray-200 px-2.5 py-0.5 rounded-full">
                          Recommendation
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm leading-relaxed">{rec.text}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Clean categories */}
          {cleanCategories.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
                No Risks Identified
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {cleanCategories.map((category) => (
                  <div
                    key={category}
                    className="border border-blue-100 rounded-xl p-4 bg-blue-50 flex items-center gap-2"
                  >
                    <svg
                      className="w-4 h-4 text-blue-500 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm text-blue-700 font-medium">{category}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </Shell>
  );
}
