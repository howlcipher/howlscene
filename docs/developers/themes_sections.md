# Author themes and section renderers

Use public package entry points. These extension points support trusted application developers; project imports cannot register executable components. See [SDK setup](sdk.md) to build and install the core and export tarballs. The packages are not claimed to be published to npm or stable v1 APIs.

## Add validated theme tokens

```tsx
import {
  Site,
  createThemeRegistry,
  parseSite,
  resolveTheme,
  starterSite,
  themes,
} from "@howlscene/core";
import {
  exportWebsite,
  serializeBackup,
  importBackup,
} from "@howlscene/export";
import "@howlscene/core/styles.css";

const themeRegistry = createThemeRegistry({
  forest: {
    ...themes.ink,
    name: "Forest",
    description: "Quiet greens with a serif reading style.",
    background: "#edf2e8",
    foreground: "#20382b",
    accent: "#315b3f",
  },
});
const site = parseSite({ ...starterSite, theme: "forest" }, themeRegistry);
const { warnings } = resolveTheme(themeRegistry.forest!, site.overrides);
const preview = <Site site={site} themeRegistry={themeRegistry} />;
const websiteBytes = await exportWebsite(site, { themeRegistry });
const backup = serializeBackup(site, themeRegistry);
const restored = importBackup(backup, themeRegistry);
```

A manifest contains version, description, name, background, foreground, accent, a supported font stack, ordered validated layers, and bounded presentation settings. `themeSchema` supplies version/description defaults when parsing; spreading a bundled manifest keeps the authoring example fully typed. Registry creation validates IDs and exact fields and returns an isolated registry. Six-digit hex colors, supported fonts, and bounded numeric presentation tokens keep arbitrary CSS out of project controls. The optional `presentation` object controls paragraph/list line height, card/gallery gap and radius, and navigation gap. See [the canonical token table](theme_layers.md#bounded-presentation-tokens) for exact defaults and ranges; omitted settings retain safe defaults, including older token-only authoring inputs.

`resolveTheme` centralizes user accent/font overrides. A low-contrast accent falls back to the readable manifest accent, or its foreground if needed, and produces a human-readable warning. Saved configuration is unchanged. This does not repair an inherently unreadable custom foreground or prove contrast over imagery. Test the actual presentation.

Scenery now resolves declared artwork references rather than branching on theme names. This example spreads Ink Wash, so it retains Ink Wash's layers. A token-only manifest omitting `layers` receives Modern defaults; explicit `layers: []` disables artwork. For original artwork registration and passing both registries to rendering/export, use the canonical [theme layer guide](theme_layers.md). Custom editor chooser entries and external resource discovery are not automatic. Backups serialize no callbacks and require the compatible theme registry when reopened. A theme switch changes presentation without owning or replacing content. Full metadata and general new-section/layout contracts remain open requirements.

## Override supported section content

```tsx
import {
  AssetImage,
  Site,
  createSectionRegistry,
  parseSite,
  starterSite,
  type SectionRendererProps,
} from "@howlscene/core";
import { exportWebsite } from "@howlscene/export";

function ProjectCards({
  section,
  headingLevel = 3,
  asset,
  assetUrl,
}: SectionRendererProps) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  return (
    <div className="entry-cards">
      {section.entries.map((entry) => {
        const image = entry.image ? asset?.(entry.image) : undefined;
        return (
          <article key={entry.id}>
            {image && (
              <AssetImage asset={image} source={assetUrl} loading="lazy" />
            )}
            <Heading>{entry.title}</Heading>
            <p>{entry.body}</p>
            {entry.url && <a href={entry.url}>{entry.title || "Learn more"}</a>}
          </article>
        );
      })}
    </div>
  );
}
const sectionRegistry = createSectionRegistry({ projects: ProjectCards });
const site = parseSite({
  ...starterSite,
  sections: [
    {
      id: "work",
      type: "projects",
      heading: "Selected work",
      entries: [
        {
          id: "tool",
          title: "A useful tool",
          body: "What it does.",
          url: "https://example.com",
        },
      ],
    },
  ],
});
const preview = <Site site={site} sectionRegistry={sectionRegistry} />;
const websiteBytes = await exportWebsite(site, { sectionRegistry });
```

`Site` owns the outer section, heading, anchor/navigation, rich text, section-level image, and optional CTA. The override renders the repeated content inside that structure. Honor the supplied child heading rank, resolve media through `asset`/`assetUrl`, and use `AssetImage` to retain variants and alt text. Avoid fixed heights that clip long content.

The registry supports `hero`, `about`, `rich_text`, `projects`, `experience`, `skills`, `media`, `gallery`, `contact`, and `cta`. Unspecified entries use the shared fallback: cards, ordered experience timeline, or gallery figures. The registry derives its keys from section definitions to avoid separate capability lists. To register a new section kind using the existing portable fields, use the explicit `custom` discriminator in the [custom-section guide](custom_sections.md). Custom payload schemas and editor type choosers remain outside this contract.

## Static safety and validation

Overrides run during React static rendering as well as live preview. Keep render-time behavior free of `window`, effects, network requests, and editor state. Imported project links are validated HTTPS, simple mailto, or safe anchors, and React escapes text. Trusted components can bypass these protections by introducing raw HTML, scripts, or external URLs; do not treat a registry as a sandbox.

Use the same registries for `parseSite`, `Site`, `exportWebsite`, and custom-theme backups. Export does not infer arbitrary CSS, third-party assets, or module imports from a custom component. Package required resources explicitly within the supported asset contract or document the integration limitation.

Add contract tests across bundled themes, hidden sections, long text, safe links, image variants, and heading contexts. Compare preview and extracted exported HTML, verify static nested paths and no-script content, and test a packed consumer before publishing an extension. Full plugin loading, arbitrary imported layouts, nested rich lists, a theme marketplace, and custom 3D scenes remain deferred.
