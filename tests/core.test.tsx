import { describe, expect, it } from "vitest";
import fc from "fast-check";
import { renderToStaticMarkup } from "react-dom/server";
import {
  parseSite,
  starterSite,
  Site,
  themes,
} from "../packages/core/src/index";
import { exportWebsite } from "../packages/export/src/index";
import JSZip from "jszip";

describe("configuration and rendering contracts", () => {
  it("CFG-001 CFG-002 normalizes defaults without mutating input", () => {
    const input = {
      schemaVersion: 1,
      title: "My website",
      sections: [{ id: "intro", type: "hero", heading: "Hello" }],
    };
    const result = parseSite(input);
    expect(result.theme).toBe("modern");
    expect(result.sections[0]?.visible).toBe(true);
    expect(input).not.toHaveProperty("theme");
  });
  it("CFG-003 CFG-004 rejects malformed and future projects", () => {
    expect(() => parseSite({ ...starterSite, schemaVersion: 2 })).toThrow(
      /version/i,
    );
    expect(() =>
      parseSite({
        ...starterSite,
        sections: [{ id: "../escape", type: "hero" }],
      }),
    ).toThrow();
    expect(() => parseSite({ ...starterSite, unknown: "data" })).toThrow();
  });
  it("CFG-003 rejects reserved navigation anchors", () => {
    expect(() =>
      parseSite({
        ...starterSite,
        sections: [{ id: "site-content", type: "hero", heading: "Collision" }],
      }),
    ).toThrow(/reserved/i);
  });
  it("CFG-007 rejects duplicate section IDs", () => {
    expect(() =>
      parseSite({
        ...starterSite,
        sections: [starterSite.sections[0], starterSite.sections[0]],
      }),
    ).toThrow(/unique/i);
  });
  it("THM-001 THM-003 themes preserve content and normalize idempotently", () => {
    fc.assert(
      fc.property(fc.string({ maxLength: 100 }), (heading) => {
        const source = parseSite({
          ...starterSite,
          sections: [{ id: "intro", type: "hero", heading }],
        });
        for (const theme of Object.keys(themes)) {
          const site = parseSite({ ...source, theme });
          expect(site.sections).toEqual(source.sections);
          expect(parseSite(site)).toEqual(site);
        }
      }),
      { seed: 83201, numRuns: 60 },
    );
  });
  it("TXT-003 escapes text rather than interpreting HTML", () => {
    const site = parseSite({
      ...starterSite,
      title: "<script>alert(1)</script>",
    });
    const html = renderToStaticMarkup(<Site site={site} />);
    expect(html).toContain("&lt;script&gt;");
    expect(html).not.toContain("<script>");
  });
});

describe("portable website export", () => {
  it("EXP-001 EXP-006 EXP-007 EXP-009 produces deterministic meaningful standalone HTML", async () => {
    const bytes = await exportWebsite(starterSite);
    expect(await exportWebsite(starterSite)).toEqual(bytes);
    const zip = await JSZip.loadAsync(bytes);
    const html = await zip.file("index.html")!.async("string");
    expect(html).toContain("Build something worth sharing");
    expect(html).toContain("<title>My website</title>");
    expect(html).toContain('href="./site.css"');
    expect(html).not.toContain("apps/editor");
    expect(html).not.toContain("<script");
    expect(zip.file("site.css")).not.toBeNull();
    expect(zip.file("PUBLISH.txt")).not.toBeNull();
    const publishing = await zip.file("PUBLISH.txt")!.async("string");
    expect(publishing).toContain("Cloudflare Pages");
    expect(publishing).toContain("GitHub Pages");
    expect(publishing).toContain("No code or build step is required");
  });
  it("EXP-011 rejects invalid data before producing output", async () => {
    await expect(
      exportWebsite({ ...starterSite, title: 42 }),
    ).rejects.toThrow();
  });
});

it("THM-002 projects render entries identically in every bundled theme", () => {
  for (const theme of Object.keys(themes)) {
    const site = parseSite({
      ...starterSite,
      theme,
      sections: [
        {
          id: "work",
          type: "projects",
          heading: "Selected work",
          entries: [
            {
              id: "first",
              title: "Useful tools",
              body: "Built for people",
              url: "https://example.com",
            },
          ],
        },
      ],
    });
    const html = renderToStaticMarkup(<Site site={site} />);
    expect(html).toContain("Useful tools");
    expect(html).toContain('href="https://example.com"');
  }
});
it("AST-005 background images keep descriptive text and safe asset references", () => {
  const site = parseSite({
    ...starterSite,
    assets: [
      {
        id: "asset-background",
        mime: "image/png",
        data: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=",
        alt: "Green woodland",
      },
    ],
    sections: [
      {
        ...starterSite.sections[0],
        image: "asset-background",
        imageTreatment: "background",
      },
    ],
  });
  expect(renderToStaticMarkup(<Site site={site} />)).toContain(
    "scene-background-image",
  );
});
it("CFG-002 guided presentation settings validate and reach both shared renderers", () => {
  const site = parseSite({
    ...starterSite,
    sections: [
      {
        ...starterSite.sections[0],
        spacing: "compact",
        alignment: "start",
        contentWidth: "narrow",
        imagePosition: "top",
      },
    ],
  });
  const html = renderToStaticMarkup(<Site site={site} />);
  expect(html).toContain("spacing-compact");
  expect(html).toContain("align-start");
  expect(html).toContain("width-narrow");
  expect(() =>
    parseSite({
      ...site,
      sections: [{ ...site.sections[0], spacing: "999px" }],
    }),
  ).toThrow();
});
