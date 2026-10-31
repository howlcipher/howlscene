import type { CSSProperties, ReactNode } from "react";
import { AssetImage } from "./media.js";
import { Scenery } from "./scenery.js";
import { defaultArtworkRegistry, type ArtworkRegistry } from "./artwork.js";
import { RichText } from "./rich_text.js";
import { themes, resolveTheme, type ThemeRegistry } from "./themes.js";
import {
  createSectionRegistry,
  type SectionRendererRegistry,
} from "./sections.js";
import type { SectionConfig, SiteConfig } from "./config.js";
import {
  collectLayoutStyles,
  defaultLayoutRegistry,
  type LayoutRegistry,
} from "./layouts.js";
const defaultSectionRegistry = createSectionRegistry();
const displayHeading = (heading: string) =>
  heading.trim() ? heading : "Untitled section";
/** Shared semantic renderer; independent of editor state and browser effects. */
export function Site({
  site,
  assetUrl,
  themeRegistry = themes,
  sectionRegistry = defaultSectionRegistry,
  layoutRegistry = defaultLayoutRegistry,
  includeLayoutStyles = true,
  artworkRegistry = defaultArtworkRegistry,
  sceneBackdrop,
  showScenery = true,
}: {
  site: SiteConfig;
  assetUrl?: (id: string, width?: number) => string;
  themeRegistry?: ThemeRegistry;
  artworkRegistry?: ArtworkRegistry;
  sectionRegistry?: SectionRendererRegistry;
  layoutRegistry?: LayoutRegistry;
  includeLayoutStyles?: boolean;
  /** Trusted consumer artwork rendered behind one scene, such as an external local image. */
  sceneBackdrop?: (section: SectionConfig, index: number) => ReactNode;
  /** Hides theme SVG scenery when the consumer supplies its own scene artwork. */
  showScenery?: boolean;
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
  const layoutStyles = collectLayoutStyles(site, layoutRegistry);
  return (
    <div
      className="howlscene"
      style={style}
      data-theme={site.theme}
      data-experience={site.experience}
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
      {includeLayoutStyles && layoutStyles.length > 0 && (
        <style data-howls-layout-styles>{layoutStyles.join("\n")}</style>
      )}
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
                {displayHeading(s.navigationLabel?.trim() || s.heading)}
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
          const definition = layoutRegistry[s.layout];
          if (!definition || !Object.hasOwn(layoutRegistry, s.layout))
            throw Error(`Unregistered layout '${s.layout}'.`);
          if (!definition.sectionTypes.includes(s.type))
            throw Error(
              `Layout '${s.layout}' is not supported for section type '${s.type}'.`,
            );
          const Layout = definition.renderer;
          const hasBackgroundImage =
            Boolean(s.image) && s.imageTreatment === "background";
          const image = s.image ? (
            <AssetImage
              asset={lookup(s.image)!}
              source={resolveAsset}
              className={
                hasBackgroundImage ? "scene-background-image" : "section-image"
              }
              loading={index === 0 ? "eager" : "lazy"}
              style={{ objectPosition: s.imagePosition }}
            />
          ) : null;
          const intro = (
            <>
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
            </>
          );
          const body = s.richText.length ? (
            <RichText value={s.richText} headingLevel={index === 0 ? 2 : 3} />
          ) : (
            s.body
              .split("\n")
              .map((paragraph, paragraphIndex) => (
                <p key={paragraphIndex}>{paragraph}</p>
              ))
          );
          const entries = (
            <Entries
              section={s}
              assetUrl={resolveAsset}
              asset={lookup}
              headingLevel={index === 0 ? 2 : 3}
            />
          );
          const cta = s.link ? (
            <a
              className="scene-cta"
              data-readable-surface="solid"
              href={s.link}
            >
              {s.linkLabel}
            </a>
          ) : null;
          return (
            <section
              key={s.id}
              id={s.id}
              data-scene-motion={s.animation}
              data-transition={s.transition}
              className={`scene layout-${s.layout} spacing-${s.spacing} align-${s.alignment} width-${s.contentWidth}`}
            >
              {s.transitionCover && (
                <AssetImage
                  asset={lookup(s.transitionCover)!}
                  source={resolveAsset}
                  className="scene-transition-cover"
                  loading={index === 0 ? "eager" : "lazy"}
                  aria-hidden="true"
                  alt=""
                />
              )}
              {sceneBackdrop?.(s, index)}
              {showScenery && (
                <Scenery
                  theme={site.theme}
                  themeRegistry={themeRegistry}
                  artworkRegistry={artworkRegistry}
                />
              )}
              <Layout
                section={s}
                intro={intro}
                image={image}
                body={body}
                entries={entries}
                cta={cta}
              />
            </section>
          );
        })}
      </main>
      <footer>Made with HowlScene</footer>
    </div>
  );
}
