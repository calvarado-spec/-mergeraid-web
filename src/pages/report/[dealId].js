import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { calculateExposures } from "../../lib/exposureEngine";

// ─── Static metadata per risk category ───────────────────────────────────────

const CATEGORY_META = {
  "Federal Tax": {
    general:
      "Federal income tax compliance involves adherence to U.S. Internal Revenue Code requirements, including accurate reporting of income, deductions, and credits, and timely filing of all applicable returns. In the context of an acquisition, federal tax risk encompasses exposure from open audit years, pending examinations, uncertain tax positions, and entity-level elections and qualifications.",
    recommendation:
      "Recommend obtaining copies of federal income tax returns for the prior three to five years, all IRS correspondence, and audit reports. Obtain representations from the target regarding open tax years and any potential adjustments. Recommend tax representation and indemnification provisions in the purchase agreement for material exposures identified herein. For larger transactions, representations and warranties insurance may provide additional protection.",
  },
  "State Income Tax": {
    general:
      "State income tax obligations are triggered by nexus, which may arise from physical presence, economic activity, or factor-based standards depending on the jurisdiction. Following South Dakota v. Wayfair and subsequent state adoption of economic nexus thresholds, companies may have filing obligations in states where they have never maintained a physical presence.",
    recommendation:
      "Recommend a comprehensive nexus study covering all states where the target has sales activity, employees, or property. Obtain copies of state income and franchise tax returns. Assess voluntary disclosure opportunities in states where the target has nexus but has not filed returns, prior to closing.",
  },
  "Sales & Use Tax": {
    general:
      "Sales and use tax compliance requires registration and remittance in states where the company has established economic or physical nexus. Post-Wayfair, most states impose economic nexus thresholds, typically $100,000 in annual sales or 200 transactions. Proper documentation of exemption certificates and accrual of use tax on taxable purchases are critical audit risk areas.",
    recommendation:
      "Recommend a sales tax nexus study, thorough review of exemption certificate documentation, and assessment of use tax accrual practices on purchases. Identify states where voluntary disclosure programs may be utilized to reduce pre-closing exposure.",
  },
  "Employment Tax": {
    general:
      "Employment tax obligations include federal and state payroll taxes, unemployment insurance contributions, and proper classification of workers as employees or independent contractors. Multi-state operations create additional complexity regarding withholding and employer-side obligations in each state where employees are based.",
    recommendation:
      "Recommend a review of worker classification policies and documentation supporting independent contractor status, payroll tax filings in all applicable states, and any prior employment tax examinations. Quantify potential exposure for reclassification of independent contractors and obtain representations from the target.",
  },
  "Property Tax": {
    general:
      "Property tax obligations arise in states and localities where the target owns or leases tangible personal or real property. Many jurisdictions require annual filings of personal property schedules, and failure to file may result in estimated assessments, penalties, and interest. Companies with multi-state operations must maintain compliance across each applicable jurisdiction.",
    recommendation:
      "Recommend identification of all states and localities where the target has reportable property, confirmation of current filing status, and review of applicable assessment notices and appeal history. Assess whether voluntary disclosure opportunities exist for non-filing jurisdictions.",
  },
  "Unclaimed Property": {
    general:
      "Unclaimed property (escheat) laws require businesses to report and remit to the applicable state dormant financial obligations, including uncashed checks, unused gift card balances, security deposits, and other unclaimed funds. Most states impose a dormancy period of three to five years, after which property must be reported and remitted.",
    recommendation:
      "Recommend an unclaimed property liability analysis covering the prior ten years, identification of all jurisdictions in which the target has reporting obligations, and consideration of voluntary disclosure programs to minimize penalties and interest. Obtain representations from the target regarding prior unclaimed property filings and any known liabilities.",
  },
};

const CATEGORIES_ORDER = [
  "Federal Tax",
  "State Income Tax",
  "Sales & Use Tax",
  "Employment Tax",
  "Property Tax",
  "Unclaimed Property",
];

function fmtExp(n) {
  return "$" + Math.round(n).toLocaleString("en-US");
}

