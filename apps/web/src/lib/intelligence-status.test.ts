import { describe, expect, it } from "vitest";
import { availabilityLabel, intelligenceCoverage } from "@/lib/intelligence-status";

describe("market intelligence availability", () => {
  it("labels unavailable and review-gated coverage explicitly rather than implying a market conclusion", () => {
    expect(availabilityLabel("UNAVAILABLE")).toBe("Data unavailable");
    expect(availabilityLabel("REVIEW_REQUIRED")).toBe("Review required");
    expect(availabilityLabel("AVAILABLE")).toBe("Source-ready");
  });

  it("keeps every displayed coverage row tied to a scope and a non-empty operational note", () => {
    for (const coverage of intelligenceCoverage) {
      expect(coverage.scope).not.toHaveLength(0);
      expect(coverage.note).not.toHaveLength(0);
    }
  });
});
