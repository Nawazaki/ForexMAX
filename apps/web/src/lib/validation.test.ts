import { describe, expect, it } from "vitest";
import { articleInputSchema, isRelationId } from "@/lib/validation";

describe("article relation validation", () => {
  const baseArticle = { title: "Preview article", slug: "preview-article", contentMarkdown: "Body", status: "DRAFT" as const };

  it("accepts UUID identifiers from migrated Supabase relationships", () => {
    const uuid = "d8d2e0f0-831a-474c-b666-7a3af578101c";
    expect(isRelationId(uuid)).toBe(true);
    expect(articleInputSchema.safeParse({ ...baseArticle, categoryId: uuid, authorId: uuid, featuredMediaId: uuid }).success).toBe(true);
  });

  it("continues accepting CUID identifiers for newly managed records", () => {
    const cuid = "ckv5n2j9w0000x0x0x0x0x0x0";
    expect(isRelationId(cuid)).toBe(true);
    expect(articleInputSchema.safeParse({ ...baseArticle, categoryId: cuid }).success).toBe(true);
  });

  it("rejects malformed relationship identifiers", () => {
    expect(isRelationId("not-an-id")).toBe(false);
    expect(articleInputSchema.safeParse({ ...baseArticle, categoryId: "not-an-id" }).success).toBe(false);
  });
});
