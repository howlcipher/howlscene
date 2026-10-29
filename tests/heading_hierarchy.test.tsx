import { expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import {
  Site,
  parseSite,
  starterSite,
  RichText,
  richTextSchema,
} from "../packages/core/src/index";

const richText = richTextSchema.parse([
  { type: "heading", level: 2, spans: [{ text: "Topic" }] },
  { type: "heading", level: 3, spans: [{ text: "Detail" }] },
]);
function headings(html: string) {
  return [...html.matchAll(/<h([1-6])[^>]*>(.*?)<\/h[1-6]>/g)].map((match) => [
    Number(match[1]),
    match[2],
  ]);
}
it("A11Y-005 reordered first projects and later gallery use headings relative to their owning section", () => {
  const site = parseSite({
    ...starterSite,
    sections: [
      {
        id: "projects",
        type: "projects",
        heading: "Projects",
        entries: [{ id: "project-one", title: "Tool" }],
      },
      {
        id: "gallery",
        type: "gallery",
        heading: "Gallery",
        entries: [{ id: "image-one", title: "Landscape" }],
      },
    ],
  });
  const html = renderToStaticMarkup(<Site site={site} />);
  expect(html).toContain('<h2 class="entry-title">Tool</h2>');
  expect(headings(html)).toEqual([
    [1, "Projects"],
    [2, "Tool"],
    [2, "Gallery"],
    [3, "Landscape"],
  ]);
  const reordered = parseSite({
    ...site,
    sections: [site.sections[1], site.sections[0]],
  });
  expect(headings(renderToStaticMarkup(<Site site={reordered} />))).toEqual([
    [1, "Gallery"],
    [2, "Landscape"],
    [2, "Projects"],
    [3, "Tool"],
  ]);
});
it("TXT-004 nested rich headings adapt to the owning section without changing portable content or standalone semantics", () => {
  const site = parseSite({
    ...starterSite,
    sections: [
      { id: "first", type: "rich_text", heading: "First", richText },
      { id: "second", type: "rich_text", heading: "Second", richText },
    ],
  });
  expect(headings(renderToStaticMarkup(<Site site={site} />))).toEqual([
    [1, "First"],
    [2, "<span>Topic</span>"],
    [3, "<span>Detail</span>"],
    [2, "Second"],
    [3, "<span>Topic</span>"],
    [4, "<span>Detail</span>"],
  ]);
  expect(headings(renderToStaticMarkup(<RichText value={richText} />))).toEqual(
    [
      [2, "<span>Topic</span>"],
      [3, "<span>Detail</span>"],
    ],
  );
  expect(site.sections[1]?.richText).toEqual(richText);
  expect(renderToStaticMarkup(<Site site={site} />)).toContain(
    '<h4 class="rich-heading rich-heading-detail">',
  );
});
it("A11Y-005 blank headings have the same accessible fallback in navigation and semantic headings", () => {
  for (const heading of ["", "   "]) {
    const site = parseSite({
      ...starterSite,
      sections: [{ ...starterSite.sections[0]!, heading }],
    });
    const html = renderToStaticMarkup(<Site site={site} />);
    expect(html).toContain("<h1>Untitled section</h1>");
    expect(html).toContain('href="#intro">Untitled section</a>');
    expect(site.sections[0]?.heading).toBe(heading);
  }
});
