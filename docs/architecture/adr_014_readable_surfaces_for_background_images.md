# ADR 014: Give text an opaque surface over uploaded background images

## Status

Accepted for uploaded section background images. The shared renderer applies an
opaque theme-colored surface to section copy in preview and static export. This
policy was extended to native theme scenery by
[ADR 015](adr_015_readable_surfaces_over_theme_scenery.md).

## Context

Creators can place an uploaded image behind a section. The renderer dims that
image, but its pixels remain variable, so a fixed foreground color cannot be
shown to contrast reliably with every uploaded image. The existing flat-color
contrast resolver does not inspect image pixels.

## Options considered

| Option                                      | Benefits                                              | Costs and risks                                                                           |
| ------------------------------------------- | ----------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Keep the image dimmed and copy transparent  | Preserves maximum image visibility and minimal markup | Opacity alone cannot guarantee contrast across arbitrary uploaded pixels                  |
| Estimate contrast from image pixels         | Could preserve copy-over-image for some assets        | Sampling adds thresholds and lifecycle handling; samples cannot cover every pixel or crop |
| Place copy on the resolved theme background | Deterministic contrast with shared tokens             | Conceals image detail beneath the copy panel; keeps the image visible around its edges    |

## Decision

When a section uses an uploaded image as its background, the shared renderer
places its semantic copy inside a `scene-copy` element marked with the fixed
`data-readable-surface="solid"` value. Shared CSS uses the resolved theme
background and foreground tokens, a bounded border, and responsive padding.
Inline images and sections without uploaded background images retain their
existing rendering.

The marker is derived from validated section data. It is not user-authored HTML,
CSS, or an additional project setting. The renderer, preview and exporter share
the same markup and stylesheet.

## Consequences and verification

Section headings, text, cards, and links remain on a flat theme surface when an
uploaded background image is present. This trades detail directly behind the
copy for predictable text contrast while preserving scenery around the panel.
Tests cover contrast of at least 4.5:1 for all three built-in theme tokens in
preview and in a nested static ZIP served with JavaScript disabled. Visual
snapshots cover mobile, tablet and desktop. Text over theme scenery and other
artwork still requires human review; the automated check does not establish
WCAG conformance.
