import { z } from "zod";
import {
  sectionTypes,
  layoutIds,
  sectionSpacings,
  sectionAlignments,
  sectionContentWidths,
  sectionImagePositions,
} from "./registry.js";
import {
  validateEncodedImage,
  inspectImageDimensions,
  assertProjectAssetBudget,
} from "./assets.js";
import { richTextSchema, safeUrl } from "./rich_text.js";
import { themes, themeOverridesSchema, type ThemeRegistry } from "./themes.js";
import { entriesSchema } from "./sections.js";
const imageFields = {
  mime: z.enum(["image/png", "image/jpeg", "image/webp"]),
  data: z.string().max(7000000),
};
const variantSchema = z.strictObject({
  ...imageFields,
  width: z.number().int().min(1).max(1600),
  height: z.number().int().min(1).max(1600),
});
const assetMetadataSchema = z.strictObject({
  id: z.string().regex(/^asset-[a-zA-Z0-9-]{1,80}$/),
  ...imageFields,
  alt: z.string().max(500),
  width: z.number().int().min(1).max(8192).optional(),
  height: z.number().int().min(1).max(8192).optional(),
  variants: z.array(variantSchema).max(2).optional(),
});
const assetSchema = assetMetadataSchema.superRefine((asset, ctx) => {
  try {
    for (const image of [asset, ...(asset.variants ?? [])]) {
      const bytes = validateEncodedImage(image.data, image.mime);
      const actual = inspectImageDimensions(bytes, image.mime);
      if (
        (image.width !== undefined && image.width !== actual.width) ||
        (image.height !== undefined && image.height !== actual.height)
      )
        throw Error("Image dimensions do not match the stored dimensions.");
    }
    if (
      new Set(asset.variants?.map((v) => v.width)).size !==
      (asset.variants?.length ?? 0)
    )
      throw Error("Responsive image widths must be unique.");
    if (asset.variants?.length && !asset.width)
      throw Error("Responsive images need their full image width.");
  } catch (error) {
    ctx.addIssue({
      code: "custom",
      message: error instanceof Error ? error.message : "Invalid image data",
      path: ["data"],
    });
  }
});
const assetsSchema = z
  .array(assetMetadataSchema)
  .max(20)
  .superRefine((assets, ctx) => {
    try {
      assertProjectAssetBudget(assets);
    } catch (error) {
      ctx.addIssue({
        code: "custom",
        message:
          error instanceof Error ? error.message : "Invalid asset budget",
      });
    }
  })
  .pipe(z.array(assetSchema));
const sectionSchema = z.strictObject({
  id: z
    .string()
    .regex(/^[a-z][a-z0-9-]{0,63}$/)
    .refine((id) => id !== "site-content", "This section ID is reserved"),
  type: z.enum(sectionTypes),
  animation: z
    .enum(["inherit", "none", "calm", "cinematic", "dynamic"])
    .default("inherit"),
  entries: entriesSchema.default([]),
  link: safeUrl.optional(),
  linkLabel: z.string().max(100).default("Learn more"),
  image: z.string().optional(),
  imageTreatment: z.enum(["inline", "background"]).default("inline"),
  inNavigation: z.boolean().default(true),
  spacing: z.enum(sectionSpacings).default("comfortable"),
  alignment: z.enum(sectionAlignments).default("center"),
  contentWidth: z.enum(sectionContentWidths).default("normal"),
  imagePosition: z.enum(sectionImagePositions).default("center"),
  heading: z.string().max(300),
  richText: richTextSchema.default([]),
  body: z.string().max(30000).default(""),
  visible: z.boolean().default(true),
  layout: z.enum(layoutIds).default("centered"),
});
export const siteSchema = z
  .strictObject({
    schemaVersion: z.literal(1),
    title: z.string().min(1).max(200),
    description: z.string().max(500).default(""),
    canonical: safeUrl
      .refine(
        (url) => url.startsWith("https://"),
        "Use an https:// canonical address.",
      )
      .optional(),
    indexable: z.boolean().default(true),
    theme: z
      .string()
      .regex(/^[a-z][a-z0-9-]{0,63}$/)
      .default("modern"),
    assets: assetsSchema.default([]),
    overrides: themeOverridesSchema.default({}),
    motionSettings: z
      .strictObject({
        intensity: z.number().min(0).max(1).default(1),
        speed: z.number().min(0.5).max(2).default(1),
      })
      .default({ intensity: 1, speed: 1 }),
    motion: z.enum(["none", "calm", "cinematic", "dynamic"]).default("none"),
    sections: z.array(sectionSchema).min(1).max(100),
  })
  .superRefine((site, ctx) => {
    if (new Set(site.assets.map((a) => a.id)).size !== site.assets.length)
      ctx.addIssue({ code: "custom", message: "Asset IDs must be unique" });
    for (const section of site.sections)
      if (
        [section.image, ...section.entries.map((e) => e.image)].some(
          (id) => id && !site.assets.some((a) => a.id === id),
        )
      )
        ctx.addIssue({
          code: "custom",
          message: "A referenced image is missing",
          path: ["sections"],
        });
    if (new Set(site.sections.map((s) => s.id)).size !== site.sections.length)
      ctx.addIssue({
        code: "custom",
        message: "Section IDs must be unique",
        path: ["sections"],
      });
  });
export type SiteConfig = z.infer<typeof siteSchema>;
export type SectionConfig = SiteConfig["sections"][number];
/** Validates an untrusted project atomically without mutating input. */
export function parseSite(
  input: unknown,
  themeRegistry: ThemeRegistry = themes,
): SiteConfig {
  if (
    typeof input === "object" &&
    input !== null &&
    "schemaVersion" in input &&
    input.schemaVersion !== 1
  )
    throw new Error(
      "Unsupported project version. Open it in a compatible version of HowlScene.",
    );
  const parsed = siteSchema.parse(input);
  if (!Object.hasOwn(themeRegistry, parsed.theme))
    throw Error(
      "This project uses an unsupported theme. Register it before rendering.",
    );
  return parsed;
}
export const starterSite = parseSite({
  schemaVersion: 1,
  title: "My website",
  description: "A website made with HowlScene.",
  sections: [
    {
      id: "intro",
      type: "hero",
      heading: "Build something worth sharing",
      body: "Your ideas deserve a place of their own. Start with a few words, then make this space yours.",
    },
  ],
});
