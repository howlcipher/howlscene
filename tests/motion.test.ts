import { afterEach, expect, it, vi } from "vitest";
import {
  resolveMotion,
  resolvePrimitive,
  motionPrimitives,
  readMotionSettings,
} from "../packages/core/src/motion";
import { enhanceSite } from "../packages/core/src/enhance";
afterEach(() => vi.unstubAllGlobals());
it("MOT-001 primitives have finite validated parameters and safe untrusted settings", () => {
  for (const primitive of motionPrimitives) {
    const effect = resolvePrimitive(primitive, "cinematic", 0.5, 2);
    expect(effect.duration).toBeGreaterThan(0);
    expect(effect.duration).toBeLessThan(3);
    expect(effect.keyframes.opacity).toBeDefined();
  }
  expect(() => resolvePrimitive("fade", "calm", NaN, 1)).toThrow();
  expect(
    readMotionSettings({ motionIntensity: "NaN", motionSpeed: "100" }),
  ).toEqual({ intensity: 1, speed: 1 });
  expect(
    readMotionSettings({ motionIntensity: "0", motionSpeed: "0.5" }),
  ).toEqual({ intensity: 0, speed: 0.5 });
});
it("MOT-005 scroll frames coalesce and cleanup removes work; none schedules nothing", () => {
  const target = new EventTarget();
  const frames = new Map<number, FrameRequestCallback>();
  let next = 0;
  const win = Object.assign(target, { innerHeight: 800 });
  vi.stubGlobal("window", win);
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
    frames.set(++next, callback);
    return next;
  });
  vi.stubGlobal("cancelAnimationFrame", (id: number) => frames.delete(id));
  const media = Object.assign(new EventTarget(), { matches: false });
  vi.stubGlobal("matchMedia", () => media);
  vi.stubGlobal("localStorage", { getItem: () => null });
  const style = { transform: "" };
  const layer = {
    dataset: { depth: "0.5" },
    style,
    closest: () => ({
      dataset: { sceneMotion: "inherit" },
      getBoundingClientRect: () => ({ top: 0, bottom: 1000, height: 1000 }),
    }),
  };
  const root = {
    dataset: { motion: "cinematic" },
    querySelector: () => null,
    querySelectorAll: (selector: string) =>
      selector.includes("scenery-layer") ? [layer] : [],
  };
  const dispose = enhanceSite(root as unknown as HTMLElement);
  target.dispatchEvent(new Event("scroll"));
  target.dispatchEvent(new Event("scroll"));
  expect(frames.size).toBe(1);
  for (const callback of frames.values()) callback(0);
  frames.clear();
  expect(style.transform).toContain("translate3d");
  target.dispatchEvent(new Event("scroll"));
  expect(frames.size).toBe(1);
  media.matches = true;
  media.dispatchEvent(new Event("change"));
  expect(frames.size).toBe(0);
  expect(style.transform).toBe("");
  target.dispatchEvent(new Event("scroll"));
  expect(frames.size).toBe(0);
  media.matches = false;
  media.dispatchEvent(new Event("change"));
  expect(frames.size).toBe(1);
  dispose();
  dispose();
  expect(frames.size).toBe(0);
  expect(style.transform).toBe("");
  target.dispatchEvent(new Event("scroll"));
  expect(frames.size).toBe(0);
  root.dataset.motion = "none";
  const disposeNone = enhanceSite(root as unknown as HTMLElement);
  target.dispatchEvent(new Event("scroll"));
  expect(frames.size).toBe(0);
  disposeNone();
});
it("MOT-001 validates intensity, speed and all presets", () => {
  for (const preset of ["none", "calm", "cinematic", "dynamic"] as const) {
    const result = resolveMotion(preset, 0.5, 1, false);
    expect(result.duration).toBeGreaterThanOrEqual(0);
    expect(result.distance).toBeLessThanOrEqual(60);
  }
  expect(() => resolveMotion("calm", -1, 1, false)).toThrow();
  expect(() => resolveMotion("dynamic", 1, 0, false)).toThrow();
});
it("MOT-002 MOT-003 removes motion when requested while preserving configuration", () => {
  expect(resolveMotion("dynamic", 1, 1, true).distance).toBe(0);
  expect(resolveMotion("none", 1, 1, false).duration).toBe(0);
});
it("MOT-003 section overrides inherit global motion and cannot bypass site-wide none", async () => {
  const { resolveSceneMotion } = await import("../packages/core/src/motion");
  expect(resolveSceneMotion("cinematic", "inherit")).toBe("cinematic");
  expect(resolveSceneMotion("dynamic", "calm")).toBe("calm");
  expect(resolveSceneMotion("dynamic", "none")).toBe("none");
  expect(resolveSceneMotion("none", "dynamic")).toBe("none");
});
