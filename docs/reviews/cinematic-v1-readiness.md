# Cinematic v1 Readiness Report

**Verdict: NOT READY**

The shared cinematic mode now includes a reusable transition-cover asset path,
editor controls, static ZIP support, an independent SDK consumer, and the
migrated Ink Wash sample. The latest source commit passes the full GitHub-hosted
Quality workflow and Pages artifact verification. Overall v1 remains
**NOT READY** because visual review, performance, human accessibility review,
independent review, and real-user acceptance are incomplete.

## 1. Executive summary

The implementation adds a defaulted cinematic experience mode to the existing
site configuration, bounded scene transition identifiers, a reusable finite
transition resolver, responsive shared-renderer styling, a Cinematic Story
editor starter, a scene transition control, and focused source tests. Existing
section editing, image handling, themes, history, storage, backups, previews,
and ZIP export remain the shared paths.

The follow-up adds a validated optional per-scene `transitionCover` asset ID,
editor upload/removal controls, decorative entry animation, cleanup coverage,
asset retention, backup round trips, and ZIP inclusion. The Ink Wash demo now
uses the shared renderer and configured mist-reveal transitions. Final hosted
checks pass: 171 unit tests, 61 Playwright tests on one worker, independent SDK
package/browser export checks, dependency and license checks, and Pages artifact
verification.

## 2. Commits

- Starting commit: `efb9e160d9156e43716ec182908514d4af84131b`
- Test-first commit: `e19f0b6cf24d41d9edd101c7b383efbc303e19e6`
- Feature commit: `8f8fde351581e94bd45729adedc7b3edfb252143`
  (`feat(cinematic): add shared configurable story mode`).
- Rendering follow-up: `7b08c0750a8221d738ac1249af9dd4262ea23bbe`
  (`fix(cinematic): animate full scene artwork bounds`).
- Type correction: `73e4dcb1e7aefaa3855e25a92b3b4b11214617b0`.
- PR #34 final commit: `05c8dc4d50ad0b2b50b88e128f775a7621f09983`
  (`test(cinematic): assert background transition replay`), merged into
  `main` as `741c8277e754aa8a71d6af8be8cdacc6020de927`.
- Follow-up starting commit: `741c8277e754aa8a71d6af8be8cdacc6020de927`.
- Follow-up test-only commit: `df222d0a567fa0593a31c3e2a11eddeb1de45fde`.
- Follow-up implementation commit: `4a9063574fd1178bd282d172c002afddc1a4b751`.
- Follow-up source commit verified by CI:
  `4b4583c626a5215219597b857cc3501117d85377`.
