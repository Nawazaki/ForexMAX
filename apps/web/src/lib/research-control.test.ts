import { describe, expect, it } from "vitest";
import { canPublishResearchEvent, canTransitionEvent, getResearchControlSnapshot, previewDatabaseBlocker } from "@/lib/research-control";

describe("research control contracts", () => {
  it("does not expose fake persisted records when a Preview database is absent", () => {
    const snapshot = getResearchControlSnapshot();
    expect(snapshot.persistence.code).toBe("PREVIEW_DATABASE_REQUIRED");
    expect(snapshot.persistedRecords).toEqual({ sources: 0, events: 0, evidence: 0, assessments: 0, qualityChecks: 0 });
    expect(snapshot.operations.every((operation) => operation.state === "BLOCKED" && operation.blocker === previewDatabaseBlocker.code)).toBe(true);
  });

  it("allows only documented research-event transitions", () => {
    expect(canTransitionEvent("INGESTED", "PROCESSING")).toBe(true);
    expect(canTransitionEvent("PROCESSING", "PUBLISHED")).toBe(false);
    expect(canTransitionEvent("VERIFIED", "PUBLISHED")).toBe(true);
  });

  it("requires verified evidence and editorial approval before publication", () => {
    expect(canPublishResearchEvent({ eventStatus: "VERIFIED", evidenceStatuses: ["VERIFIED"], assessmentStatus: "APPROVED", editorialDecision: "APPROVED" }).allowed).toBe(true);
    expect(canPublishResearchEvent({ eventStatus: "VERIFIED", evidenceStatuses: ["UNVERIFIED"], assessmentStatus: "APPROVED", editorialDecision: "APPROVED" }).allowed).toBe(false);
    expect(canPublishResearchEvent({ eventStatus: "REQUIRES_REVIEW", evidenceStatuses: ["VERIFIED"], assessmentStatus: "APPROVED", editorialDecision: "APPROVED" }).allowed).toBe(false);
  });
});
