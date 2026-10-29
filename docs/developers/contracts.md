# Developer contracts and extension points

This describes the current development API, not a stable v1 compatibility guarantee. Install the built package artifact and load `@howlscene/core/styles.css`; see [SDK instructions](sdk.md). The editor is a consumer of core, not an engine dependency.

## Configuration version 1

Use `parseSite(unknown, themeRegistry?)` before accepting external data. Configuration is normalized atomically and unsupported versions fail. Version 1 is the first supported format; there is no historical version migration to demonstrate. Future migrations must be explicit and preserve supported content.

A project contains metadata, theme ID and validated overrides, ordered sections with stable IDs, assets, and a motion preset. Limits include 100 sections, 100 entries per section, 20 images, and 28,000,000 characters for the serialized asset array. This last limit includes base64 overhead and metadata; it is not a promise of 28 MB of original image bytes. Each uploaded/prepared image is limited to 5 MiB, 8192 pixels per side, and 24 million decoded pixels. Backups are limited to 30 MiB of encoded UTF-8 data.

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

Registry creation validates safe IDs, six-digit hex colors, supported font stacks, and exact manifest fields. It creates an isolated frozen registry rather than mutating bundled themes. Choose contrast deliberately: syntactically valid colors do not prove accessibility. Unknown scenery theme names use the quiet Modern illustration fallback. Full custom artwork manifests and multipage themes are not implemented. The standard browser editor uses bundled registries. Developer export accepts the same trusted registries as rendering: `exportWebsite(site, {themeRegistry, sectionRegistry})`. Custom backup functions accept an explicit theme registry as their second argument. Neither backups nor imported JSON can carry executable component code; custom-theme backups require a compatible registry when reopened. See [SDK examples](sdk.md).

## Section rendering

`createSectionRegistry(overrides)` supplies shared fallbacks for `hero`, `about`, `rich_text`, `projects`, `experience`, `skills`, `media`, `gallery`, `contact`, and `cta`. Pass the returned registry as `sectionRegistry` to `Site`. An override receives `{section, assetUrl}` and is trusted application code; imported project JSON cannot execute or register components.

Entries contain stable `id`, `title`, plain `body`, optional safe `url`, and optional asset `image`. Default entries render cards, an ordered experience timeline, or gallery figures. The outer renderer owns section landmarks, headings, navigation, section image, rich text, and optional CTA. A custom entry renderer should preserve that shared structure and resolve image references through `assetUrl`. This API overrides supported section types; it does not register arbitrary new schema discriminators.

## Portable rich text

`RichDocument` is a validated array of paragraph, level-2/3 heading, or list blocks. Text spans support text, bold, italic, and optional safe links. Ordered and unordered lists have one level; nested lists, arbitrary HTML, embeds, and custom Lexical nodes are outside this contract. Lexical is an editor implementation detail. Preview and export render the same portable model.

URLs accept HTTPS without credentials, simple `mailto:` addresses, or safe local section anchors. HTTP, executable/data schemes, protocol-relative URLs, and whitespace/control obfuscation are rejected. A valid URL does not mean its destination is trustworthy.

## Storage, history, and lifecycle

The IndexedDB adapter stores validated browser-local drafts including embedded assets. Restore failure pauses automatic saving to protect existing data. Quota and storage errors must leave in-memory edits available and direct users to backup. There is no account, cloud synchronization, or tracking dependency. See [privacy](../architecture/privacy.md).

Editor history retains 50 prior snapshots. Each committed operation creates a history step, a new edit clears Redo, and identical states do not create a new step. Text commits can create separate steps; this is not a guarantee of word-level grouping. Draft saving and undo history are separate responsibilities; snapshots are not cloud backups.

Motion respects reduced-motion preference and exposes a manual disable control in enhanced exported sites. Essential content is static HTML. See [motion](motion.md). Do not introduce unbounded loops or essential content that depends on effects.
