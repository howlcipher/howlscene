# Camera Journey Engineering Journal

## Repository state

- Repository: `howlcipher/howlscene`
- Branch: `work/camera-journey`
- Starting commit: `95cc4b9cc942f80c61a6e5cd514488644ecc6c3c`
- Latest committed change: `9e780ca` test-first Camera Journey configuration contract
- Working tree: implementation in progress
- Active phase: C, shared renderer and lifecycle

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
- Implementation in progress adds the opt-in strict settings contract, deterministic pure transition frame, bounded scroll geometry resolver, shared DOM stage/controller, editor controls, and Ink Wash migration. No GREEN result claimed yet.
- Workflow inspected: `.github/workflows/ci.yml` uses `ubuntu-latest`, timeout 20 minutes, no deployment, and runs sequential steps. `playwright.config.ts` sets one worker. Existing Vitest command has no explicit worker cap.
- Hosted CI must be used for all tests/builds; local execution is prohibited.

## Safety

- No local heavy workload executed. No package installation, compilation, build, test, browser, container, or performance command run locally.
- No local subagents or background processes started.
- No safety rule violated.
- Hosted CI availability: run above in progress.

## Next actions

1. Review current source changes and resolve statically evident correctness issues.
2. Commit config, pure timeline, controller, editor, and migration together; push for hosted GREEN/regression evidence.
3. Correct remote format/type/unit/browser failures without local execution.
4. Add root/nested export, reduced-motion, lifecycle, and performance evidence.
5. Update reference/acceptance documents and final readiness report.
6. Keep PR draft; do not merge or deploy.
