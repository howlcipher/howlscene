import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import JSZip from "jszip";
import {
  createLayoutRegistry,
  layoutIds,
  parseSite,
  Site,
  sectionDefinitions,
  starterSite,
  themes,
  type LayoutRendererProps,
} from "../packages/core/src/index.js";
import {
  exportWebsite,
  importBackup,
  serializeBackup,
} from "../packages/export/src/index.js";

const registry = createLayoutRegistry([
  {
    id: "feature-frame",
    sectionTypes: ["hero", "custom"],
    renderer: ({
      section,
      image,
      intro,
      body,
      entries,
      cta,
    }: LayoutRendererProps) => (
      <article className="feature-frame" data-layout-section={section.id}>
        {intro}
        {image}
        <div className="feature-frame-copy">{body}</div>
        {entries}
        {cta}
      </article>
    ),
    styles:
      ".layout-feature-frame .feature-frame { display: grid; grid-template-columns: 1fr 1fr; }",
  },
]);

const customLayoutSite = {
  ...starterSite,
  sections: [
    {
      ...starterSite.sections[0]!,
      layout: "feature-frame",
      heading: "Custom composition",
      body: "Portable text in a registered layout.",
    },
  ],
};

it("CFG-LAYOUT-001 registers trusted layouts for preview, export and backups", async () => {
  const site = parseSite(customLayoutSite, themes, undefined, registry);
  const preview = renderToStaticMarkup(
    <Site site={site} layoutRegistry={registry} />,
  );

  expect(preview).toContain('class="feature-frame"');
  expect(preview).toContain('data-layout-section="intro"');
  expect(preview).toContain("Custom composition");
  expect(preview).toContain("Portable text in a registered layout.");
  expect(preview).toContain("grid-template-columns: 1fr 1fr");

  const zip = await JSZip.loadAsync(
    await exportWebsite(site, { layoutRegistry: registry }),
  );
  const html = await zip.file("index.html")!.async("string");
  expect(html).toContain('class="feature-frame"');
  expect(html).toContain("grid-template-columns: 1fr 1fr");
  expect(html).not.toContain("<script");
  const stylesheetPosition = html.indexOf("data-howls-layout-styles");
  expect(stylesheetPosition).toBeGreaterThan(-1);
  expect(stylesheetPosition).toBeLessThan(html.indexOf("</head>"));
  expect(html.indexOf("data-howls-layout-styles", html.indexOf("<body>"))).toBe(
    -1,
  );

  const backup = serializeBackup(site, themes, undefined, registry);
  expect(importBackup(backup, themes, undefined, registry)).toEqual(site);
  expect(backup).not.toContain("grid-template-columns");
});

it("CFG-LAYOUT-002 rejects malformed, conflicting and unregistered layouts", () => {
  const renderer = () => null;
  const valid = {
    id: "feature-frame",
    sectionTypes: ["hero"] as const,
    renderer,
  };

  for (const id of ["", "../escape", "Centered", "x".repeat(65), "wide"])
    expect(() => createLayoutRegistry([{ ...valid, id }])).toThrow();

  expect(() => createLayoutRegistry([valid, valid])).toThrow(/duplicate/i);
  expect(() =>
    createLayoutRegistry([{ ...valid, sectionTypes: ["hero", "hero"] }]),
  ).toThrow(/unique/i);
  expect(() => createLayoutRegistry([{ ...valid, sectionTypes: [] }])).toThrow(
    /section/i,
  );
  expect(() =>
    createLayoutRegistry([
      { ...valid, styles: "</style><script>alert(1)</script>" },
    ]),
  ).toThrow(/style/i);
  expect(() =>
    createLayoutRegistry([
      { ...valid, styles: '@import url("https://example.com");' },
    ]),
  ).toThrow(/style/i);
  expect(() =>
    createLayoutRegistry([{ ...valid, styles: "a".repeat(50_001) }]),
  ).toThrow(/50,000/i);
  expect(() =>
    createLayoutRegistry([
      { ...valid, renderer: "not a component" as unknown as typeof renderer },
    ]),
  ).toThrow(/renderer/i);

  expect(() => parseSite(customLayoutSite)).toThrow(/layout.*register/i);
  expect(() =>
    parseSite({
      ...customLayoutSite,
      sections: [{ ...customLayoutSite.sections[0], layout: "constructor" }],
    }),
  ).toThrow(/unsupported layout.*constructor/i);
  expect(() =>
    parseSite(
      {
        ...customLayoutSite,
        sections: [
          {
            ...customLayoutSite.sections[0],
            styles: ".evil { display: none }",
          },
        ],
      },
      themes,
      undefined,
      registry,
    ),
  ).toThrow();
  const incompatibleSite = {
    ...customLayoutSite,
    sections: [{ ...customLayoutSite.sections[0], type: "about" as const }],
  };
  expect(() =>
    parseSite(incompatibleSite, themes, undefined, registry),
  ).toThrow(/not supported.*about/i);
});

it("CFG-LAYOUT-003 preserves every previously accepted built-in section/layout pair", () => {
  for (const type of Object.keys(sectionDefinitions))
    for (const layout of layoutIds)
      expect(() =>
        parseSite({
          ...starterSite,
          sections: [
            {
              ...starterSite.sections[0]!,
              type,
              layout,
            },
          ],
        }),
      ).not.toThrow();
});

it("CFG-LAYOUT-004 returns independent deeply immutable registry entries", () => {
  expect(registry).not.toBe(createLayoutRegistry());
  expect(Object.isFrozen(registry)).toBe(true);
  expect(Object.isFrozen(registry["feature-frame"])).toBe(true);
  expect(Object.isFrozen(registry["feature-frame"]?.sectionTypes)).toBe(true);
  expect(createLayoutRegistry()).toHaveProperty("centered");
});
