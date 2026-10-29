import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  Site,
  createSectionRegistry,
  parseSite,
  starterSite,
  themes,
  type SectionRendererRegistry,
} from "../packages/core/src/index.js";
import {
  exportWebsite,
  importBackup,
  serializeBackup,
} from "../packages/export/src/index.js";
import JSZip from "jszip";

const customSite = {
  ...starterSite,
  sections: [
    {
      ...starterSite.sections[0]!,
      id: "notice",
      type: "custom",
      customType: "notice",
      heading: "A custom notice",
      body: "This content stays portable.",
    },
  ],
};

describe("registered custom sections", () => {
  const sectionRegistry = createSectionRegistry({}, [
    {
      id: "notice",
      renderer: ({ section }) => (
        <aside className="entry-cards">{section.body}</aside>
      ),
    },
  ]);

  it("parses, renders, exports and backs up registered section types", async () => {
    const site = parseSite(customSite, themes, sectionRegistry);
    expect(site.sections[0]?.customType).toBe("notice");
    const preview = renderToStaticMarkup(
      <Site site={site} sectionRegistry={sectionRegistry} />,
    );
    expect(preview).toContain("This content stays portable.");
    const zip = await JSZip.loadAsync(
      await exportWebsite(site, { sectionRegistry }),
    );
    const html = await zip.file("index.html")!.async("string");
    expect(html).toContain("This content stays portable.");
    const backup = serializeBackup(site, themes, sectionRegistry);
    expect(importBackup(backup, themes, sectionRegistry)).toEqual(site);
  });

  it("rejects unregistered and malformed custom section references", () => {
    expect(() => parseSite(customSite)).toThrow(/custom section|register/i);
    expect(() =>
      parseSite(customSite, themes, {
        "custom:notice": "not a renderer",
      } as unknown as SectionRendererRegistry),
    ).toThrow(/custom section|register/i);
    expect(() =>
      parseSite(
        {
          ...customSite,
          sections: [{ ...customSite.sections[0], customType: undefined }],
        },
        themes,
        sectionRegistry,
      ),
    ).toThrow();
    expect(() =>
      parseSite(
        {
          ...customSite,
          sections: [{ ...customSite.sections[0], customType: "missing" }],
        },
        themes,
        sectionRegistry,
      ),
    ).toThrow(/custom section|register/i);
    for (const invalid of ["../notice", "", "Bad ID", "x".repeat(65)])
      expect(() =>
        parseSite(
          {
            ...customSite,
            sections: [{ ...customSite.sections[0], customType: invalid }],
          },
          themes,
          sectionRegistry,
        ),
      ).toThrow();
  });

  it("renders imported custom text as inert escaped content", () => {
    const site = parseSite(
      {
        ...customSite,
        sections: [
          { ...customSite.sections[0], body: "<script>alert('no')</script>" },
        ],
      },
      themes,
      sectionRegistry,
    );
    const markup = renderToStaticMarkup(
      <Site site={site} sectionRegistry={sectionRegistry} />,
    );
    expect(markup).not.toContain("<script>alert('no')</script>");
    expect(markup).toContain("&lt;script&gt;");
  });

  it("requires unique safe extension IDs and registered renderer references", () => {
    const renderer = ({ section }: { section: { body: string } }) => (
      <p>{section.body}</p>
    );
    expect(() =>
      createSectionRegistry({}, [{ id: "projects", renderer }]),
    ).toThrow();
    expect(() =>
      createSectionRegistry({}, [
        { id: "notice", renderer },
        { id: "notice", renderer },
      ]),
    ).toThrow();
    expect(() =>
      createSectionRegistry({}, [{ id: "../escape", renderer }]),
    ).toThrow();
  });
});
