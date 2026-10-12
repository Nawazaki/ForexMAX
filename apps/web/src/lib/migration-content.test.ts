import { describe, expect, it } from "vitest";
import { getLegacyArticles, getLegacyAudits, legacyRecords } from "@/lib/content";

describe("legacy content migration package", () => {
  it("preserves all public article and audit records while excluding templates", () => { expect(getLegacyArticles()).toHaveLength(16); expect(getLegacyAudits()).toHaveLength(2); expect(legacyRecords.some((record) => record.sourceFile.includes("template.html") || record.sourceFile.includes("author-card.html"))).toBe(false); });
  it("routes the duplicate legacy trading-sessions page to its canonical article", () => { const routes = legacyRecords.map((record) => record.route); expect(new Set(routes).size).toBe(routes.length - 1); expect(legacyRecords.find((record) => record.slug === "forexmax_article")?.route).toBe("/articles/trading_sessions"); expect(legacyRecords.find((record) => record.slug === "trading_sessions")?.route).toBe("/articles/trading_sessions"); });
});
