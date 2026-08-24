import { beforeEach, describe, expect, it, vi } from "vitest";

const { getPrisma } = vi.hoisted(() => ({ getPrisma: vi.fn() }));
vi.mock("@/lib/prisma", () => ({ getPrisma }));
import { GET } from "@/app/api/search/route";

describe("GET /api/search", () => {
  const article = { findMany: vi.fn() }; const audit = { findMany: vi.fn() }; const propFirm = { findMany: vi.fn() };
  beforeEach(() => { vi.clearAllMocks(); getPrisma.mockReturnValue({ article, audit, propFirm }); article.findMany.mockResolvedValue([{ title: "Gold macro", slug: "gold-macro", excerpt: "macro research" }, { title: "Extra", slug: "extra", excerpt: "more" }]); audit.findMany.mockResolvedValue([]); propFirm.findMany.mockResolvedValue([]); });
  it("limits category queries to articles and reports the next page", async () => { const response = await GET(new Request("https://forexmax.com/api/search?q=gold&type=all&category=macro&limit=1&page=2")); const body = await response.json(); expect(article.findMany).toHaveBeenCalledWith(expect.objectContaining({ skip: 1, take: 2, where: expect.objectContaining({ category: { slug: "macro" } }) })); expect(audit.findMany).not.toHaveBeenCalled(); expect(propFirm.findMany).not.toHaveBeenCalled(); expect(body).toMatchObject({ page: 2, limit: 1, hasMore: true, results: [{ type: "article", href: "/articles/gold-macro" }] }); });
});
