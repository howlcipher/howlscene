import { useEffect, useRef, useState } from "react";
import { Site, themes, type SiteConfig } from "../../packages/core/src/index";
import { enhanceSite } from "../../packages/core/src/enhance";
import { williamSite, originalPortfolioUrl } from "./site";
export function Example() {
  const [theme, setTheme] = useState<SiteConfig["theme"]>("ink");
  const [interactive, setInteractive] = useState(false);
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    setInteractive(true);
  }, []);
  useEffect(() => {
    const root = host.current?.querySelector<HTMLElement>(".howlscene");
    if (root) return enhanceSite(root);
  }, [theme]);
  return (
    <>
      <aside className="demo-toolbar" aria-label="Example controls">
        <a href="../../">HowlScene</a>
        <label>
          Try a theme{" "}
          <select
            disabled={!interactive}
            value={theme}
            onChange={(event) => {
              const value = event.target.value;
              if (value === "ink" || value === "cyber" || value === "modern")
                setTheme(value);
            }}
          >
            {Object.entries(themes).map(([id, entry]) => (
              <option key={id} value={id}>
                {entry.name}
              </option>
            ))}
          </select>
        </label>
        <a href={originalPortfolioUrl}>Original portfolio</a>
      </aside>
      <noscript>
        <p className="demo-toolbar">
          You are viewing the Ink Wash presentation. Enable JavaScript to switch
          themes or use animation controls. All portfolio content and links
          remain available.
        </p>
      </noscript>
      <div ref={host}>
        <Site
          site={{
            ...williamSite,
            theme,
            motion: theme === "modern" ? "none" : "cinematic",
          }}
        />
      </div>
    </>
  );
}
