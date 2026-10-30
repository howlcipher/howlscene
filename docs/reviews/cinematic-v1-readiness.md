# Cinematic v1 Readiness Report

**Verdict: NOT READY**

This branch contains an initial shared cinematic configuration, renderer,
editor, and test increment. Quality gates and Pages artifact verification pass
on GitHub-hosted Actions. The original Ink Wash demonstration has not yet been
migrated, and dedicated cinematic export, human, accessibility, and visual
acceptance remain. The ultimate v1 acceptance criterion is not met.

## 1. Executive summary

The implementation adds a defaulted cinematic experience mode to the existing
site configuration, bounded scene transition identifiers, a reusable finite
transition resolver, responsive shared-renderer styling, a Cinematic Story
editor starter, a scene transition control, and focused source tests. Existing
section editing, image handling, themes, history, storage, backups, previews,
and ZIP export remain the shared paths.

The shared implementation increment has passing hosted checks. The planned
test-only RED phase was not observed. Visual review, SDK consumer use of the
new contract, and cinematic ZIP browser verification remain outstanding. The
five-scene demo still contains its separate hardcoded rendering and transition
logic.

## 2. Commits

- Starting commit: `efb9e160d9156e43716ec182908514d4af84131b`
- Test-first commit: `e19f0b6cf24d41d9edd101c7b383efbc303e19e6`
- Feature commit: `8f8fde351581e94bd45729adedc7b3edfb252143`
  (`feat(cinematic): add shared configurable story mode`).
- Rendering follow-up: `7b08c0750a8221d738ac1249af9dd4262ea23bbe`
  (`fix(cinematic): animate full scene artwork bounds`).
- Type correction: `73e4dcb1e7aefaa3855e25a92b3b4b11214617b0`.
- Current code commit: `05c8dc4d50ad0b2b50b88e128f775a7621f09983`
  (`test(cinematic): assert background transition replay`).
