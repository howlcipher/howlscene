# ADR 003: Bounded theme presentation tokens

## Status

Selected for the `work/theme-presentation` increment. The complete local Node 24 gate passes 134 unit and 35 browser tests, including computed styles and nested no-script export. Hosted run `40887036736` also passed after the pull request was retargeted to `main`; see [executed evidence](../evidence/theme_presentation_final_gate.txt). This is not a declaration that the full v1 theme contract is complete.

## Context

Manifest layers separate scenery from content and trusted artwork code. Themes also need useful control over reading rhythm, repeated content, and navigation. Adding fields that no renderer consumes creates misleading configuration. Letting imported data inject arbitrary CSS expands security and maintenance responsibilities without a clear v1 need.

The current slice changes theme manifests and their renderer presentation. It does not add site configuration fields, editor controls, or historical schema migrations.

## Alternatives

| Option                                              | Advantages                                                                                                     | Costs                                                                                                                                     |
| --------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Arbitrary CSS strings or style objects in manifests | Very flexible and familiar to developers                                                                       | Hard to validate safely; can break readability, layout, resource isolation, and export assumptions; obscures which settings are supported |
| Separate bespoke CSS implementation for every theme | Direct control over each visual design                                                                         | Duplicates shared layout knowledge and makes new themes depend on engine-specific selectors                                               |
| Four bounded numeric tokens consumed by shared CSS  | Small testable contract; useful changes without duplicating layouts; safe defaults preserve existing authoring | Less expressive; each future token needs demonstrated use and coordinated validation/rendering tests                                      |

## Decision

Add an optional nested `presentation` object to theme authoring. Normalize it with defaults and expose readonly resolved settings. Validate exact fields and finite numeric ranges; reject CSS strings, unsupported keys, and out-of-range values.

| Field              | Default | Inclusive range | Consumption                           |
| ------------------ | ------- | --------------- | ------------------------------------- |
| `bodyLineHeight`   | `1.8`   | `1.5..2.2`      | Shared paragraph and list line height |
| `cardGapRem`       | `1.5`   | `0.5..3`        | Shared card and gallery gap           |
| `cardRadiusRem`    | `0.7`   | `0..2`          | Shared card and gallery radius        |
| `navigationGapRem` | `1.2`   | `0.5..3`        | Shared navigation gap                 |

Rem values are numbers with the unit supplied by renderer/CSS code. Line height is unitless. Shared `Site` CSS variables bridge validated values to existing layout rules. These controls belong to presentation rather than content or motion.

A legacy authoring input can omit `presentation`; partial nested input receives the same per-field defaults. Default values preserve the existing reading and spacing choices. The API must continue accepting supported token-only authoring inputs rather than requiring callers to manufacture normalized manifests.

## Consequences and verification

The contract stays small enough to validate and review. Each field has a visible consumer and a predictable static-export representation. The portable project continues referencing its theme; no executable styling code is serialized. Developers remain responsible for checking the actual layout, contrast, long text, and viewport behavior.

Tests must establish defaults, partial normalization, invalid boundaries, immutability, and observable CSS application in preview and export. Existing themes and compatibility examples must remain valid. Record actual execution evidence separately; this ADR asserts no passing counts or final release result.

Full theme metadata and asset collection, arbitrary external styles/resources, general new-section/layout contracts, editor exposure, and multipage behavior are outside this increment and remain open requirements or deferred extensions according to product scope. Future tokens should solve a concrete rendered need rather than anticipating hundreds of settings.

See [the canonical theme guide](../developers/theme_layers.md#bounded-presentation-tokens) for author-facing details.
