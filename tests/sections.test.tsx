import { expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import {
  createSectionRegistry,
  entriesSchema,
  SectionEntries,
} from "../packages/core/src/sections";
import { parseSite, sectionDefinitions } from "../packages/core/src/index";
const entry = {
  id: "work-one",
  title: "Useful tool",
  body: "A careful project",
  url: "https://example.com",
  image: "asset-one",
};
const section = parseSite({
  schemaVersion: 1,
  title: "Test",
  sections: [{ id: "work", type: "projects", heading: "Work" }],
}).sections[0]!;
it("section entries preserve portable content and reject unsafe links and asset paths", () => {
  expect(entriesSchema.parse([entry])).toEqual([entry]);
  for (const patch of [
    { url: "javascript:alert(1)" },
    { image: "../escape" },
    { id: "../escape" },
    { title: "x".repeat(301) },
  ])
    expect(() => entriesSchema.parse([{ ...entry, ...patch }])).toThrow();
  expect(() => entriesSchema.parse([entry, entry])).toThrow(/unique/);
});
it("shared entries render escaped card content and resolved image paths", () => {
  const html = renderToStaticMarkup(
    <SectionEntries
      section={{
        ...section,
        entries: [{ ...entry, title: "<script>bad</script>" }],
      }}
      assetUrl={(id) => `./assets/${id}.png`}
    />,
  );
  expect(html).toContain("<article");
  expect(html).toContain("&lt;script&gt;");
  expect(html).toContain('href="https://example.com"');
  expect(html).toContain('src="./assets/asset-one.png"');
  expect(html).not.toContain("<script>");
});
it("timeline and gallery choose meaningful shared structures", () => {
  const timeline = renderToStaticMarkup(
    <SectionEntries
      section={{ ...section, type: "experience", entries: [entry] }}
      assetUrl={() => "./a.png"}
    />,
  );
  expect(timeline).toContain("<ol");
  expect(timeline).toContain("<li");
  expect(timeline).toContain('data-readable-surface="solid"');
  const gallery = renderToStaticMarkup(
    <SectionEntries
      section={{ ...section, type: "gallery", entries: [entry] }}
      assetUrl={() => "./a.png"}
    />,
  );
  expect(gallery).toContain("<figure");
  expect(gallery).toContain("<figcaption");
});
it("does not render empty entry layouts or leave decorative spacing", () => {
  for (const type of ["projects", "experience", "gallery"] as const) {
    const html = renderToStaticMarkup(
      <SectionEntries
        section={{ ...section, type, entries: [] }}
        assetUrl={() => "./unused.png"}
      />,
    );
    expect(html).toBe("");
  }
});
it("all section types have defaults and custom registrations remain isolated", () => {
  const defaults = createSectionRegistry();
  expect(Object.keys(defaults).sort()).toEqual(
    Object.keys(sectionDefinitions).sort(),
  );
  const Custom = () => <p>Custom projects</p>;
  const custom = createSectionRegistry({ projects: Custom });
  expect(custom.projects).toBe(Custom);
  expect(defaults.projects).toBe(SectionEntries);
  expect(custom.about).toBe(defaults.about);
});
it("SDK-004 a custom section receives a fail-closed asset resolver", async () => {
  const { Site, starterSite, createSectionRegistry } =
    await import("../packages/core/src/index");
  const registry = createSectionRegistry({
    hero: ({ assetUrl }) => (
      <img src={assetUrl("asset-missing")} alt="Missing image" />
    ),
  });
  expect(() =>
    renderToStaticMarkup(
      <Site site={starterSite} sectionRegistry={registry} />,
    ),
  ).toThrow(/image.*missing/i);
});
