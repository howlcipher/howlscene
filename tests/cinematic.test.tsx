import { describe, expect, it } from "vitest";
import fc from "fast-check";
import { renderToStaticMarkup } from "react-dom/server";
import JSZip from "jszip";
import {
  parseSite,
  Site,
  starterSite,
  themes,
  resolveSceneTransition,
} from "../packages/core/src/index";
import { exportWebsite } from "../packages/export/src/index";
import { importBackup, serializeBackup } from "../packages/export/src/backup";

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
      navigationLabel: "Opening scene",
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
        sections: [{ ...cinematicInput.sections[0], transition: "run-script" }],
      }),
    ).toThrow();
  });

  it("CIN-007 resolves observably distinct finite transition recipes", () => {
    const transitions = [
      "none",
      "fade",
      "camera-push",
      "camera-pan",
      "mist-reveal",
      "layered-parallax",
    ] as const;
    const recipes = transitions.map((transition) =>
      resolveSceneTransition(transition, "cinematic"),
    );
    expect(
      new Set(recipes.map((recipe) => JSON.stringify(recipe.keyframes))).size,
    ).toBe(transitions.length);
    expect(recipes[0]!.duration).toBe(0);
    expect(
      resolveSceneTransition("camera-push", "cinematic", 1, 1, true),
    ).toEqual({ duration: 0, keyframes: { opacity: [1, 1] } });
  });

  it("CIN-008 keeps cinematic settings in semantic render output", () => {
    const site = parseSite(cinematicInput);
    const html = renderToStaticMarkup(<Site site={site} />);
    expect(html).toContain('data-experience="cinematic"');
    expect(html).toContain('data-transition="mist-reveal"');
    expect(html).toContain("A story in motion");
    expect(html).toContain(">Opening scene</a>");
  });

  it("CIN-022 renders decorative transition artwork and includes it in the ZIP", async () => {
    const cover = {
      id: "asset-mist-cover",
      mime: "image/png",
      data: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=",
      alt: "",
    };
    const site = parseSite({
      ...cinematicInput,
      assets: [cover],
      sections: [{ ...cinematicInput.sections[0]!, transitionCover: cover.id }],
    });
    const html = renderToStaticMarkup(<Site site={site} />);
    expect(html).toContain('class="scene-transition-cover"');
    expect(html).toContain('aria-hidden="true"');
    const archive = await JSZip.loadAsync(await exportWebsite(site));
    const exportedHtml = await archive.file("index.html")!.async("string");
    expect(exportedHtml).toContain(
      'src="./assets/asset-mist-cover/original.png"',
    );
    expect(archive.file("assets/asset-mist-cover/original.png")).not.toBeNull();
  });

  it("CIN-017 rejects a missing transition-cover asset", () => {
    expect(() =>
      parseSite({
        ...cinematicInput,
        sections: [
          { ...cinematicInput.sections[0]!, transitionCover: "asset-missing" },
        ],
      }),
    ).toThrow(/referenced image is missing/i);
  });

  it("CIN-012 CIN-014 exports cinematic semantics and transition styles", async () => {
    const site = parseSite(cinematicInput);
    const archive = await JSZip.loadAsync(await exportWebsite(site));
    const html = await archive.file("index.html")!.async("string");
    const css = await archive.file("site.css")!.async("string");
    expect(html).toContain('data-experience="cinematic"');
    expect(html).toContain('data-transition="camera-pan"');
    expect(html).toContain("A different ending");
    expect(css).toContain('data-experience="cinematic"');
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

  it("CIN-008 CIN-009 preserves settings through backups and theme changes", () => {
    const source = parseSite(cinematicInput);
    for (const theme of Object.keys(themes)) {
      const themed = parseSite({ ...source, theme });
      const restored = importBackup(serializeBackup(themed));
      expect(restored.experience).toBe("cinematic");
      expect(restored.sections.map((scene) => scene.transition)).toEqual(
        source.sections.map((scene) => scene.transition),
      );
      expect(restored.sections.map((scene) => scene.heading)).toEqual(
        source.sections.map((scene) => scene.heading),
      );
    }
  });

  it("CIN-025 normalizes each supported transition idempotently", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(
          "none",
          "fade",
          "camera-push",
          "camera-pan",
          "mist-reveal",
          "layered-parallax",
        ),
        (transition) => {
          const source = parseSite({
            ...cinematicInput,
            sections: [{ ...cinematicInput.sections[0]!, transition }],
          });
          expect(parseSite(source)).toEqual(source);
        },
      ),
      { seed: 504301, numRuns: 24 },
    );
  });
});
