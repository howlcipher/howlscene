# Cinematic v1 Engineering Journal

## Repository state

- Repository: `howlcipher/howlscene`
- Branch: `work/cinematic-v1`
- Starting commit: `efb9e160d9156e43716ec182908514d4af84131b`
- Current committed test-first checkpoint: `e19f0b6cf24d41d9edd101c7b383efbc303e19e6`
- Feature commit: `8f8fde351581e94bd45729adedc7b3edfb252143` (`feat(cinematic): add shared configurable story mode`)
- Current implementation checkpoint: `7b08c0750a8221d738ac1249af9dd4262ea23bbe`
- Latest changes: hosted TypeScript fix in progress; documentation checkpoint `975cdc6773699d5c33bfcd9b4b83ee37ab0b49ec`
- Pull request: [#34](https://github.com/howlcipher/howlscene/pull/34), draft
- Active milestone: shared cinematic configuration, rendering, and editor integration

## Safety policy

- No local compilation, build, package install, test, browser, container, load,
  stress, or GPU workload has been executed for this mission.
- No background process was started intentionally.
- No local subagents or browser automation processes were started.
- The checked workflows select GitHub-hosted `ubuntu-latest` runners. Their
  commands execute only on those runners. Quality gates have a 20-minute job
  timeout; Pages build verification has a 15-minute timeout.
- No self-hosted runner or command back to the desktop was found in the
  inspected workflow definitions.
- No safety rule has been violated.
- Local lightweight Prettier formatting and `git diff --check` were used; no
  compilation or tests were run locally.
- The first push attempt failed because the repository-local URL-specific Git
  helper pointed to missing `/home/linuxbrew/.linuxbrew/bin/gh`. The owner
  remained authenticated through `/usr/bin/gh` with `repo` scope. The local
  helper was corrected; no credential value was read or printed.
- GitHub MCP branch creation independently returned 403 because that
  integration lacks write access. This did not prevent Git CLI push or PR
  creation after the local helper correction.
- Branch `work/cinematic-v1` is pushed and draft PR #34 is open.
- Quality gates run [41128567497](https://github.com/howlcipher/howlscene/actions/runs/41128567497)
  and Pages build run [41128567426](https://github.com/howlcipher/howlscene/actions/runs/41128567426)
  both failed at the strict TypeScript check for the custom scene keyframe type.
  This is an implementation failure, not behavioral RED evidence.
- A fix now derives the exported keyframe type from Motion's public `animate`
  API. It is unverified pending the next hosted run.
- Host-side testing was not requested and will not be used for this mission.

## Initial audit

Confirmed existing capabilities include the versioned `SiteConfig`, strict
Zod validation, shared React `Site` renderer, three registered themes, section
and layout registries, Lexical editing, image uploads, local IndexedDB drafts,
undo/redo, editable project backups, standalone ZIP export, public SDK checks,
and section add/duplicate/remove/reorder controls. The section editor already
has heading, rich text, image, image-position, layout, alignment, width,
visibility, navigation, and spacing controls.

The editor currently offers portfolio and article starters. The five-scene Ink
Wash demo separately hardcodes scene IDs and asset paths and implements its
own backdrop, copy layers, scroll progress, mist cover, and transition effects.
The shared config has site motion and section entry animation, but no explicit
cinematic experience mode or scene transition preset. The shared exporter
already renders the validated config through the same `Site` component and
packages referenced assets; adding declarative config to that path is the
smallest route to portable cinematic output.

### Confirmed CI state

- Quality gates: [run 41108223624](https://github.com/howlcipher/howlscene/actions/runs/41108223624),
  successful on starting SHA `efb9e160d9156e43716ec182908514d4af84131b`.
- The CI workflow runs on PRs and pushes to `main`, on `ubuntu-latest`, with a
  20-minute timeout. It installs locked dependencies, Playwright browsers,
  runs format/lint/strict TypeScript/unit coverage/build/E2E/SDK/license/audit
  checks, and uploads evidence. It does not deploy.
- The Pages workflow runs its artifact build and browser verification on
  `ubuntu-latest`. Deployment is manual-dispatch-only on `main`, with explicit
  publish input, repository safeguard variable, and two approval environments.
- No focused test workflow is present. PR #34 now triggers the hosted quality
  checks for this feature branch.

## Architecture decisions

See [ADR 0001](../architecture/adr/0001-cinematic-config-contract.md).

## Implementation and verification log

### Test-first checkpoint

- Commit `e19f0b6` adds config/render/export contract tests for the new
  cinematic `experience` field, bounded transition IDs, older-project
  defaults, and static output.
- The test-first commit was pushed as part of PR #34. Its expected RED behavior
  was not executed at the test-only checkpoint.

### Implementation checkpoint `8f8fde3`

- Added defaulted `experience: standard | cinematic` and a bounded transition
  enum to the existing version 1 project schema.
- Added the `cinematicStarterSite` and **Cinematic Story** editor selection.
- The shared `Site` renderer emits the validated mode and transition as data
  attributes; the existing exporter uses that renderer and includes shared
  CSS, so semantic HTML remains present before JavaScript runs.
- Added responsive cinematic section styling and a public finite transition
  resolver for fade, camera push, camera pan, mist reveal, and layered
  parallax. Existing reduced-motion and animation cleanup paths are reused.
- Added scene transition and navigation label controls, plus the contextual
  **Change scenery** label. Existing layout, image position, image upload,
  text, ordering, duplication, deletion, history, storage, backup, themes and
  export controls are reused.
- Added source tests for configuration, transition distinction, theme and
  backup preservation, deterministic property normalization, editor selection,
  and interruption/reentry lifecycle.
- Updated user/developer documentation, acceptance traceability, and ADR 0001.
- The implementation commit is pushed in PR #34. No local compile, test, or
  browser run was performed. The first hosted checks failed on a keyframe type
  mismatch; no RED/GREEN or package artifact result is claimed yet.

### Rendering follow-up `7b08c07`

- Camera transitions target the background image element when present so its
  containing scene continues to define full-viewport bounds.
- Added lifecycle source coverage for artwork targeting. It remains unexecuted.

### Hosted CI type correction (pending verification)

- Quality gates run `41128567497` and Pages build run `41128567426`, both on
  GitHub-hosted Ubuntu runners, failed because `SceneTransitionKeyframes`
  lacked Motion's CSS custom-property index signature.
- The keyframe alias now derives from `Parameters<typeof animate>[1]` in
  `motion/mini`, keeping the resolver aligned with Motion's accepted keyframe
  contract. No local compilation or test was run to check this change.

Historical evidence in `PROGRESS.md` and existing review documents predates
this mission and is not evidence for new changes.

## Known defects and limitations

- The original Ink Wash demo still owns its hardcoded art paths, layered
  scroll-scrubbed composition, and mist cover; migration to the shared mode is
  outstanding.
- Static ZIP nested-path, no-JavaScript, asset, browser, performance, SDK,
  visual, accessibility, security, and licensing verification is outstanding
  for the new configuration.
- Real assistive-technology and physical-device acceptance remains a manual
  gate per the existing acceptance review.

## Handoff

- Next task: commit and push the keyframe type correction, inspect hosted
  verification, then
  migrate the existing Ink Wash demo to consume the shared capability.
- Pull requests: draft [#34](https://github.com/howlcipher/howlscene/pull/34).
- Decisions needed: none identified.