function severityBadge(severity) {
  const map = {
    high: { cls: "badge-high", label: "High" },
    moderate: { cls: "badge-moderate", label: "Moderate" },
    low: { cls: "badge-low", label: "Low" },
    recommendation: { cls: "badge-recommendation", label: "Recommendation" },
  };
  const s = map[severity] || map.moderate;
  return <span className={s.cls}>{s.label}</span>;
}

function fmtCurrency(n) {
  if (n == null) return "—";
  return Number(n).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

// ─── Print + screen styles ────────────────────────────────────────────────────

const STYLES = `
  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: Arial, Helvetica, sans-serif;
    font-size: 10.5pt;
    color: #1a1a1a;
    line-height: 1.65;
    background: #cacaca;
  }

  h1, h2, h3 { font-family: Georgia, "Times New Roman", serif; color: #1e3a5f; }

  .report-wrapper {
    max-width: 9.2in;
    margin: 0 auto;
    padding: 66px 0 48px;
  }

  .report-section {
    background: #fff;
    width: 8.5in;
    margin: 0 auto 28px;
    padding: 1in;
    box-shadow: 0 2px 18px rgba(0,0,0,0.18);
  }

  .cover-section {
    display: flex;
    flex-direction: column;
    min-height: 11in;
  }

  /* ── Cover ─────────────────────────────────────────────── */
  .cover-confidential {
    text-align: right;
    font-size: 7.5pt;
    color: #999;
    letter-spacing: 0.09em;
    text-transform: uppercase;
    margin-bottom: 2in;
  }
  .cover-rule {
    border: none;
    border-top: 2.5px solid #1e3a5f;
    margin: 18px 0;
  }
  .cover-title {
    font-size: 28pt;
    font-weight: bold;
    color: #1e3a5f;
    line-height: 1.15;
    margin-bottom: 10px;
  }
  .cover-subtitle {
    font-size: 12pt;
    color: #555;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin-bottom: 28px;
  }
  .cover-meta { font-size: 10pt; color: #444; line-height: 2.2; }
  .cover-spacer { flex: 1; min-height: 0.5in; }
  .cover-footer {
    border-top: 1px solid #c0cfe0;
    padding-top: 18px;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
  }
  .cover-brand-name {
    font-family: Georgia, serif;
    font-size: 17pt;
    font-weight: bold;
    color: #1e3a5f;
  }
  .cover-brand-tagline { font-size: 8pt; color: #999; margin-top: 3px; }
  .cover-footer-note {
    font-size: 7.5pt;
    color: #bbb;
    text-align: right;
    max-width: 3.5in;
    line-height: 1.5;
  }

  /* ── Section chrome ────────────────────────────────────── */
  .section-heading {
    font-size: 18pt;
    border-bottom: 2px solid #1e3a5f;
    padding-bottom: 8px;
    margin-bottom: 22px;
  }
  .sub-heading {
    font-size: 11pt;
    font-weight: bold;
    color: #1e3a5f;
    margin: 22px 0 6px;
  }
  .salutation { font-size: 10.5pt; color: #333; margin-bottom: 6px; }
  .body-para { color: #333; margin-bottom: 14px; }
  .italic-para { font-style: italic; color: #444; }

  /* ── Tables ─────────────────────────────────────────────── */
  .data-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 9.5pt;
    margin-bottom: 24px;
  }
  .th {
    background: #1e3a5f;
    color: #fff;
    padding: 9px 12px;
    text-align: left;
    font-family: Georgia, serif;
    font-weight: bold;
  }
  .td {
    padding: 8px 12px;
    border-bottom: 1px solid #e4e4e4;
    vertical-align: top;
    color: #333;
  }
  .td-clean {
    padding: 8px 12px;
    border-bottom: 1px solid #e4e4e4;
    vertical-align: top;
    color: #555;
  }
  tr:nth-child(even) .td { background: #f7f8fa; }
  tr:nth-child(even) .td-clean { background: #f2faf2; }

  .badge-risk {
    display: inline-block;
    background: #fef3e2;
    color: #c47a2a;
    border: 1px solid #f0c07a;
    font-size: 8.5pt;
    font-weight: bold;
    padding: 2px 10px;
    border-radius: 4px;
    white-space: nowrap;
  }
  .badge-high {
    display: inline-block;
    background: #fde8e8;
    color: #b91c1c;
    border: 1px solid #f5a5a5;
    font-size: 8.5pt;
    font-weight: bold;
    padding: 2px 10px;
    border-radius: 4px;
    white-space: nowrap;
  }
  .badge-moderate {
    display: inline-block;
    background: #fef3e2;
    color: #c47a2a;
    border: 1px solid #f0c07a;
    font-size: 8.5pt;
    font-weight: bold;
    padding: 2px 10px;
    border-radius: 4px;
    white-space: nowrap;
  }
  .badge-low {
    display: inline-block;
    background: #dbeafe;
    color: #1d4ed8;
    border: 1px solid #93c5fd;
    font-size: 8.5pt;
    font-weight: bold;
    padding: 2px 10px;
    border-radius: 4px;
    white-space: nowrap;
  }
  .badge-recommendation {
    display: inline-block;
    background: #f3f4f6;
    color: #6b7280;
    border: 1px solid #d1d5db;
    font-size: 8.5pt;
    font-weight: bold;
    padding: 2px 10px;
    border-radius: 4px;
    white-space: nowrap;
  }
  .badge-clean {
    display: inline-block;
    background: #e8f5e9;
    color: #2e7d32;
    border: 1px solid #a5d6a7;
    font-size: 8.5pt;
    font-weight: bold;
    padding: 2px 10px;
    border-radius: 4px;
    white-space: nowrap;
  }

  /* ── Exposure summary ───────────────────────────────────── */
  .exposure-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 9.5pt;
    margin-bottom: 16px;
  }
  .exposure-th { background: #1e3a5f; color: #fff; padding: 9px 12px; text-align: left; font-family: Georgia, serif; font-weight: bold; }
  .exposure-th-right { background: #1e3a5f; color: #fff; padding: 9px 12px; text-align: right; font-family: Georgia, serif; font-weight: bold; }
  .exposure-td { padding: 8px 12px; border-bottom: 1px solid #e4e4e4; vertical-align: top; color: #333; }
  .exposure-td-desc { padding: 8px 12px; border-bottom: 1px solid #e4e4e4; color: #555; font-size: 8.5pt; }
  .exposure-td-right { padding: 8px 12px; border-bottom: 1px solid #e4e4e4; text-align: right; color: #333; white-space: nowrap; }
  .exposure-total { font-weight: bold; color: #1e3a5f; background: #eef2f7; }
  .exposure-disclaimer { font-size: 7.5pt; color: #999; line-height: 1.55; font-style: italic; border-top: 1px solid #e4e4e4; padding-top: 10px; margin-top: 4px; }

  /* ── Detailed findings ──────────────────────────────────── */
  .section-block {
    margin-bottom: 32px;
    page-break-inside: avoid;
    break-inside: avoid;
  }
  .cat-heading {
    font-size: 13pt;
    color: #1e3a5f;
    border-bottom: 1px solid #bfcfdf;
    padding-bottom: 5px;
    margin-bottom: 12px;
    page-break-after: avoid;
    break-after: avoid;
  }
  .label-bold {
    font-weight: bold;
    color: #1e3a5f;
    font-size: 9.5pt;
    margin: 13px 0 3px;
  }
  .finding-item { color: #333; margin-bottom: 8px; padding-left: 14px; }
  .finding-num { font-weight: bold; margin-right: 4px; }
  .clean-section-heading {
    font-family: Georgia, serif;
    font-size: 13pt;
    color: #2e7d32;
    margin: 28px 0 12px;
  }

  /* ── Print ──────────────────────────────────────────────── */
  @media screen and (max-width: 640px) {
    body { background: #f0f4f8; }

    .report-wrapper { padding: 64px 0 24px; }

    .report-section {
      width: 100%;
      padding: 20px 16px;
      margin-bottom: 16px;
    }

    .cover-section { min-height: auto; }
    .cover-confidential { margin-bottom: 24px; }
    .cover-title { font-size: 18pt; }
    .cover-subtitle { font-size: 10pt; }
    .cover-footer { flex-direction: column; gap: 12px; }
    .cover-footer-note { text-align: left; max-width: 100%; }

    .data-table { font-size: 8.5pt; }
    .th, .td, .td-clean { padding: 6px 8px; }
  }

  @media print {
    .no-print { display: none !important; }

    body { background: #fff; }

    .report-wrapper { max-width: none; padding: 0; }

    .report-section {
      width: auto;
      margin: 0;
      padding: 0;
      box-shadow: none;
      page-break-after: always;
      break-after: page;
    }
    .report-section:last-child {
      page-break-after: avoid;
      break-after: avoid;
    }

    .cover-section { min-height: 9in; }

    @page { size: letter; margin: 1in; }

    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
  }
`;

// ─── Component ────────────────────────────────────────────────────────────────

export default function ReportPage() {
  const router = useRouter();
  const { dealId } = router.query;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!dealId) return;
    fetch(`/api/report?dealId=${dealId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setData(d);
      })
      .catch(() => setError("Failed to load report data."))
      .finally(() => setLoading(false));
  }, [dealId]);

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", fontFamily: "Arial, sans-serif", color: "#888", fontSize: "14px" }}>
        Loading report…
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", fontFamily: "Arial, sans-serif", color: "#cc3333", fontSize: "14px" }}>
        {error}
      </div>
    );
  }

  const { deal, risks, answers, stateSales, incomeTaxSales } = data;
  const exposures = calculateExposures(answers || [], stateSales || [], incomeTaxSales || []);

  const recommendations = risks.filter((r) => r.severity === "recommendation");
  const activeRisks = risks.filter((r) => r.severity !== "recommendation");

  const risksByCategory = {};
  for (const risk of activeRisks) {
    if (!risksByCategory[risk.category]) risksByCategory[risk.category] = [];
    risksByCategory[risk.category].push(risk);
  }

  const recsByCategory = {};
  for (const rec of recommendations) {
    if (!recsByCategory[rec.category]) recsByCategory[rec.category] = [];
    recsByCategory[rec.category].push(rec);
  }

  const riskyCategories = CATEGORIES_ORDER.filter((c) => risksByCategory[c]);
  const recCategories = CATEGORIES_ORDER.filter((c) => recsByCategory[c] && !risksByCategory[c]);
  const cleanCategories = CATEGORIES_ORDER.filter((c) => !risksByCategory[c] && !recsByCategory[c]);

  const dealTitle = deal.deal_name || deal.target_name;
  const dealTypeLabel = deal.deal_type === "asset" ? "Asset Acquisition" : "Equity Purchase";
  const generatedDate = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <>
      <Head>
        <title>{`MergerAid Report — ${dealTitle}`}</title>
        <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      </Head>

      {/* ── Fixed print bar (hidden when printing) ── */}
      <div
        className="no-print"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: "54px",
          background: "#1e3a5f",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 16px",
          zIndex: 100,
          boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
        }}
      >
        <span style={{ fontFamily: "Georgia, serif", color: "#fff", fontSize: "15pt", fontWeight: "bold" }}>
          MergerAid
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <span style={{ color: "#a0b4cc", fontSize: "10pt", fontFamily: "Arial, sans-serif" }}>
            {dealTitle}
          </span>
          <button
            onClick={() => window.print()}
            style={{
              background: "#fff",
              color: "#1e3a5f",
              border: "none",
              padding: "7px 20px",
              borderRadius: "5px",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "13px",
              fontFamily: "Arial, sans-serif",
            }}
          >
            Print / Save as PDF
          </button>
        </div>
      </div>

      {/* ── Report content ── */}
      <div className="report-wrapper">

        {/* PAGE 1 — COVER */}
        <div className="report-section cover-section">
          <p className="cover-confidential">Strictly Privileged &amp; Confidential</p>

          <hr className="cover-rule" />
          <h1 className="cover-title">{dealTitle}</h1>
          <p className="cover-subtitle">Tax Risk Screening Report</p>
          <hr className="cover-rule" />

          <div className="cover-meta">
            <p><strong>Target Company:</strong>&nbsp; {deal.target_name}</p>
            <p><strong>Prepared for:</strong>&nbsp; {deal.client_name}</p>
            <p><strong>Transaction Type:</strong>&nbsp; {dealTypeLabel}</p>
            <p><strong>Date Generated:</strong>&nbsp; {generatedDate}</p>
          </div>

          <div className="cover-spacer" />

          <div className="cover-footer">
            <div>
              <div className="cover-brand-name">MergerAid</div>
              <div className="cover-brand-tagline">Tax Risk Screening Platform</div>
            </div>
            <div className="cover-footer-note">
              This report is generated by MergerAid and is intended
              for internal use only. Not for third-party distribution
              without appropriate legal review.
            </div>
          </div>
        </div>

        {/* PAGE 2 — SCOPE & DISCLAIMER */}
        <div className="report-section">
          <h2 className="section-heading">Scope &amp; Disclaimer</h2>
          <p className="salutation">To Whom It May Concern,</p>

          <p className="sub-heading">Nature of Services</p>
          <p className="body-para">
            This screening was generated by MergerAid in connection with
            the proposed acquisition of {deal.target_name} by {deal.client_name}. This screening is
            based solely on representations provided by the user and does not reflect a review of tax
            returns, financial statements, workpapers, or supporting documentation. The screening
            was limited to a structured questionnaire covering key federal, state, sales and
            use tax, employment tax, property tax, and unclaimed property risk areas.
          </p>

          <p className="sub-heading">Limitations</p>
          <p className="body-para">
            This report does not constitute legal or tax advice, a tax opinion, an audit, a review, or
            any other form of professional assurance. MergerAid makes no representations or warranties
            regarding the accuracy or completeness of the information provided. Results are based solely
            on user-provided representations and should be considered preliminary and directional. For
            material transactions, MergerAid recommends engaging qualified tax counsel to conduct a full
            due diligence review of the areas identified herein.
          </p>

          <p className="sub-heading">Use of Report</p>
          <p className="body-para">
            This report is intended for the internal use of the client identified above and should not
            be distributed to third parties without appropriate legal review. MergerAid bears no
            liability for decisions made in reliance on this screening report.
          </p>
        </div>

        {/* PAGE 3 — RISK SUMMARY */}
        <div className="report-section">
          <h2 className="section-heading">Risk Summary</h2>

          {activeRisks.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th className="th" style={{ width: "20%" }}>Risk Area</th>
                  <th className="th" style={{ width: "16%" }}>Risk Level</th>
                  <th className="th">Finding</th>
                </tr>
              </thead>
              <tbody>
                {activeRisks.map((r, i) => (
                  <tr key={i}>
                    <td className="td">{r.category}</td>
                    <td className="td">{severityBadge(r.severity)}</td>
                    <td className="td">{r.text}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="body-para" style={{ color: "#2e7d32", fontWeight: "bold" }}>
              No elevated risks were identified based on the information provided.
            </p>
          )}

          {recommendations.length > 0 && (
            <>
              <h3 className="clean-section-heading" style={{ color: "#555" }}>Recommendations</h3>
              <table className="data-table">
                <thead>
                  <tr>
                    <th className="th" style={{ width: "20%" }}>Area</th>
                    <th className="th" style={{ width: "16%" }}>Type</th>
                    <th className="th">Recommendation</th>
                  </tr>
                </thead>
                <tbody>
                  {recommendations.map((r, i) => (
                    <tr key={i}>
                      <td className="td">{r.category}</td>
                      <td className="td">{severityBadge(r.severity)}</td>
                      <td className="td">{r.text}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          {cleanCategories.length > 0 && (
            <>
              <h3 className="clean-section-heading">Areas with No Issues Identified</h3>
              <table className="data-table">
                <thead>
                  <tr>
                    <th className="th" style={{ width: "20%" }}>Risk Area</th>
                    <th className="th" style={{ width: "22%" }}>Status</th>
                    <th className="th">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {cleanCategories.map((c, i) => (
                    <tr key={i}>
                      <td className="td-clean">{c}</td>
                      <td className="td-clean"><span className="badge-clean">No Issues Identified</span></td>
                      <td className="td-clean">No risk indicators were identified in this category based on information provided. This does not constitute a finding of compliance or tax clearance.</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>

        {/* EXPOSURE SUMMARY */}
        {exposures.length > 0 && (() => {
          const totalLow = exposures.reduce((s, e) => s + e.lowEstimate, 0);
          const totalHigh = exposures.reduce((s, e) => s + e.highEstimate, 0);
          return (
            <div className="report-section">
              <h2 className="section-heading">Estimated Tax Exposure Summary</h2>
              <table className="exposure-table">
                <thead>
                  <tr>
                    <th className="exposure-th" style={{ width: "22%" }}>Risk Category</th>
                    <th className="exposure-th">Description</th>
                    <th className="exposure-th-right" style={{ width: "14%" }}>Low Estimate</th>
                    <th className="exposure-th-right" style={{ width: "14%" }}>High Estimate</th>
                  </tr>
                </thead>
                <tbody>
                  {exposures.map((e, i) => (
                    <tr key={i}>
                      <td className="exposure-td">{e.category}</td>
                      <td className="exposure-td-desc">{e.description}</td>
                      <td className="exposure-td-right">{fmtExp(e.lowEstimate)}</td>
                      <td className="exposure-td-right">{fmtExp(e.highEstimate)}</td>
                    </tr>
                  ))}
                  <tr className="exposure-total">
                    <td className="exposure-td" colSpan={2} style={{ fontWeight: "bold", color: "#1e3a5f" }}>Total Estimated Exposure</td>
                    <td className="exposure-td-right" style={{ fontWeight: "bold", color: "#1e3a5f" }}>{fmtExp(totalLow)}</td>
                    <td className="exposure-td-right" style={{ fontWeight: "bold", color: "#1e3a5f" }}>{fmtExp(totalHigh)}</td>
                  </tr>
                </tbody>
              </table>
              <p className="exposure-disclaimer">
                Exposure estimates are based on information provided through the MergerAid screening
                questionnaire and are intended solely for due diligence planning purposes. These
                estimates do not constitute tax advice and may not reflect all applicable taxes,
                penalties, or interest. Consult a qualified tax advisor before making any decisions
                based on these figures.
              </p>
            </div>
          );
        })()}

        {/* PAGE 4+ — DETAILED FINDINGS */}
        {(riskyCategories.length > 0 || recCategories.length > 0) && (
          <div className="report-section">
            <h2 className="section-heading">Detailed Findings</h2>

            {riskyCategories.map((cat) => {
              const meta = CATEGORY_META[cat];
              return (
                <div key={cat} className="section-block">
                  <h3 className="cat-heading">{cat}</h3>

                  <p className="label-bold">General</p>
                  <p className="body-para">{meta.general}</p>

                  <p className="label-bold">Finding</p>
                  {risksByCategory[cat].map((risk, i) => (
                    <p key={i} className="finding-item">
                      <span className="finding-num">{i + 1}.</span>{" "}{risk.text}
                    </p>
                  ))}

                  <p className="label-bold">Recommendation</p>
                  <p className="body-para italic-para">{meta.recommendation}</p>
                </div>
              );
            })}

            {recCategories.map((cat) => {
              const meta = CATEGORY_META[cat];
              return (
                <div key={`rec-${cat}`} className="section-block">
                  <h3 className="cat-heading">{cat}</h3>

                  <p className="label-bold">General</p>
                  <p className="body-para">{meta.general}</p>

                  <p className="label-bold">Recommendation</p>
                  {recsByCategory[cat].map((rec, i) => (
                    <p key={i} className="finding-item">
                      <span className="finding-num">{i + 1}.</span>{" "}{rec.text}
                    </p>
                  ))}
                </div>
              );
            })}
          </div>
        )}

        {/* APPENDIX — STATE SALES DATA */}
        {stateSales && stateSales.length > 0 && (
          <div className="report-section">
            <h2 className="section-heading">Appendix A: State Sales Data</h2>
            <p className="body-para" style={{ marginBottom: "18px" }}>
              The following state-level sales figures were provided as part of the diligence intake process.
            </p>
            <table className="data-table">
              <thead>
                <tr>
                  <th className="th" style={{ width: "32%" }}>State</th>
                  <th className="th">Year 1</th>
                  <th className="th">Year 2</th>
                  <th className="th">Year 3</th>
                </tr>
              </thead>
              <tbody>
                {stateSales.map((row, i) => (
                  <tr key={i}>
                    <td className="td">{row.state}</td>
                    <td className="td">{fmtCurrency(row.year_1)}</td>
                    <td className="td">{fmtCurrency(row.year_2)}</td>
                    <td className="td">{fmtCurrency(row.year_3)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </>
  );
}
