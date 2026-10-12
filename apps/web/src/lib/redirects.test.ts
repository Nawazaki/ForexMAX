import { describe, expect, it } from "vitest";
import nextConfig from "../../next.config";

describe("legacy redirects", () => {
  it("returns HTTP 301 for original article and audit URLs redirected to clean routes", async () => { const redirects = await nextConfig.redirects?.(); expect(redirects).toContainEqual(expect.objectContaining({ source: "/articles/central-banks-gold-buying.html", destination: "/articles/central-banks-gold-buying", statusCode: 301 })); expect(redirects).toContainEqual(expect.objectContaining({ source: "/audits/finotive-funding.html", destination: "/audits/finotive-funding", statusCode: 301 })); });
  it("covers every non-template record and the duplicate sessions alias", async () => { const redirects = await nextConfig.redirects?.() ?? []; expect(redirects).toHaveLength(33); expect(redirects).toContainEqual(expect.objectContaining({ source: "/forexmax_article", destination: "/articles/trading_sessions", statusCode: 301 })); expect(redirects).toContainEqual(expect.objectContaining({ source: "/forexmax_article.html", destination: "/articles/trading_sessions", statusCode: 301 })); expect(redirects).not.toContainEqual(expect.objectContaining({ source: "/:path*", has: expect.any(Array) })); });
});
