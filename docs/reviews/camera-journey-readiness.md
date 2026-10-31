# Camera Journey Readiness Report

**Verdict: NOT READY**

The shared Camera Journey implementation is present on draft PR #37 and passes
the current GitHub-hosted automated gates at commit `7bda077`. A native scroll
position determines a reversible camera and mist handoff; the original finite
scene-entry transitions remain separate. This milestone is not release-ready:
journey-specific stress and leak measurements, physical-device and assistive
technology review, simulated human acceptance, an independent review, and
several acceptance cases remain incomplete.

## 1. Repository state

- Repository: `howlcipher/howlscene`
- Starting commit: `95cc4b9cc942f80c61a6e5cd514488644ecc6c3c`
- Latest behaviorally verified commit: `7bda07722f8c7e5c56c108a02495ea84b8f37e7e`
- Branch: `work/camera-journey`
- Pull request: [#37, draft](https://github.com/howlcipher/howlscene/pull/37)
- No merge, publish, or deployment occurred.

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
  [41169005027](https://github.com/howlcipher/howlscene/actions/runs/41169005027)
  passed at `7bda077`: formatting, lint, strict TypeScript, 38 Vitest files
  (181 tests), coverage thresholds, production build, 62 Playwright tests on
  one worker, SDK packaging/consumer check, license audit, and dependency
  audit.
- Core branch coverage was 89.71%, above the existing 85% threshold. The
  browser-only DOM controller is covered in Playwright and excluded from the
  Node-only Vitest coverage denominator; no coverage threshold was lowered.
- Hosted Pages artifact run
  [41169005224](https://github.com/howlcipher/howlscene/actions/runs/41169005224)
  passed production build, root/project path checks, and artifact packaging.
  Independent approvals and publication jobs were skipped. This was not a
  deployment.

Earlier failed runs and corrections are preserved in the
[engineering journal](../development/camera-journey-journal.md). The latest
performance test-source edit changes evidence wording to identify the
GitHub-hosted runner; its next run is pending and is not included in the
`7bda077` verification above.

## 4. Acceptance matrix

| ID     | Result  | Evidence / limit                                                                                                           |
| ------ | ------- | -------------------------------------------------------------------------------------------------------------------------- |
| CJ-001 | Pass    | Editor exposes and enables Camera Journey.                                                                                 |
| CJ-002 | Pass    | Pure progress/frame tests and browser scroll checkpoints.                                                                  |
| CJ-003 | Partial | Deterministic resolver freezes for a position; browser idle-state assertion is indirect.                                   |
| CJ-004 | Pass    | Pure reverse-state test and reverse scroll checkpoint.                                                                     |
| CJ-005 | Pass    | Outgoing copy is gone before the covered handoff.                                                                          |
| CJ-006 | Pass    | Browser test observes camera transform during travel.                                                                      |
| CJ-007 | Pass    | Mist cover opacity is asserted at the handoff checkpoint.                                                                  |
| CJ-008 | Pass    | Incoming landscape is present before incoming copy.                                                                        |
| CJ-009 | Partial | Scene-count and progress boundaries have unit coverage; all boundary geometries are not browser-tested.                    |
| CJ-010 | Partial | Anchor navigation and reversing mid-transition are tested; rapid multi-scene stress is not.                                |
| CJ-011 | Partial | One, two, five, and seven scenes validate in configuration tests; browser rendering is five-scene only.                    |
| CJ-012 | Pass    | Configuration round-trip through saved backup is covered.                                                                  |
| CJ-013 | Pass    | Backup round-trip preserves settings.                                                                                      |
| CJ-014 | Pass    | Theme changes preserve Camera Journey settings in configuration tests.                                                     |
| CJ-015 | Partial | Exported ZIP retains Camera Journey configuration and runtime; exhaustive scroll equivalence is not asserted.              |
| CJ-016 | Pass    | Root and nested export paths are browser-tested.                                                                           |
| CJ-017 | Pass    | Exported essential headings are checked with JavaScript disabled.                                                          |
| CJ-018 | Pass    | Reduced-motion browser checks preserve content and remove camera movement.                                                 |
| CJ-019 | Pass    | Manual motion disable removes temporary journey artwork.                                                                   |
| CJ-020 | Partial | Native scene-anchor navigation works; full keyboard-only audit remains.                                                    |
| CJ-021 | Partial | Phone-sized browser layout and screenshot pass; touch hardware is not tested.                                              |
| CJ-022 | Partial | Manual disable removes the active stage; repeated mount/unmount leak measurement is absent.                                |
| CJ-023 | Partial | Controller schedules at most one pending frame by implementation; no long-run instrumentation was performed.               |
| CJ-024 | Pass    | Runtime schema rejects invalid movement and numeric settings.                                                              |
| CJ-025 | Pass    | Remote SDK package check builds and consumes the public contract.                                                          |
| CJ-026 | Pass    | Existing finite transition coverage remains and the sample retains its finite preset values.                               |
| CJ-027 | Pass    | Full existing editor/export/browser suite passed in the hosted run.                                                        |
| CJ-028 | Partial | Five-scene sample choreography passed browser checks; image comparison is qualitative, not pixel-baseline equivalence.     |
| CJ-029 | Partial | Shared configuration drives preview and export; a complete resolved-frame parity assertion is absent.                      |
| CJ-030 | Partial | ZIP includes configured cover artwork and asset checks pass; arbitrary replacement-artwork journey is not fully exercised. |

## 5. Visual evidence and reference fidelity

The hosted Playwright artifact for run `41169005027` includes the established
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

The hosted artifacts for run `41169005027` report these single-run synthetic
observations:

- Desktop Chromium on `ubuntu-latest`, 1440×1000, unthrottled: runtime 89,467
  bytes (27,237 gzip), observed LCP 304 ms, CLS 0.000089, 60 frame-interval
  samples with p95 16.8 ms, and one 22.7 MB JS heap observation.
- Exported site on Chromium, 390×844, 4× CPU slowdown, 150 ms RTT and 200
  KiB/s downlink, nested static path: runtime 89,467 bytes (27,237 gzip),
  observed LCP 548 ms, CLS 0, no observed long tasks, 60 frame-interval
  samples with p95 16.7 ms, and a 3.45 KiB selected responsive image.

These are GitHub-hosted runner measurements, not physical-device or field
results. The frame samples are not a frame-rate guarantee and were not a
long-duration Camera Journey stress test. The desktop heap is one observation,
not a retained-memory comparison. Seven-scene, large-artwork, repeated-theme,
hidden-tab, animation-instance, listener, and leak-growth profiling remain
unverified. The runtime size is under the existing 256 KiB gzip budget.

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
- The Pages workflow prepared and verified an artifact only. Approval and
  publication were skipped. There is no deployed URL to report.
- No host-side testing was requested; the mission’s host-safety rules prohibit
  it.

## 10. Remaining blockers and verdict

Before human acceptance, add or run the missing journey stress/lifecycle tests,
verify scroll-frame parity for exported sites, exercise two- and seven-scene
browser stories, review large artwork and repeated navigation, and capture
journey-specific performance/resource data. Human review must include screen
reader, zoom, keyboard, touch, and physical mobile checks. An independent code
review and real nontechnical user feedback are also outstanding.

**NOT READY.** Automated gates pass at `7bda077`, but required implementation-
critical performance and lifecycle cases and human acceptance have not been
verified. Keep PR #37 in draft. Do not merge or deploy from this report.
