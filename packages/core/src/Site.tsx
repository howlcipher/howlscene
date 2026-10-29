import type { CSSProperties } from "react";
import { AssetImage } from "./media.js";
import { Scenery } from "./scenery.js";
import { defaultArtworkRegistry, type ArtworkRegistry } from "./artwork.js";
import { RichText } from "./rich_text.js";
import { themes, resolveTheme, type ThemeRegistry } from "./themes.js";
import {
  createSectionRegistry,
  type SectionRendererRegistry,
} from "./sections.js";
import type { SiteConfig } from "./config.js";
const defaultSectionRegistry = createSectionRegistry();
const displayHeading = (heading: string) =>
  heading.trim() ? heading : "Untitled section";
/** Shared semantic renderer; independent of editor state and browser effects. */
export function Site({
  site,
  assetUrl,
  themeRegistry = themes,
  sectionRegistry = defaultSectionRegistry,
  artworkRegistry = defaultArtworkRegistry,
}: {
  site: SiteConfig;
  assetUrl?: (id: string, width?: number) => string;
  themeRegistry?: ThemeRegistry;
  artworkRegistry?: ArtworkRegistry;
  sectionRegistry?: SectionRendererRegistry;
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
    "--scene-body-line-height": theme.presentation.bodyLineHeight,
    "--scene-card-gap": `${theme.presentation.cardGapRem}rem`,
    "--scene-card-radius": `${theme.presentation.cardRadiusRem}rem`,
    "--scene-nav-gap": `${theme.presentation.navigationGapRem}rem`,
  } as CSSProperties;
  const sections = site.sections.filter((s) => s.visible);
  return (
    <div
      className="howlscene"
      style={style}
      data-theme={site.theme}
      data-theme-card-style={theme.presentation.cardStyle}
      data-theme-heading-treatment={theme.presentation.headingTreatment}
      data-theme-mobile-navigation={theme.presentation.mobileNavigationLayout}
      data-theme-navigation-style={theme.presentation.navigationStyle}
      data-motion={site.motion}
      data-motion-intensity={site.motionSettings.intensity}
      data-motion-speed={site.motionSettings.speed}
      data-theme-motion-intensity={theme.motion.intensityScale}
      data-theme-motion-speed={theme.motion.speedScale}
      data-theme-parallax={theme.accessibility.parallax}
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
          const rendererId =
            s.type === "custom" ? `custom:${s.customType}` : s.type;
          const Entries = sectionRegistry[rendererId];
          if (!Entries)
            throw Error(
              `This project uses an unsupported custom section '${s.customType}'. Register it before rendering.`,
            );
          return (
            <section
              key={s.id}
              id={s.id}
              data-scene-motion={s.animation}
              className={`scene layout-${s.layout} spacing-${s.spacing} align-${s.alignment} width-${s.contentWidth}`}
            >
              <Scenery
                theme={site.theme}
                themeRegistry={themeRegistry}
                artworkRegistry={artworkRegistry}
              />
              <div className="scene-content">
                <p className="eyebrow">
                  {(s.type === "custom" ? s.customType! : s.type).replace(
                    /[_-]/g,
                    " ",
                  )}
                </p>
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
