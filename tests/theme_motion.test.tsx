import { afterEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { enhanceSite } from "../packages/core/src/enhance";
import {
  Site,
  createThemeRegistry,
  parseSite,
  starterSite,
  themeSchema,
  themes,
  type ThemeManifestInput,
  readMotionSettings,
  readThemeParallax,
} from "../packages/core/src/index";

const legacy: ThemeManifestInput = {
  name: "Legacy",
  background: "#ffffff",
  foreground: "#101010",
  accent: "#315b3f",
  font: "system-ui, sans-serif",
};
afterEach(() => vi.unstubAllGlobals());
describe("theme motion and accessibility", () => {
  it("THM-MOT-001 provides immutable defaults to prior theme authors", () => {
    const normalized = themeSchema.parse(legacy);
    expect(normalized.motion).toEqual({ intensityScale: 1, speedScale: 1 });
    expect(normalized.accessibility).toEqual({ parallax: true });
    expect(Object.isFrozen(normalized.motion)).toBe(true);
    expect(Object.isFrozen(normalized.accessibility)).toBe(true);
    expect(themeSchema.parse(normalized)).toEqual(normalized);
  });
  it("THM-MOT-002 validates finite bounded motion overrides and exact accessible settings", () => {
    const valid = themeSchema.parse({
      ...legacy,
      motion: { intensityScale: 0.35, speedScale: 1.8 },
      accessibility: { parallax: false },
    });
    expect(valid.motion).toEqual({ intensityScale: 0.35, speedScale: 1.8 });
    expect(valid.accessibility.parallax).toBe(false);
    for (const motion of [
      { intensityScale: -0.01 },
      { intensityScale: 1.01 },
      { intensityScale: NaN },
      { speedScale: 0.49 },
      { speedScale: 2.01 },
      { speedScale: Infinity },
      { duration: "100ms" },
    ])
      expect(() => themeSchema.parse({ ...legacy, motion })).toThrow();
    expect(() =>
      themeSchema.parse({ ...legacy, accessibility: { parallax: "false" } }),
    ).toThrow();
    expect(() =>
      themeSchema.parse({
        ...legacy,
        accessibility: { css: "*{display:none}" },
      }),
    ).toThrow();
  });
  it("MOT-008 composes theme scalars with user choices and preserves fail-safe bounds", () => {
    expect(
      readMotionSettings({
        motionIntensity: "0.8",
        motionSpeed: "1.5",
        themeMotionIntensity: "0.5",
        themeMotionSpeed: "1.5",
      }),
    ).toEqual({ intensity: 0.4, speed: 2 });
    expect(
      readMotionSettings({
        motionIntensity: "1",
        motionSpeed: "0.5",
        themeMotionIntensity: "1",
        themeMotionSpeed: "0.5",
      }),
    ).toEqual({ intensity: 1, speed: 0.5 });
    expect(
      readMotionSettings({
        themeMotionIntensity: "1e9",
        themeMotionSpeed: "url(javascript:bad)",
      }),
    ).toEqual({ intensity: 1, speed: 1 });
    expect(readThemeParallax("false")).toBe(false);
    expect(readThemeParallax("true")).toBe(true);
    expect(readThemeParallax("unexpected")).toBe(false);
    expect(readThemeParallax(undefined)).toBe(true);
  });
  it("MOT-009 disables only parallax layers when the selected theme disallows them", () => {
    const target = new EventTarget();
    const win = Object.assign(target, { innerHeight: 800 });
    vi.stubGlobal("window", win);
    vi.stubGlobal("requestAnimationFrame", () => 1);
    vi.stubGlobal("cancelAnimationFrame", () => undefined);
    vi.stubGlobal("matchMedia", () =>
      Object.assign(new EventTarget(), { matches: false }),
    );
    vi.stubGlobal("localStorage", { getItem: () => null });
    const requests: string[] = [];
    const root = {
      dataset: { motion: "cinematic", themeParallax: "false" },
      querySelector: () => null,
      querySelectorAll: (selector: string) => {
        requests.push(selector);
        return [];
      },
    };
    const dispose = enhanceSite(root as unknown as HTMLElement);
    expect(
      (root.dataset as typeof root.dataset & { motionEnabled?: string })
        .motionEnabled,
    ).toBe("true");
    expect(requests).not.toContain(".scenery-layer[data-depth]");
    dispose();
  });
  it("THM-MOT-003 carries validated settings into shared static rendering without changing content", () => {
    const registry = createThemeRegistry({
      gentle: {
        ...themes.ink,
        name: "Gentle",
        motion: { intensityScale: 0.35, speedScale: 1.8 },
        accessibility: { parallax: false },
      },
    });
    const site = parseSite(
      { ...starterSite, theme: "gentle", motion: "cinematic" },
      registry,
    );
    const markup = renderToStaticMarkup(
      <Site site={site} themeRegistry={registry} />,
    );
    expect(markup).toContain('data-theme-motion-intensity="0.35"');
    expect(markup).toContain('data-theme-motion-speed="1.8"');
    expect(markup).toContain('data-theme-parallax="false"');
    expect(markup).toContain("Build something worth sharing");
    expect(site.sections).toEqual(starterSite.sections);
    expect(registry.gentle?.motion).toEqual({
      intensityScale: 0.35,
      speedScale: 1.8,
    });
  });
});
