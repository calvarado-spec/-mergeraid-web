import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import FlowHeader from "../components/FlowHeader";
import FlowStepper from "../components/FlowStepper";

const US_STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado",
  "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho",
  "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana",
  "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota",
  "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada",
  "New Hampshire", "New Jersey", "New Mexico", "New York",
  "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon",
  "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
  "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington",
  "West Virginia", "Wisconsin", "Wyoming", "District of Columbia",
];

// ── Asset deal: 14-question flow ─────────────────────────────────────────────
const QUESTIONS = {
  prior_reorg: {
    number: 1,
    text: "Have there been any reorganizations or material stock or asset acquisitions in the last 5 years?",
    outcomes: {
      yes: { next: "prior_diligence", nextNumber: 2 },
      no:  { next: "erc_claimed",     nextNumber: 3 },
    },
  },
  prior_diligence: {
    number: 2,
    text: "Was any tax due diligence performed on that transaction?",
    outcomes: {
      yes: { next: "erc_claimed", nextNumber: 3 },
      no:  { risk: true, next: "erc_claimed", nextNumber: 3 },
    },
  },
  erc_claimed: {
    number: 3,
    text: "Has the Company historically claimed any Employee Retention Credit?",
    outcomes: {
      yes: { next: "erc_q3_2021", nextNumber: 3 },
      no:  { next: "tax_exam",    nextNumber: 4 },
    },
  },
  erc_q3_2021: {
    number: 3,
    text: "Was the credit claimed related to Quarter 3 of 2021?",
    outcomes: {
      yes: { next: "erc_received_2yr", nextNumber: 3 },
      no:  { next: "erc_received_2yr", nextNumber: 3 },
    },
  },
  erc_received_2yr: {
    number: 3,
    text: "Has the credit for any quarter been received within the past 2 years?",
    outcomes: {
      yes: { risk: true, next: "tax_exam", nextNumber: 4 },
      no:  { risk: true, next: "tax_exam", nextNumber: 4 },
    },
  },
  tax_exam: {
    number: 4,
    text: "Has the Company been subject to any tax examinations over the past 5 years?",
    outcomes: {
      yes: { next: "tax_exam_resolved", nextNumber: 4 },
      no:  { next: "related_party",     nextNumber: 5 },
    },
  },
  tax_exam_resolved: {
    number: 4,
    text: "Has the examination been resolved?",
    outcomes: {
      yes: { next: "related_party", nextNumber: 5 },
      no:  { risk: true, next: "related_party", nextNumber: 5 },
    },
  },
  related_party: {
    number: 5,
    text: "Is the Company party to any related party transactions?",
    outcomes: {
      yes: { next: "related_party_fmv",  nextNumber: 5 },
      no:  { next: "income_tax_nexus",   nextNumber: 6 },
    },
  },
  related_party_fmv: {
    number: 5,
    text: "Are all related party transactions done at fair market value?",
    outcomes: {
      yes: { risk: true, next: "income_tax_nexus", nextNumber: 6 },
      no:  { risk: true, next: "income_tax_nexus", nextNumber: 6 },
    },
  },
  income_tax_nexus: {
    number: 6,
    text: "Does the Company have sales to states where it does not currently file state income tax returns?",
    outcomes: {
      yes: { stateSelect: true, next: "physical_nexus", nextNumber: 7 },
      no:  { next: "physical_nexus", nextNumber: 7 },
    },
  },
  physical_nexus: {
    number: 7,
    text: "Does the Company have any presence outside of states where they currently file? This includes employees, contractors, or property in those states.",
    outcomes: {
      yes: { risk: true, next: "taxable_sales", nextNumber: 8 },
      no:  { next: "taxable_sales", nextNumber: 8 },
    },
  },
  taxable_sales: {
    number: 8,
    text: "Does the Company make taxable sales of tangible goods or services for sales tax purposes?",
    outcomes: {
      yes: { next: "sales_tax_nexus", nextNumber: 8 },
      no:  { next: "exemption_certs", nextNumber: 9 },
    },
  },
  sales_tax_nexus: {
    number: 8,
    text: "Does the Company have sales to states where it does not currently file sales and use tax returns?",
    outcomes: {
      yes: { stateSelect: true, next: "exemption_certs", nextNumber: 9 },
      no:  { next: "exemption_certs", nextNumber: 9 },
    },
  },
  exemption_certs: {
    number: 9,
    text: "Are exemption certificates collected and refreshed from customers who claim exemption from sales tax?",
    outcomes: {
      yes: { next: "use_tax_review", nextNumber: 10 },
      no:  { risk: true, next: "use_tax_review", nextNumber: 10 },
    },
  },
  use_tax_review: {
    number: 10,
    text: "Does the Company regularly review invoices from vendors for instances where sales tax was not charged?",
    outcomes: {
      yes: { next: "employment_tax_states", nextNumber: 11 },
      no:  { risk: true, next: "employment_tax_states", nextNumber: 11 },
    },
  },
  employment_tax_states: {
    number: 11,
    text: "Does the Company have employees residing or traveling to states where the Company does not file employment tax returns?",
    outcomes: {
      yes: { risk: true, next: "contractor_classification", nextNumber: 12 },
      no:  { next: "contractor_classification", nextNumber: 12 },
    },
  },
  contractor_classification: {
    number: 12,
    text: "Does the Company have a process in place to differentiate whether an independent contractor should be considered an employee?",
    threeWay: true,
    outcomes: {
      yes: { next: "property_tax", nextNumber: 13 },
      no:  { risk: true, next: "property_tax", nextNumber: 13 },
      na:  { next: "property_tax", nextNumber: 13 },
    },
  },
  property_tax: {
    number: 13,
    text: "Does the Company file real or personal property tax returns in all states where property is located?",
    outcomes: {
      yes: { next: "unclaimed_property", nextNumber: 14 },
      no:  { risk: true, next: "unclaimed_property", nextNumber: 14 },
    },
  },
  unclaimed_property: {
    number: 14,
    text: "Does the Company have processes in place to address any uncashed checks or customer credits?",
    outcomes: {
      yes: { next: "done" },
      no:  { risk: true, next: "done" },
    },
  },
};

