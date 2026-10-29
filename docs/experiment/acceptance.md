# Acceptance traceability

This maps observable requirements to implemented behavior and executable evidence.
It does not assert that every scenario within a group is complete. See the
[current journal](../../PROGRESS.md) for the exact executed snapshot and open gates.

| Requirement group | Implementation and tests                                                                                                     | Verification scope                                                                                                                                            |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CFG-001–005,007   | Core schema, stable IDs, validation; `tests/core.test.tsx` and security/contract/property tests                              | Unit gate; invalid imports cannot partially replace a draft                                                                                                   |
| CFG-006           | No older released format exists                                                                                              | No invented migration claim; add migration when a supported older format exists                                                                               |
| THM-001–006       | Theme registry/resolution, three original scenery themes; contracts, browser theme preservation, responsive and visual tests | Shared content preserved; nine viewport/theme screenshots; broader visual review open                                                                         |
| MOT-001–007       | Preset/primitive resolution, enhancer lifecycle, scene tests and `tests/e2e/motion.spec.ts`                                  | Reduced/manual motion, finite entry/exit ownership, cleanup and ordinary scrolling; rapid theme/anchor changes and long-content browser scenarios now covered |
| TXT-001–005       | Portable model/Lexical bridge, editor history, rich-text and browser tests                                                   | Formatting round trips, inert markup, safe links, undo/redo                                                                                                   |
| EDT-001–009       | Guided panels, history, storage, files, onboarding; editor/model/browser journey tests                                       | Template, text, sections, theme preservation, images, reload, errors, confirmation, keyboard workflow                                                         |
| AST-001–006       | Header/decode validation, normalization/srcset, manifest; assets and collision regression tests                              | Upload, restore/backup, image export, path isolation; final ZIP journey uses real images                                                                      |
| EXP-001–011       | Shared renderer and standalone ZIP, backups, metadata and runtime                                                            | Extracted files served root/nested with JS on/off; malformed input rejected; independent exporter package exercised                                           |
| SDK-001–005       | Public registries/render/validation/export packages; `scripts/sdk_check.mjs`                                                 | Actual tarballs installed in independent typed consumer, browser render and CSS, no editor imports                                                            |
| A11Y-001–007      | Semantics, focus recovery, motion control, keyboard and axe browser tests                                                    | Representative keyboard/viewport/focus checks; human assistive-technology and zoom review open; no WCAG conformance claim                                     |
| SEC-001–006       | Strict runtime schema, safe URLs, bounded media/imports, controlled paths, inert text                                        | Positive/negative regression tests and vulnerability/provenance audit; not a complete adversarial audit                                                       |

## Final journey

`tests/e2e/journey.spec.ts` performs the portfolio workflow: template/theme,
formatted text, uploaded background, projects, reordering, motion, content
preservation across themes, phone preview, reload, backup import, website ZIP,
extraction, real nested static hosting, images/navigation and disabling motion.
`tests/e2e/production.spec.ts` verifies actual production landing/editor/example
files under root and `/howlscene/`, including meaningful no-JavaScript content.
These local servers establish static deployment compatibility, not an actual
public-host deployment. Human review of clarity and usability remains required.

## Theme-layer extension increment

`tests/theme_layers.test.tsx` covers immutable registries, bounded manifests,
legacy authoring compatibility, unsafe IDs/references and property-based
normalization (seed 23614). The installed-package consumer registers a fourth
theme with original artwork, restores its backup and serves the browser-generated
ZIP under two nested mounts, JavaScript on/off. Existing visual baselines remain
unchanged. `tests/security.test.tsx` now proves aggregate-budget rejection occurs
before decoding and preserves exact limits. These scenarios pass in the
[130-unit/34-browser integrated gate](../evidence/theme_layers_final_gate.txt).
Broader v1 theme/section contracts and human review remain open.
