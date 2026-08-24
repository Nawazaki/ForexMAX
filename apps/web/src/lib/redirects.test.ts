import { describe, expect, it } from "vitest";
import nextConfig from "../../next.config";

describe("legacy redirects", () => {
  it("returns HTTP 301 for original article and audit URLs redirected to clean routes", async () => { const redirects = await nextConfig.redirects?.(); expect(redirects).toContainEqual(expect.objectContaining({ source: "/articles/central-banks-gold-buying.html", destination: "/articles/central-banks-gold-buying", statusCode: 301 })); expect(redirects).toContainEqual(expect.objectContaining({ source: "/audits/finotive-funding.html", destination: "/audits/finotive-funding", statusCode: 301 })); });
  it("covers every non-template record and canonicalises the www host with HTTP 301", async () => { const redirects = await nextConfig.redirects?.() ?? []; expect(redirects).toHaveLength(33); expect(redirects).toContainEqual(expect.objectContaining({ source: "/:path*", destination: "https://forexmax.com/:path*", statusCode: 301 })); });
});