// ── Equity deal: entity-branching flow ───────────────────────────────────────
// next: same destination for both yes/no
// yesNext / noNext: different destinations per answer
// type: "text-input" for free-text questions
const EQUITY_QUESTIONS = {
  // S Corporation branch
  scorp_single_class: {
    text: "Has the company maintained a single class of stock throughout its history?",
    next: "scorp_shareholder_count",
  },
  scorp_shareholder_count: {
    text: "Has the company ever had more than 100 shareholders?",
    next: "scorp_eligible_shareholders",
  },
  scorp_eligible_shareholders: {
    text: "Has the company ever had a non-eligible shareholder (non-resident alien, corporation, or certain trusts)?",
    next: "scorp_election_docs",
  },
  scorp_election_docs: {
    text: "Does the company have documentation of a timely S corp election including IRS acceptance?",
    next: "scorp_converted_from_c",
  },
  scorp_converted_from_c: {
    text: "Did the company convert from a C corporation to an S corporation within the last 5 years?",
    yesNext: "scorp_big_assets",
    noNext:  "eq_open_years",
  },
  scorp_big_assets: {
    text: "Were there appreciated assets at the time of conversion?",
    next: "eq_open_years",
  },

  // C Corporation branch
  ccorp_ownership_change: {
    text: "Has there been any ownership change exceeding 50% over any rolling 3-year period?",
    next: "ccorp_nol",
  },
  ccorp_nol: {
    text: "Does the company have any NOL carryforwards?",
    yesNext: "ccorp_nol_amount",
    noNext:  "ccorp_credits",
  },
  ccorp_nol_amount: {
    text: "What is the total amount of NOL carryforwards?",
    type: "text-input",
    next: "ccorp_credits",
  },
  ccorp_credits: {
    text: "Does the company have any tax credit carryforwards (R&D credits, foreign tax credits)?",
    next: "eq_open_years",
  },

  // Partnership / LLC branch
  pship_rep: {
    text: "Does the partnership agreement designate a Partnership Representative?",
    next: "pship_pushout",
  },
  pship_pushout: {
    text: "Does the partnership agreement include a push-out election provision under Section 6226?",
    next: "pship_aar",
  },
  pship_aar: {
    text: "Has the partnership filed any amended returns or Administrative Adjustment Requests (AAR) in the past 3 years?",
    next: "pship_bba_alloc",
  },
  pship_bba_alloc: {
    text: "Does the LLC agreement have provisions addressing BBA audit liability allocation between pre- and post-closing owners?",
    next: "eq_open_years",
  },

  // Common equity questions (all three entity types end here)
  eq_open_years: {
    text: "Are there any open tax years where the statute of limitations has not expired?",
    next: "eq_notices",
  },
  eq_notices: {
    text: "Has the company received any notices or correspondence from federal or state taxing authorities in the past 3 years?",
    next: "eq_utp",
  },
  eq_utp: {
    text: "Does the company have any uncertain tax positions reflected on the balance sheet?",
    next: "done",
  },
};

