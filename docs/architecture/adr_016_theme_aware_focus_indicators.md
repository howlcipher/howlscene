# ADR 016: Use the resolved theme accent for website focus indicators

## Status

Accepted.

## Context

The shared focus outline used a fixed orange color. A creator can change the
website background and accent through validated project settings. When both
colors resolve to a medium gray, the fixed outline can become difficult to see
even though the site text and accent have been contrast-corrected. The editor
preview and exported site share the core stylesheet, so the same mismatch
appears in both.

## Options considered

| Option                                     | Benefits                                                              | Costs and risks                                                                  |
| ------------------------------------------ | --------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Keep one fixed outline color               | Consistent brand-independent default                                  | Can lose contrast on valid creator-selected backgrounds                          |
| Add a separate focus-color project setting | Maximum customization                                                 | Adds another color field and validation rule; users may select an invisible ring |
| Use the resolved theme accent              | Reuses a validated token and stays synchronized across preview/export | The outline color follows the site's accent choice                               |

## Decision

Keep the existing 3px outline width and offset, but set the focus outline color
inside `.howlscene` to `var(--scene-accent)`. Theme resolution already checks
the accent against the selected flat background and supplies a higher-contrast
fallback when needed. The editor's own controls outside the rendered website
retain their existing focus color.

## Verification and limits

`A11Y-009` uses keyboard tab navigation to measure the focus outline against
the selected background in the editor preview and in the actual generated ZIPs
for Modern Professional, Ink Wash, and Cyberpunk. It includes a custom gray
background and deliberately low-contrast saved colors, verifies a 3:1 outline
ratio, and checks that the 3px solid focus indicator remains present. This test
covers the shared site renderer and flat background only. Custom developer
renderers that place controls on different surfaces remain their author's
responsibility; automated checks do not establish WCAG conformance.
