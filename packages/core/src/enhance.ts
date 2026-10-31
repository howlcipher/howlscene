import { animate } from "motion/mini";
import { createCameraJourneyController } from "./camera_journey_controller.js";
import { cameraJourneySettingsSchema } from "./camera_journey.js";
import {
  readMotionSettings,
  readThemeParallax,
  resolveMotion,
  resolveSceneTransition,
  resolveSceneMotion,
  resolvePrimitive,
  type motionPresets,
} from "./motion.js";

/** Finite decorative entry effects. Semantic content is visible before mounting. */
export function enhanceSite(root: HTMLElement): () => void {
  const media = matchMedia("(prefers-reduced-motion: reduce)");
  const candidate = root.dataset.motion;
  const preset: keyof typeof motionPresets =
    candidate === "calm" || candidate === "cinematic" || candidate === "dynamic"
      ? candidate
      : "none";
  let manualOff = false;
  try {
    manualOff = localStorage.getItem("howlscene-motion") === "off";
  } catch {
    /* Storage privacy restrictions must not prevent reading content. */
  }
  let disposed = false;
  const settings = readMotionSettings(root.dataset);
  const journeySettings = cameraJourneySettingsSchema.parse({
    enabled: root.dataset.cameraJourney === "true",
    movement: root.dataset.cameraJourneyMovement ?? "diagonal",
    intensity: Number(root.dataset.cameraJourneyIntensity ?? 0.8),
    distance: Number(root.dataset.cameraJourneyDistance ?? 1),
  });
  const journeyDistance = Math.max(
    0.5,
    Math.min(2, journeySettings.distance / settings.speed),
  );
  const journey = journeySettings.enabled
    ? createCameraJourneyController(
        root,
        {
          ...journeySettings,
          intensity: journeySettings.intensity * settings.intensity,
          distance: journeyDistance,
        },
        media,
      )
    : undefined;
  const layers = !journey && readThemeParallax(root.dataset.themeParallax)
    ? Array.from(
        root.querySelectorAll<HTMLElement>(".scenery-layer[data-depth]"),
      )
    : [];
  let frame: number | undefined;
  const controls = new Map<
    Element,
    { effect: ReturnType<typeof animate>; owner: HTMLElement }
  >();
  const ratios = new Map<Element, number>();
  const seen = new WeakSet<Element>();
  const button = root.querySelector<HTMLButtonElement>(
    "button[data-motion-toggle]",
  );
  const enabled = () =>
    !disposed &&
    !manualOff &&
    !media.matches &&
    preset !== "none" &&
    settings.intensity > 0;
  function updateDepth() {
    frame = undefined;
    if (!enabled()) return;
    const distance = resolveMotion(
      preset,
      settings.intensity,
      settings.speed,
    ).distance;
    // Read all geometry before writing styles; offscreen scenery has no work.
    const updates = layers.map((layer) => {
      const scene = layer.closest<HTMLElement>(".scene");
      const rect = scene?.getBoundingClientRect();
      const raw = Number(layer.dataset.depth);
      const depth = Number.isFinite(raw) ? Math.max(-1, Math.min(1, raw)) : 0;
      if (
        resolveSceneMotion(preset, scene?.dataset.sceneMotion) === "none" ||
        !rect ||
        rect.bottom <= 0 ||
        rect.top >= window.innerHeight
      )
        return { layer, offset: 0 };
      const progress = Math.max(
        -1,
        Math.min(
          1,
          (window.innerHeight / 2 - (rect.top + rect.height / 2)) /
            window.innerHeight,
        ),
      );
      return { layer, offset: progress * distance * depth };
    });
    for (const { layer, offset } of updates)
      layer.style.transform = `translate3d(0, ${offset}px, 0)`;
  }
  function scheduleDepth() {
    if (enabled() && layers.length && frame === undefined)
      frame = requestAnimationFrame(updateDepth);
  }
  function stopScene(owner: HTMLElement) {
    for (const [target, item] of controls)
      if (item.owner === owner) {
        controls.delete(target);
        item.effect.cancel();
      }
  }
  function play(
    owner: HTMLElement,
    target: HTMLElement,
    keyframes: Parameters<typeof animate>[1],
    duration: number,
  ) {
    const old = controls.get(target);
    if (old) {
      controls.delete(target);
      old.effect.cancel();
    }
    const effect = animate(target, keyframes, { duration, ease: "easeOut" });
    controls.set(target, { effect, owner });
    const finish = () => {
      if (controls.get(target)?.effect === effect) {
        controls.delete(target);
        effect.cancel();
        if (owner.dataset.sceneState === "entering")
          owner.dataset.sceneState = "active";
      }
    };
    void effect.then(finish, finish);
  }
  const observer =
    typeof IntersectionObserver === "undefined"
      ? undefined
      : new IntersectionObserver(
          (entries) => {
            if (!enabled()) return;
            for (const entry of entries) {
              const scene = entry.target as HTMLElement;
              const scenery = scene.querySelector<HTMLElement>(".scenery");
              const scenePreset = resolveSceneMotion(
                preset,
                scene.dataset.sceneMotion,
              );
              if (scenePreset === "none") {
                scene.dataset.sceneState = "static";
                observer?.unobserve(scene);
                continue;
              }
              const previous = ratios.get(scene) ?? 0;
              ratios.set(scene, entry.intersectionRatio);
              if (!entry.isIntersecting) {
                stopScene(scene);
                scene.dataset.sceneState = "offscreen";
                if (scenery) scenery.style.opacity = "0.7";
                continue;
              }
              const first = !seen.has(scene);
              const entering =
                first ||
                (root.dataset.experience === "cinematic" && previous === 0);
              if (
                !first &&
                Math.abs(previous - entry.intersectionRatio) < 0.001
              )
                continue;
              const exiting = !first && entry.intersectionRatio < previous;
              scene.dataset.sceneState = exiting ? "exiting" : "entering";
              const params = resolvePrimitive(
                "crossfade",
                scenePreset,
                settings.intensity,
                settings.speed,
              );
              if (entering) {
                seen.add(scene);
                const target =
                  (root.dataset.experience === "cinematic"
                    ? scene.querySelector<HTMLElement>(
                        ".scene-background-image",
                      )
                    : null) ??
                  scene.querySelector<HTMLElement>(".scene-content") ??
                  scene;
                if (root.dataset.experience === "cinematic") {
                  const candidate = scene.dataset.transition;
                  const transition =
                    candidate === "none" ||
                    candidate === "fade" ||
                    candidate === "camera-push" ||
                    candidate === "camera-pan" ||
                    candidate === "mist-reveal" ||
                    candidate === "layered-parallax"
                      ? candidate
                      : "fade";
                  const entryParams = resolveSceneTransition(
                    transition,
                    scenePreset,
                    settings.intensity,
                    settings.speed,
                  );
                  if (entryParams.duration)
                    play(
                      scene,
                      target,
                      entryParams.keyframes,
                      entryParams.duration,
                    );
                  const cover = scene.querySelector<HTMLElement>(
                    ".scene-transition-cover",
                  );
                  if (cover && entryParams.duration)
                    play(
                      scene,
                      cover,
                      { opacity: [1, 0] },
                      entryParams.duration,
                    );
                } else {
                  const entryParams = resolvePrimitive(
                    "slide",
                    scenePreset,
                    settings.intensity,
                    settings.speed,
                  );
                  play(
                    scene,
                    target,
                    entryParams.keyframes,
                    entryParams.duration,
                  );
                }
              }
              if (scenery) {
                scenery.style.opacity = exiting ? "0.7" : "1";
                play(
                  scene,
                  scenery,
                  { opacity: exiting ? [1, 0.7] : [0.7, 1] },
                  params.duration,
                );
              } else if (!first && !exiting)
                scene.dataset.sceneState = "active";
            }
          },
          { threshold: [0, 0.2, 0.5, 0.8, 0.95, 1] },
        );
  function cancel() {
    if (frame !== undefined) {
      cancelAnimationFrame(frame);
      frame = undefined;
    }
    for (const layer of layers) layer.style.transform = "";
    for (const { effect } of controls.values()) effect.cancel();
    controls.clear();
    journey?.stop();
    for (const scene of root.querySelectorAll<HTMLElement>(".scene")) {
      scene.dataset.sceneState = "static";
      const scenery = scene.querySelector<HTMLElement>(".scenery");
      if (scenery) scenery.style.opacity = "";
    }
  }
  function refresh() {
    observer?.disconnect();
    cancel();
    ratios.clear();
    root.dataset.motionEnabled = String(enabled());
    if (button) {
      button.hidden = false;
      button.textContent = enabled() ? "Disable animation" : "Enable animation";
      button.setAttribute("aria-pressed", String(enabled()));
      button.disabled =
        media.matches || preset === "none" || settings.intensity === 0;
    }
    if (enabled()) {
      if (journey) journey.start();
      else
        root.querySelectorAll(".scene").forEach((scene) => {
          observer?.observe(scene);
        });
    }
    scheduleDepth();
  }
  function toggle() {
    manualOff = !manualOff;
    try {
      localStorage.setItem("howlscene-motion", manualOff ? "off" : "on");
    } catch {
      /* Motion still changes for this visit when storage is blocked. */
    }
    refresh();
  }
  media.addEventListener("change", refresh);
  if (!journey) {
    window.addEventListener("scroll", scheduleDepth, { passive: true });
    window.addEventListener("resize", scheduleDepth, { passive: true });
  }
  button?.addEventListener("click", toggle);
  refresh();
  return () => {
    if (disposed) return;
    disposed = true;
    observer?.disconnect();
    cancel();
    journey?.dispose();
    delete root.dataset.motionEnabled;
    media.removeEventListener("change", refresh);
    if (!journey) {
      window.removeEventListener("scroll", scheduleDepth);
      window.removeEventListener("resize", scheduleDepth);
    }
    button?.removeEventListener("click", toggle);
  };
}
