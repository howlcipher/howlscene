import {
  resolveCameraJourneyFrame,
  resolveScrollProgress,
  type CameraJourneySettings,
} from "./camera_journey.js";

interface JourneyPair {
  outgoing: HTMLImageElement;
  incoming: HTMLImageElement;
  cover: HTMLImageElement;
  atmosphere: HTMLDivElement;
  outgoingDepth: DepthLayer[];
  incomingDepth: DepthLayer[];
}

interface DepthLayer {
  element: SVGElement;
  depth: number;
  opacity: number;
}

/** Owns the scroll listener, temporary visual stage, and its single pending frame. */
export function createCameraJourneyController(
  root: HTMLElement,
  settings: CameraJourneySettings,
  reducedMotion: MediaQueryList,
) {
  const scenes = Array.from(
    root.querySelectorAll<HTMLElement>(".scene"),
  ).filter((scene) => getComputedStyle(scene).display !== "none");
  let scrollContainer: HTMLElement | null = root.parentElement;
  while (scrollContainer && scrollContainer !== document.body) {
    const overflow = getComputedStyle(scrollContainer).overflowY;
    if (
      (overflow === "auto" ||
        overflow === "scroll" ||
        overflow === "overlay") &&
      scrollContainer.scrollHeight > scrollContainer.clientHeight
    )
      break;
    scrollContainer = scrollContainer.parentElement;
  }
  if (scrollContainer === document.body) scrollContainer = null;
  const stage = document.createElement("div");
  stage.className = "camera-journey-stage";
  stage.setAttribute("aria-hidden", "true");
  stage.hidden = true;
  root.prepend(stage);
  let pair: JourneyPair | undefined;
  let pairIndex = -1;
  let frame: number | undefined;
  let enabled = false;
  let disposed = false;
  const originalMinHeights = new Map<HTMLElement, string>(
    scenes.map((scene) => [scene, scene.style.minHeight] as const),
  );
  const resizeObserver =
    typeof ResizeObserver === "undefined"
      ? undefined
      : new ResizeObserver(() => schedule());

  function clearPair() {
    pair = undefined;
    pairIndex = -1;
    stage.replaceChildren();
  }

  function copyImage(source: HTMLImageElement | null): HTMLImageElement {
    if (source) {
      const image = source.cloneNode(true) as HTMLImageElement;
      image.className = "camera-journey-art";
      image.loading = "eager";
      image.removeAttribute("aria-hidden");
      image.alt = "";
      return image;
    }
    const image = document.createElement("img");
    image.className = "camera-journey-art";
    image.alt = "";
    return image;
  }

  function copyDepthLayers(scene: HTMLElement): DepthLayer[] {
    return Array.from(
      scene.querySelectorAll<SVGElement>(".scenery-layer[data-depth]"),
    ).map((source) => {
      const element = source.cloneNode(true) as SVGElement;
      const rawDepth = Number(source.dataset.depth);
      const depth = Number.isFinite(rawDepth)
        ? Math.max(0, Math.min(1, rawDepth))
        : 0;
      const rawOpacity = Number(getComputedStyle(source).opacity);
      const opacity = Number.isFinite(rawOpacity) ? rawOpacity : 1;
      element.classList.add("camera-journey-depth-layer");
      element.style.opacity = String(opacity);
      element.style.transform = "";
      return { element, depth, opacity };
    });
  }

  function buildPair(index: number) {
    clearPair();
    const outgoingScene = scenes[index];
    const incomingScene = scenes[index + 1] ?? outgoingScene;
    if (!outgoingScene || !incomingScene) return;
    const outgoing = copyImage(
      outgoingScene.querySelector<HTMLImageElement>(".scene-background-image"),
    );
    const incoming = copyImage(
      incomingScene.querySelector<HTMLImageElement>(".scene-background-image"),
    );
    const cover = copyImage(
      incomingScene.querySelector<HTMLImageElement>(".scene-transition-cover"),
    );
    cover.className = "camera-journey-cover";
    const atmosphere = document.createElement("div");
    atmosphere.className = "camera-journey-atmosphere";
    const outgoingDepth = copyDepthLayers(outgoingScene);
    const incomingDepth = copyDepthLayers(incomingScene);
    stage.append(
      outgoing,
      incoming,
      ...outgoingDepth.map((layer) => layer.element),
      ...incomingDepth.map((layer) => layer.element),
      atmosphere,
      cover,
    );
    pair = {
      outgoing,
      incoming,
      cover,
      atmosphere,
      outgoingDepth,
      incomingDepth,
    };
    pairIndex = index;
  }

  function setCopy(
    scene: HTMLElement,
    opacity: number,
    y: number,
    tallContent: boolean,
  ) {
    const content = scene.querySelector<HTMLElement>(".scene-content");
    if (!content) return;
    content.style.position = tallContent ? "relative" : "sticky";
    content.style.top = tallContent ? "" : "20svh";
    content.style.zIndex = "3";
    content.style.opacity = String(opacity);
    content.style.transform = `translateY(${y}px)`;
    content.style.pointerEvents = opacity > 0.85 ? "auto" : "none";
  }

  function resetCopy(scene: HTMLElement | undefined) {
    const content = scene?.querySelector<HTMLElement>(".scene-content");
    if (!content) return;
    for (const property of [
      "position",
      "top",
      "z-index",
      "opacity",
      "transform",
      "pointer-events",
    ])
      content.style.removeProperty(property);
  }

  function update() {
    frame = undefined;
    if (!enabled || disposed || document.visibilityState === "hidden") return;
    const viewportTop = scrollContainer?.getBoundingClientRect().top ?? 0;
    const positions = scenes.map(
      (scene) => scene.getBoundingClientRect().top - viewportTop,
    );
    if (!scenes.length) return;
    const lastScene = scenes.at(-1)!;
    if (lastScene.getBoundingClientRect().bottom - viewportTop <= 0) {
      stage.hidden = true;
      delete root.dataset.cameraJourneyActive;
      for (const scene of scenes) resetCopy(scene);
      return;
    }
    stage.hidden = false;
    root.dataset.cameraJourneyActive = "true";

    let index = 0;
    while (index < positions.length - 1 && positions[index + 1]! <= 0)
      index += 1;
    index = Math.min(index, scenes.length - 1);
    if (index !== pairIndex) buildPair(index);
    if (!pair) return;

    const last = index >= scenes.length - 1;
    const progress = last
      ? 0
      : resolveScrollProgress(0, positions[index]!, positions[index + 1]!);
    const visual = resolveCameraJourneyFrame(
      progress,
      settings,
      reducedMotion.matches,
    );
    const outgoingScene = scenes[index]!;
    const incomingScene = scenes[index + 1];
    const outgoingTall =
      (outgoingScene.querySelector<HTMLElement>(".scene-content")
        ?.scrollHeight ?? 0) >
      window.innerHeight * 0.75;
    const incomingTall =
      (incomingScene?.querySelector<HTMLElement>(".scene-content")
        ?.scrollHeight ?? 0) >
      window.innerHeight * 0.75;
    pair.outgoing.style.opacity = String(visual.outgoingLandscapeOpacity);
    pair.incoming.style.opacity = String(visual.incomingLandscapeOpacity);
    pair.outgoing.style.transform = `translate3d(${visual.cameraTranslateX}px, ${visual.cameraTranslateY}px, 0) scale(${visual.cameraScale})`;
    const incomingScale = 1 + (visual.cameraScale - 1) * (1 - progress);
    pair.incoming.style.transform = `translate3d(${-visual.cameraTranslateX}px, ${-visual.cameraTranslateY}px, 0) scale(${incomingScale})`;
    for (const layer of pair.outgoingDepth) {
      const amount = settings.parallaxDepth * layer.depth;
      layer.element.style.opacity = String(
        layer.opacity * visual.outgoingLandscapeOpacity,
      );
      layer.element.style.transform = `translate3d(${visual.cameraTranslateX * amount}px, ${visual.cameraTranslateY * amount}px, 0) scale(${1 + (visual.cameraScale - 1) * amount})`;
    }
    for (const layer of pair.incomingDepth) {
      const amount = settings.parallaxDepth * layer.depth;
      layer.element.style.opacity = String(
        layer.opacity * visual.incomingLandscapeOpacity,
      );
      layer.element.style.transform = `translate3d(${-visual.cameraTranslateX * amount}px, ${-visual.cameraTranslateY * amount}px, 0) scale(${1 + (incomingScale - 1) * amount})`;
    }
    pair.cover.style.opacity = String(visual.coverOpacity);
    pair.atmosphere.style.opacity = String(visual.coverOpacity);

    setCopy(
      outgoingScene,
      last ? 1 : visual.outgoingCopyOpacity,
      visual.outgoingCopyTranslateY,
      outgoingTall,
    );
    if (incomingScene) {
      setCopy(
        incomingScene,
        last ? 0 : visual.incomingCopyOpacity,
        visual.incomingCopyTranslateY,
        incomingTall,
      );
    }
    for (const [sceneIndex, scene] of scenes.entries())
      if (sceneIndex !== index && sceneIndex !== index + 1) resetCopy(scene);
    root.dataset.cameraJourneyStage = visual.stage;
  }

  function schedule() {
    if (enabled && !disposed && frame === undefined)
      frame = requestAnimationFrame(update);
  }

  function start() {
    if (enabled || disposed || !settings.enabled || scenes.length < 2) return;
    enabled = true;
    stage.hidden = false;
    for (const scene of scenes)
      scene.style.minHeight = `calc(${settings.distance} * 100svh)`;
    root.dataset.cameraJourneyActive = "true";
    (scrollContainer ?? window).addEventListener("scroll", schedule, {
      passive: true,
    });
    window.addEventListener("resize", schedule, { passive: true });
    document.addEventListener("visibilitychange", schedule);
    scenes.forEach((scene) => resizeObserver?.observe(scene));
    update();
  }

  function stop() {
    if (!enabled) return;
    enabled = false;
    (scrollContainer ?? window).removeEventListener("scroll", schedule);
    window.removeEventListener("resize", schedule);
    document.removeEventListener("visibilitychange", schedule);
    resizeObserver?.disconnect();
    if (frame !== undefined) cancelAnimationFrame(frame);
    frame = undefined;
    for (const scene of scenes) resetCopy(scene);
    for (const [scene, minHeight] of originalMinHeights) {
      if (minHeight) scene.style.minHeight = minHeight;
      else scene.style.removeProperty("min-height");
    }
    clearPair();
    stage.hidden = true;
    delete root.dataset.cameraJourneyActive;
    delete root.dataset.cameraJourneyStage;
  }

  function dispose() {
    if (disposed) return;
    stop();
    disposed = true;
    stage.remove();
  }

  return { start, stop, dispose };
}
