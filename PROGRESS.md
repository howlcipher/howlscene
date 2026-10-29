# HowlScene progress and resumption journal

## Current state

Track A is the conventional TypeScript/React implementation in this repository. Work is local and not released. Do not read or modify another experiment track, the original portfolio, or unrelated repositories. No public deployment is established. The reference video has not been supplied.

Phase 0 proved the shared editor-to-static-export approach. Core/schema, rich text, assets, storage, history, guided editor controls, backups, SDK packaging, and motion work have since been added. Integration and regression fixes are active. These source features do not establish complete v1 acceptance.

## Latest executed milestone

The current Node 24.22.2 local gate passes formatting, lint, strict TypeScript,
production build/prerender, **150 unit tests in 35 files**, **45 browser tests**,
independent SDK/export tarball consumption and the 267-package license/provenance
audit. `npm audit --audit-level=moderate` reports zero vulnerabilities. Overall
coverage is 94.85% statements and 89.54% branches; core branch coverage is
89.97%, configuration 92.59%, and exporter 97.72%. Executed logs are in the
[layout preset gate](docs/evidence/section_layout_final_gate.txt),
[audit](docs/evidence/section_layout_audit.txt), and previous
[performance record](docs/evidence/export_image_visual_performance.json).

Nine deterministic preview screenshots and nine image-rich, long-form static
export screenshots pass across all three themes at 375, 768, and 1440 px. The
new export baselines show user-uploaded scenery and card images served with
JavaScript disabled. Maximum presentation tokens pass automated 200% root text
sizing at 320 CSS pixels across all three themes, including long text, navigation
and cards. A new editor workflow verifies compatible section layout choices,
desktop image/text placement, phone fallback, reload and static export. These
automated results do not close actual browser-zoom, assistive-technology, or
nontechnical usability review. PR #13 passed hosted run `40956127243` and merged
as `6efd87b`; PR #14 passed and merged as `6e97bab`. Current-branch hosted
verification, deployment, and the missing reference video remain open.
Comparison and v1 release readiness are not claimed.

## Review corrections completed

- Collision-safe original/derivative image paths use per-asset directories;
  a regression proves distinct bytes survive deliberately similar IDs.
- Section reordering preserves heading hierarchy, including rich text and item
  titles; blank headings have a consistent accessible fallback.
- Simple mailto links reject query-like headers and percent escapes.
- Scene exit crossfades and offscreen cancellation have lifecycle/browser tests.
- Production static serving tests distinguish the exact Chromium no-JavaScript
  preload policy cancellation from missing files and other request errors.

The final run first exposed a stale journey assertion expecting the former
responsive filename. The assertion now verifies the new path and actual image
loading. Focused journey and complete gate both passed afterward.

## Next work and open release gates

Complete manual browser-zoom/assistive-technology and nontechnical usability
review, production performance review, hosted verification of subsequent changes,
and public deployment. Finish release review before calling v1 ready. Keep open
requirements visible in [acceptance](docs/experiment/acceptance.md) and
[limitations](docs/experiment/limitations.md).

The standalone remote is https://github.com/howlcipher/howlscene. No deployment
or release is established. Repository isolation remains intact. No comparison
outcome is claimed. The missing reference video remains recorded.

## Published development checkpoint

