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
const transitionCoverUrl = "./assets/mist-cover.webp";

export function StoryExample() {
  const host = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const root = host.current?.querySelector<HTMLElement>(".howlscene");
    if (!root) return;

    const disposeMotion = enhanceSite(root);
    const scenes = Array.from(root.querySelectorAll<HTMLElement>(".scene"));
    const observer = new IntersectionObserver(
      (entries) => {
        const current = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (left, right) => right.intersectionRatio - left.intersectionRatio,
          )[0];
        const index = current
          ? scenes.indexOf(current.target as HTMLElement)
          : -1;
        if (index >= 0) setActiveIndex(index);
      },
      { rootMargin: "-35% 0px -45% 0px", threshold: [0, 0.2, 0.5, 0.8, 1] },
    );
    scenes.forEach((scene) => observer.observe(scene));

    return () => {
      observer.disconnect();
      disposeMotion();
    };
  }, []);

  return (
    <div className="story-demo" ref={host}>
      <div className="story-footer-links">
        <a href="../../">← HowlScene</a>
        <a href={creditsUrl}>Artwork notes</a>
      </div>
      <Site
        site={storySite}
        sceneBackdrop={(section, index) => {
          const id = section.id as StorySceneId;
          const artwork = storyArtwork[id];
          if (!artwork) return null;
          return (
            <>
              <img
                className="scene-background-image story-art"
                src={artworkUrls[id]}
                alt=""
                aria-hidden="true"
                loading={index === 0 ? "eager" : "lazy"}
                fetchPriority={index === 0 ? "high" : "auto"}
                decoding="async"
              />
              <img
                className="scene-transition-cover"
                src={transitionCoverUrl}
                alt=""
                aria-hidden="true"
                loading="lazy"
                decoding="async"
              />
            </>
          );
        }}
        showScenery={false}
      />
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
