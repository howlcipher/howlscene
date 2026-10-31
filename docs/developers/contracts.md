# Developer contracts and extension points

This describes the current development API, not a stable v1 compatibility guarantee. Install the built package artifact and load `@howlscene/core/styles.css`; see [SDK instructions](sdk.md). The editor is a consumer of core, not an engine dependency.

## Configuration version 1

Use `parseSite(unknown, themeRegistry?, sectionRegistry?, layoutRegistry?)` before accepting external data. Configuration is normalized atomically and unsupported versions fail. Custom section and layout references require the same explicitly supplied registries as rendering, export and backup restoration. Version 1 is the first supported format; there is no historical version migration to demonstrate. Future migrations must be explicit and preserve supported content.

A project contains metadata, theme ID and validated overrides, an `experience` (`standard` by default or `cinematic`), ordered sections with stable IDs, assets, and a motion preset. Cinematic sections can choose one bounded transition identifier: `none`, `fade`, `camera-push`, `camera-pan`, `mist-reveal`, or `layered-parallax`. An optional `transitionCover` section field references a validated project asset; the shared renderer treats it as a decorative entry overlay and the static exporter packages it when its section is visible. No script, CSS, or arbitrary transition payload is accepted. Limits include 100 sections, 100 entries per section, 20 images, and 28,000,000 characters for the serialized asset array. This last limit includes base64 overhead and metadata; it is not a promise of 28 MB of original image bytes. Each uploaded/prepared image is limited to 5 MiB, 8192 pixels per side, and 24 million decoded pixels. Backups are limited to 30 MiB of encoded UTF-8 data.

Image assets use `{id, mime, data, alt}` with safe `asset-` IDs, validated PNG/JPEG/WebP data URLs, and editable alternative text. SVG uploads are rejected. Browser boundaries decode and check project images before accepting imports. Never treat a filename, MIME declaration, or magic signature alone as complete proof of a valid decoded image.

## Theme authoring

```tsx
import {
  createThemeRegistry,
  parseSite,
  Site,
  starterSite,
  themes,
} from "@howlscene/core";

const registry = createThemeRegistry({
  forest: {
    ...themes.ink,
    name: "Forest",
    background: "#f1f4ee",
    foreground: "#20382b",
    accent: "#315b3f",
    font: "Georgia, serif",
  },
});
const site = parseSite({ ...starterSite, theme: "forest" }, registry);
const preview = <Site site={site} themeRegistry={registry} />;
```

Registry creation validates safe IDs, hex colors, supported font stacks, layer descriptors, and registered artwork references. It creates isolated immutable registries rather than mutating bundled themes. A clone such as `...themes.ink` inherits Ink Wash's declared layers. A token-only manifest with no `layers` receives the Modern layer defaults; explicit `layers: []` renders no artwork. A custom theme ID itself does not choose scenery. See the canonical [theme layer and artwork guide](theme_layers.md) for the public registration API, limits, and working rendering/export example.

`resolveTheme` accepts authoring inputs with defaults, including older token-only typed manifests. Its accent fallback does not establish contrast over arbitrary artwork. The standard editor uses bundled registries. Developer rendering and export support explicit theme, artwork, and supported-section registries; custom artwork must receive the same artwork registry at both boundaries. Backups accept a compatible theme registry as their second argument and serialize no executable code. See [SDK examples](sdk.md).

The manifest-layer increment, custom-section renderers, and trusted custom layout renderers are implemented. Full presentation metadata, external artwork collection, multipage themes, arbitrary custom payload schemas, and custom renderer controls in the standard editor remain unfinished; this is not a complete v1 theme-contract claim.

## Section rendering

`createSectionRegistry(overrides)` supplies shared fallbacks for `hero`, `about`, `rich_text`, `projects`, `experience`, `skills`, `media`, `gallery`, `contact`, and `cta`. Pass the returned registry as `sectionRegistry` to `Site`. An override receives section content, child `headingLevel`, asset lookup, and `assetUrl` and is trusted application code; imported project JSON cannot execute or register components.

Entries contain stable `id`, `title`, plain `body`, optional safe `url`, and optional asset `image`. Default entries render cards, an ordered experience timeline, or gallery figures. The outer renderer owns section landmarks, headings, navigation, section image, rich text, and optional CTA. A custom entry renderer should preserve that shared structure and resolve image references through `assetUrl`. This API overrides built-in types. For a new registered kind using portable section fields, use the explicit `custom` discriminator described in the [custom-section guide](custom_sections.md); arbitrary payload schemas still need coordinated schema, editor metadata, and contract changes.

Section configuration options are exported from `@howlscene/core` as
`layoutIds`, `sectionSpacings`, `sectionAlignments`, `sectionContentWidths`, and
`sectionImagePositions`. The editor derives its built-in choices from shared
section metadata. Compatible applications may register trusted layout
components using `createLayoutRegistry`; a project can reference only a layout
provided by its consumer. See the [custom layout guide](custom_layouts.md) for
the renderer slots, CSS limits, and propagation through export and backups.

## Portable rich text

`RichDocument` is a validated array of paragraph, level-2/3 heading, or list blocks. Text spans support text, bold, italic, and optional safe links. Ordered and unordered lists have one level; nested lists, arbitrary HTML, embeds, and custom Lexical nodes are outside this contract. Lexical is an editor implementation detail. Preview and export render the same portable model.

URLs accept HTTPS without credentials, simple `mailto:` addresses, or safe local section anchors. HTTP, executable/data schemes, protocol-relative URLs, and whitespace/control obfuscation are rejected. A valid URL does not mean its destination is trustworthy.

## Storage, history, and lifecycle

The IndexedDB adapter stores validated browser-local drafts including embedded assets. Restore failure pauses automatic saving to protect existing data. Quota and storage errors must leave in-memory edits available and direct users to backup. There is no account, cloud synchronization, or tracking dependency. See [privacy](../architecture/privacy.md).

Editor history retains 50 prior snapshots. Each committed operation creates a history step, a new edit clears Redo, and identical states do not create a new step. Text commits can create separate steps; this is not a guarantee of word-level grouping. Draft saving and undo history are separate responsibilities; snapshots are not cloud backups.

Motion respects reduced-motion preference and exposes a manual disable control in enhanced exported sites. Essential content is static HTML. See [motion](motion.md). Do not introduce unbounded loops or essential content that depends on effects.
