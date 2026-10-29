# ADR 008: User background and text color overrides

## Status

Accepted for guided color editing. The implementation gate and hosted verification
will be recorded in the experiment evidence. The project data stores selected
colors; rendering may resolve a readable display color and explain the fallback.

## Context

The creator's primary color controls currently include only accent. The approved
editor workflow calls for changing the website's colors. Background and text
color choices must survive theme switching, local draft saving, project backups,
and static export. A low-contrast combination must not make site text unusable.

## Options

| Option                                                       | Benefit                                                                              | Cost                                                                      |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------- |
| Expose accent only                                           | Smallest interface and fewest contrast combinations                                  | Does not satisfy background/text customization                            |
| Expose arbitrary CSS or color roles                          | Maximum styling freedom                                                              | Unsafe, difficult to explain, and hard to render consistently             |
| Add bounded six-digit background/foreground/accent overrides | Nontechnical controls with one predictable CSS consumer; values serialize and export | Flat pair checking cannot reason about text over scenery or image artwork |

## Decision

Add optional `background` and `foreground` six-digit hex fields to the existing
`themeOverridesSchema`. The editor presents native color controls and stores the
selected values in `site.overrides`; theme switching does not clear them. `Site`
and static export use the same `resolveTheme` path. Contrast is checked between
the resolved background and foreground, and accent contrast is also evaluated
against the resolved background. If the selected text pair is below 4.5:1, display
the higher-contrast of opaque black/white and return a warning without changing
the stored selection. An unsafe accent falls back to an accessible theme accent
or the already-resolved text foreground, with a warning. This uses the conservative
ordinary-text threshold in [WCAG 2.2 SC 1.4.3](https://www.w3.org/TR/WCAG22/#contrast-minimum).

This only checks flat colors. It cannot guarantee contrast over decorative
artwork, gradients, or uploaded backgrounds. The control does not offer arbitrary
CSS or separate component color roles.

## Verification

Schema tests cover valid hex colors and malformed values. Resolver tests verify
contrast fallback relative to a user-selected background, warning and source
immutability. Browser acceptance changes colors, switches themes, waits for local
save, reloads, and checks the extracted published ZIP. Manual artwork/zoom and
assistive-technology review remain required.
