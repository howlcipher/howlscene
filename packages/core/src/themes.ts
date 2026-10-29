import { z } from "zod";
import {
  builtinArtworkDescriptors,
  defaultThemeLayers,
  registryIdSchema,
  themeLayerSchema,
} from "./artwork_contract.js";
import type { ArtworkRegistry } from "./artwork.js";
const color = z.string().regex(/^#[0-9a-fA-F]{6}$/);
export const DEFAULT_THEME_ID = "modern";
const themeMotionSchema = z
  .strictObject({
    intensityScale: z.number().min(0).max(1).default(1),
    speedScale: z.number().min(0.5).max(2).default(1),
  })
  .readonly();
const themeAccessibilitySchema = z
  .strictObject({ parallax: z.boolean().default(true) })
  .readonly();
/** Bounded theme styling with fixed units; never arbitrary CSS or layout code. */
export const themePresentationSchema = z
  .strictObject({
    bodyLineHeight: z.number().min(1.5).max(2.2).default(1.8),
    cardGapRem: z.number().min(0.5).max(3).default(1.5),
    cardRadiusRem: z.number().min(0).max(2).default(0.7),
    navigationGapRem: z.number().min(0.5).max(3).default(1.2),
  })
  .readonly();
export type ThemePresentation = z.infer<typeof themePresentationSchema>;
export const themeSchema = z
  .strictObject({
    version: z
      .string()
      .regex(/^\d+\.\d+\.\d+$/)
      .default("1.0.0"),
    description: z.string().max(500).default("A configurable HowlScene theme."),
    name: z.string().min(1).max(100),
    background: color,
    foreground: color,
    accent: color,
    font: z.enum([
      "system-ui, sans-serif",
      "Georgia, serif",
      "ui-monospace, monospace",
    ]),
    presentation: themePresentationSchema.prefault({}),
    motion: themeMotionSchema.prefault({}),
    accessibility: themeAccessibilitySchema.prefault({}),
    layers: z
      .array(themeLayerSchema)
      .max(12)
      .refine(
        (layers) =>
          new Set(layers.map((layer) => layer.id)).size === layers.length,
        "Theme layer IDs must be unique.",
      )
      .readonly()
      .prefault(() => [...defaultThemeLayers]),
  })
  .readonly();
export type ThemeManifest = z.infer<typeof themeSchema>;
/** Authoring accepts omitted default settings and previously normalized manifests. */
export type ThemeManifestInput = z.input<typeof themeSchema>;
export type ThemeRegistry = Readonly<Record<string, ThemeManifest>>;
const builtinArtworkIds = new Set(Object.keys(builtinArtworkDescriptors));
function normalizeManifest(
  input: unknown,
  available: ReadonlySet<string>,
): ThemeManifest {
  const manifest = themeSchema.parse(input);
  for (const layer of manifest.layers) {
    if (!available.has(layer.artwork))
      throw new Error(`Unknown artwork '${layer.artwork}' in theme layers.`);
  }
  return manifest;
}
export const themes: ThemeRegistry &
  Record<"modern" | "ink" | "cyber", ThemeManifest> = Object.freeze({
  modern: normalizeManifest(
    {
      version: "1.0.0",
      description:
        "Clear typography, generous spacing, and quiet geometric scenery.",
      name: "Modern Professional",
      background: "#f4f5f7",
      foreground: "#162439",
      accent: "#184ca0",
      font: "system-ui, sans-serif",
      layers: defaultThemeLayers,
    },
    builtinArtworkIds,
  ),
  ink: normalizeManifest(
    {
      version: "1.0.0",
      description: "Painted mountains, mist, and layered natural shapes.",
      name: "Ink Wash",
      background: "#eee9dc",
      foreground: "#263b36",
      accent: "#496052",
      font: "Georgia, serif",
      layers: [
        { id: "sky", artwork: "ink-sky", depth: 0.08 },
        { id: "mountains", artwork: "ink-mountains", depth: 0.2 },
        { id: "mist", artwork: "ink-mist", depth: 0.35 },
        { id: "ridges", artwork: "ink-ridges", depth: 0.62 },
      ],
    },
    builtinArtworkIds,
  ),
  cyber: normalizeManifest(
    {
      version: "1.0.0",
      description:
        "A dark neon city with a layered horizon and perspective grid.",
      name: "Cyberpunk",
      background: "#111326",
      foreground: "#f4f3ff",
      accent: "#6ee7ed",
      font: "ui-monospace, monospace",
      layers: [
        { id: "horizon", artwork: "cyber-horizon", depth: 0.08 },
        { id: "city-distant", artwork: "cyber-city-distant", depth: 0.22 },
        { id: "city-near", artwork: "cyber-city-near", depth: 0.46 },
        { id: "grid", artwork: "cyber-grid", depth: 0.7 },
      ],
    },
    builtinArtworkIds,
  ),
});
/** Validate data references against explicitly supplied trusted artwork components. */
export function createThemeRegistry(
  additions: Record<string, ThemeManifestInput | ThemeManifest> = {},
  artworkRegistry?: ArtworkRegistry,
): ThemeRegistry {
  const available = artworkRegistry
    ? new Set(Object.keys(artworkRegistry))
    : builtinArtworkIds;
  const result: Record<string, ThemeManifest> = { ...themes };
  for (const [id, manifest] of Object.entries(additions)) {
    registryIdSchema.parse(id);
    result[id] = normalizeManifest(manifest, available);
  }
  return Object.freeze(result);
}

/** Safe user-facing theme controls, shared by validation and rendering. */
export const themeOverridesSchema = z.strictObject({
  accent: color.optional(),
  font: z.enum(["system", "serif", "mono"]).optional(),
});
const fontStacks = {
  system: "system-ui, sans-serif",
  serif: "Georgia, serif",
  mono: "ui-monospace, monospace",
} as const;

/** WCAG 2.2 sRGB relative luminance and contrast, for opaque six-digit colors.
 * https://www.w3.org/TR/WCAG22/#dfn-relative-luminance
 * This token comparison does not establish contrast over arbitrary artwork.
 */
export function contrastRatio(first: string, second: string): number {
  const luminance = (hex: string) => {
    color.parse(hex);
    const linear = (offset: number) => {
      const channel = Number.parseInt(hex.slice(offset, offset + 2), 16) / 255;
      return channel <= 0.04045
        ? channel / 12.92
        : ((channel + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * linear(1) + 0.7152 * linear(3) + 0.0722 * linear(5);
  };
  const a = luminance(first),
    b = luminance(second);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

/** Resolves accessible accent presentation without changing saved preferences. */
export function resolveTheme(
  manifest: ThemeManifestInput | ThemeManifest,
  overrides: unknown = {},
): { tokens: ThemeManifest; warnings: string[] } {
  const base = themeSchema.parse(manifest);
  const selected = themeOverridesSchema.parse(overrides);
  const tokens = {
    ...base,
    font: selected.font ? fontStacks[selected.font] : base.font,
    accent: selected.accent ?? base.accent,
  };
  const warnings: string[] = [];
  if (contrastRatio(tokens.accent, base.background) < 4.5) {
    tokens.accent =
      contrastRatio(base.accent, base.background) >= 4.5
        ? base.accent
        : base.foreground;
    warnings.push(
      "The selected accent is difficult to read against this background. A theme color is shown instead; your selected color is still saved.",
    );
  }
  return { tokens, warnings };
}
