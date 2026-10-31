import { describe, expect, it } from "vitest";
import { parseSite, starterSite } from "../packages/core/src/config";

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

    expect(site.cameraJourney.enabled).toBe(true);
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
    expect(parseSite(starterSite).cameraJourney.enabled).toBe(false);
  });
});
