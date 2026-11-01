# Camera Journey Readiness Report

**Verdict: NOT READY FOR RELEASE**

PR #37 has been merged to `main` at `25ad8f9`. Its merge-triggered GitHub-hosted
Quality run passed, and a post-merge Pages artifact build passed without
publishing. A native scroll position determines a reversible camera and mist
handoff; finite scene-entry transitions remain separate. The camera-art
replacement lifecycle defect was reproduced and fixed, and actual ZIP
replacement scenery/cover assets and preview/export states are covered.
The feature remains **NOT READY FOR RELEASE**: memory sampling is short, some
lifecycle and keyboard cases remain partial, and physical-device,
assistive-technology, simulated human acceptance, and independent review are
outstanding.

## 1. Repository state

- Repository: `howlcipher/howlscene`
- Starting commit: `95cc4b9cc942f80c61a6e5cd514488644ecc6c3c`
- Ending implementation/test commit: `33aaeaf7b19e45b0649bf9c66db1f43e66056cc9`
- Merge commit: `25ad8f9e5db7b4872002226ded1955750eab0b9d`
- Branch: `work/camera-journey` (merged)
- Pull request: [#37, merged](https://github.com/howlcipher/howlscene/pull/37)

## 2. Baseline and architecture

At the starting commit, the Ink Wash example used the shared renderer and finite
`mist-reveal` entry transition. It no longer had the earlier sample-only,
scroll-scrubbed camera controller. The reference review and historical source
identify the missing choreography: copy departure, camera travel, mist-covered
handoff, incoming landscape reveal, then incoming copy.

The implementation adds a defaulted, validated `cameraJourney` option to the
existing site schema. It does not change the meaning of per-scene finite
transitions. Pure functions resolve normalized scroll progress into a
deterministic frame. A shared DOM controller applies that frame using native
scroll, one coalesced animation frame, temporary visual layers for only the
active scene pair, and owned lifecycle cleanup. The user’s semantic section
content stays in the document. Reduced motion and the manual motion toggle
preserve content while removing the camera effect.

The Ink Wash example opts into the shared journey and retains its own artwork
and content. The editor exposes an enable toggle, movement, intensity, depth,
and scroll distance. Export uses the existing renderer/runtime and ZIP path;
the SDK check builds an independent consumer. Architectural tradeoffs are
recorded in [ADR 0002](../architecture/adr/0002-scroll-scrubbed-camera-journey.md).

## 3. TDD and remote verification

Test-first evidence:

- Test-only commit `7feef8c` produced behavioral RED on hosted run
  [41166873671](https://github.com/howlcipher/howlscene/actions/runs/41166873671):
  the strict configuration rejected the absent Camera Journey contract and
  existing projects lacked its disabled default. The earlier type-checking
  failure at `9e780ca` is not counted as behavioral RED.
- Hosted run
  [41169436370](https://github.com/howlcipher/howlscene/actions/runs/41169436370)
  passed at `afa59d1`: formatting, lint, strict TypeScript, 38 Vitest files
  (181 tests), coverage thresholds, production build, 62 Playwright tests on
  one worker, SDK packaging/consumer check, license audit, and dependency
  audit.
- Core branch coverage was 89.71%, above the existing 85% threshold. The
  browser-only DOM controller is covered in Playwright and excluded from the
  Node-only Vitest coverage denominator; no coverage threshold was lowered.
- Hosted Pages artifact run
  [41169436138](https://github.com/howlcipher/howlscene/actions/runs/41169436138)
  passed production build, root/project path checks, and artifact packaging.
  Independent approvals and publication jobs were skipped. This was not a
  deployment.
- Final hardening run [41274716405](https://github.com/howlcipher/howlscene/actions/runs/41274716405)
  passed at `990589c`: formatting, lint, strict TypeScript, 181 Vitest tests,
  coverage thresholds, production build, 66 Playwright tests on one worker,
  SDK consumer check, license audit, and dependency audit. The hosted Pages
  artifact run [41274716412](https://github.com/howlcipher/howlscene/actions/runs/41274716412)
  passed root/project path checks and packaging; publish and approvals were
  skipped.
- Follow-up full run [41275074117](https://github.com/howlcipher/howlscene/actions/runs/41275074117)
  passed at `d5f05c9`: 38 Vitest files / 181 tests, all 66 Playwright tests,
  formatting, lint, strict TypeScript, coverage, build, SDK consumer, license,
  and dependency checks. This commit adds the uploaded replacement-scene image
  to the actual ZIP fixture and asserts that both scene and transition-cover
  assets exist in the archive. Pages artifact run [41275074147](https://github.com/howlcipher/howlscene/actions/runs/41275074147)
  also passed; publication and approvals were skipped.
- Latest full run [41276708527](https://github.com/howlcipher/howlscene/actions/runs/41276708527)
  passed at `33aaeaf`: 38 Vitest files / 181 tests, all 66 Playwright tests,
  formatting, lint, strict TypeScript, coverage, build, SDK consumer, license,
  and dependency checks. Pages artifact run [41276708530](https://github.com/howlcipher/howlscene/actions/runs/41276708530)
  also passed; publication and approvals were skipped.
- Supplemental hardening PR [#41](https://github.com/howlcipher/howlscene/pull/41)
  adds six normalized checkpoints in both scroll directions across all six
  intervals of a seven-scene preview, plus editor preview-stage disposal and
  reinitialization coverage. Hosted run
  [41326754359](https://github.com/howlcipher/howlscene/actions/runs/41326754359)
  passed at `66b6fe7`: 38 Vitest files / 181 tests, all 68 Playwright tests,
  format, lint, strict TypeScript, build, SDK, licensing, and dependency audit.
  Exact/extreme scene geometry and detached-node retention remain open.
- On the way to this passing run, [41274285564](https://github.com/howlcipher/howlscene/actions/runs/41274285564)
  ran 64/66 browser tests successfully but exposed stale cloned scenery after
  image replacement and smooth-scroll timing in the parity test. The controller
  now observes relevant source artwork mutations and rebuilds only the active
  pair; scroll comparison uses instant native scrolling. The follow-up pass is
  [41274716405](https://github.com/howlcipher/howlscene/actions/runs/41274716405).

Earlier failed runs and corrections are preserved in the
[engineering journal](../development/camera-journey-journal.md). The final
run regenerated performance observations with the GitHub-hosted runner
identified in the evidence.

## 4. Acceptance matrix

| ID     | Result  | Evidence / limit                                                                                                                                                           |
| ------ | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CJ-001 | Pass    | Editor exposes and enables Camera Journey.                                                                                                                                 |
| CJ-002 | Pass    | Pure progress/frame tests and browser scroll checkpoints.                                                                                                                  |
| CJ-003 | Pass    | Browser test waits 100 ms at an unchanged scroll position and asserts the camera transform remains unchanged.                                                              |
| CJ-004 | Pass    | Pure reverse-state test and reverse scroll checkpoint.                                                                                                                     |
| CJ-005 | Pass    | Outgoing copy is gone before the covered handoff.                                                                                                                          |
| CJ-006 | Pass    | Browser test observes camera transform during travel.                                                                                                                      |
| CJ-007 | Pass    | Mist cover opacity is asserted at the handoff checkpoint.                                                                                                                  |
| CJ-008 | Pass    | Incoming landscape is present before incoming copy.                                                                                                                        |
| CJ-009 | Partial | All six seven-scene intervals are sampled at six states in both directions; extreme geometry remains open.                                                                 |
| CJ-010 | Pass    | Five bounded forward/reverse jumps between distant scene pairs, motion toggles, and stage ownership checks pass.                                                           |
| CJ-011 | Pass    | Real editor preview exercises two and seven scenes, theme switches, and replacement scenery.                                                                               |
| CJ-012 | Pass    | Configuration round-trip through saved backup is covered.                                                                                                                  |
| CJ-013 | Pass    | Backup round-trip preserves settings.                                                                                                                                      |
| CJ-014 | Pass    | Theme changes preserve Camera Journey settings in configuration tests.                                                                                                     |
| CJ-015 | Pass    | Actual extracted ZIP preserves a resolved Camera Journey frame at root and nested paths; JS-off and reduced-motion paths are also covered.                                 |
| CJ-016 | Pass    | Root and nested export paths are browser-tested.                                                                                                                           |
| CJ-017 | Pass    | Exported essential headings are checked with JavaScript disabled.                                                                                                          |
| CJ-018 | Pass    | Reduced-motion browser checks preserve content and remove camera movement.                                                                                                 |
| CJ-019 | Pass    | Manual motion disable removes temporary journey artwork.                                                                                                                   |
| CJ-020 | Partial | Native anchors and hidden-link tab removal/restoration pass; full keyboard-only focus-order review remains.                                                                |
| CJ-021 | Partial | Phone-sized browser layout and screenshot pass; touch hardware is not tested.                                                                                              |
| CJ-022 | Partial | Five repeated navigation/toggle cycles, theme reinitialization, stage count, browser node and listener counts are covered; explicit detached-node snapshots remain absent. |
| CJ-023 | Pass    | Instrumented browser lifecycle run observed a maximum of one pending rAF and zero pending after idle.                                                                      |
| CJ-024 | Pass    | Runtime schema rejects invalid movement and numeric settings.                                                                                                              |
| CJ-025 | Pass    | Remote SDK package check builds and consumes the public contract.                                                                                                          |
| CJ-026 | Pass    | Existing finite transition coverage remains and the sample retains its finite preset values.                                                                               |
| CJ-027 | Pass    | Full existing editor/export/browser suite passed in the hosted run.                                                                                                        |
| CJ-028 | Partial | Current hosted stage captures were reviewed qualitatively; direct historical pixel-baseline comparison is not available.                                                   |
| CJ-029 | Pass    | Preview and extracted root/nested ZIP compare stage, cover opacity, and camera transform with bounded geometry tolerances.                                                 |
| CJ-030 | Pass    | Uploaded replacement scenery refreshes the active preview pair and the actual ZIP references and includes both custom scenery and transition-cover assets.                 |

Supplemental PR [#41](https://github.com/howlcipher/howlscene/pull/41) adds
seven-scene forward/reverse checkpoints across all six scene intervals and
verifies project replacement disposes the temporary journey stage before
reinitialization. The hosted run and remaining limits are recorded above.

## 5. Visual evidence and reference fidelity

The hosted Playwright artifact for run `41169436370` includes the established
scene, copy departure, camera travel, covered handoff, landscape reveal, copy
arrival, reverse scroll, and mobile screenshots. The screenshots were reviewed
from the artifact. They show a pinned illustrated stage, diagonal camera drift,
a high-opacity mist handoff, and delayed incoming copy. The sequence is
reversible and remains readable at phone width.

This is a visual-principle match, not a claim of pixel-perfect equivalence to
the reference. The implementation transitions between configured still-image
layers rather than generating continuous new landscape imagery. No new visual
baseline was accepted or committed. The original reference video remains
outside the repository.

## 6. Accessibility and security

The shared content remains semantic and is not duplicated for assistive
technology. Existing E2E checks cover reduced motion, manual motion disable,
anchor navigation, and a serious/critical axe scan of the sample. The mobile
fixture confirms visible copy with motion disabled and image alternative text.
These automated checks do not establish WCAG conformance. Screen-reader,
browser zoom, keyboard-only, and physical touch review remain human gates.

The existing strict configuration/security tests remain enabled and passed;
unsupported movement identifiers and out-of-range settings are rejected. The
hosted dependency audit and license check passed. No dedicated independent
security or licensing review was performed for this milestone.

## 7. Performance observations

The hosted artifacts for run `41169436370` report these single-run synthetic
observations:

- Desktop Chromium 156 on a GitHub-hosted `ubuntu-latest` AMD EPYC 9V45 runner,
  1440×1000, unthrottled: runtime 89,467 bytes (27,237 gzip), observed LCP
  276 ms, CLS 0.000089, 60 frame-interval samples with p95 16.8 ms, and one
  22.7 MB JS heap observation.
- Exported site on Chromium, 390×844, 4× CPU slowdown, 150 ms RTT and 200
  KiB/s downlink, nested static path on the same runner: runtime 89,467 bytes
  (27,237 gzip), observed LCP 524 ms, CLS 0, no observed long tasks, 60 frame-interval
  samples with p95 16.7 ms, and a 3.45 KiB selected responsive image.

These are GitHub-hosted runner measurements, not physical-device or field
results. The frame samples are not a frame-rate guarantee and were not a
long-duration Camera Journey stress test. The latest lifecycle attachment from
run `41276708527` measured after two warmup cycles and five navigation/toggle
cycles at 1440×900 on hosted Chromium. Event listeners remained at 186;
document nodes were 184 except for one sample at 188, then returned to 184.
Instrumented rAF peaked at one pending callback and returned to zero after idle.
Post-GC JS heap readings increased from 10,123,840 to 10,253,692 bytes
(+129,852 bytes, about 1.28%). Five cycles are too short to distinguish a stable
cache/measurement variation from a slow retained-growth trend; this neither
proves nor rules out a leak and does not count all GPU/image memory. Hidden-tab
browser memory, explicit detached-DOM inspection, physical-device, and
longer-duration profiling remain incomplete. The runtime size is under the
existing 256 KiB gzip budget.

## 8. Simulated and human acceptance

The existing automated browser journeys ran sequentially on one hosted worker.
The suite included editing, export, reduced motion, mobile layout, and the
Ink Wash scroll sequence. No separate beginner, storyteller, business-owner,
mobile-only, or independent SDK persona study was completed. Playwright
automation is not real user feedback.

No independent code reviewer was available in this run. Manual screen-reader,
real-device, browser-zoom, physical mobile performance, and human visual
acceptance remain outstanding.

## 9. Host safety and deployment

- No local package installation, build, compilation, test, browser automation,
  container, stress, or performance workload was run.
- Local work was limited to source/document editing, targeted Git inspection,
  `git diff --check`, bounded Prettier formatting of changed text files, and
  reading hosted logs/artifacts.
- No unexpected local background process was started, no local subagent was
  launched, and no known safety rule was violated.
- All substantial verification cited here ran on GitHub-hosted `ubuntu-latest`
  runners with a 20-minute job timeout; Playwright and Vitest were capped at one
  worker. No self-hosted runner or local delegation was used.
- Post-merge Pages run [41318348721](https://github.com/howlcipher/howlscene/actions/runs/41318348721)
  prepared and verified the artifact only. Approval and publication were
  skipped. There is no deployed URL to report.
- At the user's later direction, workflow run [41320649182](https://github.com/howlcipher/howlscene/actions/runs/41320649182)
  deployed `main` SHA `f7633f9f351b62991e14f5faf4484b9650f6a0f5` to
  [GitHub Pages](https://howlcipher.github.io/howlscene/). The build, root and
  project path checks, artifact upload, and deploy job passed. The two named
  approval jobs ran without human review because their environments had no
  protection rules. A bounded live GET returned HTTP 200 and the expected
  HowlScene title; this is a basic availability check, not full human
  acceptance. The publish variable was reset to `false` after this one-time
  deployment.
- No host-side testing was requested; the mission’s host-safety rules prohibit
  it.

## 10. Remaining blockers and verdict

Before calling the feature release-ready, add direct detached-node assertions
or document an accepted manual review, and extend/interpret the short
heap-growth sample. Remaining human review includes
screen reader, browser zoom, keyboard-only use, physical touch/mobile, and real
nontechnical user acceptance. No independent code review has been requested or
received; no review requests are currently attached to the PR.

**NOT READY FOR RELEASE.** The merge-triggered Quality run
[41318025128](https://github.com/howlcipher/howlscene/actions/runs/41318025128)
and post-merge Pages artifact run [41318348721](https://github.com/howlcipher/howlscene/actions/runs/41318348721)
passed. Direct detached-node tests, longer retained-memory profiling, human
acceptance, and independent review remain incomplete. PR #37 was merged at the
user's direction; that merge does not establish release readiness. The preview
is deployed, but the named approval environments had no human reviewer
protection during deployment. The publish flag is now false. Configure distinct
eligible reviewers before any future publish, and complete the remaining
release gates. The current deployment does not change this report's NOT READY
verdict.
