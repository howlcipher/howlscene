# Acceptance traceability

This maps observable requirements to implemented behavior and executable evidence.
It does not assert that every scenario within a group is complete. See the
[current journal](../../PROGRESS.md) for the exact executed snapshot and open gates.

| Requirement group | Implementation and tests                                                                                                                                          | Verification scope                                                                                                                                                                                                                                                                                          |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CFG-001–005,007   | Core schema, stable IDs, validation; `tests/core.test.tsx` and security/contract/property tests                                                                   | Unit gate; invalid imports cannot partially replace a draft                                                                                                                                                                                                                                                 |
| CFG-006           | No older released format exists                                                                                                                                   | No invented migration claim; add migration when a supported older format exists                                                                                                                                                                                                                             |
| THM-001–006       | Theme registry/resolution, three original scenery themes; contracts, browser theme preservation, responsive and visual tests                                      | Shared content preserved; nine viewport/theme screenshots; broader visual review open                                                                                                                                                                                                                       |
| MOT-001–007       | Preset/primitive resolution, enhancer lifecycle, scene tests and `tests/e2e/motion.spec.ts`                                                                       | Reduced/manual motion, finite entry/exit ownership, cleanup and ordinary scrolling; rapid theme/anchor changes and long-content browser scenarios now covered                                                                                                                                               |
| TXT-001–005       | Portable model/Lexical bridge, editor history, rich-text and browser tests                                                                                        | Formatting round trips, inert markup, safe links, undo/redo                                                                                                                                                                                                                                                 |
| EDT-001–010       | Guided panels, history, storage, files, onboarding; editor/model/browser journey tests                                                                            | Template, text, sections, theme preservation, images, reload, errors, confirmation, keyboard workflow; EDT-003 layout controls and EDT-010 colors covered below                                                                                                                                             |
| AST-001–006       | Header/decode validation, normalization/srcset, manifest; assets and collision regression tests                                                                   | Upload, restore/backup, image export, path isolation; final ZIP journey uses real images                                                                                                                                                                                                                    |
| EXP-001–011       | Shared renderer and standalone ZIP, backups, metadata and runtime                                                                                                 | Extracted files served root/nested with JS on/off; malformed input rejected; independent exporter package exercised                                                                                                                                                                                         |
| SDK-001–005       | Public registries/render/validation/export packages; `scripts/sdk_check.mjs`                                                                                      | Actual tarballs installed in independent typed consumer, including custom-section registration, backup, browser render and nested export; no editor imports                                                                                                                                                 |
| A11Y-001–008      | Semantics, focus recovery, motion control, keyboard and axe browser tests, including actual exported ZIPs                                                         | Automated 200% root text-size and 320 CSS-pixel reflow pass with maximum valid presentation tokens in all themes; exported theme ZIPs have serious/critical axe scans, reduced-motion behavior, skip-link keyboard access and mobile/desktop overflow checks; human review remains open; no WCAG claim      |
| SEC-001–006       | Strict runtime schema, safe URLs, bounded media/imports, controlled paths, inert text                                                                             | Positive/negative regression tests and vulnerability/provenance audit; not a complete adversarial audit                                                                                                                                                                                                     |
| EDT-011           | Theme presentation overrides, `AppearancePanel`, shared resolver and export; `tests/theme_presentation.test.tsx`, `tests/e2e/theme_presentation_controls.spec.ts` | Card appearance, navigation treatment and phone link layout are selectable, validated, retained across theme changes/reload and exported with the same values                                                                                                                                               |
| EDT-012           | Registry-derived layout options, `SectionPanel` and `tests/e2e/layout_controls.spec.ts`                                                                           | About-section layout choices stay compatible; a real image moves beside text in the wide preview, stacks in the phone preview, survives reload and appears in the published HTML                                                                                                                            |
| THM-PRES-005      | `tests/e2e/presentation.spec.ts` and `tests/fixtures/presentation.tsx`                                                                                            | Maximum bounded line-height, card gap/radius and navigation gap reflow with long text at 200% root text sizing and 320 CSS px for Modern, Ink Wash and Cyberpunk; no document, navigation, card or text overflow                                                                                            |
| VIS-001           | `tests/e2e/export_image_rich_visual.spec.ts` and nine reviewed Playwright baselines                                                                               | Actual ZIP with generated uploaded artwork and long copy, JavaScript disabled, three themes at 375/768/1440 px; all four images load and retain alt text, pinned font weights load, and computed theme font is asserted. Font mismatch correction passed hosted run 40956127243; PR #13 merged as `6efd87b` |
| EXP-PLATFORM-001  | `tests/e2e/cross_browser_export.spec.ts`, browser-specific Playwright projects                                                                                    | Actual editor-generated ZIP at a nested path with JavaScript disabled; all themes, long text, image decoding/alt text, responsive split layout, anchor navigation and overflow are checked in Chromium, Firefox and WebKit                                                                                  |
| PERF-LAB-001      | `tests/e2e/production_mobile_performance.spec.ts`                                                                                                                 | Actual editor-generated ZIP under nested static hosting on an emulated 390×844 Chromium profile; records loading, LCP, CLS, long tasks, sampled frame intervals, image/runtime bytes and motion-off content. It is a lab observation, not physical-device or field evidence.                                |
| DEPLOY-PAGES-001  | `.github/workflows/pages.yml`, `production.spec.ts`, ADR 012                                                                                                      | PRs build and test the deploy artifact at root and `/howlscene/`; deployment requires manual main dispatch, repository enable variable, and two distinct protected reviewer approvals. Hosted workflow result and public deployment remain pending.                                                         |

