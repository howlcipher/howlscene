# Measurement record

These measurements are historical, scoped observations reported during implementation. They are not final-tree verification.

| Observation                           | Recorded value          | Scope and limitation                                                                         |
| ------------------------------------- | ----------------------- | -------------------------------------------------------------------------------------------- |
| Initial feasibility unit run          | 8 passing               | Phase 0 snapshot                                                                             |
| Initial feasibility browser run       | 2 passing               | Phase 0 export/editor snapshot                                                               |
| Later intermediate unit run           | 31 passing              | Before subsequent integration edits                                                          |
| Later intermediate browser run        | 4 passing               | Included contenteditable warning; not a clean release gate                                   |
| Standalone motion browser run         | 3 passing               | Motion subsystem snapshot                                                                    |
| Standalone motion runtime output      | 65.69 kB; 20.44 kB gzip | Reported bundler output units; not an editor bundle or all-site performance measurement      |
| External package consumption          | Passed separately       | Generated tarball, separate install, TypeScript and rendering; rerun after final integration |
| Core branch coverage                  | Not established         | Required thresholds remain unverified                                                        |
| Core Web Vitals and animation FPS     | Not measured            | No claim of meeting targets                                                                  |
| Manual accessibility/usability review | Not completed           | Automated tests cannot establish WCAG conformance                                            |

## Reproduce current checks

Use the commands defined in the current package scripts. The following direct commands support focused verification while integration scripts are being finalized:

```sh
npm ci
npx playwright install chromium
npm run format:check
npm run lint
npx tsc --noEmit
npm test -- --coverage
npm run build
npm run test:e2e
node scripts/sdk_check.mjs
node scripts/license_audit.mjs
npm audit --audit-level=moderate
```

The SDK check requires built package artifacts. Consult the current build configuration before running it. Running these commands is not itself evidence that they pass. Preserve their actual output with the relevant milestone.

[RED evidence](../evidence/) includes configuration/export, rich text, storage, motion, backup, upload, editor, SDK, and race-regression development failures. RED logs document the preimplementation failures; they do not prove GREEN or final regression results.

## Executed continuation snapshot

[Full command output](../evidence/continuation_gate_before_review.txt) records
108 passing unit tests, 31 passing browser tests, passing independent package
consumption and license review. Branch coverage was 88.46% overall, 89.18% core,
91.89% configuration and 93.18% exporter. This snapshot precedes review fixes;
it is not final-tree release evidence.

[Local performance observations](../evidence/local_performance.json) preserve
raw timing, browser/CPU/Node context and limitations. The generated runtime was
68,713 bytes / 21,297 bytes gzip using Node zlib. The fresh ten-section text-only
export took 65.2 ms. These measurements exclude images, use a development server,
and do not establish field Core Web Vitals, animation FPS or comparative results.
The probe now writes `.artifacts/performance.json` so later consumer browser
checks cannot clear its evidence.

## Final continuation gate

[Executed output](../evidence/continuation_final_gate.txt) records 113 passing
unit tests across 30 files and 32 passing browser tests, with no failures.
Formatting, lint, production build/prerendering, independent core/export package
installation and license/provenance checks passed. Final branch coverage:
overall 89.36%, core 89.82%, configuration 91.89%, exporter 97.72%.
The [vulnerability scan](../evidence/continuation_audit.txt) reports zero issues.

The final raw [performance report](../evidence/local_performance.json) supersedes
earlier single-run timing observations. Values naturally vary between runs;
compare its environment and limitations before drawing conclusions.

## Full production build observation

A complete `npm run build` (runtime, TypeScript, client build, SSR build and
semantic HTML insertion) on the local Linux x64 / Node 22.22.1 environment took
7.887 seconds of wall time using Bash `time`. See [raw elapsed output](../evidence/production_build_time.txt).
This is one uncontrolled warm local observation, including process startup;
filesystem cache and competing load were not controlled. It is not comparable
to another platform's isolated build benchmark.

## Node 24 compatibility correction

The first hosted CI run exposed a test that assumed the host lacked Web Locks.
[Actual Node 24 RED](../evidence/node24_lock_red.txt) reproduces the failure.
Explicit navigator stubs now test supported and unsupported environments.
[Full Node 24.22.2 gate](../evidence/node24_final_gate.txt) passes 114 unit tests
and 32 browser tests, plus all build, package and license checks. No production
behavior changed. Coverage percentages are unchanged.

## Deterministic visual acceptance snapshot

[Full Node 24.22.2 gate](../evidence/font_final_gate.txt) passes 114 unit tests
and 34 browser tests, including rapid transitions and long content. Unit coverage
is unchanged. Test-only font fixtures are documented with hashes/licenses and
[reviewed baseline rationale](../evidence/font_fixture_review.md). No screenshot
threshold was relaxed. This local result does not itself prove remote Ubuntu
rendering; the clean-runner result is tracked separately.

## Capture-origin correction