- Shared demo migration and browser acceptance: `788ed72`.
- Cinematic ZIP and SDK acceptance: `0e81fbe` with follow-up test fixes.
- Latest verified source commit: `85225bd94f0bac97454a026aa8b57081a5cfae36`.
- Follow-up draft PR: [#35](https://github.com/howlcipher/howlscene/pull/35).
- Final tested PR head: `472de5bd2f98258f63c811858e24868f7177e262`.
- Ending merge commit: `3700a1d149b9e7a4880131799f6e5b4f1d476143`.

## 3. Architectural audit

Confirmed at the starting commit: a strict version 1 Zod configuration, shared
React renderer, three themes, registered section/layout renderers, Lexical
editing, section lifecycle controls, image upload/positioning, local IndexedDB
drafts, history, project backups, static ZIP export, and SDK package checks.
The standard editor already covers much of the requested scene editing surface.

The starting gap was that cinematic composition lived in
`examples/ink-wash-story/StoryExample.tsx` and its stylesheet rather than in the
shared config and renderer. The sample has now been moved onto the shared
`Site` renderer: bespoke copy layers and camera/mist scroll choreography were
removed, while example-specific artwork selection remains in the example as
content data. Scene headings and copy are emitted once by the shared semantic
renderer.

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
- Optional scene transition-cover asset references are strictly validated,
  rendered with empty alternative text as a decorative animated overlay,
  editable through the cinematic editor, kept when other artwork changes, and
  included in ZIPs when referenced by visible scenes.
- Vitest runs with one worker. A transitive `minimatch` override to patched
  `11.0.1` resolves the new moderate advisory found by hosted npm audit.
- The five-scene Ink Wash sample uses the shared renderer, registered scene
  transitions, and shared lifecycle enhancement. Its own artwork and labels
  remain example content rather than shared-engine assumptions.
- Editor ZIP browser coverage checks cinematic transition covers at root and
  nested static paths, with JavaScript enabled/disabled and reduced motion.
- The standalone SDK check installs the packed public packages into an
  independent consumer and exercises browser ZIP export and static hosting.
- User/developer docs, acceptance traceability, engineering journal, readiness
  report, and ADR.

## 5. Refactoring, DRY, and hardcoding

No second engine, project format, exporter, or editor was added. The transition
resolver is in the shared core motion module. User content remains in section
configuration, and the template is only a starting composition. The sample's
per-scene art mapping is appropriately example-owned; its separate rendering,
duplicate copy, and scroll-scrubbed transition implementation were removed.
The former continuous camera passage has been replaced by configured scene
entry mist reveals; this is a documented visual deviation from the reference.

## 6. TDD evidence

The first test-only commit is `e19f0b6`. It adds config, rendering, static
export, bounded identifier, and compatibility assertions before the
implementation commit. Additional source tests cover transition recipes,
reduced motion, themes, backup round trips, deterministic normalization, editor
journey, and interrupted/reentered scene lifecycle.

For the original PR #34 test-only checkpoint, no RED result was observed. In the
follow-up, test-only commit `df222d0` produced valid hosted RED evidence in
[run 41155355988](https://github.com/howlcipher/howlscene/actions/runs/41155355988):
the new renderer/export contract failed because strict schema rejected
`transitionCover`; the missing-reference assertion failed at the same schema
boundary. The implementation then made the reference assertion specifically
check missing-asset validation. A browser test fixture was corrected twice
after hosted evidence showed that one PNG payload was invalid and that normalized
uploads use WebP. The demo migration test was added first in commit `72bf70e`
and produced expected hosted RED in [run 41158575129](https://github.com/howlcipher/howlscene/actions/runs/41158575129):
the sample did not yet contain shared scene artwork. After migration and
selector corrections, the shared sample passed in run `41161202518`. An
independent SDK browser export then exposed an undecodable PNG test fixture in
run `41162490713`; the fixture was replaced with a valid PNG generated from
Node built-ins. Current GREEN is [run 41162883019](https://github.com/howlcipher/howlscene/actions/runs/41162883019).

## 7. Acceptance matrix

| ID          | Source coverage / state                                                            | Verification                                                        |
| ----------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| CIN-001     | Starter and editor test added                                                      | CI passed; focused journey incomplete                               |
| CIN-002     | Reuses rich-text editor; not specifically extended                                 | CI passed; focused edit coverage partial                            |
| CIN-003     | Reuses scenery upload and adds independent cover upload                            | Editor artwork journey passed in run 41157467153                    |
| CIN-004–005 | Reuses add/duplicate/remove/reorder operations                                     | CI passed; focused scene lifecycle coverage incomplete              |
| CIN-006     | Reuses existing layout controls                                                    | CI passed; dedicated cinematic tests absent                         |
| CIN-007     | Bounded transition schema, resolver, distinction and lifecycle tests               | Unit and lifecycle tests passed                                     |
| CIN-008     | Config backup/theme round trip includes cover assets                               | Unit tests passed in run 41157467153                                |
| CIN-009     | Three-theme content preservation test added                                        | Unit tests passed                                                   |
| CIN-010–011 | Existing storage and backup paths consume `parseSite`; backup roundtrip test added | CI passed; dedicated cinematic local-save test absent               |
| CIN-012     | Shared renderer and transition-cover ZIP asset contract                            | Extracted ZIP browser test and SDK ZIP passed in run 41162883019    |
| CIN-013     | Editor ZIP and SDK ZIP served at root and nested paths                             | Passed in run 41162883019                                           |
| CIN-014     | Shared semantic HTML tested with JavaScript disabled                               | Editor and SDK ZIP browser checks passed in run 41162883019         |
| CIN-015     | Reduced-motion export behavior checked in extracted editor ZIP                     | Passed in run 41162883019                                           |
| CIN-016     | Lifecycle interruption/reentry test added                                          | Lifecycle tests passed                                              |
| CIN-017     | Invalid transition, malformed cover ID, and missing asset rejected                 | Unit tests passed in run 41157467153                                |
| CIN-018     | Original five-scene demo consumes shared `Site`; configured transitions/navigation | Passed in run 41161202518                                           |
| CIN-019     | Independent packaged SDK consumer exports and serves cinematic cover ZIP           | Passed in run 41162883019                                           |
| CIN-020     | Existing 1–100 section limit; generic add/remove reused                            | Partially covered; pending hosted CI                                |
| CIN-021     | No preview/export equivalence browser test                                         | Pending                                                             |
| CIN-022     | Decorative transition-cover asset is included in editor and SDK ZIPs               | Browser checks passed in run 41162883019                            |
| CIN-023     | Transition-cover animation is scene-owned and cancellation tested                  | Lifecycle unit test passed                                          |
| CIN-024     | Theme switching preservation test added                                            | Unit tests passed                                                   |
| CIN-025     | Shared rendering has no example-specific scene/asset assumptions                   | Shared demo and unrelated SDK fixture pass; broader persona remains |

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

PR #34 was opened and triggered the inspected workflows, then merged into
`main` at `741c8277e754aa8a71d6af8be8cdacc6020de927`.
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

After PR #34 merged, follow-up PR #35 started from `741c827`. Its test-only
commit `df222d0` was observed failing in the intended schema behavior on hosted
run [41155355988](https://github.com/howlcipher/howlscene/actions/runs/41155355988).
Final commit `4b4583c626a5215219597b857cc3501117d85377` passed quality run
[41157467153](https://github.com/howlcipher/howlscene/actions/runs/41157467153):
locked install, format, lint, strict TypeScript, 171 unit tests across 37 files,
build, all 60 Playwright tests with one worker, SDK checks, license audit, and
`npm audit --audit-level=moderate`. Reported aggregate coverage was 94.74% lines,
89.91% branches, 95.65% functions, and 96.58% statements.

Pages run
[41157467158](https://github.com/howlcipher/howlscene/actions/runs/41157467158)
passed production build, root and project-path browser checks, and artifact
packaging on the follow-up. Approval and production deployment jobs were
skipped. The audit initially found minimatch 10.2.6 below the newly published
patched version; the lock now overrides it to 11.0.1, and the final hosted audit
passed. See the [GitHub security advisory](https://github.com/advisories/GHSA-g3hv-75wg-m249).

The Ink Wash migration test was added first. Hosted run
[41158575129](https://github.com/howlcipher/howlscene/actions/runs/41158575129)
showed the expected behavioral RED because the demo lacked shared scene
artwork. After migration, hosted run
[41161202518](https://github.com/howlcipher/howlscene/actions/runs/41161202518)
passed the 60-test suite. Subsequent exported-ZIP and SDK consumer work was
verified on final implementation commit `85225bd94f0bac97454a026aa8b57081a5cfae36`:
[Quality run 41162883019](https://github.com/howlcipher/howlscene/actions/runs/41162883019)
passed 171 unit tests and 61 Playwright tests, including independent packaged
SDK export and extracted editor ZIP checks. Coverage was 94.74% lines, 89.91%
branches, 95.65% functions, and 96.58% statements. The independent SDK fixture
failure in run `41162490713` was caused by an invalid one-pixel PNG payload; the
fixture was replaced with a valid PNG and the browser export then passed.
[Pages run 41162883058](https://github.com/howlcipher/howlscene/actions/runs/41162883058)
passed production build, root/project-path checks, and artifact packaging.
Approval and publish jobs were skipped.

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

Follow-up coverage extends `tests/cinematic.test.tsx`,
`tests/e2e/cinematic-editor.spec.ts`, `tests/e2e/story_demo.spec.ts`,
`tests/image_replacement.test.ts`, and `tests/scene_lifecycle.test.ts`. On
hosted run `41162883019`, all 171 unit tests and 61 Playwright tests passed.
The final run includes the shared-demo and extracted-ZIP browser checks. No test
command, TypeScript compilation, or build ran locally.

## 10. Browser, export, SDK, visual, accessibility, and performance results

- Browser tests: all 61 Playwright tests passed on one worker in run
  `41162883019`; Pages production root/project-path checks and packaging passed
  in run `41162883058`.
- The editor-generated cinematic ZIP was extracted and served at root and a
  nested path, with JavaScript on and off and reduced motion enabled. The
  contract verifies scene order/content, transition cover URL and decoded image,
  navigation, and resource responses.
- An independent installed SDK consumer generated a ZIP containing its
  configured cinematic cover, then served it at two nested mounts with
  JavaScript enabled and disabled. This passed inside run `41162883019`.
- Visual regression/screenshots: no migrated-demo screenshots were captured or
  reviewed. Existing project visual baselines passed in CI but are not a review
  of the Ink Wash transition deviation.
- Automated accessibility scanning: not run for cinematic mode.
- Human screen-reader, browser zoom, physical device, and nontechnical user
  acceptance: not performed.
- Performance measurements, throttling, resource-growth checks, and physical
  device conclusions: none for this increment.

These are unverified items, not successful results.

## 11. Security and licensing

The transition input remains a closed enum and `transitionCover` accepts only a
bounded `asset-` ID whose asset exists in the validated project. No scripts,
HTML, stylesheets, or arbitrary URLs are introduced. The hosted security tests,
dependency audit, and license workflow passed in run `41162883019`. The new
moderate minimatch advisory against 10.2.6 was fixed with the 11.0.1 override.
No separate manual third-party licensing assessment was performed.

## 12. Simulated-user outcomes

No new simulated user journey was executed. Existing persona evidence in
`docs/reviews/simulated-user-acceptance.md` predates this branch and does not
cover Cinematic Story.

## 13. Host-safety compliance

- Local heavy workload executed: **No**.
- Verification on GitHub-hosted infrastructure for this change: [Quality run 41162883019](https://github.com/howlcipher/howlscene/actions/runs/41162883019) and [Pages artifact run 41162883058](https://github.com/howlcipher/howlscene/actions/runs/41162883058), both passed on `85225bd94f0bac97454a026aa8b57081a5cfae36`.
- Tests not executed: visual regression review specific to the migrated demo,
  manual accessibility/assistive-technology review, performance throttling and
  physical-device measurements, independent review, and the five requested
  persona journeys.
- Unexpected background process started: **No**.
- Safety rule violated: **No**.
- Further host-side testing requested: **No**.
- PR #35 merged to `main` as `3700a1d149b9e7a4880131799f6e5b4f1d476143`.
  No deployment occurred; the Pages workflow's approval and publish jobs were
  skipped.
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

The Ink Wash example now uses the shared `Site` renderer and configured
mist-reveal scene entries. Its original continuous scroll-scrubbed camera
passage was removed, so exact transition choreography differs from the
reference; no pixel-perfect match is claimed. Hosted nested ZIP and independent
SDK consumer checks now pass. Full CIN-001–025 coverage, visual review of the
migrated example, real user and assistive-technology acceptance, performance
measurements, human browser-zoom review, and independent review remain. Existing
unit and E2E tests pass remotely but do not establish all requested release
requirements.

**NOT READY** — human accessibility, performance, visual, persona, independent
review, and remaining acceptance gates are unverified.

## Follow-up pull request

[PR #35](https://github.com/howlcipher/howlscene/pull/35) contains the
shared cinematic configuration, transition-cover support, Ink Wash sample
migration, extracted ZIP and SDK acceptance, and minimatch audit fix. It is
merged. Quality run [41163428593](https://github.com/howlcipher/howlscene/actions/runs/41163428593)
and Pages artifact run [41163428704](https://github.com/howlcipher/howlscene/actions/runs/41163428704)
passed on PR head `472de5bd2f98258f63c811858e24868f7177e262`, which contains
the implementation verified in run `41162883019`. The merge commit is
`3700a1d149b9e7a4880131799f6e5b4f1d476143`. No public deployment occurred.
