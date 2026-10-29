import { expect, it } from "vitest";
import fc from "fast-check";
import { renderToStaticMarkup } from "react-dom/server";
import {
  parseSite,
  Site,
  starterSite,
  sectionDefinitions,
  themes,
  type SectionConfig,
} from "../packages/core/src/index";

it("THM-002 every section/theme contract preserves repeated content, safe links, hidden sections and fallback anchors", () => {
  for (const theme of Object.keys(themes))
    for (const type of Object.keys(
      sectionDefinitions,
    ) as SectionConfig["type"][]) {
      const site = parseSite({
        ...starterSite,
        theme,
        assets: [
          {
            id: "asset-pixel",
            mime: "image/png",
            data: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=",
            alt: "Contract pixel",
          },
        ],
        sections: [
          {
            id: "visible",
            type,
            heading: "",
            body: "Visible body",
            image: "asset-pixel",
            entries: [
              {
                id: "one",
                title: "Visible entry",
                body: "Entry body",
                url: "https://example.com",
                image: "asset-pixel",
              },
            ],
            link: "mailto:hello@example.com",
            linkLabel: "Write to me",
          },
          {
            id: "hidden",
            type,
            heading: "Hidden heading",
            body: "Secret unpublished draft",
            visible: false,
          },
        ],
      });
      const html = renderToStaticMarkup(<Site site={site} />);
      expect(html).toContain('href="#visible">Untitled section</a>');
      expect(html).toContain("Visible body");
      expect(html).toContain("Visible entry");
      expect(html).toContain("Entry body");
      expect(html).toContain('alt="Contract pixel"');
      expect(html).toContain('src="data:image/png;base64,');
      expect(html).toContain('href="https://example.com"');
      expect(html).toContain('href="mailto:hello@example.com"');
      expect(html).not.toContain("Hidden heading");
      expect(html).not.toContain("Secret unpublished draft");
      expect(html).not.toContain('href="#hidden"');
    }
});
it("CFG-007 serializing bounded section permutations preserves stable IDs and all content", () => {
  fc.assert(
    fc.property(
      fc.uniqueArray(fc.integer({ min: 0, max: 99 }), {
        minLength: 1,
        maxLength: 20,
      }),
      (ids) => {
        const sections = ids.map((id) => ({
          ...starterSite.sections[0]!,
          id: `section-${id}`,
          heading: `Heading ${id}`,
          body: `Body ${id}`,
        }));
        const source = parseSite({ ...starterSite, sections });
        const reordered = parseSite(
          JSON.parse(
            JSON.stringify({
              ...source,
              sections: [...source.sections].reverse(),
            }),
          ),
        );
        expect(
          new Map(reordered.sections.map((section) => [section.id, section])),
        ).toEqual(
          new Map(source.sections.map((section) => [section.id, section])),
        );
        expect(parseSite(reordered)).toEqual(reordered);
      },
    ),
    { seed: 20261028, numRuns: 60 },
  );
});
