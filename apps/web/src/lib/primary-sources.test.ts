import { describe, expect, it } from "vitest";
import { primarySources } from "@/lib/primary-sources";

describe("primary source registry", () => {
  it("uses unique HTTPS records with the traceability fields required for the public directory", () => {
    expect(primarySources.length).toBeGreaterThan(0);
    expect(new Set(primarySources.map((source) => source.id)).size).toBe(primarySources.length);
    expect(new Set(primarySources.map((source) => source.url)).size).toBe(primarySources.length);
    for (const source of primarySources) {
      expect(source.url).toMatch(/^https:\/\//);
      expect(source.name).not.toHaveLength(0);
      expect(source.organization).not.toHaveLength(0);
      expect(source.coverage).not.toHaveLength(0);
      expect(source.access).not.toHaveLength(0);
    }
  });
});
