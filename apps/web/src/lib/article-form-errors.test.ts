import { describe, expect, it } from "vitest";
import { articleFormErrorCode, articleFormErrorMessage } from "@/lib/article-form-errors";

describe("article form errors", () => {
  it("maps Prisma unique constraint failures to a slug message", () => {
    expect(articleFormErrorCode({ code: "P2002" })).toBe("slug-taken");
    expect(articleFormErrorMessage("slug-taken")).toContain("unique URL slug");
  });

  it("maps publish validation failures to an actionable form message", () => {
    expect(articleFormErrorCode(new Error("PUBLISHED_CONTENT_REQUIRES_SOURCE_AND_REVIEW_DATE"))).toBe("publish-requires-source");
    expect(articleFormErrorMessage("publish-requires-source")).toContain("last-reviewed date");
  });

  it("does not mask unexpected errors", () => {
    expect(articleFormErrorCode(new Error("DATABASE_CONNECTION_FAILED"))).toBeNull();
    expect(articleFormErrorMessage("unknown")).toBeNull();
  });
});
