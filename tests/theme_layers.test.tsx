import { expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import JSZip from "jszip";
import fc from "fast-check";
import {
  Site,
  createArtworkRegistry,
  createThemeRegistry,
  parseSite,
  starterSite,
  themes,
  resolveTheme,
} from "../packages/core/src/index";
import {
  exportWebsite,
  importBackup,
  serializeBackup,
} from "../packages/export/src/index";

function artwork() {
  return createArtworkRegistry({
    "forest-canopy": {
      render: () => (
        <circle data-original-art="forest-canopy" cx="720" cy="200" r="160" />
      ),
    },
  });
}
function forest() {
  return {
    ...themes.ink,
    name: "Forest",
    layers: [
      { id: "canopy", artwork: "forest-canopy", depth: 0.3, opacity: 0.2 },
    ],
  };
}
it("THM-EXT-001 a fourth theme declares scenery independently of generic rendering and motion", () => {
  const artworkRegistry = artwork();
  const themeRegistry = createThemeRegistry(
    { forest: forest() },
    artworkRegistry,
  );
  const site = parseSite({ ...starterSite, theme: "forest" }, themeRegistry);
  const html = renderToStaticMarkup(
    <Site
      site={site}
      themeRegistry={themeRegistry}
      artworkRegistry={artworkRegistry}
    />,
  );
  expect(html).toContain('data-original-art="forest-canopy"');
  expect(html).toContain('data-depth="0.3"');
  expect(html).toContain("opacity:0.2");
  expect(html).not.toContain("scenery-mountains");
  expect(site.sections).toEqual(parseSite(starterSite).sections);
  expect(themes).not.toHaveProperty("forest");
  expect(createArtworkRegistry()).not.toHaveProperty("forest-canopy");
  expect(Object.isFrozen(artworkRegistry)).toBe(true);
});
it("THM-EXT-002 layers reject unknown artwork, duplicate IDs, unsafe identifiers and unbounded parameters", () => {
  const registry = artwork();
  const valid = forest().layers[0]!;
  for (const layers of [
    [{ ...valid, artwork: "missing" }],
    [valid, valid],
    [{ ...valid, id: "../escape" }],
    [{ ...valid, depth: 1.01 }],
    [{ ...valid, depth: -1.01 }],
    [{ ...valid, depth: Number.NaN }],
    [{ ...valid, opacity: 1.1 }],
    [{ ...valid, opacity: -0.1 }],
    [{ ...valid, style: "url(javascript:alert(1))" }],
  ]) {
    expect(() =>
      createThemeRegistry({ forest: { ...forest(), layers } }, registry),
    ).toThrow();
  }
  expect(() =>
    createArtworkRegistry({ "../escape": { render: () => <circle /> } }),
  ).toThrow();
  expect(() =>
    createArtworkRegistry({
      safe: { render: () => <circle />, className: 'bad" onclick=alert(1)' },
    }),
  ).toThrow();
});
it("THM-EXT-003 custom layered scenery survives portable backup and standalone static export", async () => {
  const artworkRegistry = artwork();
  const themeRegistry = createThemeRegistry(
    { forest: forest() },
    artworkRegistry,
  );
  const site = parseSite(
    { ...starterSite, theme: "forest", motion: "none" },
    themeRegistry,
  );
  const backup = serializeBackup(site, themeRegistry);
  expect(backup).not.toContain("forest-canopy");
  const restored = importBackup(backup, themeRegistry);
  expect(restored).toEqual(site);
  const bytes = await exportWebsite(restored, {
    themeRegistry,
    artworkRegistry,
  });
  const zip = await JSZip.loadAsync(bytes);
  const html = await zip.file("index.html")!.async("string");
  expect(html).toContain('data-original-art="forest-canopy"');
  expect(html).toContain(site.sections[0]!.heading);
  expect(html).toContain('href="./site.css"');
  expect(html).not.toContain("<script");
  expect(() => createThemeRegistry({ forest: forest() })).toThrow(/artwork/i);
});

it("THM-EXT-004 token-only legacy themes retain the quiet default scenery", () => {
  const themeRegistry = createThemeRegistry({
    legacy: {
      name: "Legacy tokens",
      background: "#eee9dc",
      foreground: "#263b36",
      accent: "#496052",
      font: "Georgia, serif",
    },
  });
  const site = parseSite({ ...starterSite, theme: "legacy" }, themeRegistry);
  const html = renderToStaticMarkup(
    <Site site={site} themeRegistry={themeRegistry} />,
  );
  expect(html).toContain("scenery-orbit");
  expect(html).not.toContain("scenery-mountains");
  expect(Object.isFrozen(themeRegistry.legacy?.layers)).toBe(true);
  expect(Object.isFrozen(themeRegistry.legacy?.layers[0])).toBe(true);
});
it("THM-EXT-005 layer count, empty scenery, depth limits and zero opacity have explicit boundaries", () => {
  const artworkRegistry = artwork();
  const layers = Array.from({ length: 12 }, (_, index) => ({
    id: `layer-${index}`,
    artwork: "forest-canopy",
    depth: index % 2 ? -1 : 1,
  }));
  expect(
    createThemeRegistry({ forest: { ...forest(), layers } }, artworkRegistry)
      .forest?.layers,
  ).toHaveLength(12);
  expect(() =>
    createThemeRegistry(
      {
        forest: {
          ...forest(),
          layers: [...layers, { ...layers[0]!, id: "extra" }],
        },
      },
      artworkRegistry,
    ),
  ).toThrow();
  const empty = createThemeRegistry(
    { forest: { ...forest(), layers: [] } },
    artworkRegistry,
  );
  const site = parseSite({ ...starterSite, theme: "forest" }, empty);
  expect(
    renderToStaticMarkup(
      <Site
        site={site}
        themeRegistry={empty}
        artworkRegistry={artworkRegistry}
      />,
    ),
  ).not.toContain("scenery-layer");
  const zero = createThemeRegistry(
    {
      forest: {
        ...forest(),
        layers: [
          { id: "zero", artwork: "forest-canopy", depth: -1, opacity: 0 },
        ],
      },
    },
    artworkRegistry,
  );
  const html = renderToStaticMarkup(
    <Site site={site} themeRegistry={zero} artworkRegistry={artworkRegistry} />,
  );
  expect(html).toContain("opacity:0");
  expect(html).toContain('data-depth="-1"');
});
it("THM-EXT-006 registries isolate and freeze metadata without freezing the author's input", () => {
  const layer = { ...forest().layers[0]! };
  const authored = { ...forest(), layers: [layer] };
  const definition = { render: () => <circle />, className: "original" };
  const artworkRegistry = createArtworkRegistry({
    "forest-canopy": definition,
  });
  const themeRegistry = createThemeRegistry(
    { forest: authored },
    artworkRegistry,
  );
  layer.depth = 0.9;
  authored.layers.push({ ...layer, id: "new-layer" });
  definition.className = "changed";
  expect(themeRegistry.forest?.layers).toHaveLength(1);
  expect(themeRegistry.forest?.layers[0]?.depth).toBe(0.3);
  expect(artworkRegistry["forest-canopy"]?.className).toBe("original");
  expect(Object.isFrozen(themeRegistry.forest)).toBe(true);
  expect(Object.isFrozen(themeRegistry.forest?.layers[0])).toBe(true);
  expect(Object.isFrozen(artworkRegistry["forest-canopy"])).toBe(true);
});
it("THM-EXT-007 invalid executable definitions and render results cannot produce a successful export", async () => {
  // Reflect simulates an untyped JavaScript caller at the runtime boundary.
  for (const render of [
    "<script>alert(1)</script>",
    async () => <circle />,
    function* () {
      yield <circle />;
    },
    async function* () {
      yield <circle />;
    },
  ]) {
    expect(() =>
      Reflect.apply(createArtworkRegistry, undefined, [{ unsafe: { render } }]),
    ).toThrow(/synchronous|function/i);
  }
  const themeRegistry = createThemeRegistry({ forest: forest() }, artwork());
  const site = parseSite({ ...starterSite, theme: "forest" }, themeRegistry);
  for (const value of ["not a React element", Promise.resolve(<circle />)]) {
    const artworkRegistry = {
      ...artwork(),
      "forest-canopy": { render: () => value },
    };
    await expect(
      Reflect.apply(exportWebsite, undefined, [
        site,
        { themeRegistry, artworkRegistry },
      ]),
    ).rejects.toThrow(/React element|synchronously/);
  }
  const artworkRegistry = createArtworkRegistry({
    "forest-canopy": {
      render: () => {
        throw new Error("Artwork failed");
      },
    },
  });
  await expect(
    exportWebsite(site, { themeRegistry, artworkRegistry }),
  ).rejects.toThrow("Artwork failed");
});

it("THM-EXT-008 artwork registration rejects reserved object identifiers", () => {
  for (const id of ["constructor", "prototype", "__proto__"]) {
    const input = Object.fromEntries([[id, { render: () => <circle /> }]]);
    expect(() => createArtworkRegistry(input)).toThrow();
  }
});

it("THM-EXT-009 the token resolver still accepts the previous public manifest shape", () => {
  const resolved = resolveTheme({
    version: "1.0.0",
    description: "Legacy token input",
    name: "Legacy",
    background: "#eee9dc",
    foreground: "#263b36",
    accent: "#496052",
    font: "Georgia, serif",
  });
  expect(resolved.tokens.layers).toHaveLength(3);
  expect(resolved.tokens.background).toBe("#eee9dc");
});

it("THM-EXT-010 layer normalization is idempotent for bounded generated scenes", () => {
  fc.assert(
    fc.property(
      fc.array(
        fc.record({
          depth: fc.double({ min: -1, max: 1, noNaN: true }),
          opacity: fc.option(fc.double({ min: 0, max: 1, noNaN: true }), {
            nil: undefined,
          }),
        }),
        { maxLength: 12 },
      ),
      (values) => {
        const layers = values.map((value, index) => ({
          id: `layer-${index}`,
          artwork: "forest-canopy",
          ...value,
        }));
        const original = structuredClone(layers);
        const artworkRegistry = artwork();
        const first = createThemeRegistry(
          { forest: { ...forest(), layers } },
          artworkRegistry,
        );
        const second = createThemeRegistry(
          { forest: first.forest! },
          artworkRegistry,
        );
        expect(second).toEqual(first);
        expect(layers).toEqual(original);
      },
    ),
    { seed: 23614, numRuns: 60 },
  );
});
it("THM-EXT-011 an explicitly empty artwork callback preserves semantic content", () => {
  const artworkRegistry = createArtworkRegistry({
    "forest-canopy": { render: () => null },
  });
  const themeRegistry = createThemeRegistry(
    { forest: forest() },
    artworkRegistry,
  );
  const site = parseSite({ ...starterSite, theme: "forest" }, themeRegistry);
  const html = renderToStaticMarkup(
    <Site
      site={site}
      themeRegistry={themeRegistry}
      artworkRegistry={artworkRegistry}
    />,
  );
  expect(html).toContain(site.sections[0]!.heading);
  expect(html).toContain('data-depth="0.3"');
  expect(html).not.toContain("<circle");
});
