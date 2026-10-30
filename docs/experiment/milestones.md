# Implementation milestones

The current resumption record is [PROGRESS.md](../../PROGRESS.md). Detailed
commands are preserved in [the executed continuation gate](../evidence/font_final_gate.txt).

| Phase | Implemented and verified in that snapshot                                                                                                     | Remaining work                                                              |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| 0     | Shared React preview/static HTML, browser ZIP export, root and nested static serving with JavaScript disabled                                 | Preserve through final gates                                                |
| 1     | Versioned schema, ten sections, custom section/layout registries, portable text, safe URLs, motion, public API; unit/property/contract suites | Broader theme and section/layout contracts                                  |
| 2     | Guided editor, Lexical, responsive images, IndexedDB, undo/redo, backups, previews, competing-tab protection                                  | Human usability review                                                      |
| 3     | Standalone HTML/CSS/runtime/assets ZIP and editable backup; complete browser journey                                                          | Public deployment verification (collision regression passes)                |
| 4     | Three procedural layered themes; reduced motion, entry/exit effects, parallax; nine visual comparisons                                        | Complete visual/manual accessibility review; missing reference video        |
| 5     | William Elias consumer with theme switching and public-source provenance                                                                      | Production nested-route verification and deployment                         |
| 6     | Build, coverage, independent core/export tarball consumers, license audit, zero-vulnerability scan passed                                     | Hosted baseline passed; current increment verification, review, publication |

No hosted deployment or public v1 release is established. Later hosted gates
include cross-engine export run `40963619832`; subsequent edits still require
fresh verification. Comparison with the independent track remains pending.

## Current accessibility export reflow increment

The `A11Y-007` scenario extends 200% root text sizing at a 320 CSS-pixel
viewport to the actual no-JavaScript static ZIPs for Modern Professional, Ink
Wash, and Cyberpunk. Its fixture includes long section copy and a project card;
the test checks the document, navigation, copy panels and card layout for
horizontal overflow, and confirms headings and body copy remain visible. This
behavior already passed, so the increment adds coverage without production CSS
changes or a claimed RED phase. The focused test passed. The full local check
passed 152 unit tests and 53 of 54 browser scenarios; WebKit could not launch on
the host due missing system libraries. Separate SDK, license and vulnerability
checks passed. Raw results are in the linked evidence from `PROGRESS.md`; hosted
verification is pending.

PR #27 merged this `A11Y-007` coverage as `b21f26c` after hosted `verify` passed
in run `40982131106`.

## Merged theme focus indicator increment

`A11Y-009` reproduced a 1.1133:1 keyboard-outline contrast against the valid
creator-selected `#767676` website background. The renderer now uses the
contrast-resolved theme accent for its 3px website focus outline. Browser
coverage measures at least 3:1 in preview and in actual ZIPs for all three
themes, with a low-contrast saved accent forcing the fallback. Focused Chromium
verification passes. The full local check passed formatting, lint, strict
types, build/prerender and 152 unit tests (94.88% statements and 89.68% branch
coverage); 53 of 54 browser scenarios passed, with host WebKit startup blocked
by missing system libraries. Separate SDK, 267-package license and zero-
vulnerability checks passed. PR #28 merged as `7ac2522` after hosted `verify`
passed in run `40983837315` and the deployable-site artifact build passed in
run `40983837406`. The original failure is preserved in
[`theme_focus_indicator_red.txt`](../evidence/theme_focus_indicator_red.txt);
local evidence is linked in `PROGRESS.md`. See
[ADR 016](../architecture/adr_016_theme_aware_focus_indicators.md).
Current focus contrast measurement is exercised in Chromium; browser-engine
coverage for this particular custom-color case is being extended in the current
increment.

## Merged cross-engine focus indicator coverage

