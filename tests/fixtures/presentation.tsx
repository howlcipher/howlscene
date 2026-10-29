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
      body: "The same words in every theme.",
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
      <label>
        Fixture theme
        <select
          value={theme}
          onChange={(event) => setTheme(event.target.value)}
        >
          <option value="spacious">Spacious</option>
          <option value="baseline">Baseline</option>
        </select>
      </label>
      <button
        type="button"
        onClick={async () => {
          const bytes = await exportWebsite(site, { themeRegistry: registry });
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
      <Site site={site} themeRegistry={registry} />
    </>
  );
}
const root = document.getElementById("root");
if (!root) throw Error("Missing fixture root");
createRoot(root).render(<Fixture />);
