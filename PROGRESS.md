# HowlScene progress and resumption journal

## Current state

Track A is the conventional TypeScript/React implementation in this repository. Work is local and not released. Do not read or modify another experiment track, the original portfolio, or unrelated repositories. No public deployment is established. The reference video has not been supplied.

Phase 0 proved the shared editor-to-static-export approach. Core/schema, rich text, assets, storage, history, guided editor controls, backups, SDK packaging, and motion work have since been added. Integration and regression fixes are active. These source features do not establish complete v1 acceptance.

## Latest executed milestone

The final local continuation gate passed: formatting, lint, strict TypeScript,
production build and semantic prerendering, **114 unit tests in 30 files**, **34
browser tests**, independent core/export tarball consumption and the 267-package
license/provenance audit. The separate vulnerability audit reports zero issues.
Evidence: [complete gate](docs/evidence/font_final_gate.txt),
[audit](docs/evidence/continuation_audit.txt), and
[local performance observations](docs/evidence/local_performance.json).

Branch coverage: overall 89.36%, core 89.82%, configuration 91.89%, export package
97.72%. All configured coverage gates passed. These results cover the current
source and test tree. Later documentation changes are checked separately.

The complete browser journey creates, edits, restores, backs up, exports and
serves a portfolio with responsive uploaded images. Export tests serve root and
nested paths with JavaScript enabled and disabled. Actual production files also
work at root and `/howlscene/`. Nine existing visual comparisons passed. Automated
accessibility and keyboard workflows passed within their asserted scope; human
usability and screen-reader review remain open.

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

Complete broader image-rich/long-form export visual coverage, manual zoom/assistive-technology and
nontechnical usability review, production performance review, hosted CI and
public deployment. Finish release review before calling v1 ready. Keep open
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
