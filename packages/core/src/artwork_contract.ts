import { z } from "zod";
export const registryIdSchema = z
  .string()
  .regex(/^[a-z][a-z0-9-]{0,63}$/)
  .refine(
    (id) => !["constructor", "prototype", "__proto__"].includes(id),
    "This identifier is reserved.",
  );
export const themeLayerSchema = z
  .strictObject({
    id: registryIdSchema,
    artwork: registryIdSchema,
    depth: z.number().min(-1).max(1),
    opacity: z.number().min(0).max(1).optional(),
  })
  .readonly();
export type ThemeLayer = z.infer<typeof themeLayerSchema>;
export const builtinArtworkDescriptors = Object.freeze({
  "ink-sky": Object.freeze({ className: "scenery-ink-sky" }),
  "ink-mountains": Object.freeze({ className: "scenery-mountains" }),
  "ink-mist": Object.freeze({ className: "scenery-mist" }),
  "ink-ridges": Object.freeze({ className: "scenery-ink-ridges" }),
  "cyber-horizon": Object.freeze({ className: "scenery-cyber-horizon" }),
  "cyber-city-distant": Object.freeze({
    className: "scenery-skyline scenery-city-distant",
  }),
  "cyber-city-near": Object.freeze({
    className: "scenery-skyline scenery-city-near",
  }),
  "cyber-grid": Object.freeze({ className: "scenery-cyber-grid" }),
  "modern-paper": Object.freeze({ className: "scenery-modern-paper" }),
  "modern-orbit": Object.freeze({ className: "scenery-orbit" }),
  "modern-ribbon": Object.freeze({ className: "scenery-modern-ribbon" }),
});
export const defaultThemeLayers: readonly ThemeLayer[] = Object.freeze([
  themeLayerSchema.parse({ id: "paper", artwork: "modern-paper", depth: 0.08 }),
  themeLayerSchema.parse({ id: "orbit", artwork: "modern-orbit", depth: 0.2 }),
  themeLayerSchema.parse({
    id: "ribbon",
    artwork: "modern-ribbon",
    depth: 0.38,
  }),
]);
