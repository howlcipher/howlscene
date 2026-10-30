import { useEffect, useRef, useState } from "react";
import { Site, enhanceSite } from "../../packages/core/src/index";
import { storyArtwork, storySite } from "./site";
import type { StorySceneId } from "./site";

const artworkUrls: Record<StorySceneId, string> = {
  "scene-1": "./assets/stone-bridge.webp",
  "scene-2": "./assets/clocktower-river.webp",
  "scene-3": "./assets/moon-gate.webp",
  "scene-4": "./assets/river-city.webp",
  "scene-5": "./assets/dusk-skyline.webp",
};
const creditsUrl = "./assets/CREDITS.txt";

function StoryCanvas() {
  return (
    <div className="story-canvas" aria-hidden="true">
      {storySite.sections.map((section, index) => {
        const id = section.id as StorySceneId;
        if (!storyArtwork[id]) return null;
        return (
          <div className="story-backdrop" data-story-scene={id} key={id}>
            <img
              className="story-art"
              src={artworkUrls[id]}
              alt=""
              loading={index === 0 ? "eager" : "lazy"}
              fetchPriority={index === 0 ? "high" : "auto"}
              decoding="async"
            />
          </div>
        );
      })}
      <div className="story-transition-mist" />
    </div>
  );
}

function StoryCopyStage() {
  return (
    <div className="story-copy-stage" aria-hidden="true">
      {storySite.sections.map((section, index) => {
        const Heading = index === 0 ? "h1" : "h2";
        return (
          <section
            className={`scene-copy story-copy-panel align-${section.alignment}`}
            data-story-copy-scene={section.id}
            key={section.id}
          >
            <p className="eyebrow">{section.type.replace(/[_-]/g, " ")}</p>
            <Heading>{section.heading}</Heading>
            {section.body.split("\n").map((paragraph, paragraphIndex) => (
              <p key={paragraphIndex}>{paragraph}</p>
            ))}
          </section>
        );
      })}
    </div>
  );
}

