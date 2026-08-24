export type SourceRequirement = { name: string | null; url: string | null; lastReviewedAt: string | null };

export function canPublish(status: string, source: SourceRequirement) {
  if (status !== "PUBLISHED") return true;
  return Boolean(source.name && source.url && source.lastReviewedAt);
}

export function assertPublishable(status: string, source: SourceRequirement) {
  if (!canPublish(status, source)) throw new Error("PUBLISHED_CONTENT_REQUIRES_SOURCE_AND_REVIEW_DATE");
}
