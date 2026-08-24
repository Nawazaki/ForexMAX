import { describe, expect, it } from "vitest";
import { getSearchPlan, searchQuerySchema } from "@/lib/search-params";

describe("searchQuerySchema", () => {
  it("parses type, category, limit and page with safe bounds", () => expect(searchQuerySchema.parse({ q: "gold", type: "article", category: "macro", limit: "10", page: "2" })).toMatchObject({ q: "gold", type: "article", category: "macro", limit: 10, page: 2 }));
  it("rejects unsafe query, limit and page values", () => { expect(searchQuerySchema.safeParse({ q: "x" }).success).toBe(false); expect(searchQuerySchema.safeParse({ q: "gold", limit: 21 }).success).toBe(false); expect(searchQuerySchema.safeParse({ q: "gold", page: 0 }).success).toBe(false); });
  it("limits an all-type category search to articles and derives a bounded page plan", () => { const params = searchQuerySchema.parse({ q: "gold", type: "all", category: "macro", limit: 5, page: 3 }); expect(getSearchPlan(params)).toEqual({ type: "article", skip: 10, take: 6, outputLimit: 5 }); });
});
