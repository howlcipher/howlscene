import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Site,
  createThemeRegistry,
  parseSite,
  themes,
} from "../../packages/core/src/index";
import { exportWebsite } from "../../packages/export/src/index";
import { enhanceSite } from "../../packages/core/src/enhance";
import "../../packages/core/src/site.css";

const maximumPresentation = {
  bodyLineHeight: 2.2,
  cardGapRem: 3,
  cardRadiusRem: 2,
  navigationGapRem: 3,
};
const registry = createThemeRegistry({
  baseline: { ...themes.modern, name: "Baseline" },
  spacious: {
    ...themes.modern,
    name: "Spacious cards",
    presentation: {
      bodyLineHeight: 2,
      cardGapRem: 2.5,
      cardRadiusRem: 1.5,
      navigationGapRem: 2,
    },
    motion: { intensityScale: 0.35, speedScale: 1.8 },
    accessibility: { parallax: false },
  },
  maximum: {
    ...themes.modern,
    name: "Maximum supported modern presentation",
    presentation: maximumPresentation,
  },
  "maximum-ink": {
    ...themes.ink,
    name: "Maximum supported Ink Wash presentation",
    presentation: maximumPresentation,
  },
  "maximum-cyber": {
    ...themes.cyber,
    name: "Maximum supported Cyberpunk presentation",
    presentation: maximumPresentation,
  },
});
const content = {
  schemaVersion: 1,
  title: "Presentation contract",
  motion: "cinematic",
  sections: [
    {
      id: "intro",
      type: "hero",
      heading: "A considered portfolio",
      body: "The same words in every theme, at every size. Read slowly through a record of careful work, thoughtful questions, quiet experiments, and useful discoveries. Even when a longUnbrokenWordNeedsToWrapAcrossTheAvailableMeasure, the complete introduction should remain visible and readable without forcing the page to scroll sideways.",
    },
    {
      id: "projects",
      type: "projects",
      heading: "Selected work",
      entries: [
        { id: "first", title: "Useful tools", body: "Made with care." },
        { id: "second", title: "Small experiments", body: "Always learning." },
      ],
    },
  ],
};
function Fixture() {
  const [theme, setTheme] = useState("spacious");
  const site = parseSite({ ...content, theme }, registry);
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".howlscene");
    return root ? enhanceSite(root) : undefined;
  }, [theme]);
  return (
    <>
      <div className="fixture-controls">
        <label>
          Fixture theme
          <select
            value={theme}
            onChange={(event) => setTheme(event.target.value)}
          >
            <option value="spacious">Spacious</option>
            <option value="baseline">Baseline</option>
            <option value="maximum">Maximum supported</option>
            <option value="maximum-ink">Maximum supported Ink Wash</option>
            <option value="maximum-cyber">Maximum supported Cyberpunk</option>
          </select>
        </label>
        <button
          type="button"
          onClick={async () => {
            const bytes = await exportWebsite(site, {
              themeRegistry: registry,
            });
            const url = URL.createObjectURL(
              new Blob([new Uint8Array(bytes)], { type: "application/zip" }),
            );
            const link = document.createElement("a");
            link.href = url;
            link.download = "presentation.zip";
            link.click();
            setTimeout(() => URL.revokeObjectURL(url), 0);
          }}
        >
          Download contract website
        </button>
      </div>
      <Site site={site} themeRegistry={registry} />
    </>
  );
}
const root = document.getElementById("root");
if (!root) throw Error("Missing fixture root");
createRoot(root).render(<Fixture />);
