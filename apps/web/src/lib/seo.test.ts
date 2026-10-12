import { describe, expect, it } from "vitest";
import { buildMetadata, normalizePublicTitle } from "@/lib/seo";

describe("SEO metadata", () => {
  it("builds a canonical public URL and noindex utility pages", () => { const metadata = buildMetadata({ title: "Search", description: "Search page", path: "/search", noIndex: true }); expect(metadata.alternates?.canonical).toBe("https://www.forexmax.com/search"); expect(metadata.robots).toEqual({ index: false, follow: false }); });
  it("normalizes legacy brand suffixes before creating absolute page titles", () => {
    expect(normalizePublicTitle("Research article | ForexMax")).toBe("Research article");
    expect(normalizePublicTitle("Research article | ForexMax Market Intelligence")).toBe("Research article");
    expect(normalizePublicTitle("Research article | ForexMax | ForexMax")).toBe("Research article");
    const metadata = buildMetadata({ title: "Research article | ForexMax", description: "Summary", path: "/articles/example" });
    expect(metadata.title).toEqual({ absolute: "Research article | ForexMax" });
    expect(metadata.openGraph?.title).toBe("Research article | ForexMax");
    expect(metadata.twitter?.title).toBe("Research article | ForexMax");
  });
});
