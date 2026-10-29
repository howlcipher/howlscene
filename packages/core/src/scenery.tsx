import { isValidElement } from "react";
import { DEFAULT_THEME_ID, themes, type ThemeRegistry } from "./themes.js";
import { defaultArtworkRegistry, type ArtworkRegistry } from "./artwork.js";

export interface SceneryProps {
  theme: string;
  themeRegistry?: ThemeRegistry;
  artworkRegistry?: ArtworkRegistry;
}
/** Generic decorative SVG layers. Theme manifests own ordering and motion depth;
 * the trusted artwork registry owns shapes. Essential content stays outside.
 */
export function Scenery({
  theme,
  themeRegistry = themes,
  artworkRegistry = defaultArtworkRegistry,
}: SceneryProps) {
  const id = Object.hasOwn(themeRegistry, theme) ? theme : DEFAULT_THEME_ID;
  const manifest = themeRegistry[id] ?? themes[DEFAULT_THEME_ID];
  return (
    <div className="scenery" data-theme={id} aria-hidden="true">
      {manifest.layers.map((layer) => {
        const artwork = Object.hasOwn(artworkRegistry, layer.artwork)
          ? artworkRegistry[layer.artwork]
          : undefined;
        if (!artwork) throw new Error(`Unknown artwork: ${layer.artwork}`);
        const children = artwork.render();
        if (children !== null && !isValidElement(children))
          throw new Error(
            `Artwork ${layer.artwork} must return a React element or null synchronously.`,
          );
        return (
          <svg
            key={layer.id}
            className={["scenery-layer", "scene-layer", artwork.className]
              .filter(Boolean)
              .join(" ")}
            data-depth={layer.depth}
            viewBox="0 0 1440 900"
            preserveAspectRatio="xMidYMax slice"
            focusable="false"
            aria-hidden="true"
            style={
              layer.opacity === undefined
                ? undefined
                : { opacity: layer.opacity }
            }
          >
            {children}
          </svg>
        );
      })}
      <div className="scenery-veil" />
    </div>
  );
}
