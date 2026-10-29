import { describe, it, expect } from "vitest";
import { starterSite, sectionDefinitions } from "../packages/core/src/index";
import {
  addSection,
  duplicateSection,
  removeSection,
  reorderSection,
  createHistory,
  commitHistory,
  undoHistory,
  redoHistory,
} from "../apps/editor/model";
describe("editor project operations", () => {
  it("EDT-003 adds every section type and rejects duplicate IDs without mutation", () => {
    for (const type of [
      "hero",
      "about",
      "rich_text",
      "projects",
      "experience",
      "skills",
      "media",
      "gallery",
      "contact",
      "cta",
    ] as const) {
      const site = addSection(starterSite, type, "new-section");
      expect(site.sections[1]?.type).toBe(type);
      expect(sectionDefinitions[type].layouts).toContain(
        site.sections[1]?.layout,
      );
    }
    expect(() => addSection(starterSite, "about", "intro")).toThrow();
    expect(starterSite.sections).toHaveLength(1);
  });
  it("EDT-003 duplicates content, reorders stable IDs and keeps one section", () => {
    let site = duplicateSection(starterSite, "intro", "copy");
    expect(site.sections[1]).toEqual({ ...site.sections[0], id: "copy" });
    site = reorderSection(site, "copy", 0);
    expect(site.sections.map((s) => s.id)).toEqual(["copy", "intro"]);
    site = removeSection(site, "copy");
    expect(site.sections[0]?.id).toBe("intro");
    expect(() => removeSection(site, "intro")).toThrow();
    expect(() => reorderSection(site, "missing", 0)).toThrow();
    expect(() => reorderSection(site, "intro", 9)).toThrow();
  });
  it("TXT-005 restores snapshots and clears redo after branching", () => {
    const history = createHistory(starterSite);
    const edited = commitHistory(history, { ...starterSite, title: "Edited" });
    expect(undoHistory(edited).present.title).toBe(starterSite.title);
    expect(redoHistory(undoHistory(edited)).present.title).toBe("Edited");
    expect(
      commitHistory(undoHistory(edited), { ...starterSite, title: "Other" })
        .future,
    ).toHaveLength(0);
    expect(undoHistory(history)).toBe(history);
  });
  it("bounds history to 50 snapshots and isolates incoming mutable data", () => {
    let history = createHistory(starterSite);
    for (let i = 0; i < 60; i++)
      history = commitHistory(history, { ...starterSite, title: `Edit ${i}` });
    expect(history.past).toHaveLength(50);
    const input = { ...starterSite, title: "Unchanged" };
    const next = commitHistory(history, input);
    input.title = "Mutated";
    expect(next.present.title).toBe("Unchanged");
  });
});