Commit `ce5a57c` is pushed to the standalone repository's `main` branch.
[Clean GitHub Actions verification](https://github.com/howlcipher/howlscene/actions/runs/40797818564)
failed on a Node 24 test-isolation assumption: Node now has Web Locks, so passing
`undefined` uses the real default manager instead of simulating absence. This was
reproduced locally under Node 24; the unsupported-browser test now explicitly
stubs navigator and a companion test covers default-manager discovery. The four
focused tests pass on Node 24. The complete Node 24.22.2 gate also passes:
114 unit tests, 32 browser tests, build, package consumers, coverage and licenses.
[Full Node 24 evidence](docs/evidence/node24_final_gate.txt). Production code is
unchanged; a fresh hosted CI run is needed for the test correction. GitHub reports Pages disabled. The initial Git push encountered
a stale global credential-helper path; a command-scoped helper override used
the installed GitHub CLI successfully without changing global configuration.

Terminal output in committed evidence has trailing whitespace normalized; the
underlying test results are preserved. The final source/test gate is unchanged.

## Deterministic visual and motion acceptance checkpoint

The second hosted run passed functional browser tests but failed seven visual
comparisons because system fonts differed. Chromium platform-font inspection
identified actual glyph sources; complete unchanged test-only fonts now pin all
three typography styles. Their licenses and hashes were independently reviewed.
Root and reviewer inspected actual/diff images before nine intentional fixture
baseline updates. Screenshot thresholds and production fonts are unchanged.
[Review evidence](docs/evidence/font_fixture_review.md).

New actual-browser acceptance tests cover rapid theme/anchor changes during
transitions and >10k-character sections at phone/tablet widths across all themes.
The complete Node 24.22.2 gate passes **114 unit and 34 browser tests**, including
normal screenshot comparisons and independent package consumption.
[Executed final output](docs/evidence/font_final_gate.txt). Hosted verification
of the font correction remains pending. General theme artwork/layer manifests
and section/layout extension contracts remain required v1 work; see limitations.

## Fractional capture origin correction

Hosted run `40800029407` passed all functional browser tests and all three desktop
screenshots but failed six mobile/tablet images. The visual fixture was below
editor controls whose host-font metrics put its origin on fractional pixels.
Controlled layouts measured document origins 3393.625 and 3167.875 pixels.
Preserving the live preview dimensions and capturing at fixed `(0, 0)` made the
two parent-font experiments pixel-identical. Only six reviewed mobile/tablet
baselines changed, removing the extra fractional-crop pixel; desktop baselines
and thresholds are unchanged. Normal comparisons and the complete local Node
24.22.2 gate pass: **114 unit tests, 34 browser tests**, SDKs and licenses.
[Executed output](docs/evidence/origin_final_gate.txt).

CI actions are updated to live-verified releases and pinned commit SHAs:
checkout v7.0.1, setup-node v7.1.0, upload-artifact v7.0.2. This addresses the
runner's Node 20 action deprecation warning. CI now preserves the explicitly
selected performance report alongside coverage/browser results. Hosted execution
of these updates remains pending.

The next implementation slice is the tested theme-layer registration contract
selected in [ADR 002](docs/architecture/adr_002_theme_layer_registry.md), retaining
shared rendering/export and safe imported references.

## Theme-layer increment and aggregate asset preflight

Hosted CI for `ce06f23` is green:
https://github.com/howlcipher/howlscene/actions/runs/40878831459.
The current branch `work/theme-layers` adds immutable validated artwork/layer
registries shared by preview and exporter, preserving all three bundled visuals.
Eleven focused tests pass, nine unchanged visual comparisons pass, and actual
packaged-consumer checks cover custom artwork and nested exported serving with
JavaScript enabled and disabled. RED evidence is in `docs/evidence/theme_layers*`
and the focused default/type compatibility logs. Full integration is pending.

The first integrated Node 24 gate passed formatting, lint and production build,
then reported 124 passing unit tests and one security fixture timeout (5,044 ms).
Independent isolated measurements passed all seven security tests, taking
3,062 ms with coverage and 2,710 ms without. Investigation identified a real
ordering weakness: aggregate-budget rejection follows every image decode.
A deterministic regression and bounded preflight are being implemented; the
existing timeout and resource limits remain unchanged. Raw investigation logs
are in `.artifacts/security-budget-investigation/`. No release readiness is claimed.
Repository isolation remains intact; comparison evaluation remains pending.

The asset-budget correction has genuine failing decoder-call regressions in
`docs/evidence/asset_budget_preflight_red.txt`. It now checks bounded metadata,
raw payload lengths, exact serialized size, then image contents. Twenty-five
affected tests, TypeScript, lint and formatting pass on Node 24. Invalid inputs
may report budget/metadata errors before image-format errors; valid input and
the exact 28,000,000-character limit are unchanged. The next full gate stopped
at formatting in newly updated journal/experiment prose; those files were
formatted before proceeding. Independent review additionally found an SDK-harness
cleanup path that skips server shutdown if browser shutdown rejects; a focused
regression and lifecycle fix are being added before final verification.

## Verified theme-layer checkpoint

The complete Node 24.22.2 gate now passes: **130 unit tests across 32 files,
34 browser tests, production builds, independently installed core/export
packages, custom-artwork nested ZIP serving with JavaScript on/off, formatting,
lint and license/provenance checks**. Branch coverage is 89.50% overall, 89.97%
core, 94.59% configuration and 97.72% exporter. The vulnerability scan reports
zero issues. See [executed output](docs/evidence/theme_layers_final_gate.txt),
[audit](docs/evidence/theme_layers_audit.txt) and the environment-scoped
[performance observation](docs/evidence/theme_layers_performance.json).

The earlier coverage gate reported configuration at 89.18%, below 90%; meaningful
stored-dimension mismatch and missing-responsive-width cases close that gap.
No threshold was reduced. Cleanup now closes the real test HTTP server even when
browser shutdown fails; independent review found no blocking defect in that fix
or the dimension cases. The cleanup RED was observed in agent tool output but
not preserved as a raw log; its evidence limitation is explicitly documented.

This increment completes the first ADR 002 layer contract, not the full v1 theme
system. Broader manifest presentation/defaults, external theme assets, general
section/layout registration, wider visual coverage, human usability/accessibility
review, production performance and deployment remain required. The next step is
reviewable branch publication and fresh hosted CI, followed by broader theme
metadata. Other repositories remain untouched and comparative evaluation pending.

## Hosted theme-layer verification and next increment

PR https://github.com/howlcipher/howlscene/pull/1 contains commits `a461e72`
and `a86c7d0`. Its clean hosted quality gate passed:
https://github.com/howlcipher/howlscene/actions/runs/40884610329.
It remains a reviewable, unmerged development increment. The next branch,
`work/theme-presentation`, starts from that verified source and will add bounded
presentation tokens consumed by the shared renderer/CSS. No production changes
for that next increment have been made yet. Architecture choices and acceptance
criteria must precede implementation; preserve existing bundled appearances.

## Verified bounded theme presentation increment

ADR 003 selects four bounded numeric settings consumed by shared CSS: body line
height, card gap, card radius and navigation gap. Defaults preserve the three
bundled themes; legacy and partial authoring inputs normalize immutable values.
No site schema or editor controls changed. Genuine unit/browser RED is preserved
in `docs/evidence/theme_presentation*_red.txt`. A real browser verifies computed
styles, unchanged content across theme switches, and the same presentation in an
extracted ZIP served under a nested path with JavaScript disabled. All nine
existing visual comparisons pass without baseline changes.

The complete local Node 24.22.2 gate passes **134 unit tests across 33 files and
35 browser tests**, formatting/lint/types, production builds, actual installed
package consumers, nested custom-theme export and 267-package license/provenance
inspection. Branch coverage: overall 89.50%, core 89.97%, configuration 94.59%,
exporter 97.72%. Fresh dependency audit: zero vulnerabilities. Executed evidence:
[full gate](docs/evidence/theme_presentation_final_gate.txt),
[audit](docs/evidence/theme_presentation_audit.txt),
[local performance](docs/evidence/theme_presentation_performance.json).
Independent review found no blocking defect. Maximum token combinations at narrow
widths and increased text zoom remain a verification gap; no blanket AA claim.

The bounded theme-presentation checkpoint was later merged after hosted CI run
`40887036736`. Its implementation details and original measurements remain
recorded here as historical evidence.
Then continue required theme responsive/accessibility/motion contracts and
external asset collection, followed by general section/layout registration.
Human usability/screen-reader review, broader exported visual coverage,
production performance and deployment remain open. This is not a v1 release.
Repository isolation and experiment evidence remain intact.

## Theme motion and parallax contract

Merged motion branch: `work/theme-motion-accessibility`, merge `7ce0f42`. The
current navigation branch is `work/theme-navigation-presentation`. Added optional immutable theme motion scalars and parallax preference.
Scalars are runtime-validated and bounded; theme intensity can reduce the user's
site setting, while combined speed is clamped. Themes that opt out of parallax do
not schedule layer movement; site motion-off, manual disable and reduced-motion
remain authoritative. These are public developer theme settings, not visual
editor controls.

TDD evidence: the five new `tests/theme_motion.test.tsx` cases failed before
implementation; the sanitized RED is retained in `docs/evidence/theme_motion_red.txt`.
The complete Node 24.22.2 `npm run check` passes with **139 unit tests across 34
files, 35 Playwright tests, 89.57% branch coverage overall**, production builds,
installed SDK consumer checks, and 267-package license/provenance review. A fresh
`npm audit --audit-level=moderate` reports zero vulnerabilities. Independent
review found no blocker and recommended explicitly emulating no-preference in the
presentation browser scenario; that change passes the focused test and full gate.
See `docs/evidence/theme_motion_final_gate.txt`,
`theme_motion_audit.txt`, and `theme_motion_performance.json`. Local performance is
one controlled observation, not a production or field guarantee.

The reference video remains unavailable. Human accessibility/usability review,
editor controls for theme accessibility, external theme-asset collection,
broader responsive/full manifest and section/layout contracts, deployment, and
release gates remain outstanding. Isolation is intact: no other track or
William Elias repository has been modified or consulted for implementation.
Independent comparison evidence continues in `docs/experiment/`.

## Theme navigation presentation

Implemented in `work/theme-navigation-presentation`: a bounded `navigationStyle`
presentation setting. Existing manifests default to plain; Ink Wash uses an
accent underline and Cyberpunk uses an accent frame. Shared CSS implements both
without theme-name conditionals. Contract tests reject arbitrary values;
Playwright verifies computed styles and wrapping at mobile, tablet, and desktop
widths. Six reviewed Ink/Cyber screenshot baselines changed intentionally; all
nine visual comparisons pass. TDD RED is preserved at
`docs/evidence/theme_navigation_red.txt`. The complete local gate now passes 140
unit tests and 36 browser tests; hosted run `40938230422` passed and merged
as `c1e33a1`.

## Theme-responsive navigation layout

Current branch: `work/theme-responsive-navigation`, based on main at `4691737`.
Added a closed `mobileNavigationLayout` field with `wrap` and `stack` choices.
Legacy themes default to wrap; Cyberpunk selects stack below the shared 600px
breakpoint. Anchors, focus, ordering and breakpoint remain common. THM-RESP-001
failed before implementation and its RED is preserved at
`docs/evidence/theme_responsive_red.txt`. Focused schema and browser tests pass;
the real editor test creates multiple section links and checks visibility and
overflow at 375, 768 and 1440 pixels. The full gate passes 142 unit and 38
browser tests with 89.57% branch coverage. Hosted verification is pending.

## Theme text contrast resolution

Current branch: `fix/theme-text-contrast`, based on main at `55070ad`. Added a
regression for a custom theme whose foreground contrast is below the WCAG 2.2
ordinary-text minimum. `resolveTheme` should pick the higher-contrast opaque black
or white foreground, warn, leave saved data unchanged, and flow the same result
through `Site` and static export. The first unit run reproduced the issue; RED is
preserved at `docs/evidence/theme_contrast_red.txt`. The complete local gate passes 143 unit and 38 browser tests; overall branch
coverage is 89.47%, and dependency audit reports zero vulnerabilities. Executed
logs are in `docs/evidence/theme_contrast_*`. Hosted verification is pending. This
checks flat color pairs only; artwork-overlay contrast and human WCAG review remain
open.

## Creator color controls

Current branch: `feat/editor-theme-colors`, based on main at `f792902`. The editor
now exposes background, text, and accent color inputs. Optional theme overrides
remain in the project across theme switching and draft reload. Resolver checks
foreground/background and accent against the chosen background, preserving saved
values while showing a readable fallback and warning. The TDD failure is retained
at `docs/evidence/editor_colors_red.txt`. Focused schema, preview/export, and real
browser tests pass. The complete Node 24.22.2 gate now passes: formatting, lint,
type checking, production builds/prerender, **145 unit tests across 34 files,
39 browser tests, independent SDK/export consumer checks,** and the 267-package
license/provenance audit. Branch coverage is 89.54% overall, 90.02% core,
94.59% configuration, and 97.72% exporter. `npm audit --audit-level=moderate`
reports zero vulnerabilities. Executed evidence is in
[`editor_colors_final_gate.txt`](docs/evidence/editor_colors_final_gate.txt),
[`editor_colors_audit.txt`](docs/evidence/editor_colors_audit.txt), and
[`editor_colors_performance.json`](docs/evidence/editor_colors_performance.json).
The local Chromium/Node sample reports a 68,879-byte runtime (21,330 gzip),
444.5 ms editor-ready time, 16.7 ms sampled frame p50/p95, and 72 ms for a
ten-section text-only export; it is one controlled local observation, not field
performance evidence. npm noted that the host npm 12 is unsupported by host
Node 22.22.1; the complete application gate ran with Node 24.22.2. Text over
artwork and human accessibility/usability review remain open. Isolation remains
intact and comparison evidence is maintained; no comparison result or release
readiness is claimed.

Color controls merged as `41618b6`; PR #8's hosted run `40943699920` passed.
Section image positioning merged as `35a53b0`; PR #9's hosted run `40945088628`
passed. Section spacing/alignment/width controls merged as `568c065` after hosted
run `40946421582` passed. Registered custom sections merged as `ba6125f` after
hosted run `40950249941` passed. Current work adds creator overrides for card,
navigation-link and phone-navigation presentation with bounded tokens. The unit
and browser contracts pass locally; the full gate and hosted run remain pending.
The original custom section work established registered section
types using the shared portable fields. The contract test had a genuine RED
because the schema rejected `customType`; evidence is in
`docs/evidence/custom_sections_red.txt`. Four unit contract tests and the
independently packed browser consumer now verify registration, safe IDs,
preview, backup, and nested static export. Full local Node 24.22.2 gate passes
149 unit and 41 browser tests; branch coverage is 89.43% overall, 89.82% core,
92.45% configuration, and 97.72% exporter. The 267-package audit passes and
`npm audit` reports zero vulnerabilities. Exact logs and local performance data
are in `docs/evidence/custom_sections_*`. PR #11 merged as `ba6125f` after hosted
run `40950249941` passed.
Repository isolation and independent comparison records remain intact; release
readiness is not claimed.

## Current milestone: creator theme presentation controls

Creators can now override the theme's shared card appearance, navigation link
style, and phone navigation layout using closed, validated options. Unset
choices continue to inherit each selected theme's defaults. The shared theme
resolver keeps preview and static export consistent, while saved choices survive
theme changes and draft reload. Unit and real-browser tests were written first;
their initial failures are preserved in `docs/evidence/editor_presentation_*_red.txt`.
Focused verification passes: 10 presentation unit tests and one browser test
covering a real project card, a theme switch, narrow navigation, reload, and
published ZIP content. The full Node 24.22.2 gate now passes 150 unit tests in 35
files and 42 browser tests. Overall branch coverage is 89.54%; core is 89.97%,
configuration 92.59%, and export 97.72%. The 267-package license audit and
separate zero-vulnerability npm audit passed. Full output and local performance
data are in `docs/evidence/editor_presentation_*`. PR #12 merged as `c82bd5b`
after hosted run `40952321979` passed; its first formatter check caught and
prompted formatting of the generated performance JSON. No deployment,
comparison result, or release readiness is claimed.

## Current milestone: image-rich exported visual acceptance

`EXP-VISUAL-001` now captures the actual exported ZIP with an original generated
landscape uploaded as background scenery and shown on three project cards, plus
eight paragraphs of long copy. It serves each export with JavaScript disabled
and pins the same licensed test-font fixtures used by the existing preview
baselines. Nine screenshots cover Modern, Ink Wash and Cyberpunk at 375, 768
and 1440 px. All nine have been visually reviewed. The first run's expected
missing-snapshot RED is in `docs/evidence/export_image_visual_red.txt`. The new
test and all nine existing theme snapshots pass together (10 browser tests);
the full Node 24.22.2 gate passes 150 unit tests and all 43 browser tests, with
89.54% overall branch coverage. SDK/export, 267-package license, and zero-issue
vulnerability audits pass; detailed logs and local measurements are in
`docs/evidence/export_image_visual_*`. The first PR #13 hosted run exposed an
environment-dependent system-font capture: the fixture's ordinary CSS rule
could not override the renderer's inline font token. Root-cause evidence is in
[`export_image_visual_font_red.txt`](docs/evidence/export_image_visual_font_red.txt).
The fixture now overrides the inline token and asserts both font weights load
and that the computed theme font is correct. All nine baselines were regenerated
under the pinned fonts and visually reviewed; the complete local gate passes.
PR #13 passed hosted run `40956127243` and merged as `6efd87b`. `tia` and the
referenced `documentation/TESTING.md` are unavailable in this repository or
environment, so test-impact pathways are mapped manually in
[`acceptance.md`](docs/experiment/acceptance.md).

## Current milestone: maximum theme presentation reflow

THM-PRES-005 covers maximum valid presentation tokens in
all three themes with long copy at 200% root text sizing and a 320 CSS-pixel
viewport. The first failure came from the test-only theme selector exceeding the
viewport; bounding that control leaves the rendered website within its tested
layout. The focused and integrated tests pass. Full results are in
[`theme_presentation_zoom_final_gate.txt`](docs/evidence/theme_presentation_zoom_final_gate.txt)
and [`theme_presentation_zoom_audit.txt`](docs/evidence/theme_presentation_zoom_audit.txt).
The integrated gate passes 150 unit tests and 44 browser tests with 89.54%
overall branch coverage. The 200% root-size test is a deterministic text-resize
stress case, not real browser zoom or human review.

## Current milestone: compatible section layout presets

EDT-012 exercises the editor's registry-derived layout choices with a real
uploaded image. The wide preview floats the image beside text for the split
preset; the phone-sized preview stacks it. The selected layout and image alt
text survive local draft reload and appear in the static website ZIP. The full
Node 24.22.2 gate passes 150 unit and 45 browser tests, with 89.54% overall
branch coverage; see [`section_layout_final_gate.txt`](docs/evidence/section_layout_final_gate.txt)
and [`section_layout_audit.txt`](docs/evidence/section_layout_audit.txt). No
new performance sample was taken for this test increment. Hosted verification
is pending.
