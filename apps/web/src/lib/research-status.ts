export const dataQualityPresentation = {
  VERIFIED: { label: "Verified", canPresentAsFact: true, note: "Source, timestamp and verification record are available." },
  DELAYED: { label: "Delayed", canPresentAsFact: false, note: "The latest expected update has not been received." },
  STALE: { label: "Stale", canPresentAsFact: false, note: "The record is older than its documented freshness window." },
  UNAVAILABLE: { label: "Data unavailable", canPresentAsFact: false, note: "No eligible source-backed value is available." },
  REQUIRES_REVIEW: { label: "Requires review", canPresentAsFact: false, note: "A reviewer has not confirmed the record for public use." },
} as const;

export type DataQualityState = keyof typeof dataQualityPresentation;

export function presentDataQuality(status: DataQualityState) {
  return dataQualityPresentation[status];
}

export function canPublishAssessment(status: "DRAFT" | "REVIEW" | "APPROVED" | "PUBLISHED" | "SUPERSEDED" | "REJECTED") {
  return status === "PUBLISHED";
}
