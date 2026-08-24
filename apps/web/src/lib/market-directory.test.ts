import { describe, expect, it } from "vitest";
import { marketDirectory } from "@/lib/market-directory";
import { presentDataQuality } from "@/lib/research-status";

describe("market directory", () => {
  it("uses unique public market routes with explicit data-availability states", () => {
    expect(new Set(marketDirectory.map((market) => market.slug)).size).toBe(marketDirectory.length);
    expect(marketDirectory.every((market) => market.coverage.length > 0)).toBe(true);
    expect(marketDirectory.every((market) => presentDataQuality(market.availability).canPresentAsFact === false)).toBe(true);
  });
});