The `EXP-PLATFORM-001` exported ZIP browser matrix now also checks `A11Y-009`
with a low-contrast creator color selection. In each engine, the test uses the
keyboard skip link, then measures the 3px solid outline against the resolved
site background in a JavaScript-disabled ZIP for all three themes. The shared
measurement helper is also used by the editor-preview/export accessibility
scenario. Local Chromium and Firefox runs pass; WebKit could not launch on the
host because GTK/WebKit/media dependencies are missing. The full local gate
passes format, lint, strict types, production build, and 152 unit tests (94.88%
statements, 89.68% branches); its browser suite passes 53 of 54 scenarios, with
WebKit as the only launch failure. Separate SDK, license, and vulnerability
checks pass. PR #29 merged as `78a6327` after hosted `verify` passed in run
`40985012399`, including WebKit. See the focused, full-gate and supplemental
evidence files linked in `PROGRESS.md`.

## Current trusted custom layout increment

`CFG-LAYOUT-001–004` adds an immutable per-consumer `createLayoutRegistry` with
safe IDs, section compatibility, trusted React renderers, semantic content
slots and bounded self-contained CSS. `parseSite`, `Site`, ZIP export and backup
operations all receive the same registry; imported projects store only a layout
ID. Existing built-in section/layout pairs remain accepted. The standard editor
continues to offer its built-in layout choices. Focused tests pass preview,
static ZIP, backup round-trip and invalid registration behavior. The full local
check passes formatting, lint, typecheck/build/prerender and 156 unit tests at
94.50% statement / 89.84% branch coverage. Browser tests pass 53/54; the only
failure is local WebKit launch due to missing host GTK/media libraries, while
Chromium and Firefox cross-engine ZIP checks pass. SDK-001–006 pass with actual
generated packages and a clean Vite consumer; 267-package license review passes
and `npm audit` reports zero vulnerabilities. Hosted verification is pending.
The focused suite passes 4/4. RED and compatibility evidence is recorded in
[`layout_registry_red.txt`](../evidence/layout_registry_red.txt); see
[ADR 017](../architecture/adr_017_trusted_layout_renderers.md) and the
[developer guide](../developers/custom_layouts.md).

