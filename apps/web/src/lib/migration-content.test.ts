import { describe, expect, it } from "vitest";
import { getLegacyArticles, getLegacyAudits, legacyRecords } from "@/lib/content";

describe("legacy content migration package", () => {
  it("preserves all public article and audit records while excluding templates", () => { expect(getLegacyArticles()).toHaveLength(16); expect(getLegacyAudits()).toHaveLength(2); expect(legacyRecords.some((record) => record.sourceFile.includes("template.html") || record.sourceFile.includes("author-card.html"))).toBe(false); });
  it("gives every migrated record a unique destination route", () => { const routes = legacyRecords.map((record) => record.route); expect(new Set(routes).size).toBe(routes.length); });
});
