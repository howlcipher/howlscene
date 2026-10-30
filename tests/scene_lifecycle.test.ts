import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { enhanceSite } from "../packages/core/src/enhance";

interface Effect {
  target: unknown;
  keyframes: Record<string, unknown>;
  cancel: ReturnType<typeof vi.fn>;
  finish: () => void;
}
const animation = vi.hoisted(() => ({ effects: [] as Effect[] }));
vi.mock("motion/mini", () => ({
  animate: vi.fn((target: unknown, keyframes: Record<string, unknown>) => {
    const effect: Effect = {
      target,
      keyframes,
      cancel: vi.fn(),
      finish: () => undefined,
    };
    animation.effects.push(effect);
    return {
      cancel: effect.cancel,
      then: (finish: () => void) => {
        effect.finish = finish;
        return Promise.resolve();
      },
    };
  }),
}));

// Owned DOM facades test lifecycle boundaries, not browser geometry or layout.
class Node extends EventTarget {
  dataset: Record<string, string | undefined> = {};
  style = { opacity: "", transform: "" };
  hidden = false;
  disabled = false;
  textContent = "Essential readable content";
  attributes = new Map<string, string>();
  content: Node | undefined;
  scenery: Node | undefined;
  background: Node | undefined;
  scene: Node | undefined;
  setAttribute(name: string, value: string) {
    this.attributes.set(name, value);
  }
  querySelector(selector: string) {
    return selector === ".scenery"
      ? this.scenery
      : selector === ".scene-background-image"
        ? this.background
        : selector === ".scene-content"
          ? this.content
          : undefined;
  }
  closest() {
    return this.scene;
  }
  getBoundingClientRect() {
    return { top: 0, bottom: 1000, height: 1000 };
  }
}
function fixture(
  preset = "cinematic",
  override?: string,
  experience = "standard",
  transition = "fade",
  hasBackground = false,
) {
  const scene = new Node();
  if (override !== undefined) scene.dataset.sceneMotion = override;
  scene.dataset.transition = transition;
  const content = new Node();
  const scenery = new Node();
  const layer = new Node();
  const button = new Node();
  scene.content = content;
  scene.scenery = scenery;
  if (hasBackground) scene.background = new Node();
  layer.scene = scene;
  layer.dataset.depth = ".5";
  const root = new Node();
  root.dataset.motion = preset;
  root.dataset.experience = experience;
  root.querySelector = (selector: string) =>
    selector === "button[data-motion-toggle]" ? button : undefined;
  const rootDom = Object.assign(root, {
    querySelectorAll: (selector: string) =>
      selector === ".scene" ? [scene] : [layer],
  });
  const media = Object.assign(new EventTarget(), { matches: false });
  const windowEvents = Object.assign(new EventTarget(), { innerHeight: 800 });
  const frames = new Map<number, FrameRequestCallback>();
  let id = 0;
  const observed = new Set<Element>();
  let notify: IntersectionObserverCallback = () => undefined;
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      constructor(callback: IntersectionObserverCallback) {
        notify = callback;
      }
      observe(element: Element) {
        observed.add(element);
      }
      unobserve(element: Element) {
        observed.delete(element);
      }
      disconnect() {
        observed.clear();
      }
    },
  );
  vi.stubGlobal("matchMedia", () => media);
  vi.stubGlobal("window", windowEvents);
  vi.stubGlobal("localStorage", { getItem: () => null, setItem: vi.fn() });
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
    frames.set(++id, callback);
    return id;
  });
  vi.stubGlobal("cancelAnimationFrame", (frame: number) =>
    frames.delete(frame),
  );
  const dispose = enhanceSite(rootDom as unknown as HTMLElement);
  const intersect = (ratio: number) =>
    notify(
      [
        {
          target: scene as unknown as Element,
          isIntersecting: ratio > 0,
          intersectionRatio: ratio,
        },
      ] as IntersectionObserverEntry[],
      {} as IntersectionObserver,
    );
  const flushFrames = () => {
    const pending = [...frames.values()];
    frames.clear();
    pending.forEach((callback) => callback(0));
  };
  return {
    root,
    scene,
    content,
    background: scene.background,
    scenery,
    layer,
    button,
    media,
    windowEvents,
    frames,
    observed,
    intersect,
    dispose,
    flushFrames,
  };
}
beforeEach(() => {
  animation.effects.length = 0;
});
afterEach(() => vi.unstubAllGlobals());

