export const SALES_TAX_THRESHOLDS = {
  California: 500000,
  Texas: 500000,
  "New York": 500000,
};

export const DEFAULT_THRESHOLD = 100000;

export const NO_SALES_TAX_STATES = new Set([
  "Alaska", "Delaware", "Montana", "New Hampshire", "Oregon",
]);

export function getThreshold(state) {
  return SALES_TAX_THRESHOLDS[state] ?? DEFAULT_THRESHOLD;
}