## Final journey

`tests/e2e/journey.spec.ts` performs the portfolio workflow: template/theme,
formatted text, uploaded background, projects, reordering, motion, content
preservation across themes, phone preview, reload, backup import, website ZIP,
extraction, real nested static hosting, images/navigation and disabling motion.
`tests/e2e/production.spec.ts` verifies actual production landing/editor/example
files under root and `/howlscene/`, including meaningful no-JavaScript content.
These local servers establish static deployment compatibility, not an actual
public-host deployment. Human review of clarity and usability remains required.

VIS-001 captures actual exported, image-rich websites with long introductory
copy in all three themes at mobile, tablet and desktop widths. The fixture
creates its own original raster landscape in-browser, uploads it through the
editor, uses it as background scenery and on three project cards, then serves
the ZIP with JavaScript disabled. All nine baselines were reviewed; only the
test capture pins licensed fonts, and those assets remain outside production.
The initial missing-baseline RED is retained in
[`export_image_visual_red.txt`](../evidence/export_image_visual_red.txt).

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
unchanged. Automated 200% root text-size reflow at 320 CSS px now covers maximum
presentation tokens in all three themes. Actual browser-zoom and human text
zoom review remain open.

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

EDT-010 covers background, text and accent color inputs. It verifies a low-contrast
selection produces readable displayed tokens and a warning without losing the
selected values, preserves colors through theme switching and reload, and exports
the same resolved CSS values in the website ZIP.

EDT-010 passed in the integrated Node 24.22.2 gate: 145 unit tests, 39 browser
tests, 89.54% overall branch coverage, clean independent SDK/export consumers,
and the 267-package license audit. The new end-to-end test performs actual
browser edits, theme switching, autosave/reload, and checks exported HTML values.
See [`editor_colors_final_gate.txt`](../evidence/editor_colors_final_gate.txt).
Contrast fallback only checks flat color pairs; scenery and uploaded media need
human assessment and no WCAG conformance is inferred.

The new `tests/e2e/image_position.spec.ts` browser scenario verifies the
image-position control appears after an image is uploaded, updates the actual
preview image, persists after reload, and is included in the exported HTML.
Its first run failed because the editor did not expose the already-supported
schema field; that RED is preserved in
[`image_position_red.txt`](../evidence/image_position_red.txt).
It passes in the full local gate with 145 unit and 40 browser tests; see
[`image_position_final_gate.txt`](../evidence/image_position_final_gate.txt).

