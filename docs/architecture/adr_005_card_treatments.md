# ADR 005: Theme-owned shared card treatments

## Status

Accepted for a bounded theme presentation extension. The complete local implementation gate passes; hosted
verification is pending in the review pull request. This does not complete the wider component styling contract.

## Context

Themes can control card spacing and radius, but project cards and gallery figures
share one treatment. Per-theme CSS duplicates component structure; arbitrary CSS
would be difficult to validate safely. The theme needs a small setting that can
produce meaningful visual differences without changing content or component
markup.

## Alternatives

| Option                                   | Benefit                                                                        | Cost                                                          |
| ---------------------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------- |
| Keep one outlined style                  | No new settings or styling branches                                            | Themes cannot adapt repeated content to their visual language |
| Per-theme CSS or arbitrary style objects | Broad visual freedom                                                           | Duplicates selectors and accepts fragile or unsafe values     |
| Closed `cardStyle` enum in shared CSS    | Bounded validation; consistent project/gallery components; no content coupling | Only three supported effects                                  |

## Decision

Add `presentation.cardStyle` with `outlined`, `soft`, and `glow` values. Older
manifests normalize to `outlined`. Modern Professional uses the existing outline,
Ink Wash uses a neutral shadow, and Cyberpunk uses its resolved accent color for
a restrained outline and glow. `Site` emits one validated data attribute; the
shared CSS styles project cards and gallery figures. Theme accent resolution
continues to run before the glow style, and component content remains unchanged.

The editor does not expose this manifest option yet. Themes still share card
markup, focus behavior, and responsive grid sizing. Do not turn the enum into
arbitrary CSS or a speculative component styling language.

## Verification

Unit tests cover defaulting, built-in values, and rejection of unknown values. A
browser test creates a project card through the editor and checks computed text,
background, border, shadow, and grid fit across three viewport sizes. Existing
screenshot fixtures contain no cards and should remain unchanged.