// Total questions per equity entity type (including entity_type question + common 3)
// Optional questions that extend these: scorp_big_assets (+1), ccorp_nol_amount (+1)
const EQUITY_BASE_TOTALS = { scorp: 23, ccorp: 21, pship: 22 };
const EQUITY_FIRST_QUESTION = {
  scorp: "scorp_single_class",
  ccorp: "ccorp_ownership_change",
  pship: "pship_rep",
};

const TOOLTIPS = {
  prior_reorg: "A reorganization includes mergers, acquisitions, spin-offs, or any transaction where the company acquired or disposed of a significant business or assets. Material means the transaction was large enough to have a meaningful tax impact.",
  prior_diligence: "Tax due diligence is a structured review of a company's tax history to identify potential liabilities before a transaction closes. Without it, unknown tax risks from prior deals may transfer to the buyer.",
  erc_claimed: "The Employee Retention Credit (ERC) is a refundable payroll tax credit available to businesses that retained employees during COVID-19. The IRS has been actively auditing ERC claims and certain credits remain open to challenge.",
  erc_q3_2021: "Credits claimed for Q3 2021 have a special statute of limitations that runs until April 15, 2027 — longer than other quarters. This creates extended exposure if the IRS challenges the claim.",
  erc_received_2yr: "If the credit was received within the past 2 years, the statute of limitations for IRS challenge is still open. Credits received outside this window may have a shorter remaining exposure period.",
  tax_exam: "A tax examination (audit) is a review by the IRS or a state taxing authority of the company's tax returns. Open or recently resolved examinations may indicate unresolved tax positions that could create liability.",
  tax_exam_resolved: "A resolved examination means the taxing authority has formally closed the audit with no further adjustments or the company has fully paid any amounts owed. Unresolved examinations remain a contingent liability.",
  related_party: "Related party transactions are dealings between the company and its owners, officers, affiliates, or other connected parties — for example, rent paid to a shareholder-owned entity or loans between related companies.",
  related_party_fmv: "Fair market value means the price that would be agreed upon between unrelated parties in an arm's length transaction. Related party transactions not at FMV may be recharacterized by the IRS, creating additional tax exposure.",
  income_tax_nexus: "Nexus is the level of connection between a company and a state that requires the company to file and pay taxes in that state. Economic nexus is typically triggered by exceeding a revenue threshold in a state, even without physical presence.",
  physical_nexus: "Physical presence nexus is created when a company has employees, contractors, inventory, equipment, or other property in a state. This generally requires the company to file income tax returns in that state.",
  taxable_sales: "Taxable sales are sales of tangible personal property or certain services that are subject to sales tax. Not all sales are taxable — for example, sales for resale or certain exempt services may not be.",
  sales_tax_nexus: "Sales tax nexus is the connection to a state that requires a business to collect and remit sales tax. It can be created by physical presence or by exceeding economic thresholds, which vary by state.",
  exemption_certs: "Exemption certificates are documents provided by customers claiming they are exempt from sales tax — for example, resellers or exempt organizations. Without valid certificates on file, the seller may be liable for uncollected tax under audit.",
  use_tax_review: "Use tax applies when a company purchases goods or services without paying sales tax — for example, from an out-of-state vendor who did not charge tax. Companies are generally required to self-assess and remit use tax on these purchases.",
  employment_tax_states: "If employees live or work in states where the company does not file employment tax returns, the company may owe payroll taxes, unemployment insurance, and other withholding obligations in those states.",
  contractor_classification: "The IRS and states use specific criteria to determine whether a worker is an employee or an independent contractor. Misclassification can result in significant payroll tax liability, penalties, and interest.",
  property_tax: "Real and personal property tax returns are required in most states where a company owns or leases property, equipment, or other tangible assets. Failure to file can result in penalties and back taxes.",
  unclaimed_property: "Unclaimed property laws require companies to report and remit uncashed checks, unused customer credits, and other abandoned property to the state after a dormancy period, typically 3 to 5 years.",
  entity_type: "The entity type determines how the company is taxed and which specific diligence questions apply. S corporations, C corporations, and partnerships each have distinct tax rules and risk areas.",
  scorp_single_class: "S corporations are only permitted to have one class of stock. A second class of stock — created by differences in distribution rights or liquidation preferences — can invalidate S corp status retroactively.",
  scorp_shareholder_count: "S corporations may not have more than 100 shareholders. Exceeding this limit at any point could invalidate the S corp election and result in the company being treated as a C corporation.",
  scorp_eligible_shareholders: "S corporations may only have eligible shareholders: US citizens or resident individuals, certain trusts, and estates. Non-resident aliens, corporations, and certain other entities are not eligible and their ownership could terminate S corp status.",
  scorp_election_docs: "A valid S corp election requires a timely filed Form 2553 with IRS acceptance. Without documentation confirming the election was accepted, there is risk that S corp status was never validly established.",
  scorp_converted_from_c: "When a C corporation converts to an S corporation, the built-in gains tax may apply to gains that existed at the time of conversion if the assets are sold within a recognition period, currently 5 years.",
  scorp_big_assets: "Built-in gain is the excess of an asset's fair market value over its adjusted tax basis at the time of the S corp election. If appreciated assets are sold within the recognition period, corporate-level tax applies at the highest C corp rate.",
  ccorp_ownership_change: "Section 382 limits the use of net operating losses after an ownership change. An ownership change occurs when shareholders owning 5% or more collectively increase their ownership by more than 50 percentage points over a 3-year period.",
  ccorp_nol: "Net Operating Loss (NOL) carryforwards are prior year losses that can offset future taxable income. If a Section 382 ownership change occurred, the annual amount of NOL the company can use is limited to the company's value multiplied by the long-term tax-exempt rate.",
  ccorp_nol_amount: "Enter the total dollar amount of NOL carryforwards as reported on the company's most recent tax return, typically shown on Form 1120 Schedule K or the tax return footnotes.",
  ccorp_credits: "Tax credit carryforwards such as R&D credits and foreign tax credits are also subject to limitation following an ownership change under Section 383, which applies similar annual limits as Section 382.",
  pship_rep: "Under the Centralized Partnership Audit Regime (BBA), every partnership must designate a Partnership Representative who has sole authority to act on behalf of the partnership in an IRS audit. Without a designated representative, the IRS can appoint one.",
  pship_pushout: "The push-out election under Section 6226 allows a partnership to push audit adjustments out to the partners from the reviewed year rather than having the partnership pay tax at the highest rate. Without this provision, the buyer may bear the cost of pre-closing tax adjustments.",
  pship_aar: "An Administrative Adjustment Request (AAR) is the partnership equivalent of an amended return under the BBA regime. Filed AARs may have open adjustments that flow through to partners and could affect the buyer post-closing.",
  pship_bba_alloc: "The BBA regime allows the IRS to assess audit adjustments at the partnership level for the reviewed year. Without contractual provisions allocating this liability between pre- and post-closing owners, the buyer may bear the burden of taxes owed for periods before they owned the company.",
  eq_open_years: "The statute of limitations for federal income tax is generally 3 years from the filing date, or 6 years if income was understated by more than 25%. Open years represent periods where the IRS can still assess additional tax.",
  eq_notices: "Notices from taxing authorities may indicate audits, proposed adjustments, unfiled return requirements, or other unresolved issues. Outstanding notices should be obtained and reviewed as part of diligence.",
  eq_utp: "Uncertain tax positions are tax positions where the company believes there is less than a 50% likelihood of being sustained under IRS scrutiny. These are recorded as liabilities under ASC 740 and represent quantified tax risk on the balance sheet.",
};

