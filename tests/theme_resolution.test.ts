import { expect, it } from "vitest";
import {
  contrastRatio,
  resolveTheme,
  themes,
  themeOverridesSchema,
  createThemeRegistry,
} from "../packages/core/src/themes";

it("WCAG relative luminance produces symmetric 21:1 black-white contrast and 1:1 identical colors", () => {
  expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 10);
  expect(contrastRatio("#ffffff", "#000000")).toBeCloseTo(21, 10);
  expect(contrastRatio("#123456", "#123456")).toBeCloseTo(1, 10);
  expect(() => contrastRatio("red", "#ffffff")).toThrow();
});
it("bundled defaults resolve deterministically with readable accents and no warnings", () => {
  for (const theme of Object.values(themes)) {
    const resolved = resolveTheme(theme);
    expect(resolved.tokens).toEqual(theme);
    expect(resolved.warnings).toEqual([]);
    expect(
      contrastRatio(resolved.tokens.accent, resolved.tokens.background),
    ).toBeGreaterThanOrEqual(4.5);
    expect(
      contrastRatio(resolved.tokens.foreground, resolved.tokens.background),
    ).toBeGreaterThanOrEqual(4.5);
    expect(resolveTheme(theme)).toEqual(resolved);
  }
});
it("low contrast user accents preserve input but render a safe deterministic fallback with a useful warning", () => {
  const overrides = { accent: themes.modern.background };
  const before = JSON.stringify(overrides);
  const result = resolveTheme(themes.modern, overrides);
  expect(result.tokens.accent).toBe(themes.modern.accent);
  expect(result.warnings.join(" ")).toMatch(/read|contrast/i);
  expect(JSON.stringify(overrides)).toBe(before);
  expect(resolveTheme(themes.modern, overrides)).toEqual(result);
});
it("low contrast custom manifest accents use foreground without forbidding the trusted manifest", () => {
  const registry = createThemeRegistry({
    custom: { ...themes.modern, accent: themes.modern.background },
  });
  expect(resolveTheme(registry.custom!).tokens.accent).toBe(
    themes.modern.foreground,
  );
});
it("safe user accent and supported font selections resolve without mutating defaults", () => {
  for (const [font, expected] of Object.entries({
    system: "system-ui, sans-serif",
    serif: "Georgia, serif",
    mono: "ui-monospace, monospace",
  })) {
    const result = resolveTheme(themes.modern, { font, accent: "#000000" });
    expect(result.tokens.font).toBe(expected);
    expect(result.tokens.accent).toBe("#000000");
    expect(result.warnings).toEqual([]);
  }
  expect(themes.modern.font).toBe("system-ui, sans-serif");
});
it("safe foreground and background colors compose with theme overrides", () => {
  const result = resolveTheme(themes.modern, {
    background: "#eeeeee",
    foreground: "#222222",
    accent: "#184ca0",
  });
  expect(result.tokens.background).toBe("#eeeeee");
  expect(result.tokens.foreground).toBe("#222222");
  expect(result.warnings).toEqual([]);
  expect(themes.modern.background).toBe("#f4f5f7");
});
it("invalid CSS and unknown override keys fail at the shared boundary", () => {
  expect(themeOverridesSchema.parse({})).toEqual({});
  for (const overrides of [
    { accent: "red" },
    { accent: "#000000;display:none" },
    { font: "Arial" },
    { background: "url(javascript:bad)" },
    { foreground: "#fff" },
    null,
  ]) {
    expect(() => themeOverridesSchema.parse(overrides)).toThrow();
    expect(() => resolveTheme(themes.modern, overrides)).toThrow();
  }
});
