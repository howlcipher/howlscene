import { z } from "zod";
import {
  sectionTypes,
  sectionSpacings,
  sectionAlignments,
  sectionContentWidths,
  sectionImagePositions,
  cinematicTransitions,
} from "./registry.js";
import {
  validateEncodedImage,
  inspectImageDimensions,
  assertProjectAssetBudget,
} from "./assets.js";
import { richTextSchema, safeUrl } from "./rich_text.js";
import { themes, themeOverridesSchema, type ThemeRegistry } from "./themes.js";
import { entriesSchema, type SectionRendererRegistry } from "./sections.js";
import { defaultLayoutRegistry, type LayoutRegistry } from "./layouts.js";
import { cameraJourneySettingsSchema } from "./camera_journey.js";
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
  type: z.union([z.enum(sectionTypes), z.literal("custom")]),
  customType: z
    .string()
    .regex(/^[a-z][a-z0-9-]{0,63}$/)
    .optional(),
  animation: z
    .enum(["inherit", "none", "calm", "cinematic", "dynamic"])
    .default("inherit"),
  transition: z.enum(cinematicTransitions).default("fade"),
  entries: entriesSchema.default([]),
  link: safeUrl.optional(),
  linkLabel: z.string().max(100).default("Learn more"),
  image: z.string().optional(),
  transitionCover: z
    .string()
    .regex(/^asset-[a-zA-Z0-9-]{1,80}$/)
    .optional(),
  navigationLabel: z.string().max(100).optional(),
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
  layout: z
    .string()
    .regex(/^[a-z][a-z0-9-]{0,63}$/)
    .default("centered"),
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
    experience: z.enum(["standard", "cinematic"]).default("standard"),
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
    cameraJourney: cameraJourneySettingsSchema.default({
      enabled: false,
      movement: "diagonal",
      intensity: 0.8,
      parallaxDepth: 0.35,
      distance: 1,
    }),
    motion: z.enum(["none", "calm", "cinematic", "dynamic"]).default("none"),
    sections: z.array(sectionSchema).min(1).max(100),
  })
  .superRefine((site, ctx) => {
    if (new Set(site.assets.map((a) => a.id)).size !== site.assets.length)
      ctx.addIssue({ code: "custom", message: "Asset IDs must be unique" });
    for (const section of site.sections)
      if (
        [
          section.image,
          section.transitionCover,
          ...section.entries.map((e) => e.image),
        ].some((id) => id && !site.assets.some((a) => a.id === id))
      )
        ctx.addIssue({
          code: "custom",
          message: "A referenced image is missing",
          path: ["sections"],
        });
    for (const [index, section] of site.sections.entries()) {
      if (section.type === "custom" && !section.customType)
        ctx.addIssue({
          code: "custom",
          message: "A custom section needs a registered custom type ID.",
          path: ["sections", index, "customType"],
        });
      if (section.type !== "custom" && section.customType)
        ctx.addIssue({
          code: "custom",
          message: "Only custom sections can have a custom type ID.",
          path: ["sections", index, "customType"],
        });
    }
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
  sectionRegistry?: SectionRendererRegistry,
  layoutRegistry: LayoutRegistry = defaultLayoutRegistry,
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
  for (const section of parsed.sections)
    if (
      section.type === "custom" &&
      (!section.customType ||
        !sectionRegistry ||
        !Object.hasOwn(sectionRegistry, `custom:${section.customType}`) ||
        typeof sectionRegistry[`custom:${section.customType}`] !== "function")
    )
      throw Error(
        `This project uses an unsupported custom section${section.customType ? ` '${section.customType}'` : ""}. Register it before rendering.`,
      );
  for (const section of parsed.sections) {
    const definition = layoutRegistry[section.layout];
    if (!definition || !Object.hasOwn(layoutRegistry, section.layout))
      throw Error(
        `This project uses an unsupported layout '${section.layout}'. Register it before rendering.`,
      );
    if (!definition.sectionTypes.includes(section.type))
      throw Error(
        `Layout '${section.layout}' is not supported for section type '${section.type}'.`,
      );
  }
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

/** A five-scene starting composition; the validated project remains variable. */
export const cinematicStarterSite = parseSite({
  ...starterSite,
  title: "My cinematic story",
  description: "A story made of scenes, words, and scenery.",
  theme: "ink",
  experience: "cinematic",
  motion: "cinematic",
  motionSettings: { intensity: 0.8, speed: 0.9 },
  sections: [
    "The beginning",
    "A new perspective",
    "The journey",
    "A turning point",
    "The ending",
  ].map((heading, index) => ({
    id: `scene-${index + 1}`,
    type: "rich_text",
    heading,
    body: "Add your words here, then choose Change scenery to add artwork.",
    layout: "wide",
    spacing: "spacious",
    alignment: index % 2 === 0 ? "start" : "end",
    contentWidth: "wide",
    animation: "cinematic",
    transition: index === 0 ? "fade" : "camera-push",
  })),
});
