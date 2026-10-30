# ADR 015: Keep section copy on readable surfaces over theme scenery

## Status

Accepted. Shared scene copy uses an opaque, resolved theme surface whether the
scene contains bundled scenery, an uploaded background image, or both.

## Context

The CSS veil and SVG scenery are decorative, layered, and may move with
parallax. Their opacity and colors vary by layer and location. A theme's flat
foreground/background contrast check therefore cannot guarantee readable copy
when the scenery appears directly beneath it. A contrast sample of one crop or
animation frame would not establish a guarantee for different viewports,
responsive crops, or motion states.

## Options considered

| Option                                     | Benefits                                            | Costs and risks                                                                                        |
| ------------------------------------------ | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Rely on the scenery veil and layer opacity | Keeps the scene open and artwork fully visible      | Does not guarantee contrast over each color, overlap, crop, or moving layer                            |
| Sample scenery pixels and adjust copy      | Could retain a lighter presentation in some regions | Adds pixel analysis and fallback complexity; sampled frames cannot cover every crop or animation state |
| Put scene copy on resolved theme colors    | Provides deterministic contrast in preview and ZIP  | Adds a card-like surface and hides artwork immediately behind the copy                                 |

## Decision

The shared `Site` renderer marks each section introduction with
`data-readable-surface="solid"`. Existing shared CSS uses the resolved theme
background and foreground colors with a bounded border and responsive padding.
Repeated project, skill, and gallery items retain their own opaque card
backgrounds instead of receiving a nested section panel. A timeline uses one
opaque surface around its list, and a call-to-action link uses the same token
pair. Empty entry layouts render no container. The renderer and stylesheet serve
the editor preview, developer package, and static export. No project setting or
theme-specific renderer branch is needed.

## Consequences and verification

Theme scenery remains visible around and between copy panels; its detail is
concealed behind copy. Project/gallery cards retain their own theme-colored
surfaces. Browser tests measure foreground and accent text against the computed
surface in all bundled themes, in preview and in nested static ZIPs with
JavaScript disabled. The reviewed preview baselines cover 375, 768, and 1440 CSS
pixels; image-rich export baselines cover the same widths.

The flat surface prevents decorative scenery from reducing the measured text
contrast in that panel. This does not establish WCAG conformance or replace
human screen-reader, zoom, composition, and usability review.
