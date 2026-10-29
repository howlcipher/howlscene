# ADR 004: Theme-owned navigation treatment

## Status

Accepted for the navigation presentation increment. Implemented in the shared
`Site` renderer and shared stylesheet; see `docs/experiment/acceptance.md` and
the navigation evidence for executed test results. This does not establish the
complete v1 theme manifest or editor customization controls.

## Context

Themes already provide colors, fonts, spacing, scenery, and motion preferences,
but navigation links look the same across the three built-in themes. Per-theme
CSS would duplicate component selectors and attach design identity to theme-name
conditionals. Arbitrary CSS in manifests would accept unsafe and brittle input.

## Options

| Option                                                    | Benefit                                                               | Cost                                                                                                      |
| --------------------------------------------------------- | --------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Keep one shared link appearance                           | Smallest implementation and fewest knobs                              | Themes lack a meaningful navigation presentation choice                                                   |
| Add per-theme stylesheets or arbitrary CSS                | Broad design freedom                                                  | Duplicates shared layout, complicates static resource collection, and accepts unsafe/fragile declarations |
| Add a closed navigation-style enum consumed by shared CSS | Validated, data-only choice with common responsive and focus behavior | Deliberately limited to three treatments                                                                  |

## Decision

Extend the validated theme `presentation` object with `navigationStyle`, one of
`plain`, `underline`, or `framed`. Existing authoring inputs receive `plain`.
Modern Professional keeps the browser-default link treatment, Ink Wash adds an
accent-colored underline, and Cyberpunk frames links with an accent border.
`Site` emits one validated data attribute, and the shared stylesheet owns all
three treatments. Content, anchors, keyboard focus, and wrapping remain shared.

The editor does not yet expose this theme manifest setting. No imported project
can inject CSS or markup through it. Extension should follow evidence of a
concrete user need and keep structural navigation behavior independent of style.

## Verification

Contract tests validate legacy defaults and reject unknown or executable-looking
values. A browser test checks each built-in computed style and navigation
wrapping at 375, 768, and 1440 pixels. Ink and Cyberpunk visual screenshot
baselines are intentionally updated at all three widths; Modern captures remain
unchanged. Keep screenshot review separate from the observable style contract.
