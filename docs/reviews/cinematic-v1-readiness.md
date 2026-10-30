# Cinematic v1 Readiness Report

**Verdict: NOT READY**

This branch contains an initial shared cinematic configuration, renderer,
editor, and test increment. It has not been pushed or verified on GitHub-hosted
Actions. The original Ink Wash demonstration has not yet been migrated. The
ultimate v1 acceptance criterion is not met.

## 1. Executive summary

The implementation adds a defaulted cinematic experience mode to the existing
site configuration, bounded scene transition identifiers, a reusable finite
transition resolver, responsive shared-renderer styling, a Cinematic Story
editor starter, a scene transition control, and focused source tests. Existing
section editing, image handling, themes, history, storage, backups, previews,
and ZIP export remain the shared paths.

This is an incomplete and unverified increment. No hosted RED/GREEN evidence,
visual review, SDK run for the new contract, or export-browser verification is
available. The five-scene demo still contains its separate hardcoded rendering
and transition logic.

## 2. Commits

- Starting commit: `efb9e160d9156e43716ec182908514d4af84131b`
- Test-first commit: `e19f0b6cf24d41d9edd101c7b383efbc303e19e6`
- Feature commit: `8f8fde351581e94bd45729adedc7b3edfb252143`
  (`feat(cinematic): add shared configurable story mode`).
- Ending code commit: `7b08c0750a8221d738ac1249af9dd4262ea23bbe`
  (`fix(cinematic): animate full scene artwork bounds`).
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

No RED result was observed at the test-only checkpoint. The test-first commit
and implementation are now in draft PR #34. Hosted checks had not appeared in
the latest poll, so no RED/GREEN result is claimed. TDD execution evidence is
pending; source ordering alone is not represented as a passing TDD cycle.

## 7. Acceptance matrix

| ID          | Source coverage / state                                                              | Verification                         |
| ----------- | ------------------------------------------------------------------------------------ | ------------------------------------ |
| CIN-001     | Starter and editor test added                                                        | Pending hosted CI                    |
| CIN-002     | Reuses rich-text editor; not specifically extended                                   | Pending hosted CI                    |
| CIN-003     | Reuses image upload control                                                          | Pending hosted CI                    |
| CIN-004–005 | Reuses add/duplicate/remove/reorder operations                                       | Pending hosted CI                    |
| CIN-006     | Reuses existing layout controls                                                      | Pending hosted CI                    |
| CIN-007     | Bounded transition schema, resolver, distinction tests                               | Pending hosted CI                    |
| CIN-008     | Config backup and theme round-trip test added                                        | Pending hosted CI                    |
| CIN-009     | Three-theme content preservation test added                                          | Pending hosted CI                    |
| CIN-010–011 | Existing storage and backup paths consume `parseSite`; cinematic regressions not run | Pending hosted CI                    |
| CIN-012     | Shared renderer/export contract test added                                           | Pending hosted CI                    |
| CIN-013     | No new cinematic nested-hosting test                                                 | Pending                              |
| CIN-014     | Shared semantic HTML path; test added, not executed                                  | Pending hosted CI                    |
| CIN-015     | Existing reduced-motion gate reused; resolver test added                             | Pending hosted CI                    |
| CIN-016     | Lifecycle interruption/reentry test added                                            | Pending hosted CI                    |
| CIN-017     | Invalid transition test added                                                        | Pending hosted CI                    |
| CIN-018     | Original demo not migrated or reverified                                             | Not complete                         |
| CIN-019     | Public package surfaces re-export core config/motion; new SDK consumer not tested    | Pending                              |
| CIN-020     | Existing 1–100 section limit; generic add/remove reused                              | Partially covered; pending hosted CI |
| CIN-021     | No preview/export equivalence browser test                                           | Pending                              |
| CIN-022     | No transition-cover asset contract exists in the new mode                            | Not implemented                      |
| CIN-023     | Existing cleanup reused; new reentry lifecycle test added                            | Pending hosted CI                    |
| CIN-024     | Theme switching preservation test added                                              | Pending hosted CI                    |
| CIN-025     | Shared components consume config, but full unrelated-site test not added             | Pending                              |

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
both failed at strict TypeScript compilation because the custom cinematic
keyframe interface lacked Motion's CSS-variable index signature. A type
correction deriving the keyframe type from Motion's public `animate` API is
being prepared; it has not yet been verified remotely.

## 9. Unit and integration results

Tests added: `tests/cinematic.test.tsx`,
`tests/e2e/cinematic-editor.spec.ts`, and a lifecycle case in
`tests/scene_lifecycle.test.ts`. The hosted TypeScript check failed before
tests ran. No test command, TypeScript compilation, or build ran locally. Pass
counts and coverage are unavailable.

## 10. Browser, export, SDK, visual, accessibility, and performance results

- Browser tests: not run.
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
asset validation remain in force. Security tests, dependency audit, and
third-party license review have not been run on these changes.

## 12. Simulated-user outcomes

No new simulated user journey was executed. Existing persona evidence in
`docs/reviews/simulated-user-acceptance.md` predates this branch and does not
cover Cinematic Story.

## 13. Host-safety compliance

- Local heavy workload executed: **No**.
- Verification on GitHub-hosted infrastructure for this change: **Runs 41128567497 and 41128567426 failed at TypeScript compilation**.
- Tests not executed: all new and regression tests, type check, build, SDK,
  browser/export, accessibility, visual, performance, security, and licensing
  checks.
- Unexpected background process started: **No**.
- Safety rule violated: **No**.
- Further host-side testing requested: **No**.
- Local work was limited to source/document inspection and edits, Git status and
  small diff review, and bounded Prettier formatting. No package installation,
  compilation, test, browser, container, or background workload was run.

## 14. Remaining human acceptance and deployment

After hosted type/build verification, real nontechnical users,
assistive-technology review, physical mobile use, and human visual review
remain required. No deployment was requested or performed. The existing Pages
approval controls were not changed.

## 15. Known limitations and final verdict

The Ink Wash example still uses example-specific code and has not been
migrated. Transition-cover artwork, exact scene-to-scene camera passage,
dedicated cinematic nested export and visual tests, new SDK consumer tests, and
full acceptance coverage remain. The newly written tests are still unexecuted;
the draft PR exists, and the first hosted runs failed during TypeScript
compilation.

**NOT READY** — implementation-critical verification is blocked, demo migration
is incomplete, and the ultimate acceptance criterion is not met. This verdict
must be reevaluated only after hosted CI and the remaining engineering and human
gates have actual evidence.
