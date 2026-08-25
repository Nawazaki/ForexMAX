import { describe, expect, it } from "vitest";
import { canPublishAssessment, presentDataQuality } from "@/lib/research-status";

describe("research publication guardrails", () => {
  it("marks missing, delayed and unreviewed data as unsuitable for factual presentation", () => {
    for (const status of ["UNAVAILABLE", "DELAYED", "STALE", "REQUIRES_REVIEW"] as const) {
      expect(presentDataQuality(status).canPresentAsFact).toBe(false);
    }
    expect(presentDataQuality("UNAVAILABLE").label).toBe("Source contract pending");
  });

  it("permits public assessment output only at the explicit published state", () => {
    expect(canPublishAssessment("PUBLISHED")).toBe(true);
    expect(canPublishAssessment("APPROVED")).toBe(false);
    expect(canPublishAssessment("REVIEW")).toBe(false);
    expect(canPublishAssessment("DRAFT")).toBe(false);
  });
});
