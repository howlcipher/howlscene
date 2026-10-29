# ADR 006: Theme-responsive mobile navigation layout

## Status

Accepted for a bounded responsive theme rule. The complete local integrated gate passes; hosted
verification is pending in the review pull request. This does not establish
the complete responsive manifest contract.

## Context

The shared stylesheet already wraps navigation links at narrow widths. Themes
need a controlled option when wrapping does not match their composition, while
keeping the same breakpoint, semantic links, and keyboard behavior. CSS breakpoints
cannot safely be accepted as arbitrary imported values, and per-theme media rules
would duplicate structural behavior.

## Options

| Option                                                | Benefit                                                  | Cost                                                                |
| ----------------------------------------------------- | -------------------------------------------------------- | ------------------------------------------------------------------- |
| Keep wrapping for every theme                         | Predictable and simple                                   | No declarative theme choice for narrow navigation composition       |
| Accept custom breakpoint and CSS                      | Broad responsive control                                 | Unsafe and brittle; themes can cause overflow and diverging layouts |
| Closed `wrap`/`stack` choice at the shared breakpoint | Small validated setting with shared responsive lifecycle | Limited to two tested layouts and one shared breakpoint             |

## Decision

Add `presentation.mobileNavigationLayout` with `wrap` and `stack` values. Legacy
manifests default to `wrap`; Cyberpunk opts into `stack`. The existing shared
600px media query applies the value by a validated data attribute. Above the
breakpoint all navigation remains in a row. Anchors, focus behavior, ordering,
and the breakpoint are not theme-controlled.

## Verification

Unit tests cover defaulting, built-in values, and rejection of unsupported values.
A browser test adds sections through the editor, then checks actual flex direction,
link count/visibility, and overflow at 375, 768, and 1440 pixels. This option is a
developer manifest setting, not an editor control.
