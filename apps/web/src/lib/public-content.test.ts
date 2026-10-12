import { beforeEach, describe, expect, it, vi } from "vitest";

const { getPrisma } = vi.hoisted(() => ({ getPrisma: vi.fn() }));
vi.mock("@/lib/prisma", () => ({ getPrisma }));
import { getPublishedArticles, getPublishedAudits, getPublishedContent } from "@/lib/public-content";
import { getLegacyRecord } from "@/lib/content";

const article = { findMany: vi.fn(), findFirst: vi.fn() };
const audit = { findMany: vi.fn(), findFirst: vi.fn() };
const staleArticle = (slug: string) => ({
  title: "Stale CMS title",
  slug,
  excerpt: "Stale CMS description",
  seoDescription: null,
  contentHtml: "<p>Stale CMS body</p>",
  ogImage: null,
  publishedAt: new Date("2026-06-15T00:00:00.000Z"),
  lastReviewedAt: null,
  updatedAt: new Date("2026-08-25T00:00:00.000Z"),
  author: null,
});
const staleAudit = (slug: string) => ({
  title: "Stale CMS audit title",
  slug,
  summary: "Stale CMS summary",
  seoDescription: null,
  contentHtml: "<p>Stale CMS audit body</p>",
  ogImage: null,
  publishedAt: new Date("2026-06-15T00:00:00.000Z"),
  lastReviewedAt: null,
  updatedAt: new Date("2026-08-25T00:00:00.000Z"),
  author: null,
});

describe("version-controlled editorial overrides for public CMS content", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    article.findMany.mockResolvedValue([staleArticle("post-cftc-prop-firm-era"), staleArticle("unmodified-article")]);
    article.findFirst.mockImplementation(({ where }: { where: { slug: string } }) => Promise.resolve(staleArticle(where.slug)));
    audit.findMany.mockResolvedValue([staleAudit("earn2trade-gauntlet-mini")]);
    audit.findFirst.mockImplementation(({ where }: { where: { slug: string } }) => Promise.resolve(staleAudit(where.slug)));
    getPrisma.mockReturnValue({ article, audit } as never);
  });

  it("serves every reviewed article copy rather than stale CMS text", async () => {
    const slugs = ["post-cftc-prop-firm-era", "vwap-sd-bands-institutional-secrets", "us-market-opening-range-strategy", "trading_sessions", "earn2trade-mobile-futures-killer-app", "earn2trade-mobile-futures-migration"];
    for (const slug of slugs) {
      const expected = getLegacyRecord("article", slug)!;
      const actual = await getPublishedContent("article", slug);
      expect(article.findFirst).toHaveBeenCalledWith(expect.objectContaining({ where: { slug, status: "PUBLISHED" } }));
      expect(actual?.title).toBe(expected.title);
      expect(actual?.contentHtml).toBe(expected.contentHtml);
      if (slug === "post-cftc-prop-firm-era") expect(actual?.lastReviewedAt?.toISOString().slice(0, 10)).toBe("2026-10-12");
    }
  });

  it("serves the reviewed audit copy while retaining the CMS published-status gate", async () => {
    const expected = getLegacyRecord("audit", "earn2trade-gauntlet-mini")!;
    const actual = await getPublishedContent("audit", expected.slug);
    expect(actual?.title).toBe(expected.title);
    expect(actual?.contentHtml).toBe(expected.contentHtml);
    audit.findFirst.mockResolvedValueOnce(null as never);
    expect(await getPublishedContent("audit", expected.slug)).toBeUndefined();
  });

  it("applies only listed editorial overrides in public archives", async () => {
    const articles = await getPublishedArticles();
    expect(articles.find((record) => record.slug === "post-cftc-prop-firm-era")?.title).toBe(getLegacyRecord("article", "post-cftc-prop-firm-era")?.title);
    expect(articles.find((record) => record.slug === "unmodified-article")?.title).toBe("Stale CMS title");
    const audits = await getPublishedAudits();
    expect(audits.find((record) => record.slug === "earn2trade-gauntlet-mini")?.title).toBe(getLegacyRecord("audit", "earn2trade-gauntlet-mini")?.title);
  });
});
