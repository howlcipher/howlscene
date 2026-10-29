import { AssetImage } from "./media.js";
import type { ImageAsset } from "./assets.js";
import type { ComponentType } from "react";
import { z } from "zod";
import type { SectionConfig } from "./index.js";
import { sectionDefinitions } from "./registry.js";
import { safeUrl } from "./rich_text.js";

/** Portable repeated content shared by projects, skills, timelines and galleries. */
export const entrySchema = z.strictObject({
  id: z.string().regex(/^[a-z][a-z0-9-]{0,63}$/),
  title: z.string().max(300),
  body: z.string().max(30000).default(""),
  url: safeUrl.optional(),
  image: z
    .string()
    .regex(/^asset-[a-zA-Z0-9-]{1,80}$/)
    .optional(),
});
export type SectionEntry = z.infer<typeof entrySchema>;
export const entriesSchema = z
  .array(entrySchema)
  .max(100)
  .superRefine((entries, context) => {
    if (new Set(entries.map((entry) => entry.id)).size !== entries.length)
      context.addIssue({ code: "custom", message: "Entry IDs must be unique" });
  });
export interface SectionRendererProps {
  section: SectionConfig;
  /** Child heading rank supplied by the owning section; standalone entries default to h3. */
  headingLevel?: 2 | 3;
  assetUrl: (id: string, width?: number) => string;
  asset?: (id: string) => ImageAsset | undefined;
}
interface EntryRendererProps extends Omit<SectionRendererProps, "section"> {
  section: SectionConfig & { entries?: SectionEntry[] };
}

/** Shared fallback preserves content for every section type without editor imports. */
export function SectionEntries({
  section,
  assetUrl,
  asset,
  headingLevel = 3,
}: EntryRendererProps) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  const entries = entriesSchema.parse(section.entries ?? []);
  const content = (entry: SectionEntry) => (
    <>
      {entry.image && (
        <>
          {asset?.(entry.image) ? (
            <AssetImage
              asset={asset(entry.image)!}
              source={assetUrl}
              loading="lazy"
              sizes="(max-width: 600px) 100vw, 400px"
            />
          ) : (
            <img src={assetUrl(entry.image)} alt={entry.title} loading="lazy" />
          )}
        </>
      )}
      <Heading className="entry-title">{entry.title}</Heading>
      {entry.body.split("\n").map((paragraph, index) => (
        <p key={index}>{paragraph}</p>
      ))}
      {entry.url && <a href={entry.url}>{entry.title || "Learn more"}</a>}
    </>
  );
  if (section.type === "experience")
    return (
      <ol className="entry-timeline">
        {entries.map((entry) => (
          <li key={entry.id}>
            <article>{content(entry)}</article>
          </li>
        ))}
      </ol>
    );
  if (section.type === "gallery")
    return (
      <div className="entry-gallery">
        {entries.map((entry) => (
          <figure key={entry.id}>
            {entry.image && (
              <>
                {asset?.(entry.image) ? (
                  <AssetImage
                    asset={asset(entry.image)!}
                    source={assetUrl}
                    loading="lazy"
                    sizes="(max-width: 600px) 100vw, 400px"
                  />
                ) : (
                  <img
                    src={assetUrl(entry.image)}
                    alt={entry.title}
                    loading="lazy"
                  />
                )}
              </>
            )}
            <figcaption>
              <Heading className="entry-title">{entry.title}</Heading>
              <p>{entry.body}</p>
              {entry.url && (
                <a href={entry.url}>{entry.title || "Learn more"}</a>
              )}
            </figcaption>
          </figure>
        ))}
      </div>
    );
  return (
    <div className="entry-cards">
      {entries.map((entry) => (
        <article key={entry.id}>{content(entry)}</article>
      ))}
    </div>
  );
}

/** Creates an isolated registry. Custom renderers are trusted application code. */
export function createSectionRegistry(
  overrides: Partial<
    Record<SectionConfig["type"], ComponentType<SectionRendererProps>>
  > = {},
): Record<SectionConfig["type"], ComponentType<SectionRendererProps>> {
  return Object.fromEntries(
    Object.keys(sectionDefinitions).map((type) => [
      type,
      overrides[type as SectionConfig["type"]] ?? SectionEntries,
    ]),
  ) as Record<SectionConfig["type"], ComponentType<SectionRendererProps>>;
}
