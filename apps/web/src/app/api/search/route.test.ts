import { beforeEach, describe, expect, it, vi } from "vitest";

const { getPrisma } = vi.hoisted(() => ({ getPrisma: vi.fn() }));
vi.mock("@/lib/prisma", () => ({ getPrisma }));
import { GET } from "@/app/api/search/route";

const articleRows = [1, 2, 3, 4].map((number) => ({ title: `Gold article ${number}`, slug: `article-${number}`, excerpt: "macro research" }));
const auditRows = [1, 2].map((number) => ({ title: `Gold audit ${number}`, slug: `audit-${number}`, summary: "audit summary" }));
const propFirmRows = [1, 2].map((number) => ({ name: `Gold firm ${number}`, slug: `firm-${number}`, assessment: "firm assessment" }));
const findPage = <T,>(rows: T[]) => vi.fn(({ skip = 0, take = 12 }: { skip?: number; take?: number } = {}) => Promise.resolve(rows.slice(skip, skip + take)));

const article = { count: vi.fn(), findMany: findPage(articleRows) };
const audit = { count: vi.fn(), findMany: findPage(auditRows) };
const propFirm = { count: vi.fn(), findMany: findPage(propFirmRows) };

beforeEach(() => {
  vi.clearAllMocks();
  getPrisma.mockReturnValue({ article, audit, propFirm });
  article.count.mockResolvedValue(articleRows.length);
  audit.count.mockResolvedValue(auditRows.length);
  propFirm.count.mockResolvedValue(propFirmRows.length);
});

describe("GET /api/search", () => {
  it("limits category queries to articles and reports the next page", async () => {
    article.count.mockResolvedValue(3);
    const response = await GET(new Request("https://forexmax.com/api/search?q=gold&type=all&category=macro&limit=1&page=2"));
    const body = await response.json();

    expect(article.findMany).toHaveBeenCalledWith(expect.objectContaining({
      skip: 1,
      take: 1,
      where: expect.objectContaining({ category: { slug: "macro" } }),
    }));
    expect(audit.count).not.toHaveBeenCalled();
    expect(audit.findMany).not.toHaveBeenCalled();
    expect(propFirm.count).not.toHaveBeenCalled();
    expect(propFirm.findMany).not.toHaveBeenCalled();
    expect(body).toMatchObject({ page: 2, limit: 1, hasMore: true, results: [{ type: "article", href: "/articles/article-2" }] });
  });

  it("paginates all result types without skipping or duplicating matches", async () => {
    const pages: Array<{ hasMore: boolean; results: Array<{ type: string; title: string; href: string }> }> = [];
    for (const page of [1, 2, 3, 4]) {
      const response = await GET(new Request(`https://forexmax.com/api/search?q=gold&type=all&limit=2&page=${page}`));
      pages.push(await response.json());
    }

    expect(pages.map((page) => page.hasMore)).toEqual([true, true, true, false]);
    const results = pages.flatMap((page) => page.results.map(({ type, title }) => `${type}:${title}`));
    expect(results).toEqual([
      "article:Gold article 1", "article:Gold article 2", "article:Gold article 3", "article:Gold article 4",
      "audit:Gold audit 1", "audit:Gold audit 2", "prop-firm:Gold firm 1", "prop-firm:Gold firm 2",
    ]);
    expect(new Set(results).size).toBe(8);
    expect(article.findMany).toHaveBeenCalledTimes(2);
    expect(audit.findMany).toHaveBeenCalledTimes(1);
    expect(propFirm.findMany).toHaveBeenCalledTimes(1);
    expect(audit.findMany).toHaveBeenCalledWith(expect.objectContaining({ skip: 0, take: 2 }));
    expect(propFirm.findMany).toHaveBeenCalledWith(expect.objectContaining({ skip: 0, take: 2 }));
  });
});
