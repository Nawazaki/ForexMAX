import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const globalStyles = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");
const rootTokens = globalStyles.match(/:root\s*\{([^}]+)\}/)?.[1] ?? "";

function getToken(name: string) {
  const value = rootTokens.match(new RegExp(`--${name}:\\s*(#[\\da-fA-F]{6})`))?.[1];
  if (!value) throw new Error(`Missing --${name} color token in globals.css`);
  return value;
}

function luminance(color: string) {
  const channels = color.match(/[\da-fA-F]{2}/g)?.map((channel) => Number.parseInt(channel, 16) / 255);
  if (!channels || channels.length !== 3) throw new Error(`Invalid hex color: ${color}`);
  const [red, green, blue] = channels.map((channel) => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4);
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function contrastRatio(foreground: string, background: string) {
  const values = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
  return (values[0] + 0.05) / (values[1] + 0.05);
}

describe("theme accent contrast", () => {
  it("meets WCAG AA for small text on light theme surfaces", () => {
    const accent = getToken("accent");
    const lightSurfaces = [getToken("canvas"), getToken("paper"), "#eee9db", "#f8faf8"];

    for (const surface of lightSurfaces) {
      expect(contrastRatio(accent, surface), `${accent} on ${surface}`).toBeGreaterThanOrEqual(4.5);
    }
  });
});
