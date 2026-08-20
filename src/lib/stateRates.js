/**
 * State-level tax rates for screening purposes.
 * Sales tax: Tax Foundation 2024 combined state + local average rates (as decimals).
 * Corporate income tax: top marginal rates, 2024.
 * These are approximations for due diligence screening — not for filing or advice.
 */

export const salesTaxCombinedRate = {
  Alabama:                0.0924,
  Alaska:                 0.0176, // local-only avg; no state sales tax
  Arizona:                0.0837,
  Arkansas:               0.0946,
  California:             0.0868,
  Colorado:               0.0781,
  Connecticut:            0.0635,
  Delaware:               0,      // no sales tax
  "District of Columbia": 0.0600,
  Florida:                0.0702,
  Georgia:                0.0737,
  Hawaii:                 0.0444,
  Idaho:                  0.0603,
  Illinois:               0.0886,
  Indiana:                0.0700,
  Iowa:                   0.0694,
  Kansas:                 0.0868,
  Kentucky:               0.0600,
  Louisiana:              0.0956,
  Maine:                  0.0550,
  Maryland:               0.0600,
  Massachusetts:          0.0625,
  Michigan:               0.0600,
  Minnesota:              0.0749,
  Mississippi:            0.0707,
  Missouri:               0.0828,
  Montana:                0,      // no sales tax
  Nebraska:               0.0694,
  Nevada:                 0.0823,
  "New Hampshire":        0,      // no sales tax
  "New Jersey":           0.0660,
  "New Mexico":           0.0783,
  "New York":             0.0852,
  "North Carolina":       0.0699,
  "North Dakota":         0.0696,
  Ohio:                   0.0724,
  Oklahoma:               0.0898,
  Oregon:                 0,      // no sales tax
  Pennsylvania:           0.0634,
  "Rhode Island":         0.0700,
  "South Carolina":       0.0754,
  "South Dakota":         0.0640,
  Tennessee:              0.0955,
  Texas:                  0.0819,
  Utah:                   0.0719,
  Vermont:                0.0624,
  Virginia:               0.0577,
  Washington:             0.0886,
  "West Virginia":        0.0640,
  Wisconsin:              0.0543,
  Wyoming:                0.0522,
};

export const corpIncomeTaxRate = {
  Alabama:                0.0650,
  Alaska:                 0.0940,
  Arizona:                0.0490,
  Arkansas:               0.0480,
  California:             0.0884,
  Colorado:               0.0440,
  Connecticut:            0.0750,
  Delaware:               0.0870,
  "District of Columbia": 0.0825,
  Florida:                0.0550,
  Georgia:                0.0575,
  Hawaii:                 0.0960,
  Idaho:                  0.0580,
  Illinois:               0.0950,  // 7.99% + 2.5% PPRT surcharge
  Indiana:                0.0490,
  Iowa:                   0.0550,  // flat rate
  Kansas:                 0.0700,  // 4% + 3% surtax over $50K
  Kentucky:               0.0500,
  Louisiana:              0.0750,
  Maine:                  0.0893,
  Maryland:               0.0825,
  Massachusetts:          0.0800,
  Michigan:               0.0600,
  Minnesota:              0.0980,
  Mississippi:            0.0400,
  Missouri:               0.0400,
  Montana:                0.0675,
  Nebraska:               0.0558,
  Nevada:                 0,       // Commerce Tax is gross-receipts-based; no net income tax
  "New Hampshire":        0.0750,  // Business Profits Tax
  "New Jersey":           0.0900,
  "New Mexico":           0.0590,
  "New York":             0.0650,
  "North Carolina":       0.0250,
  "North Dakota":         0.0431,
  Ohio:                   0.0026,  // CAT — gross-receipts-based, not net income
  Oklahoma:               0.0400,
  Oregon:                 0.0760,
  Pennsylvania:           0.0899,
  "Rhode Island":         0.0700,
  "South Carolina":       0.0500,
  "South Dakota":         0,       // no corporate income tax
  Tennessee:              0.0650,
  Texas:                  0.0075,  // margin tax on gross receipts, not net income
  Utah:                   0.0465,
  Vermont:                0.0850,
  Virginia:               0.0600,
  Washington:             0,       // B&O tax is gross-receipts-based; no net income tax
  "West Virginia":        0.0650,
  Wisconsin:              0.0790,
  Wyoming:                0,       // no corporate income tax
};