it("MOT-004 MOT-005 entry, exit, offscreen cancellation and reentry preserve per-scene ownership", () => {
  const f = fixture();
  f.intersect(0.8);
  expect(animation.effects.map((effect) => effect.target)).toEqual([
    f.content,
    f.scenery,
  ]);
  expect(f.scene.dataset.sceneState).toBe("entering");
  const contentEntry = animation.effects[0]!;
  const sceneryEntry = animation.effects[1]!;
  f.intersect(0.5);
  expect(f.scene.dataset.sceneState).toBe("exiting");
  expect(sceneryEntry.cancel).toHaveBeenCalledOnce();
  const exit = animation.effects.at(-1)!;
  expect(exit.keyframes.opacity).toEqual([1, 0.7]);
  sceneryEntry.finish();
  expect(exit.cancel).not.toHaveBeenCalled();
  expect(f.scene.dataset.sceneState).toBe("exiting");
  f.intersect(0);
  expect(f.scene.dataset.sceneState).toBe("offscreen");
  expect(contentEntry.cancel).toHaveBeenCalledOnce();
  expect(exit.cancel).toHaveBeenCalledOnce();
  for (const effect of animation.effects) effect.finish();
  expect(f.scene.dataset.sceneState).toBe("offscreen");
  f.intersect(0.5);
  expect(
    animation.effects.filter((effect) => effect.target === f.content),
  ).toHaveLength(1);
  expect(animation.effects.at(-1)?.target).toBe(f.scenery);
  animation.effects.at(-1)!.finish();
  expect(f.scene.dataset.sceneState).toBe("active");
  expect(f.content.textContent).toBe("Essential readable content");
  f.dispose();
});

it("CIN-007 CIN-016 CIN-023 replays the selected cinematic entrance after interruption", () => {
  const f = fixture("cinematic", undefined, "cinematic", "camera-pan", true);
  f.intersect(0.8);
  expect(animation.effects[0]?.target).toBe(f.background);
  expect(animation.effects[0]?.keyframes).toEqual({
    opacity: [0.55, 1],
    transform: ["translate3d(32px, 0, 0)", "translate3d(0, 0, 0)"],
  });
  const firstEntrance = animation.effects[0]!;
  f.intersect(0);
  expect(firstEntrance.cancel).toHaveBeenCalledOnce();
  f.intersect(0.8);
  expect(
    animation.effects.filter((effect) => effect.target === f.content),
  ).toHaveLength(2);
  expect(firstEntrance.cancel).toHaveBeenCalledOnce();
  f.dispose();
});

it("MOT-003 section-none stays static and site-none schedules no decorative work", () => {
  const sectionNone = fixture("cinematic", "none");
  sectionNone.intersect(0.8);
  sectionNone.flushFrames();
  expect(animation.effects).toHaveLength(0);
  expect(sectionNone.scene.dataset.sceneState).toBe("static");
  expect(sectionNone.observed.size).toBe(0);
  expect(sectionNone.layer.style.transform).toContain("0px");
  sectionNone.dispose();
  const siteNone = fixture("none", "dynamic");
  siteNone.intersect(0.8);
  siteNone.windowEvents.dispatchEvent(new Event("scroll"));
  expect(animation.effects).toHaveLength(0);
  expect(siteNone.frames.size).toBe(0);
  expect(siteNone.scene.dataset.sceneState).toBe("static");
  siteNone.dispose();
});

it.each(["manual", "reduced"] as const)(
  "MOT-002 MOT-005 %s disable resets all owned resources despite late completion",
  (mode) => {
    const f = fixture();
    f.intersect(0.8);
    f.flushFrames();
    expect(f.layer.style.transform).toContain("translate3d");
    f.windowEvents.dispatchEvent(new Event("scroll"));
    expect(f.frames.size).toBe(1);
    if (mode === "manual") f.button.dispatchEvent(new Event("click"));
    else {
      f.media.matches = true;
      f.media.dispatchEvent(new Event("change"));
    }
    expect(f.root.dataset.motionEnabled).toBe("false");
    expect(f.frames.size).toBe(0);
    expect(f.observed.size).toBe(0);
    expect(f.layer.style.transform).toBe("");
    expect(f.scenery.style.opacity).toBe("");
    expect(f.scene.dataset.sceneState).toBe("static");
    for (const effect of animation.effects) {
      expect(effect.cancel).toHaveBeenCalledOnce();
      effect.finish();
    }
    expect(f.scene.dataset.sceneState).toBe("static");
    f.intersect(0.5);
    f.windowEvents.dispatchEvent(new Event("scroll"));
    expect(animation.effects).toHaveLength(2);
    expect(f.frames.size).toBe(0);
    expect(f.content.hidden).toBe(false);
    f.dispose();
  },
);

it("MOT-005 disposal detaches observer, preference, scroll and button callbacks", () => {
  const f = fixture();
  f.intersect(0.8);
  f.dispose();
  f.dispose();
  expect(f.frames.size).toBe(0);
  expect(f.observed.size).toBe(0);
  expect(f.root.dataset.motionEnabled).toBeUndefined();
  f.button.dispatchEvent(new Event("click"));
  f.media.dispatchEvent(new Event("change"));
  f.windowEvents.dispatchEvent(new Event("scroll"));
  f.windowEvents.dispatchEvent(new Event("resize"));
  f.intersect(0.5);
  for (const effect of animation.effects) effect.finish();
  expect(animation.effects).toHaveLength(2);
  expect(f.frames.size).toBe(0);
  expect(f.scene.dataset.sceneState).toBe("static");
  expect(f.layer.style.transform).toBe("");
});