- Draft PR: [#34](https://github.com/howlcipher/howlscene/pull/34).

## 3. Architectural audit

Confirmed at the starting commit: a strict version 1 Zod configuration, shared
React renderer, three themes, registered section/layout renderers, Lexical
editing, section lifecycle controls, image upload/positioning, local IndexedDB
drafts, history, project backups, static ZIP export, and SDK package checks.
The standard editor already covers much of the requested scene editing surface.

The main confirmed gap was that cinematic composition lived in
`examples/ink-wash-story/StoryExample.tsx` and its stylesheet rather than in the
shared config and renderer. The demo hardcodes five scene IDs and asset paths,
duplicates semantic copy for animation, and owns a scroll-scrubbed camera/mist
sequence. The project configuration had no experience mode or per-section
transition selection.

The implementation decision is recorded in
[`ADR 0001`](../architecture/adr/0001-cinematic-config-contract.md). The new
contract reuses existing sections and assets rather than introducing a second
project model.

## 4. Features implemented in source

- `experience: "standard" | "cinematic"`, defaulting to standard for existing
  version 1 projects.
- Validated per-section transitions: none, fade, camera push, camera pan, mist
  reveal, and layered parallax.
- A finite public transition resolver with bounded duration and reduced-motion
  output.
- Cinematic scene sizing, artwork surface treatment, and mobile styling in
  shared CSS.
- A five-scene generic **Cinematic Story** starter. The configuration permits
  one to 100 sections, subject to existing limits.
- Editor selection, scene transition selector, and contextual scenery upload
  label and navigation label. Existing controls cover text, image positioning,
  layout, ordering, duplicate/delete, and motion sliders.
- Shared renderer attributes and exported CSS/HTML use. Existing backup,
  autosave/history, theme switching, and ZIP packaging serialize the fields
  through the existing validated project.
- User/developer docs, acceptance traceability, engineering journal, readiness
  report, and ADR.

## 5. Refactoring, DRY, and hardcoding

No second engine, project format, exporter, or editor was added. The new
transition resolver is in the shared core motion module. User content remains
in section configuration, and the template is only a starting composition.
The example's hardcoded image selection and scroll-driven transition have not
yet been removed; therefore example generalization is incomplete.

## 6. TDD evidence

The first test-only commit is `e19f0b6`. It adds config, rendering, static
export, bounded identifier, and compatibility assertions before the
implementation commit. Additional source tests cover transition recipes,
reduced motion, themes, backup round trips, deterministic normalization, editor
journey, and interrupted/reentered scene lifecycle.

No RED result was observed at the test-only checkpoint. Run `41128843188`
reported one lifecycle assertion failure after the implementation changed the
target to the full-size background image; the assertion was corrected. Quality
run `41129125151` passed all 166 unit tests. This is subsequent GREEN evidence,
not the planned test-only RED phase; that RED evidence remains unavailable.

## 7. Acceptance matrix

| ID          | Source coverage / state                                                            | Verification                                           |
| ----------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------ |
| CIN-001     | Starter and editor test added                                                      | CI passed; focused journey incomplete                  |
| CIN-002     | Reuses rich-text editor; not specifically extended                                 | CI passed; focused edit coverage partial               |
| CIN-003     | Reuses image upload control                                                        | CI passed; focused artwork journey incomplete          |
| CIN-004–005 | Reuses add/duplicate/remove/reorder operations                                     | CI passed; focused scene lifecycle coverage incomplete |
| CIN-006     | Reuses existing layout controls                                                    | CI passed; dedicated cinematic tests absent            |
| CIN-007     | Bounded transition schema, resolver, distinction and lifecycle tests               | Unit and lifecycle tests passed                        |
| CIN-008     | Config backup and theme round-trip test added                                      | Unit tests passed                                      |
| CIN-009     | Three-theme content preservation test added                                        | Unit tests passed                                      |
| CIN-010–011 | Existing storage and backup paths consume `parseSite`; backup roundtrip test added | CI passed; dedicated cinematic local-save test absent  |
| CIN-012     | Shared renderer/export contract test added                                         | Unit/build passed; ZIP browser test absent             |
| CIN-013     | No new cinematic nested-hosting test                                               | Pending                                                |
| CIN-014     | Shared semantic HTML path and static markup test                                   | Unit tests passed; no-JS browser test absent           |
| CIN-015     | Existing reduced-motion gate reused; resolver test added                           | Unit tests passed; export browser test absent          |
| CIN-016     | Lifecycle interruption/reentry test added                                          | Lifecycle tests passed                                 |
| CIN-017     | Invalid transition test added                                                      | Unit tests passed                                      |
| CIN-018     | Original demo not migrated or reverified                                           | Not complete                                           |
| CIN-019     | Public package surfaces re-export core config/motion; new SDK consumer not tested  | Pending                                                |
| CIN-020     | Existing 1–100 section limit; generic add/remove reused                            | Partially covered; pending hosted CI                   |
| CIN-021     | No preview/export equivalence browser test                                         | Pending                                                |
| CIN-022     | No transition-cover asset contract exists in the new mode                          | Not implemented                                        |
| CIN-023     | Existing cleanup reused; new reentry lifecycle test added                          | Lifecycle tests passed                                 |
| CIN-024     | Theme switching preservation test added                                            | Unit tests passed                                      |
| CIN-025     | Shared components consume config, but full unrelated-site test not added           | Pending                                                |

## 8. GitHub Actions and verification

Starting commit quality gates passed on GitHub-hosted run
[41108223624](https://github.com/howlcipher/howlscene/actions/runs/41108223624).
That run predates all mission changes and is not evidence for this branch.

The inspected `ci.yml` uses `ubuntu-latest`, a 20-minute timeout, locked
dependency install, Playwright browser installation, format/lint/TypeScript,
unit coverage, build, browser tests, SDK, license, and dependency audit steps.
It does not deploy. No focused test workflow exists. The Pages workflow builds
PR artifacts on `ubuntu-latest`; deployment is manual on `main` with a publish
input, repository safeguard, and two approval environments.

Draft PR #34 was opened and triggered the inspected workflows.
The first Git push failed because the repository-local URL-specific helper
pointed to missing `/home/linuxbrew/.linuxbrew/bin/gh`, while the authenticated
system CLI was `/usr/bin/gh`. The local helper was corrected and the branch was
pushed. The connected GitHub integration independently returned HTTP 403 for
branch creation because it lacks write access. The hosted quality-gates run
[41128567497](https://github.com/howlcipher/howlscene/actions/runs/41128567497)
and Pages build run
[41128567426](https://github.com/howlcipher/howlscene/actions/runs/41128567426)
both initially failed at strict TypeScript compilation because the custom
cinematic keyframe interface lacked Motion's CSS-variable index signature.
The type correction was pushed in commit
`73e4dcb1e7aefaa3855e25a92b3b4b11214617b0`. Hosted quality run
[41128843188](https://github.com/howlcipher/howlscene/actions/runs/41128843188)
passed format, lint, and TypeScript, then failed one lifecycle assertion. That
assertion expected a repeated cinematic entrance to target text, but the
entrance correctly targets the full-size background image. The assertion was
corrected and passed in the later full hosted quality run.

Pages run
[41128843374](https://github.com/howlcipher/howlscene/actions/runs/41128843374)
passed the production build, root/project Pages browser checks, and artifact
packaging on commit `73e4dcb1e7aefaa3855e25a92b3b4b11214617b0`. The approval
and publish jobs were skipped as expected for a pull request.

On the corrected commit `05c8dc4d50ad0b2b50b88e128f775a7621f09983`, hosted
quality run
[41129125151](https://github.com/howlcipher/howlscene/actions/runs/41129125151)
passed formatting, lint, strict TypeScript, all 166 unit tests, build, the full
Playwright E2E suite, SDK checks, license review, and dependency audit. Pages
run
[41129125122](https://github.com/howlcipher/howlscene/actions/runs/41129125122)
passed production build, root and project path browser verification, and
artifact packaging. Approval and publishing steps were skipped.

## 9. Unit and integration results

Tests added: `tests/cinematic.test.tsx`,
`tests/e2e/cinematic-editor.spec.ts`, and a lifecycle case in
`tests/scene_lifecycle.test.ts`. On run `41128843188`, 165 of 166 unit tests
passed; one assertion used the text target instead of the background image
target. The correction passed in quality run `41129125151`; all 166 unit tests
passed. No test command, TypeScript compilation, or build ran locally.

## 10. Browser, export, SDK, visual, accessibility, and performance results

- Browser tests: the repository's full Playwright E2E suite passed in run
  `41129125151`; the Pages production root/project path checks passed in run
  `41129125122`. Dedicated cinematic export/browser coverage remains absent.
- ZIP extraction and root/nested static hosting: not run for cinematic output.
- SDK consumer verification: not run for cinematic configuration.
- Visual regression/screenshots: not captured or reviewed.
- Automated accessibility scanning: not run for cinematic mode.
- Human screen-reader, browser zoom, physical device, and nontechnical user
  acceptance: not performed.
- Performance measurements, throttling, resource-growth checks, and physical
  device conclusions: none for this increment.

These are unverified items, not successful results.

## 11. Security and licensing

The new transition input is a closed enum; no user-provided scripts, HTML,
stylesheets, or URL references are introduced. Existing safe rich text and
asset validation remain in force. The hosted security test suite, dependency
audit, and license workflow passed in run `41129125151`. No separate manual
third-party licensing assessment was performed.

## 12. Simulated-user outcomes

No new simulated user journey was executed. Existing persona evidence in
`docs/reviews/simulated-user-acceptance.md` predates this branch and does not
cover Cinematic Story.

## 13. Host-safety compliance

- Local heavy workload executed: **No**.
- Verification on GitHub-hosted infrastructure for this change: **Quality gates run 41129125151 and Pages run 41129125122 passed on commit `05c8dc4d50ad0b2b50b88e128f775a7621f09983`**.
- Tests not executed: dedicated cinematic ZIP round-trip/browser scenarios,
  visual regression, accessibility scans, physical performance, and persona
  acceptance checks.
- Unexpected background process started: **No**.
- Safety rule violated: **No**.
- Further host-side testing requested: **No**.
- Local work was limited to source/document inspection and edits, Git status and
  small diff review, and bounded Prettier formatting. No package installation,
  compilation, test, browser, container, or background workload was run.
- A short-lived foreground `gh run watch` command polled hosted workflow status
  and exited after the workflow completed. No unexpected background process
  was started.

## 14. Remaining human acceptance and deployment

After the remaining automated cinematic acceptance work, real nontechnical users,
assistive-technology review, physical mobile use, and human visual review
remain required. No deployment was requested or performed. The existing Pages
approval controls were not changed.

## 15. Known limitations and final verdict

The Ink Wash example still uses example-specific code and has not been
migrated. Transition-cover artwork, exact scene-to-scene camera passage,
dedicated cinematic nested export and visual tests, new SDK consumer tests, and
full acceptance coverage remain. Existing new unit and E2E tests pass remotely,
but they do not cover all listed acceptance requirements.

**NOT READY** — demo migration, dedicated cinematic export and SDK consumer
coverage, full automated acceptance, and human review remain. Reevaluate after
those gates have actual evidence.
