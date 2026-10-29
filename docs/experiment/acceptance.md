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

`tests/theme_presentation.test.tsx` adds THM-PRE-001–004 for bounded presentation
settings, defaults, invalid values and shared static rendering. Browser
THM-PRES-001 verifies actual computed styles and unchanged content in preview and
nested no-script export. The [integrated gate](../evidence/theme_presentation_final_gate.txt)
passes 134 unit and 35 browser tests. Nine original screenshot baselines are
unchanged. Maximum custom values with increased text zoom still require review.

`tests/theme_motion.test.tsx` covers THM-MOT-001–003 and MOT-008–009: legacy
manifest defaults, bounded motion settings, parallax opt-out, immutable
normalization and static rendering. The presentation browser scenario checks
custom theme scalars, parallax suppression, theme changes, reduced motion and
nested no-script output. Local integrated results are recorded in
[`theme_motion_final_gate.txt`](../evidence/theme_motion_final_gate.txt); hosted
verification is tracked in the pull request.

THM-NAV-001 validates navigation treatment defaults and rejects unknown values.
THM-NAV-002 checks the three bundled themes' computed link styles, visible
anchors, and wrapping at mobile/tablet/desktop widths. The six changed Ink and
Cyberpunk screenshot baselines were reviewed; all nine visual tests pass, and
Modern baselines remain unchanged.

The theme navigation update is recorded in `theme_navigation_final_gate.txt` with
140 unit tests across 34 files and 36 browser tests. Branch coverage remains
89.57%; the dependency audit reports zero vulnerabilities. Performance and visual
baseline evidence are stored beside the gate log.

THM-CARD-001 validates the card-style enum, legacy default, and the three built-in
theme values. THM-CARD-002 adds a project card in the real editor and verifies
computed text/background/border/shadow styles plus responsive grid fit at 375,
768, and 1440 pixels. Visual screenshot baselines remain unchanged because the
representative screenshot fixture contains no repeated cards.

THM-CARD-002 passes in the integrated gate and verifies all three built-in card
appearances and responsive fit through the real editor. See
[`theme_card_final_gate.txt`](../evidence/theme_card_final_gate.txt).

THM-RESP-001 validates the `wrap`/`stack` setting and backward-compatible default.
THM-RESP-002 creates multiple section links in the editor and checks layout,
visibility, and horizontal overflow for all built-in themes at mobile, tablet,
and desktop widths.

The THM-RESP-001/002 responsive-navigation slice passes the complete local gate:
142 unit tests across 34 files and 38 browser tests. The [gate log](../evidence/theme_responsive_final_gate.txt)
includes exported paths, SDK package checks, all nine visual comparisons and
license review; the [dependency audit](../evidence/theme_responsive_audit.txt)
reports zero vulnerabilities.

THM-A11Y-001 covers a custom theme with low foreground/background contrast. It
checks the displayed color reaches at least 4.5:1, reports a warning without
mutating saved theme data, and carries the same fallback into exported HTML.

THM-A11Y-001 passes in the complete local gate: 143 unit tests and 38 browser
tests. It checks a low-contrast custom theme, warning and immutability, resolved
contrast of at least 4.5:1, and the same foreground in preview and ZIP HTML.
