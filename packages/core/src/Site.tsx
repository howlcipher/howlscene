import type { CSSProperties, ComponentType } from "react";
import { AssetImage } from "./media.js";
import { Scenery } from "./scenery.js";
import { RichText } from "./rich_text.js";
import { themes, resolveTheme, type ThemeRegistry } from "./themes.js";
import {
  createSectionRegistry,
  type SectionRendererProps,
} from "./sections.js";
import type { SiteConfig, SectionConfig } from "./config.js";
const defaultSectionRegistry = createSectionRegistry();
const displayHeading = (heading: string) =>
  heading.trim() ? heading : "Untitled section";
/** Shared semantic renderer; independent of editor state and browser effects. */
export function Site({
  site,
  assetUrl,
  themeRegistry = themes,
  sectionRegistry = defaultSectionRegistry,
}: {
  site: SiteConfig;
  assetUrl?: (id: string, width?: number) => string;
  themeRegistry?: ThemeRegistry;
  sectionRegistry?: Record<
    SectionConfig["type"],
    ComponentType<SectionRendererProps>
  >;
}) {
  const manifest = themeRegistry[site.theme];
  if (!manifest) throw Error("Unsupported theme");
  const { tokens: theme } = resolveTheme(manifest, site.overrides);
  const lookup = (id: string) => site.assets.find((a) => a.id === id);
  const resolveAsset =
    assetUrl ??
    ((id: string, width?: number) => {
      const asset = lookup(id);
      if (!asset) throw Error("A referenced image is missing.");
      if (width) {
        const variant = asset.variants?.find((v) => v.width === width);
        if (!variant) throw Error("A responsive image is missing.");
        return variant.data;
      }
      return asset.data;
    });
  const style = {
    "--scene-bg": theme.background,
    "--scene-fg": theme.foreground,
    "--scene-accent": theme.accent,
    "--scene-font": theme.font,
  } as CSSProperties;
  const sections = site.sections.filter((s) => s.visible);
  return (
    <div
      className="howlscene"
      style={style}
      data-theme={site.theme}
      data-motion={site.motion}
      data-motion-intensity={site.motionSettings.intensity}
      data-motion-speed={site.motionSettings.speed}
    >
      <a className="skip-link" href="#site-content">
        Skip to content
      </a>
      <header className="site-header">
        <span className="site-title">{site.title}</span>
        <nav aria-label="Website sections">
          {sections
            .filter((s) => s.inNavigation)
            .map((s) => (
              <a key={s.id} href={`#${s.id}`}>
                {displayHeading(s.heading)}
              </a>
            ))}
        </nav>
        <button type="button" data-motion-toggle hidden>
          Disable animation
        </button>
      </header>
      <main id="site-content">
        {sections.map((s, index) => {
          const Entries = sectionRegistry[s.type];
          return (
            <section
              key={s.id}
              id={s.id}
              data-scene-motion={s.animation}
              className={`scene layout-${s.layout} spacing-${s.spacing} align-${s.alignment} width-${s.contentWidth}`}
            >
              <Scenery theme={site.theme} />
              <div className="scene-content">
                <p className="eyebrow">{s.type.replace("_", " ")}</p>
                {index === 0 ? (
                  <h1>{displayHeading(s.heading)}</h1>
                ) : (
                  <h2>{displayHeading(s.heading)}</h2>
                )}
                {s.image && (
                  <AssetImage
                    asset={lookup(s.image)!}
                    source={resolveAsset}
                    className={
                      s.imageTreatment === "background"
                        ? "scene-background-image"
                        : "section-image"
                    }
                    loading={index === 0 ? "eager" : "lazy"}
                    style={{ objectPosition: s.imagePosition }}
                  />
                )}{" "}
                {s.richText.length ? (
                  <RichText
                    value={s.richText}
                    headingLevel={index === 0 ? 2 : 3}
                  />
                ) : (
                  s.body.split("\n").map((p, i) => <p key={i}>{p}</p>)
                )}
                <Entries
                  section={s}
                  assetUrl={resolveAsset}
                  asset={lookup}
                  headingLevel={index === 0 ? 2 : 3}
                />
                {s.link && (
                  <a className="scene-cta" href={s.link}>
                    {s.linkLabel}
                  </a>
                )}
              </div>
            </section>
          );
        })}
      </main>
      <footer>Made with HowlScene</footer>
    </div>
  );
}
