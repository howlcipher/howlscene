# ADR 002: Manifest layers with trusted artwork registration

Status: first increment implemented and locally verified; hosted verification pending. Existing token themes and supported-section overrides remain compatible. This ADR does not establish v1 release readiness.

## Problem

Before this increment, custom token themes worked through rendering, backups and export, but scenery branched on built-in theme IDs. A fourth visual theme needed to declare
its layers without editing generic rendering or animation code. The master
specification also requires broader theme metadata and general section/layout
registration. Trusted custom section renderers have since received a bounded
registration contract in [ADR 009](adr_009_custom_section_registration.md);
arbitrary payload schemas and layout registrations remain unfinished.

## Options

| Option                                             | Benefits                                                                            | Costs                                                       |
| -------------------------------------------------- | ----------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| A complete declarative scene/section language      | Portable and strictly validated                                                     | Too much new language/schema complexity for v1              |
| Trusted React components alone                     | Small and flexible; shared SSR already works                                        | Layers, assets and export obligations remain implicit       |
| Validated manifests referencing trusted registries | Explicit data contracts; preserves React/static rendering; safe imported references | Callers must supply compatible registries across boundaries |

Choose validated manifests referencing trusted registries. Keep executable
components in application-owned registries. Imported project data may reference
registered IDs and validated parameters; it may never register code, arbitrary
HTML or unrestricted CSS.

## First increment

Implemented manifest layer references replace theme-name scenery branches while preserving bundled artwork and styling. Each layer has a stable ID, registered artwork reference, bounded depth and opacity. Registries and descriptors are immutable. A cloned built-in manifest retains its layers; omitting layers on a token-only manifest uses Modern defaults, while an explicit empty list renders no artwork. See the canonical [developer layer guide](../developers/theme_layers.md) for APIs and authoring constraints.

Additional presentation parameters must have small validated contracts rather than arbitrary style objects. Broader theme metadata, external asset collection, and arbitrary payload schemas remain follow-up work. Trusted layout registration is implemented separately in [ADR 017](adr_017_trusted_layout_renderers.md).

Use immutable per-consumer registries and explicit arguments. Rendering and
export must receive the same definitions; backups must reject unsupported
references without discarding content. Do not add global mutable registration,
a dependency-injection framework or a plugin runtime.

Artwork must remain separate from user content. Inline original artwork can
establish the first contract. Before external image layers are supported, define
asset provenance, export eligibility, path resolution and collection explicitly;
a component that merely points to a remote image does not satisfy static export.

## Test-first exit criteria and verification

1. A consumer registers a fourth visibly distinct layered theme without edits to
   renderer or animation modules.
2. Preview, restored backup and nested-path static export preserve the same
   content and scenery, including meaningful JavaScript-disabled output.
3. Invalid IDs, duplicate layers, unknown artwork references and unsafe motion
   depth fail before mutation or export.
4. Existing three-theme contract and visual suites continue to pass.
5. The packaged external consumer exercises the public extension API rather
   than importing workspace internals.

Focused layer tests, unchanged bundled-theme visual tests, and packaged custom-artwork export acceptance have passed in scoped runs. The integrated Node 24 gate passes 130 unit and 34 browser tests, package consumers and license checks; see [executed evidence](../evidence/theme_layers_final_gate.txt). Hosted verification remains pending. These results do not establish a complete v1 theme contract or release approval.

After this slice, extend metadata/default tokens where they affect actual
presentation and editor controls. The trusted custom section registration
increment is now tracked in ADR 009; future layout registration should use the
same explicit boundary. Reuse portable content fields; arbitrary custom payloads
and a complete CMS are unnecessary.
