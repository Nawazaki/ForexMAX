import { describe, expect, it } from "vitest";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";

describe("crawl controls", () => {
  it("includes the public home route but excludes query search", async () => { const urls = (await sitemap()).map((entry) => entry.url); expect(urls).toContain("https://forexmax.com/"); expect(urls).not.toContain("https://forexmax.com/search"); });
  it("blocks only private/admin surfaces without blocking public API namespaces by default", () => { const rules = robots().rules; expect(rules).toEqual([{ userAgent: "*", allow: "/", disallow: ["/admin/", "/admin/login", "/preview/", "/drafts/", "/private/"] }]); });
});