The [origin-corrected full gate](../evidence/origin_final_gate.txt) passes 114 unit
and 34 browser tests on local Node 24.22.2, with package consumers and licenses.
The preceding hosted run passed desktop snapshots but exposed fractional crop
origins below editor controls on mobile/tablet. The documented controlled
experiment and reviewed six-image update isolate theme captures from those
parent-font metrics; thresholds remain unchanged. Remote confirmation is still
required.

## Hosted baseline and current validation investigation

The clean Ubuntu GitHub Actions run for `ce06f23` passed:
https://github.com/howlcipher/howlscene/actions/runs/40878831459.
This confirms the deterministic font/capture-origin correction on the hosted
runner; it does not verify later source edits or constitute a live deployment.

On `work/theme-layers`, the first complete Node 24.22.2 check stopped after
124 unit passes and one existing combined-asset fixture timeout at 5,044 ms.
One isolated measurement each passed all seven security tests in 3,062 ms with
coverage and 2,710 ms without. The isolated coverage command's process exit was
nonzero because a single test file cannot satisfy whole-project thresholds;
no thresholds were changed. These are diagnostic observations under local load,
not benchmark claims. The investigation found image decoding precedes aggregate
budget rejection; a deterministic no-decode regression is being added.

## Theme-layer integrated snapshot

[Full executed Node 24.22.2 gate](../evidence/theme_layers_final_gate.txt):
130 unit tests, 34 browser tests, all configured builds/checks, independent
package consumption and 267-package license/provenance inspection pass.
Branches: overall 89.50%, core 89.97%, configuration 94.59%, exporter 97.72%.
[Fresh audit](../evidence/theme_layers_audit.txt): zero vulnerabilities.
[Raw local performance](../evidence/theme_layers_performance.json) records the
same loopback/dev-server methodology and its limitations. Runtime 68,713 bytes,
21,275 bytes gzip; ten-section text-only export 67.4 ms. These are single local
observations, not production or comparative performance claims.

## Bounded presentation integrated snapshot

[Executed gate](../evidence/theme_presentation_final_gate.txt): 134 unit and
35 browser tests pass on Node 24.22.2; build, strict types, formatting, lint,
installed package consumers and licenses pass. Branch coverage remains 89.50%
overall, 89.97% core, 94.59% configuration and 97.72% exporter.
[Audit](../evidence/theme_presentation_audit.txt): zero vulnerabilities.
[Raw local observation](../evidence/theme_presentation_performance.json):
68,713-byte runtime / 21,275 bytes gzip; text-only ten-section export 83.6 ms.
These values use the documented local development-server methodology, not a
production performance or comparative benchmark. Prior layer increment hosted
CI passed in runs `40884610329` (layers) and `40887036736` (presentation).

## Theme motion local integrated snapshot

`theme_motion_final_gate.txt` records the Node 24 `npm run check` run after the
theme-motion changes: 139 unit tests across 34 files, 35 browser tests,
89.57% overall branch coverage, formatting, lint, build,
external SDK consumer and 267-package license/provenance audit. The browser test
explicitly selects `prefers-reduced-motion: no-preference` before assertions and
then exercises the reduced-motion state. This is a local snapshot, not a
production performance claim.

The [theme-motion browser observation](../evidence/theme_motion_performance.json)
used Node 24.22.2, Chromium 156 headless on an AMD Ryzen 5 1600, 1440×1000,
loopback Vite server, and no network/CPU emulation. It observed 436.6 ms editor
ready, 294 ms navigation, 16.7 ms p50/p95 sampled frame intervals, 61.4 ms
ten-section text-only export, and a 68,879-byte runtime (21,330 gzip). It is a
single local observation, not a field Core Web Vitals or animation guarantee.
The [dependency audit](../evidence/theme_motion_audit.txt) found zero
vulnerabilities.

## Navigation presentation local integrated snapshot

[`theme_navigation_final_gate.txt`](../evidence/theme_navigation_final_gate.txt)
records 140 unit tests across 34 files, 36 browser tests, 89.57% overall branch
coverage, successful package-consumer checks, and all nine screenshot comparisons.
The [audit](../evidence/theme_navigation_audit.txt) found zero vulnerabilities.
The [performance observation](../evidence/theme_navigation_performance.json) is a
single local run on the documented Chromium/Node/CPU setup; it is not a field or
comparative claim.

## Theme card-style integrated snapshot

[`theme_card_final_gate.txt`](../evidence/theme_card_final_gate.txt) records
141 unit tests across 34 files, 37 browser tests, 89.57% overall branch
coverage, passing production builds, SDK consumers, visual comparisons, and
license/provenance checks. The [dependency audit](../evidence/theme_card_audit.txt)
found zero vulnerabilities.

The [raw performance observation](../evidence/theme_card_performance.json) was
recorded on Node 24.22.2 / Chromium 156 headless at 1440×1000, on a Ryzen 5 1600
with loopback Vite and no network/CPU emulation. Editor ready was 504 ms; sampled
frame p50/p95 was 16.7 ms; ten-section text-only export was 78.6 ms; runtime was
68,879 bytes (21,330 gzip). These are single-run lab observations, not production
Core Web Vitals, FPS guarantees, or comparative results.

