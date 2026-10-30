import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import JSZip from "jszip";
import {
  parseSite,
  Site,
  starterSite,
} from "../packages/core/src/index";
import { exportWebsite } from "../packages/export/src/index";

const cinematicInput = {
  ...starterSite,
  experience: "cinematic",
  motion: "cinematic",
  sections: [
    {
      ...starterSite.sections[0]!,
      id: "opening",
      heading: "A story in motion",
      transition: "mist-reveal",
    },
    {
      ...starterSite.sections[0]!,
      id: "ending",
      heading: "A different ending",
      transition: "camera-pan",
    },
  ],
};

describe("cinematic configuration contract", () => {
  it("CIN-001 CIN-007 preserves the mode and supported scene transitions", () => {
    const site = parseSite(cinematicInput);
    expect(site.experience).toBe("cinematic");
    expect(site.sections.map((scene) => scene.transition)).toEqual([
      "mist-reveal",
      "camera-pan",
    ]);
    expect(parseSite(site)).toEqual(site);
  });

  it("CIN-007 rejects unsupported transition identifiers", () => {
    expect(() =>
      parseSite({
        ...cinematicInput,
        sections: [
          { ...cinematicInput.sections[0], transition: "run-script" },
        ],
      }),
    ).toThrow();
  });

  it("CIN-008 keeps cinematic settings in semantic render output", () => {
    const site = parseSite(cinematicInput);
    const html = renderToStaticMarkup(<Site site={site} />);
    expect(html).toContain('data-experience="cinematic"');
    expect(html).toContain('data-transition="mist-reveal"');
    expect(html).toContain("A story in motion");
  });

  it("CIN-012 CIN-014 exports cinematic semantics and transition styles", async () => {
    const site = parseSite(cinematicInput);
    const archive = await JSZip.loadAsync(await exportWebsite(site));
    const html = await archive.file("index.html")!.async("string");
    const css = await archive.file("site.css")!.async("string");
    expect(html).toContain('data-experience="cinematic"');
    expect(html).toContain('data-transition="camera-pan"');
    expect(html).toContain("A different ending");
    expect(css).toContain("data-experience=\"cinematic\"");
    expect(html).not.toContain("apps/editor");
  });

  it("CIN-020 defaults older projects to the standard experience", () => {
    const legacy = {
      schemaVersion: 1,
      title: "Older project",
      sections: [{ id: "intro", type: "hero", heading: "Hello" }],
    };
    expect(parseSite(legacy).experience).toBe("standard");
  });
});
