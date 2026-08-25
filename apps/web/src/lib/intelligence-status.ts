export type IntelligenceAvailability = "AVAILABLE" | "UNAVAILABLE" | "REVIEW_REQUIRED";

export type IntelligenceCoverage = {
  name: string;
  scope: string;
  availability: IntelligenceAvailability;
  note: string;
};

export const intelligenceCoverage: IntelligenceCoverage[] = [
  { name: "Macro evidence", scope: "Inflation, labour, GDP, trade and policy releases", availability: "AVAILABLE", note: "Official-source registry available" },
  { name: "Rates & policy", scope: "Central-bank decisions, yields and policy context", availability: "REVIEW_REQUIRED", note: "Research workflow required before publication" },
  { name: "FX & metals", scope: "Forex, gold and silver market context", availability: "UNAVAILABLE", note: "Live market feed not connected" },
  { name: "Market structure", scope: "Prop firms, brokers and trading infrastructure", availability: "REVIEW_REQUIRED", note: "Evidence-led review required" },
];

export function availabilityLabel(availability: IntelligenceAvailability) {
  if (availability === "AVAILABLE") return "Source-ready";
  if (availability === "REVIEW_REQUIRED") return "Review required";
  return "Data unavailable";
}
