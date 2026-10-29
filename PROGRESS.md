# HowlScene progress and resumption journal

## Current state

Track A is the conventional TypeScript/React implementation in this repository. Work is local and not released. Do not read or modify another experiment track, the original portfolio, or unrelated repositories. No public deployment is established. The reference video has not been supplied.

Phase 0 proved the shared editor-to-static-export approach. Core/schema, rich text, assets, storage, history, guided editor controls, backups, SDK packaging, and motion work have since been added. Integration and regression fixes are active. These source features do not establish complete v1 acceptance.

## Latest executed milestone

The final local continuation gate passed: formatting, lint, strict TypeScript,
production build and semantic prerendering, **113 unit tests in 30 files**, **32
browser tests**, independent core/export tarball consumption and the 267-package
license/provenance audit. The separate vulnerability audit reports zero issues.
Evidence: [complete gate](docs/evidence/continuation_final_gate.txt),
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

Complete broader image-rich/long-form export visual coverage, dedicated rapid
transition/theme-switch scenarios, manual zoom/assistive-technology and
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