export function StoryExample() {
  const host = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const root = host.current?.querySelector<HTMLElement>(".howlscene");
    const canvas = host.current?.querySelector<HTMLElement>(".story-canvas");
    const copyStage =
      host.current?.querySelector<HTMLElement>(".story-copy-stage");
    if (!root || !canvas || !copyStage) return;

    const disposeMotion = enhanceSite(root);
    host.current?.classList.add("is-enhanced");
    const scenes = Array.from(root.querySelectorAll<HTMLElement>(".scene"));
    const layers = Array.from(
      canvas.querySelectorAll<HTMLElement>(".story-backdrop"),
    );
    const images = layers.map((layer) =>
      layer.querySelector<HTMLElement>(".story-art"),
    );
    const copyLayers = Array.from(
      copyStage.querySelectorAll<HTMLElement>(".story-copy-panel"),
    );
    const mist = canvas.querySelector<HTMLElement>(".story-transition-mist");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;

    const updateFromScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        if (!scenes.length || !layers.length) return;

        let segmentIndex = scenes.length - 1;
        let progress = 0;
        for (let index = 0; index < scenes.length - 1; index += 1) {
          const currentTop = scenes[index]!.getBoundingClientRect().top;
          const nextTop = scenes[index + 1]!.getBoundingClientRect().top;
          if (currentTop <= 0 && nextTop >= 0) {
            segmentIndex = index;
            progress = Math.min(
              1,
              Math.max(0, -currentTop / Math.max(1, nextTop - currentTop)),
            );
            break;
          }
          if (currentTop > 0) {
            segmentIndex = index;
            progress = 0;
            break;
          }
        }

        const motionDisabled =
          root.dataset.motionEnabled === "false" || reducedMotion.matches;
        const blend = motionDisabled ? (progress < 0.5 ? 0 : 1) : progress;
        layers.forEach((layer, index) => {
          const isOutgoing = index === segmentIndex;
          const isIncoming = index === segmentIndex + 1;
          const isSettled = segmentIndex === scenes.length - 1 && isOutgoing;
          const opacity = motionDisabled
            ? index === segmentIndex + (progress < 0.5 ? 0 : 1) || isSettled
              ? 1
              : 0
            : isOutgoing || isIncoming || isSettled
              ? 1
              : 0;
          layer.style.opacity = String(opacity);
          const revealEdge = (1 - progress) * 100;
          const revealMask =
            !motionDisabled && isIncoming
              ? `linear-gradient(to bottom, transparent ${Math.max(0, revealEdge - 9)}%, black ${Math.min(100, revealEdge + 9)}%)`
              : "none";
          layer.style.maskImage = revealMask;
          layer.style.setProperty("-webkit-mask-image", revealMask);
          const image = images[index];
          if (!image) return;
          if (motionDisabled) {
            image.style.transform = "none";
            image.style.filter = "none";
          } else if (isOutgoing) {
            image.style.transform = `translate3d(0, ${-8 * progress}vh, 0) scale(${1.08 + 0.04 * progress})`;
            image.style.filter = `blur(${progress * 1.5}px)`;
          } else if (isIncoming) {
            image.style.transform = `translate3d(0, ${(1 - progress) * 12}vh, 0) scale(${1.14 - 0.06 * progress})`;
            image.style.filter = `blur(${(1 - progress) * 1.5}px)`;
          } else {
            image.style.transform = "translate3d(0, 0, 0) scale(1.08)";
            image.style.filter = "none";
          }
        });
        if (mist) {
          mist.style.opacity = motionDisabled
            ? "0"
            : String(Math.sin(Math.PI * progress) * 0.68);
          mist.style.transform = motionDisabled
            ? "none"
            : `translate3d(0, ${(1 - progress) * 9}vh, 0)`;
        }
        copyLayers.forEach((panel, index) => {
          const opacity =
            index === segmentIndex
              ? 1 - blend
              : index === segmentIndex + 1
                ? blend
                : segmentIndex === scenes.length - 1 && index === segmentIndex
                  ? 1
                  : 0;
          panel.style.opacity = String(opacity);
          const panelProgress =
            index === segmentIndex ? progress : 1 - progress;
          const direction = index === segmentIndex ? -1 : 1;
          panel.style.setProperty(
            "--story-panel-offset",
            motionDisabled ? "0px" : `${direction * panelProgress * 12}px`,
          );
        });

        const nextIndex = Math.min(
          scenes.length - 1,
          segmentIndex + (blend >= 0.5 ? 1 : 0),
        );
        setActiveIndex((current) =>
          current === nextIndex ? current : nextIndex,
        );
      });
    };

    const motionObserver = new MutationObserver(updateFromScroll);
    motionObserver.observe(root, {
      attributes: true,
      attributeFilter: ["data-motion-enabled"],
    });
    window.addEventListener("scroll", updateFromScroll, { passive: true });
    window.addEventListener("resize", updateFromScroll);
    reducedMotion.addEventListener("change", updateFromScroll);
    updateFromScroll();

    return () => {
      host.current?.classList.remove("is-enhanced");
      window.removeEventListener("scroll", updateFromScroll);
      window.removeEventListener("resize", updateFromScroll);
      reducedMotion.removeEventListener("change", updateFromScroll);
      motionObserver.disconnect();
      if (frame) window.cancelAnimationFrame(frame);
      disposeMotion();
    };
  }, []);

  return (
    <div className="story-demo" ref={host}>
      <StoryCanvas />
      <StoryCopyStage />
      <div className="story-footer-links">
        <a href="../../">← HowlScene</a>
        <a href={creditsUrl}>Artwork notes</a>
      </div>
      <Site site={storySite} showScenery={false} />
      <nav className="story-index" aria-label="Story scenes">
        {storySite.sections.map((section, index) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            aria-label={`${String(index + 1).padStart(2, "0")}, Scene ${index + 1}: ${section.heading}`}
            aria-current={activeIndex === index ? "location" : undefined}
          >
            <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
          </a>
        ))}
      </nav>
      <p className="story-scene-status" aria-live="polite" aria-atomic="true">
        Scene {activeIndex + 1} of {storySite.sections.length}:{" "}
        {storySite.sections[activeIndex]?.heading}
      </p>
      <div className="story-step-controls" aria-label="Story controls">
        {activeIndex > 0 && (
          <a href={`#${storySite.sections[activeIndex - 1]!.id}`}>
            <span aria-hidden="true">←</span> Previous
          </a>
        )}
        {activeIndex < storySite.sections.length - 1 ? (
          <a href={`#${storySite.sections[activeIndex + 1]!.id}`}>
            Next scene <span aria-hidden="true">↓</span>
          </a>
        ) : (
          <a href="#scene-1">
            Return to beginning <span aria-hidden="true">↑</span>
          </a>
        )}
      </div>
    </div>
  );
}
