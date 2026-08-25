import { describe, expect, it } from "vitest";
import { assetIntelligenceProfiles, getAssetIntelligenceProfile } from "@/lib/asset-intelligence";

describe("asset intelligence profiles", () => {
  it("uses unique, source-aware routes with actual observation dependencies", () => {
    expect(new Set(assetIntelligenceProfiles.map((profile) => profile.slug)).size).toBe(assetIntelligenceProfiles.length);
    expect(assetIntelligenceProfiles.every((profile) => profile.tapeIds.length > 0)).toBe(true);
    expect(assetIntelligenceProfiles.every((profile) => profile.limitations.length > 40)).toBe(true);
  });

  it("does not present an inactive gold price as a live input", () => {
    expect(getAssetIntelligenceProfile("gold-macro-drivers")?.overview).toContain("does not display a gold price");
  });
});