function TooltipIcon({ text }) {
  if (!text) return null;
  return (
    <span className="relative group inline-flex items-center ml-1.5 flex-shrink-0" style={{ verticalAlign: "middle" }}>
      <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-blue-100 text-blue-600 text-xs font-bold cursor-help leading-none select-none">
        ?
      </span>
      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-80 bg-gray-800 text-white text-xs rounded-lg p-3 shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-50 font-normal leading-relaxed whitespace-normal text-left">
        {text}
      </span>
    </span>
  );
}

export default function Questionnaire() {
  const router = useRouter();
  const { dealId } = router.query;

  // ── Deal type (fetched on load) ──────────────────────────────────────────
  const [dealType, setDealType] = useState(null);
  const [loadingDeal, setLoadingDeal] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    if (!dealId) return;
    fetch(`/api/deals?dealId=${dealId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setLoadError(d.error);
        else setDealType(d.deal_type);
      })
      .catch(() => setLoadError("Failed to load deal."))
      .finally(() => setLoadingDeal(false));
  }, [dealId]);

  // ── Asset flow state ─────────────────────────────────────────────────────
  // view: "question" | "state-select" | "state-sales" | "done"
  const [view, setView] = useState("question");
  const [questionId, setQuestionId] = useState("prior_reorg");
  const [questionNumber, setQuestionNumber] = useState(1);
  const [stateSelectContext, setStateSelectContext] = useState(null);
  const [selectedStates, setSelectedStates] = useState([]);
  const [stateSalesData, setStateSalesData] = useState({});

  // ── Equity flow state ────────────────────────────────────────────────────
  // equityView: "entity-select" | "question" | "text-input"
  const [equityView, setEquityView] = useState("entity-select");
  const [equityQuestionId, setEquityQuestionId] = useState(null);
  const [equityQuestionNum, setEquityQuestionNum] = useState(1);
  const [equityTotal, setEquityTotal] = useState(null); // set after entity type is chosen
  const [equityInAssetPhase, setEquityInAssetPhase] = useState(false);
  const [equityOffset, setEquityOffset] = useState(0);
  const [textInputValue, setTextInputValue] = useState("");

  // ── Shared ───────────────────────────────────────────────────────────────
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // ── Progress bar ─────────────────────────────────────────────────────────
  const isAsset = dealType === "asset";
  const isEquity = dealType === "equity";
  const isDone = view === "done";
  const progressNum = (isAsset || equityInAssetPhase) ? questionNumber : equityQuestionNum;
  const progressTotal = isAsset ? 14 : equityTotal;
  const progress = progressTotal ? Math.round(((progressNum - 1) / progressTotal) * 100) : 0;
  const progressLabel = progressTotal
    ? `Question ${progressNum} of ${progressTotal}`
    : `Question ${progressNum}`;

  // ── Shared helper ────────────────────────────────────────────────────────
  async function postAnswer(qId, answer) {
    const res = await fetch("/api/answers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dealId, questionId: qId, answer }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Server error");
    }
  }

  // ── Asset handlers ───────────────────────────────────────────────────────
  async function handleAssetAnswer(answer) {
    if (!dealId) return;
    setError("");
    setSubmitting(true);
    try {
      await postAnswer(questionId, answer);
      const outcome = QUESTIONS[questionId].outcomes[answer];
      if (outcome.stateSelect) {
        setStateSelectContext({ questionId, nextId: outcome.next, nextNumber: outcome.nextNumber });
        setSelectedStates([]);
        setStateSalesData({});
        setView("state-select");
      } else if (outcome.next === "done") {
        setView("done");
      } else {
        setQuestionId(outcome.next);
        setQuestionNumber(equityOffset + outcome.nextNumber);
        setView("question");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function toggleState(state) {
    setSelectedStates((prev) =>
      prev.includes(state) ? prev.filter((s) => s !== state) : [...prev, state]
    );
  }

  function handleStateSelectContinue() {
    const { nextId, nextNumber } = stateSelectContext;
    if (selectedStates.length === 0) {
      if (nextId === "done") setView("done");
      else { setQuestionId(nextId); setQuestionNumber(equityOffset + nextNumber); setView("question"); }
      return;
    }
    const initial = {};
    for (const s of selectedStates) initial[s] = { year1: "", year2: "", year3: "" };
    setStateSalesData(initial);
    setView("state-sales");
  }

  async function handleStateSalesSubmit() {
    if (!dealId) return;
    setError("");
    setSubmitting(true);
    try {
      const statesPayload = selectedStates.map((s) => ({
        state: s,
        year1: stateSalesData[s]?.year1 || "",
        year2: stateSalesData[s]?.year2 || "",
        year3: stateSalesData[s]?.year3 || "",
      }));
      const res = await fetch("/api/state-sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dealId, questionId: stateSelectContext.questionId, states: statesPayload }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Server error");
      }
      const { nextId, nextNumber } = stateSelectContext;
      if (nextId === "done") setView("done");
      else { setQuestionId(nextId); setQuestionNumber(equityOffset + nextNumber); setView("question"); }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  // ── Equity handlers ──────────────────────────────────────────────────────
  async function handleEntityTypeSelect(entityType) {
    if (!dealId) return;
    setError("");
    setSubmitting(true);
    try {
      await postAnswer("entity_type", entityType);
      setEquityTotal(EQUITY_BASE_TOTALS[entityType]);
      setEquityQuestionId(EQUITY_FIRST_QUESTION[entityType]);
      setEquityQuestionNum(2);
      setEquityView("question");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleEquityAnswer(answer) {
    if (!dealId) return;
    setError("");
    setSubmitting(true);
    try {
      await postAnswer(equityQuestionId, answer);
      const q = EQUITY_QUESTIONS[equityQuestionId];

      // Extend total when optional branching questions are triggered
      if (equityQuestionId === "scorp_converted_from_c" && answer === "yes") {
        setEquityTotal((prev) => prev + 1);
      }
      if (equityQuestionId === "ccorp_nol" && answer === "yes") {
        setEquityTotal((prev) => prev + 1);
      }

      const nextId = answer === "yes" ? (q.yesNext ?? q.next) : (q.noNext ?? q.next);

      if (!nextId || nextId === "done") {
        setEquityOffset(equityQuestionNum);
        setEquityInAssetPhase(true);
        setView("question");
        setQuestionId("prior_reorg");
        setQuestionNumber(equityQuestionNum + 1);
      } else {
        const nextQ = EQUITY_QUESTIONS[nextId];
        setEquityQuestionId(nextId);
        setEquityQuestionNum((prev) => prev + 1);
        setEquityView(nextQ?.type === "text-input" ? "text-input" : "question");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleTextInputSubmit() {
    if (!dealId || !textInputValue.trim()) return;
    setError("");
    setSubmitting(true);
    try {
      await postAnswer(equityQuestionId, textInputValue.trim());
      const q = EQUITY_QUESTIONS[equityQuestionId];
      setTextInputValue("");
      setEquityQuestionId(q.next);
      setEquityQuestionNum((prev) => prev + 1);
      setEquityView("question");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  // ── Render helpers ───────────────────────────────────────────────────────
  const currentAssetQ = QUESTIONS[questionId];
  const currentEquityQ = equityQuestionId ? EQUITY_QUESTIONS[equityQuestionId] : null;

  const yesBtn = (onClick) => (
    <button
      onClick={onClick}
      disabled={submitting || !dealId}
      className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-3 rounded-lg transition-colors"
    >
      Yes
    </button>
  );

  const noBtn = (onClick) => (
    <button
      onClick={onClick}
      disabled={submitting || !dealId}
      className="flex-1 bg-white hover:bg-blue-50 disabled:text-blue-200 text-blue-600 font-semibold py-3 rounded-lg border-2 border-blue-600 disabled:border-blue-200 transition-colors"
    >
      No
    </button>
  );

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <FlowHeader />
      <FlowStepper activeStep={1} />
      <div className="flex flex-col items-center px-4 py-6 sm:py-12 flex-1">
      <div className="w-full max-w-2xl">

        {/* Progress bar */}
        {!isDone && !loadingDeal && dealType && (
          <div className="mb-6">
            <div className="flex justify-between text-xs text-blue-400 mb-1">
              <span>{progressLabel}</span>
              <span>{progress}% complete</span>
            </div>
            <div className="w-full bg-blue-50 rounded-full h-1.5">
              <div
                className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* ── Loading ── */}
        {loadingDeal && (
          <div className="bg-white border border-blue-100 rounded-2xl shadow-md p-8 text-center">
            <p className="text-blue-400 text-sm">Loading deal information…</p>
          </div>
        )}

        {/* ── Load error ── */}
        {!loadingDeal && loadError && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
            <p className="text-red-600 text-sm">{loadError}</p>
          </div>
        )}

        {/* ════════════════════════════════════════════════════
            ASSET FLOW (also handles equity+asset phase)
        ════════════════════════════════════════════════════ */}
        {(isAsset || equityInAssetPhase) && !isDone && (
          <>
            {/* ── Asset: Yes/No question ── */}
            {view === "question" && currentAssetQ && (
              <div className="bg-white border border-blue-100 rounded-2xl shadow-md p-4 sm:p-8">
                <p className="text-gray-800 text-base font-medium leading-relaxed mb-8">
                  {currentAssetQ.text}
                  <TooltipIcon text={TOOLTIPS[questionId]} />
                </p>
                {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2 mb-4">{error}</p>}
                <div className="flex flex-col gap-3">
                  <div className="flex gap-4">
                    {yesBtn(() => handleAssetAnswer("yes"))}
                    {noBtn(() => handleAssetAnswer("no"))}
                  </div>
                  {currentAssetQ.threeWay && (
                    <button
                      onClick={() => handleAssetAnswer("na")}
                      disabled={submitting || !dealId}
                      className="w-full text-sm text-gray-500 hover:text-blue-600 hover:bg-blue-50 py-2.5 rounded-lg border border-gray-200 hover:border-blue-200 transition-colors"
                    >
                      Independent contractors are not utilized.
                    </button>
                  )}
                </div>
                {!dealId && (
                  <p className="text-xs text-gray-400 text-center mt-5">
                    No deal ID found. Please start from the{" "}
                    <Link href="/intake" className="text-blue-500 underline">intake form</Link>.
                  </p>
                )}
              </div>
            )}

            {/* ── Asset: State multi-select ── */}
            {view === "state-select" && (
              <div className="bg-white border border-blue-100 rounded-2xl shadow-md p-4 sm:p-8">
                <p className="text-gray-800 text-base font-medium mb-1">Select all applicable states:</p>
                <p className="text-xs text-blue-400 mb-5">
                  {selectedStates.length} state{selectedStates.length !== 1 ? "s" : ""} selected
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-6 max-h-80 overflow-y-auto pr-1">
                  {US_STATES.map((state) => {
                    const checked = selectedStates.includes(state);
                    return (
                      <label
                        key={state}
                        className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg cursor-pointer border transition-colors ${
                          checked ? "bg-blue-50 border-blue-400 text-blue-800" : "border-gray-200 text-gray-600 hover:border-blue-200 hover:bg-blue-50"
                        }`}
                      >
                        <input type="checkbox" checked={checked} onChange={() => toggleState(state)} className="accent-blue-600 flex-shrink-0" />
                        <span className="truncate">{state}</span>
                      </label>
                    );
                  })}
                </div>
                <button
                  onClick={handleStateSelectContinue}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
                >
                  {selectedStates.length === 0 ? "Skip →" : `Enter Sales for ${selectedStates.length} State${selectedStates.length !== 1 ? "s" : ""} →`}
                </button>
              </div>
            )}

            {/* ── Asset: State sales inputs ── */}
            {view === "state-sales" && (
              <div className="bg-white border border-blue-100 rounded-2xl shadow-md p-4 sm:p-8">
                <p className="text-gray-800 text-base font-medium mb-1">Enter annual sales amounts ($) by state:</p>
                <p className="text-xs text-blue-400 mb-6">Year 1 is most recent</p>
                <div className="space-y-6 mb-6 max-h-96 overflow-y-auto pr-1">
                  {selectedStates.map((state) => (
                    <div key={state}>
                      <p className="text-sm font-semibold text-blue-700 mb-2">{state}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {["year1", "year2", "year3"].map((yr, i) => (
                          <div key={yr}>
                            <label className="text-xs text-gray-400 mb-1 block">Year {i + 1}</label>
                            <input
                              type="number" min="0" placeholder="0"
                              value={stateSalesData[state]?.[yr] || ""}
                              onChange={(e) =>
                                setStateSalesData((prev) => ({ ...prev, [state]: { ...prev[state], [yr]: e.target.value } }))
                              }
                              className="w-full border border-blue-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2 mb-4">{error}</p>}
                <button
                  onClick={handleStateSalesSubmit}
                  disabled={submitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-3 rounded-lg transition-colors"
                >
                  {submitting ? "Saving…" : "Save & Continue →"}
                </button>
              </div>
            )}
          </>
        )}

        {/* ════════════════════════════════════════════════════
            EQUITY FLOW
        ════════════════════════════════════════════════════ */}
        {isEquity && !equityInAssetPhase && !isDone && (
          <>
            {/* ── Equity: Entity type selection ── */}
            {equityView === "entity-select" && (
              <div className="bg-white border border-blue-100 rounded-2xl shadow-md p-4 sm:p-8">
                <p className="text-gray-800 text-base font-medium leading-relaxed mb-8">
                  What is the target&apos;s entity type?
                  <TooltipIcon text={TOOLTIPS["entity_type"]} />
                </p>
                {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2 mb-4">{error}</p>}
                <div className="flex flex-col gap-3">
                  {[
                    { value: "scorp", label: "S Corporation" },
                    { value: "ccorp", label: "C Corporation" },
                    { value: "pship", label: "Partnership / LLC" },
                  ].map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => handleEntityTypeSelect(value)}
                      disabled={submitting || !dealId}
                      className="w-full border-2 border-blue-200 hover:border-blue-600 hover:bg-blue-50 text-blue-700 font-medium py-3 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {label}
                    </button>
                  ))}
                </div>
                {!dealId && (
                  <p className="text-xs text-gray-400 text-center mt-5">
                    No deal ID found. Please start from the{" "}
                    <Link href="/intake" className="text-blue-500 underline">intake form</Link>.
                  </p>
                )}
              </div>
            )}

            {/* ── Equity: Yes/No question ── */}
            {equityView === "question" && currentEquityQ && (
              <div className="bg-white border border-blue-100 rounded-2xl shadow-md p-4 sm:p-8">
                <p className="text-gray-800 text-base font-medium leading-relaxed mb-8">
                  {currentEquityQ.text}
                  <TooltipIcon text={TOOLTIPS[equityQuestionId]} />
                </p>
                {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2 mb-4">{error}</p>}
                <div className="flex gap-4">
                  {yesBtn(() => handleEquityAnswer("yes"))}
                  {noBtn(() => handleEquityAnswer("no"))}
                </div>
              </div>
            )}

            {/* ── Equity: Text input (NOL amount) ── */}
            {equityView === "text-input" && currentEquityQ && (
              <div className="bg-white border border-blue-100 rounded-2xl shadow-md p-4 sm:p-8">
                <p className="text-gray-800 text-base font-medium leading-relaxed mb-6">
                  {currentEquityQ.text}
                  <TooltipIcon text={TOOLTIPS[equityQuestionId]} />
                </p>
                <input
                  type="text"
                  placeholder="e.g. $1,234,567"
                  value={textInputValue}
                  onChange={(e) => setTextInputValue(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleTextInputSubmit(); }}
                  className="w-full border border-blue-200 rounded-lg px-4 py-2 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 mb-6"
                />
                {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2 mb-4">{error}</p>}
                <button
                  onClick={handleTextInputSubmit}
                  disabled={submitting || !textInputValue.trim() || !dealId}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-3 rounded-lg transition-colors"
                >
                  {submitting ? "Saving…" : "Continue →"}
                </button>
              </div>
            )}
          </>
        )}

        {/* ════════════════════════════════════════════════════
            DONE — shared by both flows
        ════════════════════════════════════════════════════ */}
        {isDone && (
          <div className="bg-white border border-blue-100 rounded-2xl shadow-md p-6 sm:p-10 text-center">
            <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-5">
              <svg className="w-7 h-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-blue-700 mb-2">Questionnaire Complete</h2>
            <p className="text-gray-500 text-sm mb-8">
              Diligence questionnaire complete. Your risk summary is being prepared.
            </p>
            <a
              href={`/results?dealId=${dealId}`}
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
            >
              View Risk Summary →
            </a>
          </div>
        )}

      </div>
      </div>
    </div>
  );
}
