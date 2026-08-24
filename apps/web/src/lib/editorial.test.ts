import { describe, expect, it } from "vitest";
import { assertPublishable, canPublish } from "@/lib/editorial";

describe("editorial publishing rules", () => {
  it("allows draft and review without research evidence", () => expect(canPublish("REVIEW", { name: null, url: null, lastReviewedAt: null })).toBe(true));
  it("rejects publishing without a complete source and review date", () => expect(() => assertPublishable("PUBLISHED", { name: "Source", url: "https://example.com", lastReviewedAt: null })).toThrow("PUBLISHED_CONTENT_REQUIRES_SOURCE_AND_REVIEW_DATE"));
  it("allows evidence-backed publication", () => expect(canPublish("PUBLISHED", { name: "Source", url: "https://example.com", lastReviewedAt: "2026-08-24" })).toBe(true));
});
