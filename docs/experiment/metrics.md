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
