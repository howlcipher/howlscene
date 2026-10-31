# Camera Journey Engineering Journal

## Repository state

- Repository: `howlcipher/howlscene`
- Branch: `work/camera-journey`
- Starting commit: `95cc4b9cc942f80c61a6e5cd514488644ecc6c3c`
- Latest committed change: `3bf22ed` shared Camera Journey implementation and integration
- Working tree: contains a follow-up parallax-depth extension and formatting corrections; not yet committed
- Active phase: F, remote regression and acceptance

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
- Workflow inspected: `.github/workflows/ci.yml` uses `ubuntu-latest`, timeout 20 minutes, no deployment, and runs sequential steps. `playwright.config.ts` sets one worker. Existing Vitest command has no explicit worker cap.
- Hosted CI must be used for all tests/builds; local execution is prohibited.

## Safety

- No local heavy workload executed. No local package installation, compilation, build, test, browser, container, or performance command was run. One bounded Prettier formatting command was run against changed text files only.
- No local subagents or background processes started.
- No safety rule violated.
- Hosted CI availability: Pages artifact succeeded; the Quality job failed only at formatting. A corrected full verification run is pending the next push.

## Next actions

1. Commit and push the bounded parallax-depth support and formatting corrections.
2. Review hosted format, lint, type, unit, build, browser, SDK, and audit results for the new commit.
3. Review visual checkpoint artifacts, mobile/reduced-motion behavior, and exported ZIP results.
4. Add missing lifecycle, cross-browser, and remote performance evidence.
5. Update final readiness report with verified evidence and remaining human gates.
6. Keep PR draft; do not merge or deploy.