## Responsive-navigation integrated snapshot

The [gate log](../evidence/theme_responsive_final_gate.txt) records 142 unit tests
across 34 files and 38 browser tests, with 89.57% overall branch coverage. The
[dependency audit](../evidence/theme_responsive_audit.txt) found zero
vulnerabilities. The [performance sample](../evidence/theme_responsive_performance.json)
was one Node 24.22.2 / Chromium 156 headless run on the Ryzen 5 1600 at 1440×1000,
using loopback Vite and no network/CPU emulation: editor ready 444 ms, sampled
frame p50/p95 16.7 ms, text-only export 69.4 ms, runtime 68,879 bytes / 21,330
gzip. This is not a field or comparative result.

## Theme text-contrast integrated snapshot

The [Node 24 gate](../evidence/theme_contrast_final_gate.txt) records 143 unit
tests across 34 files and 38 browser tests. Overall branch coverage is 89.47%;
core/config/export modules retain their separately reported coverage in the log.
The [dependency scan](../evidence/theme_contrast_audit.txt) found zero
vulnerabilities. The [performance record](../evidence/theme_contrast_performance.json)
was captured on Node 24.22.2, Chromium 156 headless, Ryzen 5 1600, 1440×1000,
loopback Vite, without network or CPU emulation. Editor ready was 407 ms; sampled
frame p50/p95 was 16.7 ms; text-only export 73.2 ms; runtime 68,879 bytes /
21,330 gzip. These are single-run lab observations, not production or comparative
claims.

## Creator color-controls integrated snapshot

The [executed Node 24.22.2 gate](../evidence/editor_colors_final_gate.txt)
passes formatting, lint, strict type-check/build/prerender, **145 unit tests
across 34 files, 39 browser tests, clean package consumers, and the 267-package
license/provenance audit**. Branch coverage is 89.54% overall, 90.02% core,
94.59% configuration, and 97.72% exporter. The separate
[dependency audit](../evidence/editor_colors_audit.txt) reports zero
vulnerabilities.

The [performance sample](../evidence/editor_colors_performance.json) is one
Node 24.22.2 / Chromium 156 headless run on a Ryzen 5 1600 at 1440×1000, using
loopback Vite and no network or CPU emulation: editor ready 444.5 ms; observed
navigation 294.1 ms; session-observed LCP 444 ms and CLS 0.000087; sampled frame
interval p50/p95 16.7 ms; ten-section text-only ZIP 72 ms; runtime 68,879 bytes
(21,330 gzip). Production site build reports its site runtime at 125.66 kB
(38.48 kB gzip); this is separate from the compact static-export runtime and
does not include the editor or shared JSX runtime. The test fixture excludes
images. These are controlled local observations, not field Core Web Vitals or
animation guarantees. Build time in this run was 466 ms for the production client
bundle, not a full clean CI build timing. npm audit used host npm 12 under Node
22.22.1 and returned zero vulnerabilities; the application gate itself used
Node 24.22.2.

## Section image position editor snapshot

The [Node 24.22.2 full gate](../evidence/image_position_final_gate.txt) passes
145 unit and 40 browser tests; branch coverage remains 89.54% overall, 90.02%
core, 94.59% configuration, and 97.72% exporter. Package-consumer and license
checks passed. A fresh `npm audit --audit-level=moderate` found zero
vulnerabilities.

The [controlled performance record](../evidence/image_position_performance.json)
used the same Ryzen 5 1600 / Chromium 156 headless / loopback-Vite environment at
1440×1000: editor ready 481.6 ms; session-observed LCP 476 ms and CLS 0.000087;
sampled frame p50/p95 16.7 ms; ten-section text-only ZIP 68 ms; runtime 68,879
bytes (21,330 gzip). Production site JS was 125.66 kB (38.48 kB gzip) in the
build log. Single-run local measurements do not establish production field
metrics or animation guarantees.

## Section layout controls snapshot

The full Node 24.22.2 gate passes 145 unit and 41 browser tests, with 95.07%
statement coverage and 89.54% branch coverage. Core branch coverage is 90.02%,
configuration 94.59%, and exporter 97.72%. Independent package consumers,
license/provenance inspection, and the fresh vulnerability audit passed. The
[gate](../evidence/layout_controls_final_gate.txt) and
[audit](../evidence/layout_controls_audit.txt) preserve output.

One local observation on Ryzen 5 1600 / Chromium 156 headless / loopback Vite at
1440×1000 measured 414 ms editor-ready, observed LCP 436 ms and CLS 0.000087,
frame interval p50 16.7 ms / p95 16.8 ms, and 76.8 ms for ten-section
text-only export. Runtime was 68,879 bytes / 21,330 gzip. These are lab
observations, not production or comparative guarantees; see the
[raw measurement](../evidence/layout_controls_performance.json).
