import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ContentDates } from "@/components/content-dates";
import records from "@/content/legacy-content.json";
import { excludedComparisonProviders, legacyPropFirms } from "@/lib/prop-firms";

const slugs = [
  "post-cftc-prop-firm-era",
  "earn2trade-gauntlet-mini",
  "vwap-sd-bands-institutional-secrets",
  "us-market-opening-range-strategy",
  "trading_sessions",
];
const bySlug = new Map(records.map((record) => [record.slug, record]));

describe("verified editorial corrections", () => {
  it("uses extensionless canonical URLs for every legacy content record", () => {
    for (const record of records) {
      expect(record.canonical).toBe(`https://www.forexmax.com${record.route}`);
      expect(record.canonical).not.toMatch(/\.html$/);
    }
  });

  it("uses one page H1 and stores a separate editorial review date", () => {
    for (const slug of slugs) {
      const record = bySlug.get(slug);
      expect(record).toBeDefined();
      expect(record!.contentHtml.match(/<h1\b/gi) ?? []).toHaveLength(0);
      expect(record!.lastReviewedAt).toBe("2026-10-12");
      expect(record!.contentHtml).toMatch(/<strong>Sources?:<\/strong>/);
      expect(record!.contentHtml).toMatch(/https:\/\//);
    }
    expect(bySlug.get("post-cftc-prop-firm-era")?.publishedAt).toBe("2026-06-15");
    expect(bySlug.get("vwap-sd-bands-institutional-secrets")?.publishedAt).toBe("2026-06-15");
    expect(bySlug.get("earn2trade-gauntlet-mini")?.publishedAt).toBeUndefined();
  });

  it("renders only supported publication/review dates and labels missing legacy dates", () => {
    const known = renderToStaticMarkup(createElement(ContentDates, {
      publishedAt: new Date("2026-06-15T00:00:00.000Z"),
      lastReviewedAt: new Date("2026-10-12T00:00:00.000Z"),
    }));
    expect(known).toContain('dateTime="2026-06-15"');
    expect(known).toContain('dateTime="2026-10-12"');
    expect(known).toContain("First published");
    expect(known).toContain("Last reviewed");
    const unknown = renderToStaticMarkup(createElement(ContentDates, {
      lastReviewedAt: new Date("2026-10-12T00:00:00.000Z"),
    }));
    expect(unknown).toContain("Original publication date is not recorded in the migrated source");
  });

  it("withdraws unsupported opening-range statistics and untested execution claims", () => {
    const orb = bySlug.get("us-market-opening-range-strategy")!.contentHtml;
    const audit = bySlug.get("earn2trade-gauntlet-mini")!.contentHtml;
    expect(orb).toContain("not supported by a reproducible backtest");
    expect(orb).not.toMatch(/70\s*[–-]\s*75%/);
    expect(audit).toContain("No evidence was collected");
    expect(audit).toContain("zero slippage");
    const sessions = bySlug.get("trading_sessions")!.contentHtml;
    expect(sessions).toContain("https://www.bis.org/publications/");
  });

  it("links verified plan terms and explicitly excludes providers with unresolved current status", () => {
    expect(legacyPropFirms.some((firm) => firm.slug === "myforexfunds")).toBe(false);
    expect(legacyPropFirms.find((firm) => firm.slug === "the-funded-trader")?.assessment).toContain("could not be verified");
    expect(excludedComparisonProviders.map((provider) => provider.name)).toContain("MyForexFunds");
    for (const firm of legacyPropFirms) {
      expect(firm.sources.length).toBeGreaterThan(0);
      expect(firm.sources.every((source) => source.url.startsWith("https://"))).toBe(true);
      expect(firm.lastReviewed).toContain("2026-10-12");
    }
  });
});
