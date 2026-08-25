import { primarySources, type PrimarySource } from "@/lib/primary-sources";

export const previewDatabaseBlocker = {
  code: "PREVIEW_DATABASE_REQUIRED",
  label: "Preview database required",
  detail: "This workspace is intentionally read-only until an isolated Preview database is available. No research record can be created, verified, reviewed, or published from the shared Production database.",
} as const;

export type ResearchEventStatus = "INGESTED" | "PROCESSING" | "REQUIRES_REVIEW" | "VERIFIED" | "PUBLISHED" | "REJECTED" | "STALE" | "ARCHIVED";
export type EvidenceVerificationStatus = "UNVERIFIED" | "VERIFYING" | "VERIFIED" | "CONFLICTED" | "REJECTED";
export type AssessmentStatus = "DRAFT" | "REVIEW" | "APPROVED" | "PUBLISHED" | "SUPERSEDED" | "REJECTED";
export type EditorialDecision = "APPROVED" | "REJECTED" | "CHANGES_REQUESTED";

const allowedEventTransitions: Record<ResearchEventStatus, ResearchEventStatus[]> = {
  INGESTED: ["PROCESSING", "REJECTED", "ARCHIVED"],
  PROCESSING: ["REQUIRES_REVIEW", "REJECTED", "STALE"],
  REQUIRES_REVIEW: ["VERIFIED", "REJECTED", "STALE"],
  VERIFIED: ["PUBLISHED", "STALE", "ARCHIVED"],
  PUBLISHED: ["STALE", "ARCHIVED"],
  REJECTED: ["ARCHIVED"],
  STALE: ["REQUIRES_REVIEW", "ARCHIVED"],
  ARCHIVED: [],
};

export function canTransitionEvent(from: ResearchEventStatus, to: ResearchEventStatus) {
  return allowedEventTransitions[from].includes(to);
}

export function canPublishResearchEvent(input: {
  eventStatus: ResearchEventStatus;
  evidenceStatuses: EvidenceVerificationStatus[];
  assessmentStatus: AssessmentStatus;
  editorialDecision?: EditorialDecision;
}) {
  if (input.eventStatus !== "VERIFIED") return { allowed: false, reason: "The event is not verified." } as const;
  if (!input.evidenceStatuses.length || input.evidenceStatuses.some((status) => status !== "VERIFIED")) {
    return { allowed: false, reason: "Every supporting evidence record must be verified." } as const;
  }
  if (input.assessmentStatus !== "APPROVED") return { allowed: false, reason: "The assessment is not approved." } as const;
  if (input.editorialDecision !== "APPROVED") return { allowed: false, reason: "An editorial approval is required." } as const;
  return { allowed: true, reason: "Verified evidence and editorial approval are present." } as const;
}

export type ResearchControlSnapshot = {
  persistence: typeof previewDatabaseBlocker;
  sourceContracts: PrimarySource[];
  persistedRecords: { sources: number; events: number; evidence: number; assessments: number; qualityChecks: number };
  operations: Array<{ name: string; state: "BLOCKED"; blocker: string }>;
};

export function getResearchControlSnapshot(): ResearchControlSnapshot {
  return {
    persistence: previewDatabaseBlocker,
    sourceContracts: primarySources,
    persistedRecords: { sources: 0, events: 0, evidence: 0, assessments: 0, qualityChecks: 0 },
    operations: [
      "Create source",
      "Edit source",
      "Add evidence",
      "Verify evidence",
      "Create research event",
      "Record editorial review",
      "Publish assessment",
    ].map((name) => ({ name, state: "BLOCKED" as const, blocker: previewDatabaseBlocker.code })),
  };
}
