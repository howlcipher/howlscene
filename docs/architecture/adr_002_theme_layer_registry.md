# ADR 002: Manifest layers with trusted artwork registration

Status: selected direction; implementation pending. Existing token themes and
supported-section overrides continue to work during incremental development.

## Problem

Custom token themes work through rendering, backups and export, but scenery still
branches on built-in theme IDs. A fourth visual theme should be able to declare
its layers without editing generic rendering or animation code. The master
specification also requires broader theme metadata and general section/layout
registration; those contracts remain unfinished.

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

Replace theme-name scenery branches with manifest layer references. Keep existing
artwork and styling visually equivalent. Each layer has a stable ID, a trusted
artwork reference and bounded motion depth. Additional presentation parameters
must have small validated contracts rather than arbitrary style objects.

Use immutable per-consumer registries and explicit arguments. Rendering and
export must receive the same definitions; backups must reject unsupported
references without discarding content. Do not add global mutable registration,
a dependency-injection framework or a plugin runtime.

Artwork must remain separate from user content. Inline original artwork can
establish the first contract. Before external image layers are supported, define
asset provenance, export eligibility, path resolution and collection explicitly;
a component that merely points to a remote image does not satisfy static export.

## Test-first exit criteria

1. A consumer registers a fourth visibly distinct layered theme without edits to
   renderer or animation modules.
2. Preview, restored backup and nested-path static export preserve the same
   content and scenery, including meaningful JavaScript-disabled output.
3. Invalid IDs, duplicate layers, unknown artwork references and unsafe motion
   depth fail before mutation or export.
4. Existing three-theme contract and visual suites continue to pass.
5. The packaged external consumer exercises the public extension API rather
   than importing workspace internals.

After this slice, extend metadata/default tokens where they affect actual
presentation and editor controls, then implement general section/layout
registration using the same explicit-boundary approach. Reuse portable content
fields initially; arbitrary custom payloads and a complete CMS are unnecessary.
