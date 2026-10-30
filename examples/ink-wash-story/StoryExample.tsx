import { useEffect, useRef, useState } from "react";
import { Site, enhanceSite } from "../../packages/core/src/index";
import type { SectionConfig } from "../../packages/core/src/config";
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

function SceneBackdrop({
  section,
  index,
}: {
  section: SectionConfig;
  index: number;
}) {
  const id = section.id as StorySceneId;
  const artworkKey = storyArtwork[id];
  if (!artworkKey) return null;
  return (
    <div className="story-backdrop" aria-hidden="true">
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
}

export function StoryExample() {
  const host = useRef<HTMLDivElement>(null);
  const [activeId, setActiveId] = useState<StorySceneId | null>(null);

  useEffect(() => {
    const root = host.current?.querySelector<HTMLElement>(".howlscene");
    if (!root) return;

    const disposeMotion = enhanceSite(root);
    const scenes = Array.from(root.querySelectorAll<HTMLElement>(".scene"));
    if (typeof IntersectionObserver === "undefined") return disposeMotion;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (left, right) => right.intersectionRatio - left.intersectionRatio,
          )
          .at(0)?.target as HTMLElement | undefined;
        const nextId = visible?.id;
        if (nextId && Object.hasOwn(storyArtwork, nextId))
          setActiveId(nextId as StorySceneId);
      },
      { threshold: [0.35, 0.55, 0.75] },
    );
    scenes.forEach((scene) => observer.observe(scene));

    return () => {
      observer.disconnect();
      disposeMotion();
    };
  }, []);

  const selectedIndex = storySite.sections.findIndex(
    (section) => section.id === activeId,
  );
  const activeIndex = Math.max(0, selectedIndex);

  return (
    <div className="story-demo" ref={host}>
      <div className="story-footer-links">
        <a href="../../">← HowlScene</a>
        <a href={creditsUrl}>Artwork notes</a>
      </div>
      <Site
        site={storySite}
        showScenery={false}
        sceneBackdrop={(section, index) => (
          <SceneBackdrop section={section} index={index} />
        )}
      />
      <nav className="story-index" aria-label="Story scenes">
        {storySite.sections.map((section, index) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            aria-label={`${String(index + 1).padStart(2, "0")}, Scene ${index + 1}: ${section.heading}`}
            aria-current={activeId === section.id ? "location" : undefined}
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
