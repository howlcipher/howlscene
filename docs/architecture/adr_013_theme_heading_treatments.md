# ADR 013: Use closed theme tokens for section heading treatments

## Status

Accepted for the bounded section-heading presentation increment. Theme data,
preview, static export, and the three bundled themes share one renderer/CSS
contract. Human contrast review over scenery remains open.

## Context

The theme manifest already controls navigation and card treatments, while the
shared section heading styles remain identical. Themes need a safe way to give
section headings a distinct visual identity without duplicating layout CSS,
changing content, or accepting arbitrary style strings from project data.

## Options considered

| Option                                               | Benefits                                                           | Costs and risks                                                                                    |
| ---------------------------------------------------- | ------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| Arbitrary CSS or per-heading style objects           | Flexible for individual designs                                    | Hard to validate, unsafe as portable data, and prone to breaking responsive text and accessibility |
| Theme-name-specific CSS selectors                    | Direct control over bundled appearances                            | Couples rendering behavior to built-in theme names and makes new themes modify engine CSS          |
| Closed heading-treatment enum consumed by shared CSS | Explicit and validated; content semantics and layout remain shared | Limited to three treatments; future treatments need a deliberate contract and observable use       |

## Decision

Add `presentation.headingTreatment` to theme manifests with the closed values
`plain`, `accent-rule`, and `accent-rail`. Old and partial manifest inputs
default to `plain`. Modern Professional uses `plain`, Ink Wash uses
`accent-rule`, and Cyberpunk uses `accent-rail`. The shared `Site` renderer
exposes the resolved token as a data attribute. Shared CSS applies a bottom
rule or an inline-start accent rail to semantic section `h1` and `h2` elements.

The property is theme data, not user content and not arbitrary CSS. It does not
alter heading order, text, links, section identity, or project schema. The accent
continues through the existing theme contrast resolution. This flat-pair
fallback cannot establish contrast over scenery or images.

## Consequences and verification

Theme authors can distinguish heading treatment without changing engine source
or adding stylesheet fragments. The enum is testable as manifest data and as
computed preview/export output. Browser acceptance covers all three themes at
375, 768, and 1440 CSS pixels, verifies content remains unchanged, and serves a
static ZIP under a nested path with JavaScript disabled.

This contract styles only section headings. It does not make other component
styles independently configurable or add controls to the no-code editor.