The new `tests/e2e/layout_controls.spec.ts` test covers the section spacing,
alignment and content-width controls through live preview, reload and ZIP HTML.
The initial run failed because these available section values had no editor
controls; the RED is in `layout_controls_red.txt`. The focused browser test passes;
the full local gate passes 145 unit and 41 browser tests, with 89.54% overall
branch coverage, independent SDK/export checks, and a clean license audit. See
[`layout_controls_final_gate.txt`](../evidence/layout_controls_final_gate.txt).

`tests/custom_sections.test.tsx` covers safe custom IDs, duplicate and unknown
registration rejection, inert text rendering, preview/static parity, and backup
round-trip. `scripts/sdk_check.mjs` repeats the public path from independently
installed tarballs, including typed registration and nested static serving with
JavaScript enabled and disabled. The integrated local gate passes 149 unit and
41 browser tests; see
[`custom_sections_final_gate.txt`](../evidence/custom_sections_final_gate.txt).
A second negative case catches a non-callable registry entry that advertises a
valid custom ID; its pre-fix failure is retained in
[`custom_registry_validation_red.txt`](../evidence/custom_registry_validation_red.txt).

EDT-011 gives creators safe overrides for card appearance, navigation link
style, and phone navigation layout while retaining each selected theme's other
presentation defaults. `tests/theme_presentation.test.tsx` covers allowlisted
values, unsafe-value rejection and preview/export parity. Its initial schema
rejection is recorded in
[`editor_presentation_red.txt`](../evidence/editor_presentation_red.txt).
The browser scenario adds a real project card, switches themes, checks narrow
navigation layout, reloads local storage, and inspects the website ZIP. Its
initial missing-control failure is in
[`editor_presentation_e2e_red.txt`](../evidence/editor_presentation_e2e_red.txt).

EDT-012 additionally opens the actual downloaded section-layout ZIP from a
nested `/howlscene/layout/` mount with JavaScript disabled. It verifies the
exported heading and navigation, decoded image dimensions and alt text, split
image placement at desktop and phone widths, anchor navigation, and absence of
horizontal document overflow. The full Node 24.22.2 gate passes 150 unit and 45
browser tests, with 94.85% statement and 89.54% branch coverage; independent SDK
consumption, license review, and a separate zero-vulnerability audit pass. See
[`export_layout_static_final_gate.txt`](../evidence/export_layout_static_final_gate.txt)
and [`export_layout_static_audit.txt`](../evidence/export_layout_static_audit.txt).

EXP-PLATFORM-001 extends static-export verification to Chromium, Firefox and
WebKit without tripling the editor or screenshot suite. Each engine loads an
actual editor-generated ZIP under `/howlscene/platform-review/` with JavaScript
disabled, across Modern, Ink Wash and Cyberpunk at 1280 and 375 CSS pixels. The
scenario checks long content, image bytes and alternative text, responsive
split layout, working section anchors, and horizontal overflow. All three
browser projects pass in the pinned Playwright container. Direct WebKit launch
on this Bazzite host is unavailable without GTK/WebKit system libraries. See
[ADR 010](../architecture/adr_010_target_browser_export_checks.md) and the
[integrated gate](../evidence/cross_browser_final_gate.txt).

The updated cross-engine check passed the hosted quality gate in run
[`40963619832`](https://github.com/howlcipher/howlscene/actions/runs/40963619832).
`PERF-LAB-001` also passed hosted CI in run
[`40966448827`](https://github.com/howlcipher/howlscene/actions/runs/40966448827);
its local sample is preserved in
[`production_mobile_performance.json`](../evidence/production_mobile_performance.json).

`A11Y-008` is locally verified by the accessibility gate with 150 unit and 50
browser tests. Hosted verification is pending. The full command output and
separate dependency scan are in
[`export_a11y_final_gate.txt`](../evidence/export_a11y_final_gate.txt) and
[`export_a11y_audit.txt`](../evidence/export_a11y_audit.txt).

`A11Y-008` creates the same image-bearing portfolio through the editor, exports
all three themes, and serves each ZIP at a nested path. At 375 and 1440 CSS
pixels, reduced motion remains active, essential content and image alternatives
are available, and no horizontal overflow or serious/critical axe violations
are present. Keyboard-only navigation to the skip link and main content is
checked on the phone layout. This automated evidence does not substitute for
screen-reader, zoom, color-over-artwork, or nontechnical-user review.
