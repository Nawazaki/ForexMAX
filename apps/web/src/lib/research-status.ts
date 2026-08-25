export const dataQualityPresentation = {
  VERIFIED: { label: "Verified", canPresentAsFact: true, note: "Source, timestamp and verification record are available." },
  DELAYED: { label: "Delayed", canPresentAsFact: false, note: "The latest expected update has not been received." },
  STALE: { label: "Stale", canPresentAsFact: false, note: "The record is older than its documented freshness window." },
  UNAVAILABLE: { label: "Source contract pending", canPresentAsFact: false, note: "No eligible source-backed value is displayed until a named data contract is activated." },
  REQUIRES_REVIEW: { label: "Editorial review boundary", canPresentAsFact: false, note: "The source may be available, but an assessment has not been confirmed for public use." },
} as const;

export type DataQualityState = keyof typeof dataQualityPresentation;

export function presentDataQuality(status: DataQualityState) {
  return dataQualityPresentation[status];
}

export function canPublishAssessment(status: "DRAFT" | "REVIEW" | "APPROVED" | "PUBLISHED" | "SUPERSEDED" | "REJECTED") {
  return status === "PUBLISHED";
}
