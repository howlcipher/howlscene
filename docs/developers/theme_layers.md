# Theme layers and trusted artwork

Theme manifests describe ordered decorative layers. Artwork lives in a separate developer registry so project content stays portable and imported JSON cannot supply executable render functions. This is a bounded extension point, not a complete theme marketplace or asset plugin system.

## Register original artwork

```tsx
import { createElement } from "react";
import {
  Site,
  createArtworkRegistry,
  createThemeRegistry,
  parseSite,
  starterSite,
  themes,
} from "@howlscene/core";
import {
  exportWebsite,
  serializeBackup,
  importBackup,
} from "@howlscene/export";
import "@howlscene/core/styles.css";

const artworkRegistry = createArtworkRegistry({
  "forest-canopy": {
    render: () =>
      createElement("circle", {
        "data-original-art": "forest-canopy",
        cx: 720,
        cy: 200,
        r: 160,
        fill: "#315b3f",
      }),
  },
});
const themeRegistry = createThemeRegistry(
  {
    forest: {
      ...themes.ink,
      name: "Forest",
      background: "#e8efdf",
      layers: [
        { id: "canopy", artwork: "forest-canopy", depth: 0.3, opacity: 0.2 },
      ],
    },
  },
  artworkRegistry,
);
const site = parseSite({ ...starterSite, theme: "forest" }, themeRegistry);
const preview = (
  <Site
    site={site}
    themeRegistry={themeRegistry}
    artworkRegistry={artworkRegistry}
  />
);
const bytes = await exportWebsite(site, { themeRegistry, artworkRegistry });
const backup = serializeBackup(site, themeRegistry);
const restored = importBackup(backup, themeRegistry);
```

Artwork returns children for the engine-owned decorative SVG, which uses a `1440 × 900` coordinate space. The surrounding scenery supplies accessibility hiding and pointer-event isolation. Do not put essential text, links, form controls, or interactive meaning into decorative artwork.

## Callback and data contracts

`render` is trusted, pure, synchronous application code returning a React element or `null`. It is called as a factory, not mounted as a React component. Do not call React Hooks directly inside it. To use a child component, return `createElement(YourArtworkComponent)` and keep that component compatible with static rendering. Do not perform network calls, mutate state, read browser globals at render time, or return a promise/generator.

`createArtworkRegistry` retains built-in artwork and adds validated definitions to an isolated immutable registry. Optional class names accept safe space-separated class identifiers. `createThemeRegistry(additions, artworkRegistry)` checks every layer reference against available artwork. Theme registries, manifests, and layer descriptors are immutable. Up to 12 layers are accepted; layer IDs must be unique, depth is bounded to `-1..1`, and opacity to `0..1`. Defaults fill omitted layer settings.

Spreading a built-in theme copies its explicit layer list unless you override `layers`. A theme authored with tokens only receives the Modern layer fallback; that differs from spreading Ink Wash and retaining its layers. Layers belong to the manifest rather than theme-name conditionals in the renderer. The same content can therefore use different registered scenery without changing text or section order.

Projects and backups contain theme identity and content, not artwork callbacks or registry implementations. Reopening a custom-theme project requires the compatible theme registry. Rendering and export additionally require the same artwork registry. Supplying only a custom theme registry cannot recreate missing artwork definitions. The standard editor remains a bundled-registry consumer; this API does not automatically add arbitrary developer code to its theme picker.

## Bounded presentation tokens

A manifest can optionally supply a nested `presentation` object. Normalization fills omitted fields with safe defaults and returns immutable presentation settings. Older authoring inputs can omit the entire object; no site-configuration migration or new editor controls are required.

| Token              | Default | Inclusive range | Rendered responsibility               |
| ------------------ | ------- | --------------- | ------------------------------------- |
| `bodyLineHeight`   | `1.8`   | `1.5..2.2`      | Paragraph and list line height        |
| `cardGapRem`       | `1.5`   | `0.5..3`        | Card and gallery spacing in rem       |
| `cardRadiusRem`    | `0.7`   | `0..2`          | Card and gallery corner radius in rem |
| `navigationGapRem` | `1.2`   | `0.5..3`        | Navigation item spacing in rem        |

For example, add `presentation: {bodyLineHeight: 1.9, cardGapRem: 2}` to a theme passed to `createThemeRegistry`; omitted radius and navigation settings keep their defaults. Supply numeric values rather than CSS strings or units. These four settings map to shared renderer CSS variables and affect existing content; they do not introduce arbitrary per-theme stylesheets or stored user content.

