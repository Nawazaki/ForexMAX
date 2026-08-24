import { describe, expect, it } from "vitest";
import { buildMetadata } from "@/lib/seo";

describe("SEO metadata", () => {
  it("builds a canonical public URL and noindex utility pages", () => { const metadata = buildMetadata({ title: "Search", description: "Search page", path: "/search", noIndex: true }); expect(metadata.alternates?.canonical).toBe("https://www.forexmax.com/search"); expect(metadata.robots).toEqual({ index: false, follow: false }); });
});
