export * from "./backup.js";
import framerLicense from "../../../node_modules/framer-motion/LICENSE.md?raw";
import codeLicense from "../../../LICENSE?raw";
import motionLicense from "../../../node_modules/motion/LICENSE.md?raw";
import zodLicense from "../../../node_modules/zod/LICENSE?raw";
import motionDomLicense from "../../../node_modules/motion-dom/LICENSE.md?raw";
import motionUtilsLicense from "../../../node_modules/motion-utils/LICENSE.md?raw";
import sceneryCss from "../../core/src/scenery.css?raw";
import runtime from "../generated/site.js?raw";
import {
  validateProjectImages,
  validateEncodedImage,
} from "../../core/src/assets.js";
import { renderToStaticMarkup } from "react-dom/server";
import JSZip from "jszip";
import {
  parseSite,
  Site,
  themes,
  createThemeRegistry,
  createArtworkRegistry,
  type ArtworkRegistry,
  type ThemeRegistry,
  type SectionRendererRegistry,
  type LayoutRegistry,
  collectLayoutStyles,
} from "../../core/src/index.js";
import css from "../../core/src/site.css?raw";
import { formatPublishingInstructions } from "./publishing.js";
export { publishingOptions } from "./publishing.js";
const archiveDate = new Date("2000-01-01T00:00:00Z");
/** Separate asset identity from variant identity to prevent filename collisions. */
function assetPath(id: string, mime: string, width?: number): string {
  return `assets/${id}/${width === undefined ? "original" : `w${width}`}.${mime.split("/")[1]}`;
}
export interface ExportOptions {
  artworkRegistry?: ArtworkRegistry;
  themeRegistry?: ThemeRegistry;
  sectionRegistry?: SectionRendererRegistry;
  layoutRegistry?: LayoutRegistry;
}
/** Validates before packaging; generated content never depends on the editor. */
export async function exportWebsite(
  input: unknown,
  options: ExportOptions = {},
): Promise<Uint8Array> {
  const artworkRegistry = createArtworkRegistry(options.artworkRegistry);
  const themeRegistry = createThemeRegistry(
    options.themeRegistry ?? themes,
    artworkRegistry,
  );
  const site = parseSite(
    input,
    themeRegistry,
    options.sectionRegistry,
    options.layoutRegistry,
  );
  const layoutStyles = collectLayoutStyles(site, options.layoutRegistry);
  for (const asset of site.assets)
    for (const image of [asset, ...(asset.variants ?? [])])
      validateEncodedImage(image.data, image.mime);
  if (typeof createImageBitmap === "function")
    await validateProjectImages(site);
  const html =
    "<!doctype html>" +
    renderToStaticMarkup(
      <html lang="en">
        <head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>{site.title}</title>
          <meta name="description" content={site.description} />
          <meta property="og:title" content={site.title} />
          <meta property="og:description" content={site.description} />
          <meta
            name="robots"
            content={site.indexable ? "index,follow" : "noindex,nofollow"}
          />
          {site.canonical && <link rel="canonical" href={site.canonical} />}
          <meta property="og:type" content="website" />
          {site.canonical && (
            <meta property="og:url" content={site.canonical} />
          )}
          <link rel="icon" href="./favicon.svg" type="image/svg+xml" />
          <link rel="stylesheet" href="./site.css" />
          {layoutStyles.length > 0 && (
            <style data-howls-layout-styles>{layoutStyles.join("\n")}</style>
          )}
        </head>
        <body>
          <Site
            site={site}
            themeRegistry={themeRegistry}
            artworkRegistry={artworkRegistry}
            includeLayoutStyles={false}
            {...(options.sectionRegistry
              ? { sectionRegistry: options.sectionRegistry }
              : {})}
            {...(options.layoutRegistry
              ? { layoutRegistry: options.layoutRegistry }
              : {})}
            assetUrl={(id, width) => {
              const asset = site.assets.find((a) => a.id === id)!;
              const variant = width
                ? asset.variants?.find((v) => v.width === width)
                : undefined;
              return `./${assetPath(id, (variant ?? asset).mime, variant?.width)}`;
            }}
          />
          {site.motion !== "none" && <script src="./site.js" defer />}
        </body>
      </html>,
    );
  const zip = new JSZip();
  const files = {
    "index.html": html,
    "favicon.svg":
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#214637"/><path d="M14 45V19h7v10h22V19h7v26h-7V35H21v10z" fill="#fff"/></svg>',
    "LICENSES.txt":
      codeLicense +
      "\nMotion\n" +
      motionLicense +
      "\nFramer Motion\n" +
      framerLicense +
      "\nMotion DOM\n" +
      motionDomLicense +
      "\nMotion utils\n" +
      motionUtilsLicense +
      "\nZod\n" +
      zodLicense,
    "site.css":
      sceneryCss +
      "\n" +
      css.replace(/@import\s+["']\.\/scenery\.css["'];?\s*/g, ""),
    "PUBLISH.txt": formatPublishingInstructions(),
  };
  for (const [path, contents] of Object.entries(files))
    zip.file(path, contents, { date: archiveDate });
  if (site.motion !== "none")
    zip.file("site.js", runtime, { date: archiveDate });
  const visible = site.sections.filter((s) => s.visible);
  const used = new Set(
    visible.flatMap((s) =>
      [s.image, s.transitionCover, ...s.entries.map((e) => e.image)].filter(
        (id): id is string => Boolean(id),
      ),
    ),
  );
  for (const asset of site.assets.filter((a) => used.has(a.id))) {
    zip.file(assetPath(asset.id, asset.mime), asset.data.split(",")[1]!, {
      base64: true,
      date: archiveDate,
    });
    for (const variant of asset.variants ?? [])
      zip.file(
        assetPath(asset.id, variant.mime, variant.width),
        variant.data.split(",")[1]!,
        { base64: true, date: archiveDate },
      );
  }
  return zip.generateAsync({
    type: "uint8array",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
    platform: "UNIX",
  });
}