The [presentation decision](../architecture/adr_003_theme_presentation.md) records why these four controls were selected. This increment remains subject to its focused unit and browser contracts and the final integrated gate; it does not establish a complete v1 theme system.

## Export and verification boundaries

Pass both registries to `Site` and `exportWebsite`. Static export includes the rendered artwork as meaningful SVG markup in its complete HTML, independent of editor code. JavaScript remains optional enhancement for motion. The independent SDK check installs packed packages, renders custom artwork, exports it in the browser, and serves that ZIP under real nested mounts with and without JavaScript.

Callbacks are not sandboxed. A trusted developer can introduce unsafe markup, external URLs, incompatible components, or unlicensed artwork; registry validation does not audit their implementation. There is no collector that discovers arbitrary external images, custom font files, CSS imports, or runtime dependencies from an artwork callback. Keep artwork self-contained or explicitly manage and verify resources through the supported asset contract. This layer slice does not claim the full long-term theme manifest, third-party marketplace, or 3D plugin contract is implemented.

## Motion and parallax preferences

A theme may optionally define validated motion scalars and disable decorative
parallax:

```ts
const theme = {
  ...themes.ink,
  motion: { intensityScale: 0.7, speedScale: 1.2 },
  accessibility: { parallax: false },
};
```

Defaults preserve earlier manifests: both scalars are `1`, and parallax is
enabled. Intensity is bounded to `0..1`; speed is bounded to `0.5..2` and its
product with the site setting is clamped to the same range. A theme can reduce
effects but cannot exceed the user's site intensity. When parallax is false,
decorative layer movement stops while scene entry effects, navigation and
content remain available. Site motion-off, the editor's manual motion control,
and `prefers-reduced-motion` continue to disable decorative motion globally.
Preview and static output use the same validated manifest values; imported
projects do not supply executable code or CSS.

The [motion contract tests](../../tests/theme_motion.test.tsx) and presentation
browser scenario cover defaults, bounds, theme switching, reduced motion and
motionless scenery. These are API-level options rather than editor controls;
broader accessible theme customization remains open v1 work.

## Navigation treatment

`presentation.navigationStyle` selects a closed, safe visual treatment for the
shared site navigation: `plain`, `underline`, or `framed`. Existing themes
default to `plain`. Ink Wash uses `underline` and Cyberpunk uses `framed`; all
treatments retain the same semantic links, keyboard focus, responsive wrapping,
and anchor behavior. These are theme-manifest choices for developers. The
visual editor does not yet expose them. See [ADR 004](../architecture/adr_004_navigation_treatment.md).

## Shared card treatments

`presentation.cardStyle` selects one of three safe treatments for project cards
and gallery figures: `outlined`, `soft`, or `glow`. Existing manifests default to
`outlined`. Modern Professional keeps the outline, Ink Wash uses a soft neutral
shadow, and Cyberpunk uses an accent border and restrained glow. All treatments
use the same semantic card markup and responsive grid. Theme accent resolution
continues to apply before the glow color is drawn. The setting accepts an enum,
not CSS, and is not yet exposed in the editor.

Themes may also choose `presentation.mobileNavigationLayout`: `wrap` (the legacy
default) keeps the shared navigation row with wrapping links; `stack` puts links
on separate lines below the shared 600px breakpoint. Above that width both
settings use a row. Cyberpunk selects `stack`; the other built-in themes use
`wrap`. The choice cannot change anchors, ordering, focus behavior, or the
breakpoint, and does not accept CSS. It is not yet a visual-editor control. See
[ADR 006](../architecture/adr_006_mobile_navigation.md).

## Text contrast fallback

When a registered theme's foreground/background pair is below a 4.5:1 contrast
ratio, `resolveTheme` displays whichever of black or white has the higher ratio
against the background and returns a warning. The saved manifest remains
unchanged. The shared `Site` renderer uses the same resolved foreground in its
preview and static export. This threshold follows the ordinary-text minimum in
[WCAG 2.2 SC 1.4.3](https://www.w3.org/TR/WCAG22/#contrast-minimum). It checks
only the manifest's flat color pair; it cannot determine contrast over scenery,
images, uploaded backgrounds, gradients, or trusted developer artwork, and does
not establish WCAG conformance.
