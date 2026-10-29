import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import JSZip from "jszip";
import {
  Site,
  parseSite,
  starterSite,
  themeSchema,
  themeOverridesSchema,
  createThemeRegistry,
  resolveTheme,
  contrastRatio,
  type ThemeManifestInput,
  themes,
} from "../packages/core/src/index";
import { exportWebsite } from "../packages/export/src/index";
const defaults = {
  bodyLineHeight: 1.8,
  cardGapRem: 1.5,
  cardRadiusRem: 0.7,
  cardStyle: "outlined",
  headingTreatment: "plain",
  navigationGapRem: 1.2,
  navigationStyle: "plain",
  mobileNavigationLayout: "wrap",
};
// Token-only manifests remain accepted at existing public authoring boundaries.
const legacy: ThemeManifestInput = {
  name: "Legacy custom",
  background: "#ffffff",
  foreground: "#111111",
  accent: "#000000",
  font: "system-ui, sans-serif",
};
const custom = {
  ...legacy,
  presentation: {
    bodyLineHeight: 1.6,
    cardGapRem: 2,
    cardRadiusRem: 0.2,
    cardStyle: "glow" as const,
    headingTreatment: "accent-rule" as const,
    navigationGapRem: 2.4,
    navigationStyle: "underline" as const,
    mobileNavigationLayout: "wrap" as const,
  },
};
describe("validated theme presentation", () => {
  it("EDT-010 validates editable background and text colors with accent contrast against the selected background", async () => {
    expect(
      themeOverridesSchema.parse({
        background: "#ededed",
        foreground: "#101010",
      }),
    ).toEqual({ background: "#ededed", foreground: "#101010" });
    for (const invalid of [
      { background: "url(javascript:bad)" },
      { foreground: "red" },
      { background: "#fff" },
      { css: "body{display:none}" },
    ])
      expect(() => themeOverridesSchema.parse(invalid)).toThrow();

    const overrides = {
      background: "#767676",
      foreground: "#767676",
      accent: "#767676",
    };
    const result = resolveTheme(themes.modern, overrides);
    expect(result.tokens.background).toBe("#767676");
    expect(result.tokens.foreground).toBe("#000000");
    expect(result.tokens.accent).toBe("#000000");
    expect(
      contrastRatio(result.tokens.accent, result.tokens.background),
    ).toBeGreaterThanOrEqual(4.5);
    expect(overrides).toEqual({
      background: "#767676",
      foreground: "#767676",
      accent: "#767676",
    });
    const site = parseSite({ ...starterSite, overrides });
    const preview = renderToStaticMarkup(<Site site={site} />);
    const archive = await JSZip.loadAsync(await exportWebsite(site));
    const exported = await archive.file("index.html")!.async("string");
    for (const markup of [preview, exported]) {
      expect(markup).toContain("--scene-bg:#767676");
      expect(markup).toContain("--scene-fg:#000000");
      expect(markup).toContain("--scene-accent:#000000");
    }
  });
  it("EDT-011 validates and resolves creator presentation overrides for cards and navigation", async () => {
    const overrides = {
      cardStyle: "soft",
      navigationStyle: "underline",
      mobileNavigationLayout: "wrap",
    } as const;
    expect(themeOverridesSchema.parse(overrides)).toEqual(overrides);
    for (const invalid of [
      { cardStyle: "arbitrary-css" },
      { navigationStyle: "url(javascript:alert(1))" },
      { mobileNavigationLayout: "scroll" },
      { cardStyle: "soft;display:none" },
    ])
      expect(() => themeOverridesSchema.parse(invalid)).toThrow();

    const site = parseSite({ ...starterSite, overrides });
    const resolved = resolveTheme(themes.cyber, site.overrides).tokens;
    expect(resolved.presentation).toMatchObject(overrides);
    expect(site.sections).toEqual(starterSite.sections);

    const preview = renderToStaticMarkup(<Site site={site} />);
    const zip = await JSZip.loadAsync(await exportWebsite(site));
    const html = await zip.file("index.html")!.async("string");
    for (const markup of [preview, html]) {
      expect(markup).toContain('data-theme-card-style="soft"');
      expect(markup).toContain('data-theme-navigation-style="underline"');
      expect(markup).toContain('data-theme-mobile-navigation="wrap"');
    }
  });
  it("THM-A11Y-001 resolves low-contrast theme text in preview and static export", async () => {
    const inaccessible = {
      ...legacy,
      background: "#b0b0b0",
      foreground: "#aaaaaa",
    };
    const original = JSON.stringify(inaccessible);
    const result = resolveTheme(inaccessible);
    expect(result.tokens.foreground).toBe("#000000");
    expect(
      contrastRatio(result.tokens.foreground, result.tokens.background),
    ).toBeGreaterThanOrEqual(4.5);
    expect(result.warnings).toContain(
      "The theme text color is difficult to read against its background. A higher-contrast color is shown; the theme's saved colors are unchanged.",
    );
    expect(JSON.stringify(inaccessible)).toBe(original);

    const registry = createThemeRegistry({ inaccessible });
    const site = parseSite({ ...starterSite, theme: "inaccessible" }, registry);
    const html = renderToStaticMarkup(
      <Site site={site} themeRegistry={registry} />,
    );
    expect(html).toContain("--scene-fg:#000000");
    const archive = await JSZip.loadAsync(
      await exportWebsite(site, { themeRegistry: registry }),
    );
    const exported = await archive.file("index.html")!.async("string");
    expect(exported).toContain("--scene-fg:#000000");
    expect(exported).toContain(starterSite.sections[0]!.heading);
    expect(themes.modern.foreground).toBe("#162439");
    expect(
      contrastRatio(themes.modern.foreground, themes.modern.background),
    ).toBeGreaterThanOrEqual(4.5);
  });
  it("THM-RESP-001 normalizes the mobile navigation layout and preserves legacy themes", () => {
    expect(themeSchema.parse(legacy).presentation.mobileNavigationLayout).toBe(
      "wrap",
    );
    expect(themes.modern.presentation.mobileNavigationLayout).toBe("wrap");
    expect(themes.ink.presentation.mobileNavigationLayout).toBe("wrap");
    expect(themes.cyber.presentation.mobileNavigationLayout).toBe("stack");
    expect(
      themeSchema.parse({
        ...legacy,
        presentation: { mobileNavigationLayout: "stack" },
      }).presentation.mobileNavigationLayout,
    ).toBe("stack");
    for (const mobileNavigationLayout of ["scroll", "grid", "url(bad)", ""])
      expect(() =>
        themeSchema.parse({
          ...legacy,
          presentation: { mobileNavigationLayout },
        }),
      ).toThrow();
  });
  it("THM-CARD-001 normalizes safe shared card treatments", () => {
    expect(themeSchema.parse(legacy).presentation.cardStyle).toBe("outlined");
    expect(themes.modern.presentation.cardStyle).toBe("outlined");
    expect(themes.ink.presentation.cardStyle).toBe("soft");
    expect(themes.cyber.presentation.cardStyle).toBe("glow");
    expect(
      themeSchema.parse({
        ...legacy,
        presentation: { cardStyle: "glow" },
      }).presentation.cardStyle,
    ).toBe("glow");
    for (const cardStyle of ["arbitrary-css", "url(javascript:alert(1))", ""])
      expect(() =>
        themeSchema.parse({ ...legacy, presentation: { cardStyle } }),
      ).toThrow();
  });
  it("THM-NAV-001 normalizes safe navigation treatments and keeps them theme-owned", () => {
    expect(themeSchema.parse(legacy).presentation.navigationStyle).toBe(
      "plain",
    );
    expect(themes.modern.presentation.navigationStyle).toBe("plain");
    expect(themes.ink.presentation.navigationStyle).toBe("underline");
    expect(themes.cyber.presentation.navigationStyle).toBe("framed");
    expect(
      themeSchema.parse({
        ...legacy,
        presentation: { navigationStyle: "underline" },
      }).presentation.navigationStyle,
    ).toBe("underline");
    for (const navigationStyle of [
      "arbitrary-css",
      "url(javascript:alert(1))",
      "",
    ])
      expect(() =>
        themeSchema.parse({ ...legacy, presentation: { navigationStyle } }),
      ).toThrow();
  });
  it("THM-COMP-001 validates bounded section-heading treatments and shares them with export", async () => {
    expect(themeSchema.parse(legacy).presentation.headingTreatment).toBe(
      "plain",
    );
    expect(themes.modern.presentation.headingTreatment).toBe("plain");
    expect(themes.ink.presentation.headingTreatment).toBe("accent-rule");
    expect(themes.cyber.presentation.headingTreatment).toBe("accent-rail");
    for (const headingTreatment of [
      "arbitrary-css",
      "url(javascript:alert(1))",
      "",
    ])
      expect(() =>
        themeSchema.parse({
          ...legacy,
          presentation: { headingTreatment },
        }),
      ).toThrow();

    const registry = createThemeRegistry({
      "custom-rule": {
        ...themes.ink,
        name: "Custom rule",
        presentation: {
          ...themes.ink.presentation,
          headingTreatment: "accent-rule",
        },
      },
    });
    const site = parseSite(
      { ...starterSite, theme: "custom-rule", motion: "none" },
      registry,
    );
    const preview = renderToStaticMarkup(
      <Site site={site} themeRegistry={registry} />,
    );
    const archive = await JSZip.loadAsync(
      await exportWebsite(site, { themeRegistry: registry }),
    );
    const html = await archive.file("index.html")!.async("string");
    const css = await archive.file("site.css")!.async("string");
    for (const markup of [preview, html])
      expect(markup).toContain('data-theme-heading-treatment="accent-rule"');
    expect(css).toContain(
      '.howlscene[data-theme-heading-treatment="accent-rule"] .scene-content > h2',
    );
    expect(site.sections).toEqual(starterSite.sections);
  });
  it("THM-PRE-001 legacy manifests and partial settings normalize immutable, isolated, idempotent defaults", () => {
    const original = JSON.stringify(legacy);
    const normalized = themeSchema.parse(legacy);
    expect(normalized.presentation).toEqual(defaults);
    expect(themeSchema.parse(normalized)).toEqual(normalized);
    expect(JSON.stringify(legacy)).toBe(original);
    expect(Object.isFrozen(normalized)).toBe(true);
    expect(Object.isFrozen(normalized.presentation)).toBe(true);
    const first = themeSchema.parse({
      ...legacy,
      presentation: { cardGapRem: 2 },
    });
    const second = themeSchema.parse(legacy);
    expect(first.presentation).toEqual({ ...defaults, cardGapRem: 2 });
    expect(second.presentation).toEqual(defaults);
    expect(first.presentation).not.toBe(second.presentation);
    expect(createThemeRegistry({ legacy }).legacy?.presentation).toEqual(
      defaults,
    );
    expect(resolveTheme(legacy).tokens.presentation).toEqual(defaults);
  });
  it("THM-PRE-002 accepts bounded finite numeric values and rejects unsafe or unknown settings", () => {
    const limits = [
      ["bodyLineHeight", 1.5, 2.2],
      ["cardGapRem", 0.5, 3],
      ["cardRadiusRem", 0, 2],
      ["navigationGapRem", 0.5, 3],
    ] as const;
    for (const [key, min, max] of limits) {
      for (const value of [min, max])
        expect(
          themeSchema.parse({ ...legacy, presentation: { [key]: value } })
            .presentation[key],
        ).toBe(value);
      for (const value of [
        min - 0.01,
        max + 0.01,
        NaN,
        Infinity,
        -Infinity,
        "1rem",
        null,
        {},
      ])
        expect(
          () =>
            themeSchema.parse({ ...legacy, presentation: { [key]: value } }),
          `${key}: ${String(value)}`,
        ).toThrow();
    }
    for (const presentation of [
      null,
      [],
      { css: "color:red" },
      { bodyLineHeight: "url(javascript:alert(1))" },
      { cardGapRem: 1, style: "display:none" },
    ])
      expect(() => themeSchema.parse({ ...legacy, presentation })).toThrow();
  });
  it("THM-PRE-003 theme and existing user overrides compose without changing content or source settings", () => {
    const before = JSON.stringify(custom);
    const registry = createThemeRegistry({ custom });
    const site = parseSite(
      {
        ...starterSite,
        theme: "custom",
        overrides: { accent: "#000000", font: "mono" },
      },
      registry,
    );
    const tokens = resolveTheme(registry.custom!, site.overrides).tokens;
    expect(tokens.presentation).toEqual(custom.presentation);
    expect(tokens.font).toBe("ui-monospace, monospace");
    expect(tokens.accent).toBe("#000000");
    expect(site.sections).toEqual(starterSite.sections);
    expect(JSON.stringify(custom)).toBe(before);
  });
  it("THM-PRE-004 shared preview and standalone export render the same presentation values and content", async () => {
    const registry = createThemeRegistry({ custom });
    const site = parseSite(
      { ...starterSite, theme: "custom", motion: "none" },
      registry,
    );
    const preview = renderToStaticMarkup(
      <Site site={site} themeRegistry={registry} />,
    );
    const zip = await JSZip.loadAsync(
      await exportWebsite(site, { themeRegistry: registry }),
    );
    const html = await zip.file("index.html")!.async("string");
    for (const expected of [
      "--scene-body-line-height:1.6",
      "--scene-card-gap:2rem",
      "--scene-card-radius:0.2rem",
      "--scene-nav-gap:2.4rem",
      site.sections[0]!.heading,
    ]) {
      expect(preview).toContain(expected);
      expect(html).toContain(expected);
    }
    expect(preview).toContain('data-theme-navigation-style="underline"');
    expect(html).toContain('data-theme-navigation-style="underline"');
    expect(preview).toContain('data-theme-card-style="glow"');
    expect(html).toContain('data-theme-card-style="glow"');
    expect(preview).toContain('data-theme-mobile-navigation="wrap"');
    expect(html).toContain('data-theme-mobile-navigation="wrap"');
    expect(html).not.toContain("<script");
    expect(site.sections).toEqual(starterSite.sections);
  });
});
