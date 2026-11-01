# Camera Journey Engineering Journal

## Repository state

- Repository: `howlcipher/howlscene`
- Branch: `work/camera-journey`
- Starting commit: `95cc4b9cc942f80c61a6e5cd514488644ecc6c3c`
- Latest fully verified implementation/test commit: `33aaeaf7b19e45b0649bf9c66db1f43e66056cc9`.
- Current code/test branch head: `33aaeaf7b19e45b0649bf9c66db1f43e66056cc9`; the current acceptance-matrix and performance-evidence update is being committed separately.
- Active phase: G, final evidence review and remaining acceptance gaps.

## Audit and architecture

- Existing shared config supports cinematic sections and finite transitions; `mist-reveal` is a finite entry effect and must keep that meaning.
- Existing `enhanceSite` owns IntersectionObserver entry effects and one coalesced frame for theme parallax. No scroll-scrubbed timeline exists on current main.
- `Site` emits semantic sections, decorative background images, and cover images. The exporter serializes the same renderer and runtime.
- The editor already supports the Cinematic Story starter and per-scene cover artwork. Appearance controls are the common place for global motion settings.
- Historical PR #33 (`eb49835`) contains the previous sample-only scroll camera; PR #35 migrated the sample to shared finite effects. Existing reference review describes the intended camera choreography, but current source contradicts that report.
- Chosen direction: validated opt-in site configuration, deterministic pure progress/frame functions, then a shared DOM controller using native scroll and a single scheduled frame. CSS-only animation was rejected because wall-clock progress obscures reversible state; a canvas/3D renderer was rejected due to cost and duplication.

## TDD and remote verification

