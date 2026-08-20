export const SAMPLE_DEAL = {
  deal_name: "Project Summit",
  target_name: "Summit Industrial Services, LLC",
  client_name: "Pinnacle Capital Partners",
};

export const SAMPLE_RISKS = [
  // HIGH
  {
    category: "Federal Tax",
    title: "Open Tax Examination Unresolved",
    severity: "high",
    text: "Elevated risk. The Company is subject to an open or unresolved tax examination. The outcome may result in additional tax, penalties, and interest. Recommend obtaining all examination correspondence, understanding the issues under review, and quantifying any proposed adjustments prior to closing.",
  },
  // MODERATE
  {
    category: "Federal Tax",
    title: "ERC Claim — Extended Statute Open",
    severity: "moderate",
    text: "Potential risk of IRS disallowance of Employee Retention Credits claimed. The statute of limitations for Q3 2021 credits runs through April 15, 2027, or 2 years from the date the credit was received, whichever is later. Recommend reviewing eligibility documentation supporting the claim.",
  },
  {
    category: "State Income Tax",
    title: "State Income Tax Economic Nexus",
    severity: "moderate",
    text: "Risk that the Company may have state income tax filing obligations in states where it has sales to customers but does not file returns. Applicability depends on whether the Company has exceeded economic nexus thresholds adopted by each state. P.L. 86-272 protections do not extend to service revenue; income tax nexus exposure applies to all states where the Company has sales without a filing obligation.",
  },
  {
    category: "Sales & Use Tax",
    title: "Sales Tax Economic Nexus",
    severity: "moderate",
    text: "Risk that the Company may have sales and use tax collection and remittance obligations in states where it has sales to customers. Applicability depends on whether the Company has crossed economic nexus thresholds, which vary by state. Based on estimated annual sales provided, the following states appear to meet or exceed their applicable economic nexus threshold: Texas.",
  },
  {
    category: "Sales & Use Tax",
    title: "Missing Exemption Certificates",
    severity: "moderate",
    text: "Risk that undocumented exempt sales will be presumed taxable under audit and assessed against the Company with penalties and interest. Recommend implementing a process to collect and periodically refresh exemption certificates from all customers claiming exemption.",
  },
  {
    category: "Employment Tax",
    title: "Below-Market Officer Compensation",
    severity: "moderate",
    text: "To the extent officer/shareholder W-2 compensation is below reasonable levels for the industry and role, the IRS may recharacterize a portion of distributions as wages subject to employment tax. Recommend benchmarking officer compensation against industry comparables to assess exposure.",
  },
  {
    category: "Federal Tax",
    title: "Outstanding Tax Notices Received",
    severity: "moderate",
    text: "Risk of unresolved tax positions indicated by outstanding notices. Obtain copies of all notices and correspondence from taxing authorities and assess exposure and required response deadlines prior to closing.",
  },
  // LOW
  {
    category: "Federal Tax",
    title: "Related Party Transactions at FMV",
    severity: "low",
    text: "Low risk. The Company has related party transactions conducted at fair market value. Recommend confirming that contemporaneous documentation exists to support FMV pricing in the event of an audit.",
  },
  {
    category: "Federal Tax",
    title: "Open Federal Tax Years",
    severity: "low",
    text: "As is typical in most transactions, risk of exposure on open tax years where federal or state authorities may still assess additional tax. Recommend tax representation and indemnification provisions in the purchase agreement.",
  },
  // RECOMMENDATION
  {
    category: "Unclaimed Property",
    title: "Unclaimed Property Process Absent",
    severity: "recommendation",
    text: "The Company does not appear to have formal processes in place to identify and remit unclaimed property. While this is not a confirmed liability, uncashed checks and unredeemed customer credits may be subject to state escheatment laws after a dormancy period of typically 3 to 5 years. Recommend implementing a process to identify, review, and remit unclaimed property to applicable states on an annual basis.",
  },
];

export const SAMPLE_ANSWERS = [
  { question_id: "entity_type",             answer: "scorp" },
  { question_id: "most_recent_filed_year",  answer: "2024" },
  { question_id: "revenue_type",            answer: "services" },
  { question_id: "nexus_duration",          answer: "2" },
  { question_id: "prior_reorg",             answer: "no" },
  { question_id: "prior_diligence",         answer: "no" },
  { question_id: "erc_claimed",             answer: "yes" },
  { question_id: "erc_q3_2021",             answer: "yes" },
  { question_id: "erc_received_2yr",        answer: "yes" },
  { question_id: "erc_amount",              answer: "180000" },
  { question_id: "tax_exam",                answer: "yes" },
  { question_id: "tax_exam_resolved",       answer: "no" },
  { question_id: "related_party",           answer: "yes" },
  { question_id: "related_party_fmv",       answer: "yes" },
  { question_id: "income_tax_nexus",        answer: "yes" },
  { question_id: "physical_nexus",          answer: "no" },
  { question_id: "taxable_sales",           answer: "yes" },
  { question_id: "sales_tax_nexus",         answer: "yes" },
  { question_id: "exemption_certs",         answer: "no" },
  { question_id: "use_tax_review",          answer: "yes" },
  { question_id: "employment_tax_states",   answer: "no" },
  { question_id: "contractor_usage",        answer: "no" },
  { question_id: "contractor_comp",         answer: "0" },
  { question_id: "property_tax",            answer: "yes" },
  { question_id: "unclaimed_property",      answer: "no" },
  { question_id: "gross_receipts_y1",       answer: "3800000" },
  { question_id: "gross_receipts_y2",       answer: "3400000" },
  { question_id: "gross_receipts_y3",       answer: "2900000" },
  { question_id: "taxable_income_y1",       answer: "420000" },
  { question_id: "taxable_income_y2",       answer: "370000" },
  { question_id: "taxable_income_y3",       answer: "310000" },
  { question_id: "officer_comp",            answer: "95000" },
  { question_id: "eq_open_years",           answer: "yes" },
  { question_id: "eq_notices",              answer: "yes" },
  { question_id: "eq_utp",                  answer: "no" },
];

export const SAMPLE_STATE_SALES = [
  { question_id: "income_tax_nexus", state: "Texas",          year_1: 850000, year_2: 760000, year_3: 640000 },
  { question_id: "income_tax_nexus", state: "Ohio",           year_1: 420000, year_2: 390000, year_3: 310000 },
  { question_id: "income_tax_nexus", state: "North Carolina", year_1: 210000, year_2: 185000, year_3: 155000 },
  { question_id: "sales_tax_nexus",  state: "Texas",          year_1: 850000, year_2: 760000, year_3: 640000 },
  { question_id: "sales_tax_nexus",  state: "Ohio",           year_1: 420000, year_2: 390000, year_3: 310000 },
  { question_id: "sales_tax_nexus",  state: "North Carolina", year_1: 210000, year_2: 185000, year_3: 155000 },
];

export const SAMPLE_INCOME_TAX_SALES = SAMPLE_STATE_SALES.filter(
  (r) => r.question_id === "income_tax_nexus"
);
