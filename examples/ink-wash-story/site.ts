import { parseSite } from "../../packages/core/src/index";

export const storySite = parseSite({
  schemaVersion: 1,
  title: "LOREM — A JOURNEY THROUGH THE CITY",
  description:
    "A cinematic ink-wash story sample with five original landscapes and placeholder copy.",
  experience: "cinematic",
  theme: "ink",
  motion: "cinematic",
  motionSettings: { intensity: 0.82, speed: 0.82 },
  sections: [
    {
      id: "scene-1",
      type: "hero",
      heading: "Lorem ipsum dolor sit amet",
      body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus vitae nunc sed justo consequat porttitor. Aenean non sapien at ipsum tincidunt posuere.\nCurabitur posuere, augue ut facilisis pulvinar, nisl mauris volutpat arcu, vitae lacinia lacus justo at metus.",
      layout: "wide",
      spacing: "spacious",
      alignment: "start",
      contentWidth: "wide",
      animation: "cinematic",
      transition: "mist-reveal",
    },
    {
      id: "scene-2",
      type: "about",
      heading: "Consectetur adipiscing elit",
      body: "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium. Integer quis magna ac velit efficitur tincidunt.\nDonec commodo, urna vitae mattis dignissim, mi nulla convallis sapien, ut iaculis nunc lectus quis metus.",
      layout: "wide",
      spacing: "spacious",
      alignment: "end",
      contentWidth: "wide",
      animation: "cinematic",
      transition: "mist-reveal",
    },
    {
      id: "scene-3",
      type: "rich_text",
      heading: "Sed do eiusmod tempor",
      body: "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Nam dapibus, eros at cursus posuere, urna lorem commodo sem, sit amet tincidunt sapien risus in arcu.\nNulla facilisi. Duis vitae risus sed odio varius egestas. Morbi quis est at sapien dictum feugiat.",
      layout: "wide",
      spacing: "spacious",
      alignment: "start",
      contentWidth: "wide",
      animation: "cinematic",
      transition: "mist-reveal",
    },
    {
      id: "scene-4",
      type: "projects",
      heading: "Ut labore et dolore magna",
      body: "Ut labore et dolore magna aliqua. Phasellus gravida velit id nibh cursus, sit amet suscipit risus porta.\nMaecenas feugiat, arcu nec faucibus varius, leo nulla lacinia odio, non feugiat lacus neque sed sapien.",
      layout: "wide",
      spacing: "spacious",
      alignment: "end",
      contentWidth: "wide",
      animation: "cinematic",
      transition: "mist-reveal",
    },
    {
      id: "scene-5",
      type: "contact",
      heading: "Quis nostrud exercitation",
      body: "Quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Suspendisse vitae nisi sed urna dignissim blandit.\nAenean tempor, orci sed cursus varius, justo leo dictum dolor, vitae suscipit justo risus id purus.",
      layout: "wide",
      spacing: "spacious",
      alignment: "start",
      contentWidth: "wide",
      animation: "cinematic",
      transition: "mist-reveal",
    },
  ],
});

export const storyArtwork = {
  "scene-1": "stone-bridge",
  "scene-2": "clocktower-river",
  "scene-3": "moon-gate",
  "scene-4": "river-city",
  "scene-5": "dusk-skyline",
} as const;

export type StorySceneId = keyof typeof storyArtwork;