GitHub Pages preparation is implemented on `build/github-pages-preparation`.
The local full gate passes with 150 unit tests, 50 browser tests, 89.54% overall
branch coverage, independent package consumers, license review and zero
dependency vulnerabilities; see
[`pages_preparation_local_gate.txt`](../evidence/pages_preparation_local_gate.txt).
The workflow builds and tests a Pages artifact, while public deployment is
disabled unless the manual input, main ref, owner-managed repository variable,
and both distinct protected reviewer approvals all match. PR #20 passed hosted
Pages artifact/path verification in run
[`40969895104`](https://github.com/howlcipher/howlscene/actions/runs/40969895104)
and the full quality gate in run
[`40969894934`](https://github.com/howlcipher/howlscene/actions/runs/40969894934).
The approval jobs skipped as expected on the PR. Repository-side Pages and
reviewer-environment safeguards are still unconfigured. See
[ADR 012](../architecture/adr_012_github_pages_release_gate.md) and the
[administrator guide](../developers/github_pages_deployment.md).
The resulting `main` protection settings are recorded in
[`pages_branch_protection.md`](../evidence/pages_branch_protection.md).

The current branch `work/theme-section-headings` adds the theme-owned
`presentation.headingTreatment` enum: Modern Professional uses `plain`, Ink Wash
uses `accent-rule`, and Cyberpunk uses `accent-rail`. The focused RED test is
preserved in [`theme_component_treatment_red.txt`](../evidence/theme_component_treatment_red.txt).
Unit coverage verifies validation, defaults, and preview/export parity. A browser
scenario checks computed treatments and content preservation at 375, 768, and
1440 px, plus a nested no-script ZIP; it passes locally. The six changed preview
baselines were inspected. Full gate and hosted verification remain pending.

Creator background/text/accent colors now pass the integrated local gate:
145 unit tests, 39 browser tests, 89.54% overall branch coverage, production
build/prerender, independent package consumers, and dependency/license audits.
See [`editor_colors_final_gate.txt`](../evidence/editor_colors_final_gate.txt).
Hosted verification is still required; this does not close the human accessibility
or usability review or establish release readiness.

The creator color controls merged as `41618b6` after hosted run `40943699920`
passed. The image-position editor control merged as `35a53b0` after hosted run
`40945088628` passed; evidence is in
[`image-position gate`](../evidence/image_position_final_gate.txt). The
section-spacing/alignment/width editor increment passes the full local gate:
145 unit and 41 browser tests, package consumers, and license audit. Its hosted
verification and merge remain pending; see
[`layout controls evidence`](../evidence/layout_controls_final_gate.txt).

The custom-section registration increment now passes 149 unit and 41 browser
tests, the independent package/browser export check, license audit, and local
vulnerability audit. PR #11 merged as `ba6125f` after hosted run `40950249941`
passed. The portable section fields and trusted registry behavior are documented
in ADR 009 and the [custom-section guide](../developers/custom_sections.md).

The creator presentation increment adds allowlisted overrides for shared card
and navigation settings. Its initial schema and editor-control failures are
preserved in `editor_presentation_red.txt` and
`editor_presentation_e2e_red.txt`. Focused unit and browser tests pass. The
complete local gate passes 150 unit and 42 browser tests. PR #12 merged as
`c82bd5b` after hosted run `40952321979` passed; its first hosted formatting
failure was corrected before the successful run.

EXP-VISUAL-001 captures image-rich, long-form exported content with JavaScript
disabled for all themes at three viewports. The nine new baseline images and the
existing nine preview baselines pass. The complete local gate now passes 150
unit and 43 browser tests; SDK/export and 267-package license/provenance checks
pass, and the separate vulnerability audit reports zero. An initial hosted run
exposed system-font-dependent wrapping; pinned exported font fixtures and an
assertion on computed font family corrected it. PR #13 merged as `6efd87b` after
hosted run `40956127243` passed.

The following browser check exercises maximum presentation token values from
each bundled theme at 200% root text size and 320 CSS px with long copy. It
checks headings, paragraphs, navigation and cards for overflow. The test page's
theme selector itself was constrained to its viewport; it was the source of the
initial document-level false positive, not the rendered website. Actual browser
zoom and human text-zoom review remain open. The focused and full local gates
pass; the latter runs 150 unit and 44 browser tests with 89.54% overall branch
coverage. See [`theme_presentation_zoom_final_gate.txt`](../evidence/theme_presentation_zoom_final_gate.txt)
and [`theme_presentation_zoom_audit.txt`](../evidence/theme_presentation_zoom_audit.txt).

EDT-012 now verifies a registry-compatible section layout through the actual
editor. The image placement responds to the desktop and phone preview widths,
then survives a local draft reload and appears with its alt text in the exported
HTML. The full local gate passes 150 unit and 45 browser tests with 89.54%
overall branch coverage; SDK/export, license and vulnerability checks pass.
Executed results are in [`section_layout_final_gate.txt`](../evidence/section_layout_final_gate.txt)
and [`section_layout_audit.txt`](../evidence/section_layout_audit.txt). Hosted
verification is pending.

Current branch: `work/theme-layers`. Manifest-driven artwork passes the complete local gate:
130 unit tests, 34 browser tests, independent package consumption and licenses.
The aggregate asset-preflight regression and cleanup correction pass too. The clean hosted baseline is
`ce06f23`, run `40878831459`; this is separate from current-branch verification.

The next bounded presentation increment passes the complete local gate:
134 unit tests, 35 browser tests, installed consumers and licenses. Defaults
preserve all nine screenshots. Broader theme contracts remain required work;
see ADR 003 and current journal for evidence and limits.

`THM-COMP-001–002` adds a validated `headingTreatment` enum consumed by the
shared renderer and stylesheet. The full local gate passes 151 unit and 51
browser tests, including rendered theme differences and nested no-script export;
overall branch coverage is 89.54%. Six preview and six exported-site screenshots
for Ink Wash and Cyberpunk were reviewed and updated. The RED log and
[final gate output](../evidence/theme_heading_final_gate.txt) are retained.
PR #22 merged as `e4239ed` after hosted `verify` run `40972904183` and Pages
artifact/path run `40972904198` passed. Human contrast/usability review remains
open. See [ADR 013](../architecture/adr_013_theme_heading_treatments.md).

`A11Y-SCENE-001` places semantic copy on an opaque, theme-colored surface for
sections with uploaded background images. It checks all three themes in preview
and Ink Wash in a nested no-script export. Hosted `verify` passed in run
`40974740672`, and the Pages artifact/path check passed in run `40974740693`.
PR #25 merged `A11Y-SCENE-002` as `6ba4e7f`: standard section introductions,
timelines, and CTA links use an opaque resolved-theme surface over native
scenery, while project, skill and gallery cards retain their own backgrounds.
Preview and nested no-script export checks measure foreground and accent
contrast in all three themes. Six 1440-pixel theme previews were inspected; art
remains visible around the surfaces. Hosted `verify` passed in run `40980058221`
and the Pages artifact/path check passed in run `40980058139`. Local evidence is
in [`native_scenery_readability_host_local_attempt.txt`](../evidence/native_scenery_readability_host_local_attempt.txt).
See [ADR 014](../architecture/adr_014_readable_surfaces_for_background_images.md),
[ADR 015](../architecture/adr_015_readable_surfaces_over_theme_scenery.md), and
the current evidence in `PROGRESS.md`.

The post-merge `PERF-LAB-001` run measures the updated actual export under the
existing constrained Chromium profile. It observed 544 ms LCP, CLS 0, no long
tasks, 16.7 ms p95 across 60 animation-frame intervals, 10,540 encoded CSS
bytes, and 21,349 gzip bytes of site runtime. Environment and run limitations
are in [`production_mobile_performance_scene_surface.json`](../evidence/production_mobile_performance_scene_surface.json).
This Node 22.22.1 sample is not directly comparable to the prior Node 24 sample;
real older-device review remains open.

PR #24 merged as `0ad3124` and adds `EDT-ONBOARD-001`. Its five-step
guide supports back/next navigation, skip, finish, reopen, and keyboard
activation. The browser regression passes against a new draft and checks that
the save, backup and published ZIP explanations stay distinct. The local run
passed 151 unit tests and 52 of 53 browser scenarios; WebKit could not launch on
this host because system libraries are missing. SDK, license and dependency
audits also pass locally. Hosted `verify` passed in run `40976918226`, and the
Pages artifact/path check passed in run `40976918558`; hosted CI covers WebKit.
See the current run journal, `docs/evidence/editor_onboarding_red.txt`, and the
focused run transcript at `docs/evidence/editor_onboarding_focused.txt`.

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

Static-layout export verification now loads the generated ZIP itself from a
nested URL with JavaScript disabled. The browser confirms the image bytes load,
alt text remains present, the split image floats right on desktop and stacks on
phone, anchor navigation works, and the document has no horizontal overflow.
The complete local Node 24.22.2 gate passes 150 unit and 45 browser tests at
94.85% statement / 89.54% branch coverage. The separate dependency audit reports
zero vulnerabilities; hosted CI remains the merge gate. Evidence is in
[`export_layout_static_final_gate.txt`](../evidence/export_layout_static_final_gate.txt)
and [`export_layout_static_audit.txt`](../evidence/export_layout_static_audit.txt).

Target-engine static-export review adds one focused scenario across Chromium,
Firefox and WebKit. All three themes are loaded from actual no-script ZIPs at
nested paths at desktop and phone sizes, with long text, image decoding,
navigation and overflow checks. All three projects pass in the pinned
Playwright container; direct WebKit launch on this Bazzite host needs GTK/WebKit
libraries that are not installed. The full editor and screenshot suites remain
Chromium-only by design; hosted CI is pending. See
[ADR 010](../architecture/adr_010_target_browser_export_checks.md) and the
[full gate log](../evidence/cross_browser_final_gate.txt).