- Added `tests/camera_journey.test.ts` first and committed it as `9e780ca`; a follow-up `7feef8c` removed type-only coupling to the not-yet-added contract.
- Draft PR: https://github.com/howlcipher/howlscene/pull/37
- The first hosted run, [41166613508](https://github.com/howlcipher/howlscene/actions/runs/41166613508), stopped at TypeScript checking because the test accessed a field not in the old inferred type. This was not accepted as behavioral RED.
- Corrected test-only hosted run, [41166873671](https://github.com/howlcipher/howlscene/actions/runs/41166873671), passed format, lint, and TypeScript, then failed the new behavioral assertions: strict config rejected `cameraJourney`, and legacy parsing did not produce the expected disabled default. This is valid RED evidence for the configuration contract. Build and browser steps were skipped after the expected unit-test failure.
- Implementation checkpoint `3bf22edcf4c96c172ecaf1a3e7243df7f58c8746` is pushed. Quality run [41167599975](https://github.com/howlcipher/howlscene/actions/runs/41167599975) stopped at format checking; it did not run lint, type, unit, build, browser, SDK, or audit steps. The Pages artifact check [41167599997](https://github.com/howlcipher/howlscene/actions/runs/41167599997) passed production build, root/project path checks, and artifact packaging. Its publish and approval jobs were skipped; no deployment occurred.
- Hosted formatting output identified seven changed files. A bounded local Prettier command formatted only the changed source/docs/test files; no tests or build were run locally.
- Follow-up source changes add validated `parallaxDepth` using only active theme scenery layers, with editor and SDK coverage. This is not yet committed or remotely verified.
- On `1d3c9a0`, hosted Quality run [41167824656](https://github.com/howlcipher/howlscene/actions/runs/41167824656) passed format, lint, and TypeScript, then failed before Vitest started because Vitest 5.0.5 rejects the unsupported `--minWorkers` CLI option. Runtime bundle generation in `pretest` succeeded; unit tests and all later Quality steps were skipped. This is a CI command failure, not a behavioral test result.
- The same commit's Pages artifact run [41167824759](https://github.com/howlcipher/howlscene/actions/runs/41167824759) passed the production build, root/project path checks, and artifact packaging. Approval and publishing jobs were skipped; no deployment occurred.
- Corrected `.github/workflows/ci.yml` to retain `--maxWorkers=1` without the unsupported `--minWorkers` argument, and updated section sizing to emit a concrete viewport unit. Both changes are included in `4002a82`.
- Commit `4002a82` is pushed. Hosted run [41168000228](https://github.com/howlcipher/howlscene/actions/runs/41168000228) passed format, lint, TypeScript, and all 181 unit tests, then failed the existing core branch threshold (78.68% versus 85%). Browser/build/SDK/audit steps did not run. The new DOM controller is not covered by Node unit tests; it is covered by Playwright acceptance, so the Vitest coverage boundary now explicitly excludes that browser-only module without changing any thresholds. This adjustment is unverified until another hosted run.
- Pages artifact run [41168000225](https://github.com/howlcipher/howlscene/actions/runs/41168000225) passed production build, root/project path checks, and artifact packaging. Approval and publish jobs were skipped; no deployment occurred.
- Commit `cb780d9` passed format, lint, TypeScript, unit tests/coverage, and production build remotely, but Playwright run [41168189199](https://github.com/howlcipher/howlscene/actions/runs/41168189199) had 59 passed and 3 failed. Two editor tests timed out because the Camera Journey enable control was hidden inside collapsed details; a dialog-handler adjustment alone did not fix them. The scroll choreography test reached its copy departure state but an exact CSS string assertion was sensitive to fractional scroll geometry (`0.498324` versus `0.5`); it was changed to a two-decimal numeric tolerance, but the handoff checkpoint still crossed the midpoint due to browser scroll rounding. No SDK, license, or audit steps ran after the E2E failures.
- Commit `7a83671` repeated the same three browser failures. Error contexts showed the editor's Cinematic movement details were collapsed while Camera Journey was disabled, hiding the enable control. Commit `7bda077` keeps the group open so the toggle is available; advanced controls still appear only after enabling it. The browser checkpoint targets 0.49 normalized progress and checks cover opacity above 0.98 to avoid crossing the midpoint due to scroll pixel rounding. These corrections passed in run [41169005027](https://github.com/howlcipher/howlscene/actions/runs/41169005027).
- Commit `7bda077` passed full Quality run [41169005027](https://github.com/howlcipher/howlscene/actions/runs/41169005027): format, lint, strict type-check, 38 Vitest files/181 tests, coverage (core branch 89.71% against 85%), production build, 62 Playwright tests on one worker, SDK check, license audit, and `npm audit --audit-level=moderate`. Pages artifact run [41169005224](https://github.com/howlcipher/howlscene/actions/runs/41169005224) passed build and root/project path checks; publish and approval stages were skipped.
- Reviewed the hosted screenshot artifact: established scene, copy departure, camera travel, mist-covered handoff, landscape reveal, copy arrival, reverse, and mobile. They demonstrate the intended choreography; no pixel baseline comparison was performed.
- Performance artifact for the hosted runner reports desktop Chromium 1440×1000: 27,237 gzip runtime bytes, observed LCP 304 ms, CLS 0.000089, 60 frame samples/p95 16.8 ms, one 22.7 MB heap observation. Mobile static export at 390×844 used 4× CPU slowdown, 150 ms RTT, 200 KiB/s down: observed LCP 548 ms, CLS 0, no long tasks, frame sample p95 16.7 ms, 3.45 KiB responsive image transfer. These are single runner observations, not Journey stress/leak measurements or physical-device results.
- Commit `afa59d1` passed full Quality run [41169436370](https://github.com/howlcipher/howlscene/actions/runs/41169436370), including 181 Vitest tests, 62 Playwright tests, coverage, build, SDK, license, and dependency gates. Pages artifact run [41169436138](https://github.com/howlcipher/howlscene/actions/runs/41169436138) passed root/project path checks; publish and approval stages were skipped.
- Final performance artifacts identify GitHub-hosted runner execution. Desktop Chromium 156 on AMD EPYC 9V45, 1440×1000: 27,237 gzip runtime, 276 ms observed LCP, 0.000089 CLS, 60 frame intervals at p95 16.8 ms, one 22.67 MB heap reading. Mobile export at 390×844 with 4× CPU slowdown, 150 ms RTT and 200 KiB/s downlink: 524 ms LCP, CLS 0, zero observed long tasks, 60 frame intervals at p95 16.7 ms, 3.45 KiB responsive image. Single synthetic measurements do not establish physical-device behavior or leak safety.
- Workflow inspected: `.github/workflows/ci.yml` uses `ubuntu-latest`, timeout 20 minutes, no deployment, and sequential steps. `playwright.config.ts` sets one worker. Vitest is explicitly capped to one maximum worker.
- Hosted CI must be used for all tests/builds; local execution is prohibited.

## Safety

- No local heavy workload executed. No local package installation, compilation, build, test, browser, container, or performance command was run. One bounded Prettier formatting command was run against changed text files only.
- No local subagents or background processes started.
- No safety rule violated.
- Hosted CI availability: full Quality and Pages artifact workflows passed for `afa59d1`. No self-hosted runner or deployment was used.

## Next actions

1. Commit and push the final run IDs and measurements into the journal.
2. Add journey-specific lifecycle, rapid navigation, seven-scene, large-artwork, and memory-growth evidence.
3. Arrange manual screen-reader, zoom, keyboard, touch, physical-device, and real-user acceptance; no such review has been performed.
4. Request an independent code review if available.
5. Keep PR draft; do not merge or deploy.

## Final hardening checkpoint — 2026-11-01

### Repository state

- Branch: `work/camera-journey`.
- Current head: `d5f05c9e05d71e150fcda888c1da3d6793ea7e70`.
- Latest fully verified source commit: `990589cc759f4217baf3a9e72c5896532dd0b9b5`.
- Working tree contains documentation updates for this checkpoint; no unrelated edits were present.
- PR #37 remains open and draft: https://github.com/howlcipher/howlscene/pull/37.

### Completed changes and decisions

- Added browser coverage for keyboard focusability of visually hidden scene links; content stays in reading order while hidden links are removed from tab order and restored when visible.
- Added bounded repeated motion-toggle and navigation lifecycle checks. Five measured navigation/toggle cycles follow two warmups; each asserts one temporary stage, stable browser-wide listener/node counters, and no page errors.
- Added actual editor preview coverage for two and seven scenes, theme switching, uploaded scenery, and active Camera Journey artwork.
- Reproduced stale temporary camera artwork after a scenery replacement in hosted E2E. `990589c` adds a focused MutationObserver for scene artwork, cover art, and parallax-layer changes; it invalidates the active pair and disconnects on controller stop. The valid behavioral RED was observed at hosted run `41274285564`, followed by GREEN at `41274716405`.
- Expanded actual extracted-ZIP parity to active camera frames on root and nested paths, reduced motion, and JavaScript-disabled content. The test uses instant native scroll to avoid sampling a smooth scroll in flight.
- Added custom scenery upload and ZIP asset-path checks in `d5f05c9`; both hosted workflows passed as recorded below.

### Remote verification evidence

- [Quality run 41274716405](https://github.com/howlcipher/howlscene/actions/runs/41274716405), tested `990589c`: formatting, lint, strict TypeScript, 38 Vitest files / 181 tests, existing coverage thresholds, production build, 66 Playwright tests on one worker, SDK consumer, license audit, and dependency audit all passed.
- [Pages artifact run 41274716412](https://github.com/howlcipher/howlscene/actions/runs/41274716412), tested `990589c`: production build, root/project path checks, and artifact packaging passed. Approval/publish stages were skipped; no deployment occurred.
- [Quality run 41275074117](https://github.com/howlcipher/howlscene/actions/runs/41275074117) and [Pages artifact run 41275074147](https://github.com/howlcipher/howlscene/actions/runs/41275074147) passed for `d5f05c9`.
- Failed historical run [41273963924](https://github.com/howlcipher/howlscene/actions/runs/41273963924) completed 64/66 browser tests; it exposed an ambiguous upload locator and cover-opacity tolerance sensitive to scroll timing. Follow-up [41274285564](https://github.com/howlcipher/howlscene/actions/runs/41274285564) completed 64/66 and exposed the genuine stale scenery clone after artwork replacement plus remaining smooth-scroll timing variance. The mutation-observer fix and instant test scroll passed in `41274716405`; no existing test was skipped or weakened.
- Root/nested ZIP frame parity passed in the 990589c full run with tolerances of 3 CSS px for translation, 0.01 px for Z, 0.002 for scale, and 0.02 cover opacity. The cover tolerance accounts for native scroll pixel quantization after the test now forces instant scroll.

### Lifecycle and memory observations

- Evidence attachment: hosted artifact `camera-journey-lifecycle.json` from run `41274716405`.
- GitHub-hosted Chromium, 1440×900. After two warmup cycles, browser-wide event listener count was 186 and document node count 184 in the warmup and all five measured cycles.
- Post-GC JS heap samples rose from 10,118,080 to 10,250,632 bytes over five cycles (+132,552 bytes, approximately 1.31%). This short sequence is not sufficient to prove or rule out a leak. Browser-wide node/listener counters do not detect every detached object, and these samples exclude some GPU/image memory.
- A longer retained-memory profile, hidden-tab scenario, and explicit detached-node audit remain unverified. No memory threshold was invented from the small sample.

### Visual and acceptance review

- Reviewed current hosted screenshots at established, copy departure, camera travel, covered handoff, landscape reveal, copy arrival, reverse, and mobile checkpoints. These are stored as CI artifacts, not committed as new baselines.
- The captures show the intended mist-covered camera-led handoff. No pixel-perfect comparison to the external reference clip is claimed.
- Acceptance matrix is updated in `docs/reviews/camera-journey-readiness.md` and `docs/experiment/acceptance.md`. CJ-003, CJ-010, CJ-011, CJ-015, CJ-029, and CJ-030 now have direct automated coverage; CJ-009, CJ-020, CJ-021, CJ-022, CJ-023, and CJ-028 retain documented limits and/or human review.
- No independent review is attached to PR #37; no review requests are currently present.

### Safety and handoff

- No prohibited local workload ran. Only source/docs inspection and edits, bounded Prettier, Git operations, and reading hosted logs/artifacts occurred.
- No local browser, build, test, package installation, container workload, background process, or local subagent was started. No safety rule was violated.
- CI workflows use GitHub-hosted `ubuntu-latest`, bounded job timeouts, and one worker; Pages approval/publish remained skipped.
- This checkpoint's next exact actions were to observe `41275074117` and `41275074147`; the completion section below records their results. The PR description was subsequently updated; preserve the draft and do not merge or deploy.

## Verification completion — 2026-11-01

- The formerly pending [Quality run 41275074117](https://github.com/howlcipher/howlscene/actions/runs/41275074117) completed successfully on `d5f05c9`: 38 Vitest files / 181 tests and 66 Playwright tests passed, along with formatting, lint, strict type-check, coverage, production build, SDK consumer, license, and dependency-audit steps.
- The formerly pending [Pages artifact run 41275074147](https://github.com/howlcipher/howlscene/actions/runs/41275074147) completed successfully on `d5f05c9`: production artifact, root/project path checks, and packaging passed. Approval and publish jobs were skipped.
- The actual ZIP fixture now contains uploaded scene scenery and transition-cover artwork; the test asserts both asset references resolve in the archive. Preview and extracted ZIP camera state comparisons pass at root and nested hosting, with JavaScript enabled/disabled and reduced-motion cases retained.
- CI confirms the artwork mutation observer and associated test fix pass in the full regression suite. No full screenshot diff against a pixel-locked historical baseline was produced.
- Current acceptance/readiness docs now report the final CI evidence and retain partial status for exhaustive scene-boundary geometry, comprehensive keyboard-only review, physical touch, direct pending-rAF instrumentation, detached-node auditing, and long-duration memory profiling. The post-GC heap rose 132,552 bytes (~1.31%) across five measured cycles after two warmups while listener/node counts stayed constant; no leak conclusion is inferred from this short sample.
- PR #37 is still open/draft. Its description has been updated to replace the early implementation checkpoint. No merge or deployment occurred.
- Next exact actions: commit and push this documentation checkpoint, inspect its documentation-triggered remote results and final PR check state, then leave the draft for independent and human acceptance. Do not merge or deploy.

## Documentation verification follow-up — 2026-11-01

- Documentation commit `b18cb8d` triggered Quality run [41275482638](https://github.com/howlcipher/howlscene/actions/runs/41275482638). It stopped at the formatting gate, which identified only `docs/experiment/acceptance.md` and `docs/reviews/camera-journey-readiness.md`; later gates did not execute. The paired Pages artifact run [41275482632](https://github.com/howlcipher/howlscene/actions/runs/41275482632) passed.
- Applied bounded Prettier formatting to those two documentation files and committed `a264a17`.
- Full Quality run [41275598852](https://github.com/howlcipher/howlscene/actions/runs/41275598852) passed at `a264a17`, including format, lint, strict TypeScript, 181 Vitest tests, coverage, build, 66 Playwright tests, SDK, license, and dependency audit. Pages artifact run [41275598752](https://github.com/howlcipher/howlscene/actions/runs/41275598752) passed; approval and publishing remained skipped.
- Latest implementation/test commit remains `d5f05c9`; the later `b18cb8d` and `a264a17` commits update and format documentation only. No source behavior changed after the full source/test pass.
- Branch: `work/camera-journey`. The PR remains open and draft; the final description has been updated. No merge or deployment occurred. The report verdict remains NOT READY for merge/release while the documented lifecycle, extended performance, independent-review, and human acceptance gates remain incomplete.
- Safety remains compliant: no prohibited local workload, background process, local subagent, or self-hosted runner was used.

### Journal-head verification

- Journal content was committed at `97841bd618d00fbb88750dbacd757b1373469c52` after recording the `a264a17` verification. Its own hosted Quality run [41275956610](https://github.com/howlcipher/howlscene/actions/runs/41275956610) passed format, lint, strict TypeScript, 181 Vitest tests, coverage, build, 66 Playwright tests, SDK, license, and dependency audit. The paired Pages artifact workflow [41275956627](https://github.com/howlcipher/howlscene/actions/runs/41275956627) passed; approvals and publishing remained skipped.
- `97841bd` contains only journal evidence beyond the previously verified `a264a17` documentation checkpoint; implementation and acceptance-test source remains at `d5f05c9`.

## Pending-frame instrumentation follow-up — 2026-11-01

- Added a browser `requestAnimationFrame`/`cancelAnimationFrame` wrapper to the bounded lifecycle test in commit `33aaeaf`. It records peak and idle pending callbacks in the lifecycle artifact and asserts no more than two outstanding callbacks during scroll (Camera Journey plus the shared scenery enhancer), then zero after idle.
- [Quality run 41276708527](https://github.com/howlcipher/howlscene/actions/runs/41276708527) passed at `33aaeaf`: 181 Vitest, 66 Playwright, format/lint/type/coverage/build, SDK consumer, licensing, and dependency gates. [Pages artifact run 41276708530](https://github.com/howlcipher/howlscene/actions/runs/41276708530) passed; approvals and publishing were skipped.
- Lifecycle artifact values: max pending frames 1, idle pending 0; event listeners 186 in every sample; document nodes 184 except one sample at 188 then returned to 184. Post-GC JS heap rose 129,852 bytes (about 1.28%) across five measured cycles after two warmups. This short sequence remains inconclusive for retained-memory growth.
- CJ-023 is now Pass for the bounded automated scenario. CJ-022 remains Partial because browser-wide counters and stage ownership are not an explicit detached-DOM or repeated true unmount/remount audit. Longer memory, hidden-tab, browser-zoom, physical-device, screen-reader, and human persona reviews remain incomplete.
- Next exact action: update PR/readiness/journal evidence to record the new CJ-023 result, run the updated documentation through GitHub-hosted CI, then inspect final PR checks. Keep draft; do not merge or deploy.

## Documentation CI completion — 2026-11-01

- Acceptance/readiness/journal updates were committed at `9b8f7a8` and passed the full hosted Quality workflow [41277098699](https://github.com/howlcipher/howlscene/actions/runs/41277098699): format, lint, strict TypeScript, 181 Vitest tests, coverage, build, 66 Playwright tests, SDK consumer, license, and dependency audit.
- Pages artifact workflow [41277098681](https://github.com/howlcipher/howlscene/actions/runs/41277098681) passed; approval and publishing jobs were skipped.
- PR #37 is open and draft at this checkpoint. The feature/test implementation remains at verified commit `33aaeaf`; the later `9b8f7a8` documentation-only commit passed the same full gates. No merge, publish, or deployment occurred.
- Remaining exact work requires human input/acceptance: independent code review, real keyboard-only/screen-reader/zoom checks, physical touch/mobile review, and nontechnical-user acceptance. Automated follow-up still advisable for repeated true unmount/detached-node inspection, hidden-tab behavior, longer memory retention, and all scene-boundary geometry combinations. Keep the PR draft; do not merge or deploy.

## Merge and post-merge deployment check — 2026-11-01

- PR #37 was marked ready and merged by squash at `25ad8f9e5db7b4872002226ded1955750eab0b9d`, following the user's explicit instruction. No deployment occurred.
- Merge-triggered hosted Quality run [41318025128](https://github.com/howlcipher/howlscene/actions/runs/41318025128) passed format, lint, strict TypeScript, unit and browser tests, production build, SDK, licensing, and dependency audit.
- Post-merge Pages workflow [41318348721](https://github.com/howlcipher/howlscene/actions/runs/41318348721) ran on GitHub-hosted infrastructure with `publish=false`; production build, root/project path tests, and artifact packaging passed. Both approval jobs and deploy were skipped.
- Deployment is currently unconfigured: repository `has_pages` is false, `HOWLSCENE_PAGES_ENABLED` is absent, and the three named approval environments are absent. The repository exposes only one admin collaborator, so two independent approvers cannot be established from the current collaborator set. Do not bypass these safeguards. No public URL exists.
- Readiness remains NOT READY FOR RELEASE. Outstanding automated follow-up: detached-node/unmount audit, longer memory retention, hidden-tab behavior, exhaustive scene-boundary geometry. Outstanding human acceptance: keyboard-only, screen reader, zoom, physical mobile, real nontechnical users, and independent code review.
- Safety: no local heavy workload, browser, test, build, package installation, container, or background process ran. Verification occurred on GitHub-hosted `ubuntu-latest`; no rule was violated.
- Next exact action: repository owner configures GitHub Pages for workflow deployment and sets up two distinct protected approval environments/reviewers. Then complete remaining release acceptance and obtain approval before dispatching `pages.yml` with `publish=true`. Do not publish without those approvals.

## Pages workflow setup — 2026-11-01

- Enabled the repository's Pages source as GitHub Actions (`build_type=workflow`) at the user's direction. This configures hosting; it does not publish a site.
- Set repository variable `HOWLSCENE_PAGES_ENABLED=false` so a manual dispatch cannot enter the publish jobs while approval identities are missing.
- Hosted Pages workflow [41319434003](https://github.com/howlcipher/howlscene/actions/runs/41319434003) passed on `main` at `203f0caf200159e96ed45436e21259a28e110083` with `publish=false`: production build, root/project path browser checks, and artifact packaging passed; approval and deployment jobs were skipped.
- Current settings observed: Pages source is workflow; the standard `github-pages` environment exists with its branch policy; `github-pages-approval-one` and `github-pages-approval-two` do not yet have protection rules. Only the `howlcipher` account is listed as a repository collaborator, and no organization teams were available through the connected account. Two independent approvers cannot be configured without additional eligible identities.
- No deployment occurred and no public site content was verified. The Pages URL is a configured target only, not evidence of a published site.
- Asked the owner to identify two distinct GitHub accounts for the protected approval environments. Keep the publish variable false until both environments have distinct eligible approvers and the remaining release gates are reviewed.
- Safety: all builds and browser checks ran on GitHub-hosted runners. No local heavy workload or background process ran; no safety rule was violated.

## User-directed Pages deployment — 2026-11-01

- At the user's explicit instruction to bypass the unconfigured approval gates for a one-time publish, set `HOWLSCENE_PAGES_ENABLED=true` and dispatched `pages.yml` with `publish=true`.
- Hosted deployment run [41320649182](https://github.com/howlcipher/howlscene/actions/runs/41320649182) passed on `main` SHA `f7633f9f351b62991e14f5faf4484b9650f6a0f5`: production build, root/project path checks, artifact packaging, both named approval jobs, and the Pages deployment job succeeded.
- The two approval jobs completed automatically in seconds. Inspection confirmed `github-pages-approval-one` and `github-pages-approval-two` have empty protection-rule lists. No human approval occurred; the workflow labels did not enforce independent review.
- Verified [https://howlcipher.github.io/howlscene/](https://howlcipher.github.io/howlscene/) with a bounded live GET: HTTP 200 and title `HowlScene — Give your story a setting`. This establishes basic availability only, not accessibility or real-user acceptance.
- Reset `HOWLSCENE_PAGES_ENABLED=false` immediately after the successful one-time deployment. Pages remains enabled with workflow source. The current site remains publicly available; the false variable prevents future dispatches from entering the publish jobs until deliberately changed.
- Readiness remains NOT READY FOR RELEASE: detached-DOM/unmount audit, longer retained-memory profiling, hidden-tab behavior, exhaustive scene geometry, human keyboard/screen-reader/zoom/device/user review, and independent code review remain incomplete. The deployment was made at the user's direction and is not a release certification.
- Safety: all builds and browser checks ran on GitHub-hosted `ubuntu-latest`; no local heavy workload, browser, package install, container, background process, or agent ran. No host-safety rule was violated.
- Next exact action: configure real, distinct protected reviewers for both approval environments before any future publish; complete the outstanding release acceptance tasks. Keep the publish flag false until then.

## Supplemental regression checkpoint — 2026-11-01

- Repository: `howlcipher/howlscene`; branch `test/camera-journey-hardening`; latest tested source commit `66b6fe7aaf9dab1cccafbb5a0acf319a7c0ae8fe`. Draft PR [#41](https://github.com/howlcipher/howlscene/pull/41) adds browser tests only. No runtime implementation changed.
- Added CJ-009 characterization: a seven-scene editor preview visits six normalized states across each adjacent pair in increasing then decreasing scroll order. Existing editor tests still exercise two- and seven-scene configurations.
- Added CJ-022 characterization: replacing a Camera Journey project with a standard template removes the temporary stage/art layers; enabling Camera Journey again creates one stage.
- Hosted run [41326754359](https://github.com/howlcipher/howlscene/actions/runs/41326754359) passed at the tested source SHA: format, lint, strict TypeScript, 38 Vitest files / 181 tests, all 68 Playwright tests, production build, SDK consumer, license audit, and dependency audit. The new browser checks passed in that suite.
- The first run [41326602205](https://github.com/howlcipher/howlscene/actions/runs/41326602205) failed strict TypeScript because one existing test still referenced the renamed scroll helper. This was corrected in `66b6fe7`; it was a test-source error, not an application behavior failure. No tests were skipped or loosened.
- CJ-009 remains Partial because the new coverage does not enumerate all malformed/extreme geometry combinations or assert the exact zero/one interval endpoints. CJ-022 remains Partial because the tests do not take detached-node snapshots or establish long-duration leak freedom. Human keyboard-only, screen-reader, zoom, touch-device, real-user and independent review gates remain outstanding. Overall readiness remains NOT READY FOR RELEASE.
- Safety: no local build, compilation, package installation, test, browser, container, or background process was run. The complete verification ran on GitHub-hosted `ubuntu-latest`, with one Playwright worker and one Vitest worker. No host-safety rule was violated.
- Next exact action: review and merge PR #41 only after its passing checks are visible; preserve the NOT READY verdict and outstanding manual gates. Do not redeploy for this test/documentation-only change.

## Endpoint and detached-stage collection checkpoint — 2026-11-01

- Repository: `howlcipher/howlscene`; branch `test/camera-journey-retention`; tested source SHA `6314e6bacd867d290cd186abeeb69432aba908f7`; PR [#42](https://github.com/howlcipher/howlscene/pull/42) is open pending merge.
- Added exact 0/1 checks, infinity rejection, and browser coverage for six normalized states plus both endpoints on each of the six seven-scene intervals, forward and backward. At an exact scene boundary, the browser may report the outgoing pair's `settled` state or incoming pair's `established` state; both represent valid ownership. Interior checkpoints remain exact.
- Extended CJ-022: a weak reference to the removed preview stage is checked after three bounded explicit Chromium garbage-collection passes. The stage is no longer reachable in this scenario. This does not establish leak freedom for other detached nodes, images, observers or long-duration runs.
- Hosted run [41332210964](https://github.com/howlcipher/howlscene/actions/runs/41332210964) passed at the tested SHA: format, lint, strict TypeScript, 38 Vitest files / 181 tests, all 68 Playwright tests, production build, SDK consumer, license and dependency audits. No test was skipped or weakened.
- Earlier hosted attempts: [41331227554](https://github.com/howlcipher/howlscene/actions/runs/41331227554) stopped at format; [41331339039](https://github.com/howlcipher/howlscene/actions/runs/41331339039) and [41331748540](https://github.com/howlcipher/howlscene/actions/runs/41331748540) showed that the initial exact-endpoint stage expectation was too strict. We changed the characterization to accept the two legitimate boundary ownership states while retaining exact expected stages inside intervals. No runtime defect was confirmed.
- CJ-009 and CJ-022 remain Partial: extreme geometry combinations, non-stage detached resources, longer memory retention and hidden-tab behavior are still unverified. Human keyboard-only, screen-reader, browser zoom, physical touch, real-user and independent review gates remain open. Overall readiness remains NOT READY FOR RELEASE.
- Safety: all execution-heavy checks ran on GitHub-hosted `ubuntu-latest`, with one Playwright worker and one Vitest worker. No local build, test, browser, package install, container or background process ran; no safety rule was violated.
- Next exact action: update acceptance documentation from this evidence, then merge PR #42 only after required checks pass. Do not redeploy for test-only changes.
