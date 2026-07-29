// Fictional sample scenario — S Corp equity purchase
// All company names and figures are fictional and for demonstration purposes only.

export const SAMPLE_DEAL = {
  deal_name: "Project Example",
  target_name: "Summit Industrial Services, Inc. (fictional)",
  client_name: "Example Capital Partners",
  deal_type: "equity",
};

// Answers fed to calculateExposures — mirrors the answers table row format
export const SAMPLE_ANSWERS = [
  { question_id: "entity_type",          answer: "scorp" },
  { question_id: "erc_claimed",          answer: "yes" },
  { question_id: "erc_q3_2021",          answer: "yes" },
  { question_id: "erc_received_2yr",     answer: "yes" },
  { question_id: "erc_amount",           answer: "180000" },
  { question_id: "tax_exam",             answer: "yes" },
  { question_id: "tax_exam_resolved",    answer: "no" },
  { question_id: "related_party",        answer: "yes" },
  { question_id: "related_party_fmv",    answer: "yes" },
  { question_id: "income_tax_nexus",     answer: "yes" },
  { question_id: "physical_nexus",       answer: "no" },
  { question_id: "taxable_sales",        answer: "yes" },
  { question_id: "sales_tax_nexus",      answer: "yes" },
  { question_id: "exemption_certs",      answer: "no" },
  { question_id: "use_tax_review",       answer: "yes" },
  { question_id: "employment_tax_states",answer: "no" },
  { question_id: "contractor_usage",     answer: "no" },
  { question_id: "property_tax",         answer: "yes" },
  { question_id: "unclaimed_property",   answer: "no" },
  { question_id: "officer_comp",         answer: "95000" },
  { question_id: "gross_receipts_y1",    answer: "6200000" },
  { question_id: "gross_receipts_y2",    answer: "5700000" },
  { question_id: "gross_receipts_y3",    answer: "5100000" },
  { question_id: "taxable_income_y1",    answer: "740000" },
  { question_id: "taxable_income_y2",    answer: "610000" },
  { question_id: "taxable_income_y3",    answer: "520000" },
  { question_id: "eq_open_years",        answer: "yes" },
  { question_id: "eq_notices",           answer: "yes" },
  { question_id: "eq_utp",              answer: "no" },
];

// State sales used for the appendix and the Sales & Use Tax exposure calc
export const SAMPLE_STATE_SALES = [
  { state: "Texas",          year_1: 850000, year_2: 780000, year_3: 690000 },
  { state: "Ohio",           year_1: 420000, year_2: 390000, year_3: 310000 },
  { state: "North Carolina", year_1: 210000, year_2: 180000, year_3: 140000 },
];

// Income-tax-nexus state sales used for the apportionment-based exposure calc
export const SAMPLE_INCOME_TAX_SALES = SAMPLE_STATE_SALES;

// Pre-computed risk findings — matches what computeRisks would return for the above answers
export const SAMPLE_RISKS = [
  {
    category: "Federal Tax",
    severity: "high",
    text: "Elevated risk. The Company is subject to an open or unresolved tax examination. The outcome may result in additional tax, penalties, and interest. Recommend obtaining all examination correspondence, understanding the issues under review, and quantifying any proposed adjustments prior to closing.",
  },
  {
    category: "Federal Tax",
    severity: "moderate",
    text: "Potential risk of IRS disallowance of Employee Retention Credits claimed. The statute of limitations for Q3 2021 credits runs through April 15, 2027, or 2 years from the date the credit was received, whichever is later. Recommend reviewing eligibility documentation supporting the claim.",
  },
  {
    category: "Federal Tax",
    severity: "low",
    text: "Low risk. The Company has related party transactions conducted at fair market value. Recommend confirming that contemporaneous documentation exists to support FMV pricing in the event of an audit.",
  },
  {
    category: "Federal Tax",
    severity: "low",
    text: "As is typical in most transactions, risk of exposure on open tax years where federal or state authorities may still assess additional tax. Recommend tax representation and indemnification provisions in the purchase agreement. For larger transactions, representations and warranties insurance may provide additional protection.",
  },
  {
    category: "Federal Tax",
    severity: "moderate",
    text: "Risk of unresolved tax positions indicated by outstanding notices. Obtain copies and assess exposure.",
  },
  {
    category: "State Income Tax",
    severity: "moderate",
    text: "Risk that the Company may have state income tax filing obligations in states where it has sales. Applicability depends on the volume of sales, the nature of the business activity, and whether P.L. 86-272 protections apply. Review sales by state to assess nexus exposure and quantify potential liability.",
  },
  {
    category: "Sales & Use Tax",
    severity: "moderate",
    text: "Risk that the Company may have sales and use tax filing obligations in states where it has sales. Applicability depends on whether the Company has crossed economic nexus thresholds, which vary by state but are commonly $100,000 in sales or 200 transactions annually. Review sales by state to identify states where nexus may exist.",
  },
  {
    category: "Sales & Use Tax",
    severity: "moderate",
    text: "Risk that undocumented exempt sales will be presumed taxable under audit and assessed against the Company with penalties and interest. Recommend implementing a process to collect and periodically refresh exemption certificates from all customers claiming exemption.",
  },
  {
    category: "Employment Tax",
    severity: "moderate",
    text: "If officer/shareholder W-2 compensation is determined to be below a reasonable level, the IRS may recharacterize a portion of distributions as wages subject to employment tax. Recommend benchmarking officer compensation against industry comparables to assess exposure.",
  },
  {
    category: "Unclaimed Property",
    severity: "recommendation",
    text: "Recommendation: The Company does not appear to have formal processes in place to identify and remit unclaimed property. While this is not a confirmed liability, uncashed checks and unredeemed customer credits may be subject to state escheatment laws after a dormancy period of typically 3 to 5 years. Recommend implementing a process to identify, review, and remit unclaimed property to applicable states on an annual basis.",
  },
];
