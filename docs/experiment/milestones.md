# Implementation milestones

The current resumption record is [PROGRESS.md](../../PROGRESS.md). Detailed
commands are preserved in [the executed continuation gate](../evidence/font_final_gate.txt).

| Phase | Implemented and verified in that snapshot                                                                               | Remaining work                                                                                |
| ----- | ----------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| 0     | Shared React preview/static HTML, browser ZIP export, root and nested static serving with JavaScript disabled           | Preserve through final gates                                                                  |
| 1     | Versioned schema, ten sections, registries, portable text, safe URLs, motion, public API; unit/property/contract suites | Layer registry increment locally verified; broader theme and general section/layout contracts |
| 2     | Guided editor, Lexical, responsive images, IndexedDB, undo/redo, backups, previews, competing-tab protection            | Human usability review                                                                        |
| 3     | Standalone HTML/CSS/runtime/assets ZIP and editable backup; complete browser journey                                    | Public deployment verification (collision regression passes)                                  |
| 4     | Three procedural layered themes; reduced motion, entry/exit effects, parallax; nine visual comparisons                  | Complete visual/manual accessibility review; missing reference video                          |
| 5     | William Elias consumer with theme switching and public-source provenance                                                | Production nested-route verification and deployment                                           |
| 6     | Build, coverage, independent core/export tarball consumers, license audit, zero-vulnerability scan passed               | Hosted baseline passed; current increment verification, review, publication                   |

No hosted deployment or public v1 release is established. The passed snapshot
contains 114 unit tests and 34 browser tests; subsequent edits require fresh
verification. Comparison with the independent track remains pending.

Creator background/text/accent colors now pass the integrated local gate:
145 unit tests, 39 browser tests, 89.54% overall branch coverage, production
build/prerender, independent package consumers, and dependency/license audits.
See [`editor_colors_final_gate.txt`](../evidence/editor_colors_final_gate.txt).
Hosted verification is still required; this does not close the human accessibility
or usability review or establish release readiness.

The creator color controls merged as `41618b6` after hosted run `40943699920`
passed. The follow-up image-position editor control passes the full local gate:
145 unit tests, 40 browser tests, SDK/export consumer checks, and license audit.
Its hosted verification and merge remain pending; see the
[`image-position evidence`](../evidence/image_position_final_gate.txt).

Current branch: `work/theme-layers`. Manifest-driven artwork passes the complete local gate:
130 unit tests, 34 browser tests, independent package consumption and licenses.
The aggregate asset-preflight regression and cleanup correction pass too. The clean hosted baseline is
`ce06f23`, run `40878831459`; this is separate from current-branch verification.

The next bounded presentation increment passes the complete local gate:
134 unit tests, 35 browser tests, installed consumers and licenses. Defaults
preserve all nine screenshots. Broader theme contracts remain required work;
see ADR 003 and current journal for evidence and limits.

Theme motion increment: added bounded per-theme intensity/speed scalars and a
parallax preference while retaining user-level motion-off and reduced-motion
behavior. Five tests were observed failing before implementation. The local gate passes
139 unit and 35 browser tests. Static export, independent SDK and package audit
results are recorded in
[`theme_motion_final_gate.txt`](../evidence/theme_motion_final_gate.txt). Hosted
CI and merge status are tracked in the pull request.

Navigation presentation increment: `plain`, `underline`, and `framed` styles are
validated theme data consumed by shared CSS. Browser checks cover actual styles
and wrapping at three widths; reviewed visual baselines change only for Ink Wash
and Cyberpunk.

The navigation-style implementation passes the full local gate: 140 unit tests,
36 browser tests, nine visual comparisons, SDK/export checks, license audit, and
zero dependency vulnerabilities. See `theme_navigation_final_gate.txt` and
`theme_navigation_audit.txt`; hosted CI is still required.

Card presentation increment: a bounded card-style enum selects outlined, soft, or
accent-glow styles for the shared project/gallery components. Editor-based tests
verify computed appearance, readable color/background, and responsive grid fit.

The card-style contract passes the integrated Node 24 gate: 141 unit tests across
34 files and 37 browser tests, including the visual baselines, real-editor card
appearance, SDK consumer, and static export checks. Overall branch coverage is
89.57%; the dependency audit reports zero vulnerabilities. Hosted verification
remains pending.

Responsive navigation increment: added an optional `wrap`/`stack` theme choice at
the shared mobile breakpoint. Browser tests confirm link availability and no
horizontal overflow across mobile/tablet/desktop widths.

Responsive navigation passed the complete local Node 24 gate: 142 unit tests, 38
browser tests, 89.57% overall branch coverage, SDK/export verification, nine visual
comparisons, and zero dependency vulnerabilities. Hosted verification remains
pending.

Theme text-contrast increment: the shared resolver substitutes the higher-contrast
black/white foreground when a custom theme falls below 4.5:1, while preserving
saved colors and returning a warning. Unit coverage exercises preview rendering
and exported HTML; human review for text over artwork remains open.

Text-contrast fallback passes the integrated Node 24 gate: 143 unit tests across
34 files, 38 browser tests, 89.47% overall branch coverage, production builds,
package consumers, and licenses. `npm audit` reports zero vulnerabilities. Flat
colors are covered; artwork contrast and human accessibility review remain open.

Creator color controls: added editable background and text colors beside accent.
A real browser journey selects colors, verifies contrast warning/fallback, changes
the theme, waits for draft save, reloads, and checks exported CSS values.
