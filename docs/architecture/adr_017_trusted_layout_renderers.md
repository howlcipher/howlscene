# ADR 017: Register trusted layout renderers with portable content slots

## Status

Accepted.

## Context

HowlScene already validates layout IDs and lets section metadata offer compatible
built-in choices. A compatible developer application could register custom
section renderers, but it could not register a new layout composition. Layout
markup also has to match between preview and static export, and a saved project
must not carry executable components or arbitrary CSS.

## Options considered

| Option                                                    | Benefits                                                                                                                                                       | Costs and risks                                                                                                                       |
| --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Add custom layout class names only                        | Small API; developers control presentation with CSS                                                                                                            | Does not let a layout component arrange semantic content slots and leaves preview/export CSS synchronization to the consumer          |
| Register trusted React renderers with named content slots | Reuses shared React SSR for preview/export, keeps project data declarative, and lets a component compose the core-owned heading, image, body, entries, and CTA | Renderer code is trusted application code; the same registry must be supplied to validation, rendering, export, and backup operations |
| Store a portable layout tree in project data              | Could describe layouts without code                                                                                                                            | Adds a new markup language, validation surface, migration burden, and arbitrary nesting complexity                                    |

## Decision

Use immutable per-consumer layout registries. Project data stores only a safe
layout ID. Each trusted renderer receives named React content slots from the
shared site renderer, so preview and server-rendered static export use the same
content. Registries declare compatible section types. Optional trusted CSS is
bounded to 50,000 characters per layout, included with the registered layout,
and rejects `@import`, `url(...)`, and closing style tags. Developers must scope
selectors to their layout class and preserve all semantic slots.

All built-in section/layout pairs accepted by the version-1 schema remain
accepted for backward compatibility. Editor metadata still offers only its
preferred built-in choices. Custom layout IDs are available to compatible
developer consumers; the standard no-code editor does not load developer
components.

## Verification and limits

`CFG-LAYOUT-001–004` cover registry validation, preview, export, backup, safe CSS
and backward compatibility. The independent package consumer installs the
generated core/export tarballs and serves custom-layout output at nested paths
with JavaScript both enabled and disabled. Imported configuration cannot
register or inject a renderer or stylesheet. Custom components remain trusted
code and must retain accessible headings, controls and content. This extension
does not add custom forms to the standard editor or support arbitrary project
payload schemas.
