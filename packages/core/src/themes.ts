import { z } from "zod";
const color = z.string().regex(/^#[0-9a-fA-F]{6}$/);
export const themeSchema = z.strictObject({
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
});
export type ThemeManifest = z.infer<typeof themeSchema>;
export type ThemeRegistry = Readonly<Record<string, ThemeManifest>>;
export const themes: ThemeRegistry &
  Record<"modern" | "ink" | "cyber", ThemeManifest> = Object.freeze({
  modern: {
    version: "1.0.0",
    description:
      "Clear typography, generous spacing, and quiet geometric scenery.",
    name: "Modern Professional",
    background: "#f4f5f7",
    foreground: "#162439",
    accent: "#184ca0",
    font: "system-ui, sans-serif",
  },
  ink: {
    version: "1.0.0",
    description: "Painted mountains, mist, and layered natural shapes.",
    name: "Ink Wash",
    background: "#eee9dc",
    foreground: "#263b36",
    accent: "#496052",
    font: "Georgia, serif",
  },
  cyber: {
    version: "1.0.0",
    description:
      "A dark neon city with a layered horizon and perspective grid.",
    name: "Cyberpunk",
    background: "#111326",
    foreground: "#f4f3ff",
    accent: "#6ee7ed",
    font: "ui-monospace, monospace",
  },
});
/** A private registry per consumer; validates CSS tokens rather than executing theme code. */
export function createThemeRegistry(
  additions: Record<string, ThemeManifest> = {},
): ThemeRegistry {
  const result: Record<string, ThemeManifest> = { ...themes };
  for (const [id, manifest] of Object.entries(additions)) {
    z.string()
      .regex(/^[a-z][a-z0-9-]{0,63}$/)
      .refine((v) => !["constructor", "prototype", "__proto__"].includes(v))
      .parse(id);
    result[id] = Object.freeze(themeSchema.parse(manifest));
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
  manifest: ThemeManifest,
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
