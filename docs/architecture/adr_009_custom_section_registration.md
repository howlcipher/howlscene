# ADR 009: Register custom section renderers with portable content

Status: implemented locally; hosted verification pending.

## Context

The engine allowed developers to replace renderers for ten built-in section kinds,
but a new section kind still required changes to the central schema and renderer.
Imported project data is untrusted, so extending the product must not deserialize
components, HTML, or executable code.

## Options

| Option                                                           | Benefits                                                    | Costs                                                                                                                              |
| ---------------------------------------------------------------- | ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Arbitrary typed payloads per custom section                      | Maximum modeling freedom                                    | Dynamic schema and editor complexity; portability and migration burden                                                             |
| Imported component identifiers with module loading               | Flexible distribution                                       | Executes imported code and requires a module/plugin loader                                                                         |
| A bounded custom discriminator plus trusted registered renderers | Safe IDs, portable base content, explicit consumer boundary | Custom renderers reuse the v1 section content fields; consumer supplies the same registry at parse/render/export/backup boundaries |

Choose the bounded discriminator. A project section uses `type: "custom"` and a
safe `customType` ID. Its heading, body, rich text, entries, image reference,
layout, navigation and visibility use the existing validated section model.
The consumer registers trusted React renderers under unique IDs. Registry code is
never serialized into a project.

## Consequences

`createSectionRegistry` continues to provide all built-in renderers and may add
custom registrations. `parseSite` accepts that registry as its third parameter;
`Site`, `exportWebsite`, and backup functions must receive the same registry.
Missing registrations and unsafe/duplicate IDs fail explicitly. Custom renderers
must be deterministic and static-renderable. They may use the shipped semantic
classes, but custom CSS/assets are not automatically collected by the exporter.
The standard no-code editor only lists built-in section types; this API extends
consumer applications and does not create a plugin marketplace or custom-content
schema editor.

## Verification

The contract test covers registration, unknown and unsafe IDs, preview/static
output, and editable backup round-trip. The independently installed package
consumer verifies declarations, browser render, and a nested-path static ZIP.
