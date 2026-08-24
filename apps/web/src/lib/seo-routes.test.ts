import { describe, expect, it } from "vitest";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";
import { metadata as searchMetadata } from "@/app/search/page";

describe("crawl controls", () => {
  it("includes public research directories but excludes query search", async () => { const urls = (await sitemap()).map((entry) => entry.url); expect(urls).toContain("https://www.forexmax.com/"); expect(urls).toContain("https://www.forexmax.com/markets"); expect(urls).not.toContain("https://www.forexmax.com/search"); });
  it("blocks only private/admin surfaces without blocking public API namespaces by default", () => { const rules = robots().rules; expect(rules).toEqual([{ userAgent: "*", allow: "/", disallow: ["/admin/", "/admin/login", "/preview/", "/drafts/", "/private/"] }]); });
  it("marks query search as noindex", () => expect(searchMetadata.robots).toMatchObject({ index: false, follow: false }));
});
