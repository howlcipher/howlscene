import { describe, expect, it } from "vitest";
import { parseSite, starterSite } from "../packages/core/src/config";
import fc from "fast-check";
import JSZip from "jszip";
import { exportWebsite } from "../packages/export/src/index";
import { importBackup, serializeBackup } from "../packages/export/src/backup";
import {
  cameraJourneySettingsSchema,
  resolveCameraJourneyFrame,
  resolveScrollProgress,
} from "../packages/core/src/camera_journey";

const cameraJourney = {
  enabled: true,
  movement: "diagonal",
  intensity: 0.8,
  distance: 1,
};

describe("scroll-scrubbed camera journey", () => {
  it("CJ-001 accepts an explicit scroll-scrubbed mode without changing finite transitions", () => {
    const site = parseSite({
      ...starterSite,
      experience: "cinematic",
      cameraJourney,
      sections: starterSite.sections.map((scene) => ({
        ...scene,
        transition: "mist-reveal",
      })),
    });

    expect(site).toMatchObject({ cameraJourney: { enabled: true } });
    expect(site.sections[0]?.transition).toBe("mist-reveal");
  });

  it("CJ-024 rejects unsupported or unbounded camera settings", () => {
    expect(() =>
      parseSite({
        ...starterSite,
        cameraJourney: {
          ...cameraJourney,
          movement: "run-script",
          intensity: 10,
        },
      }),
    ).toThrow();
  });

  it("preserves existing projects as scene-entry experiences by default", () => {
    expect(parseSite(starterSite)).toMatchObject({
      cameraJourney: { enabled: false },
    });
  });

  it("CJ-002 through CJ-008 resolves distinct, stable scroll stages", () => {
    const settings = cameraJourneySettingsSchema.parse(cameraJourney);
    const departure = resolveCameraJourneyFrame(0.1, settings);
    const travel = resolveCameraJourneyFrame(0.3, settings);
    const covered = resolveCameraJourneyFrame(0.5, settings);
    const reveal = resolveCameraJourneyFrame(0.68, settings);
    const arrival = resolveCameraJourneyFrame(0.9, settings);

    expect(departure.outgoingCopyOpacity).toBeLessThan(1);
    expect(travel.cameraScale).toBeGreaterThan(1);
    expect(Math.abs(travel.cameraTranslateX)).toBeGreaterThan(0);
    expect(covered.coverOpacity).toBe(1);
    expect(covered.outgoingCopyOpacity).toBe(0);
    expect(reveal.incomingLandscapeOpacity).toBe(1);
    expect(reveal.incomingCopyOpacity).toBe(0);
    expect(arrival.incomingCopyOpacity).toBeGreaterThan(0);
    expect(resolveCameraJourneyFrame(0.3, settings)).toEqual(travel);
  });

  it("CJ-004 reverses the same deterministic states as scroll reverses", () => {
    const settings = cameraJourneySettingsSchema.parse(cameraJourney);
    const stops = [0.05, 0.25, 0.5, 0.75, 0.95];
    const forward = stops.map((progress) =>
      resolveCameraJourneyFrame(progress, settings),
    );
    const reverse = [...stops]
      .reverse()
      .map((progress) => resolveCameraJourneyFrame(progress, settings));
    expect(reverse).toEqual([...forward].reverse());
  });

  it("CJ-009 clamps malformed scroll geometry safely", () => {
    expect(resolveScrollProgress(150, 100, 200)).toBe(0.5);
    expect(resolveScrollProgress(-10, 100, 200)).toBe(0);
    expect(resolveScrollProgress(210, 100, 200)).toBe(1);
    expect(resolveScrollProgress(150, 200, 100)).toBe(0);
    expect(resolveScrollProgress(Number.NaN, 100, 200)).toBe(0);
  });

  it("CJ-011 supports one, two, five, and seven scenes without fixed IDs", () => {
    for (const count of [1, 2, 5, 7]) {
      const sections = Array.from({ length: count }, (_, index) => ({
        ...starterSite.sections[0]!,
        id: `chapter-${index + 1}`,
        heading: `Chapter ${index + 1}`,
      }));
      const site = parseSite({
        ...starterSite,
        experience: "cinematic",
        cameraJourney,
        sections,
      });
      expect(site.sections.map((scene) => scene.heading)).toEqual(
        sections.map((scene) => scene.heading),
      );
    }
  });

  it("CJ-018 preserves copy while reduced motion removes camera travel", () => {
    const settings = cameraJourneySettingsSchema.parse(cameraJourney);
    const before = resolveCameraJourneyFrame(0.49, settings, true);
    const after = resolveCameraJourneyFrame(0.51, settings, true);
    expect(before.cameraScale).toBe(1);
    expect(before.coverOpacity).toBe(0);
    expect(before.outgoingCopyOpacity).toBe(1);
    expect(after.incomingLandscapeOpacity).toBe(1);
    expect(after.incomingCopyOpacity).toBe(1);
  });

  it("CJ-023 is deterministic and bounded for seeded generated inputs", () => {
    const settings = cameraJourneySettingsSchema.parse(cameraJourney);
    fc.assert(
      fc.property(
        fc.double({ min: 0, max: 1, noNaN: true }),
        fc.double({ min: 0, max: 1, noNaN: true }),
        (progress, intensity) => {
          const configured = { ...settings, intensity };
          const first = resolveCameraJourneyFrame(progress, configured);
          expect(resolveCameraJourneyFrame(progress, configured)).toEqual(
            first,
          );
          expect(first.coverOpacity).toBeGreaterThanOrEqual(0);
          expect(first.coverOpacity).toBeLessThanOrEqual(1);
          expect(first.cameraScale).toBeGreaterThanOrEqual(1);
          expect(first.cameraScale).toBeLessThanOrEqual(1.1);
        },
      ),
      { seed: 9063001, numRuns: 100 },
    );
  });

  it("CJ-012 CJ-013 CJ-014 CJ-015 preserves settings through themes, backups, and export", async () => {
    const source = parseSite({
      ...starterSite,
      experience: "cinematic",
      cameraJourney,
      sections: starterSite.sections.map((scene) => ({
        ...scene,
        transition: "mist-reveal",
      })),
    });
    for (const theme of ["ink", "cyber", "modern"]) {
      const restored = importBackup(
        serializeBackup(parseSite({ ...source, theme })),
      );
      expect(restored.cameraJourney).toEqual(source.cameraJourney);
      expect(restored.sections[0]?.transition).toBe("mist-reveal");
    }
    const archive = await JSZip.loadAsync(await exportWebsite(source));
    const html = await archive.file("index.html")!.async("string");
    expect(html).toContain('data-camera-journey="true"');
    expect(html).toContain('data-camera-journey-movement="diagonal"');
    expect(html).toContain('data-transition="mist-reveal"');
  });
});
