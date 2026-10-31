# Cinematic v1 Readiness Report

**Verdict: NOT READY**

The initial shared cinematic mode is now followed by a reusable transition-cover
asset path through configuration, editor, renderer, lifecycle, backup, and ZIP
export. The current follow-up commit passes the full GitHub-hosted quality
workflow and Pages artifact verification. Overall v1 remains **NOT READY**:
the Ink Wash demo still has its own scene-transition implementation, and
broader export, SDK consumer, accessibility, visual, performance, and human
acceptance remain.

## 1. Executive summary

The implementation adds a defaulted cinematic experience mode to the existing
site configuration, bounded scene transition identifiers, a reusable finite
transition resolver, responsive shared-renderer styling, a Cinematic Story
editor starter, a scene transition control, and focused source tests. Existing
section editing, image handling, themes, history, storage, backups, previews,
and ZIP export remain the shared paths.

The follow-up adds a validated optional per-scene `transitionCover` asset ID,
editor upload/removal controls, decorative entry animation, cleanup coverage,
asset retention, backup round trips, and ZIP inclusion. Its test-only hosted
RED result was observed before implementation. Final hosted checks pass,
including a 60-test Playwright suite on one worker. The five-scene demo still
contains separate hardcoded rendering and scroll-transition logic.

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
- Follow-up draft PR: [#35](https://github.com/howlcipher/howlscene/pull/35).

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
- Optional scene transition-cover asset references are strictly validated,
  rendered with empty alternative text as a decorative animated overlay,
  editable through the cinematic editor, kept when other artwork changes, and
  included in ZIPs when referenced by visible scenes.
- Vitest runs with one worker. A transitive `minimatch` override to patched
  `11.0.1` resolves the new moderate advisory found by hosted npm audit.
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

For the original PR #34 test-only checkpoint, no RED result was observed. In the
follow-up, test-only commit `df222d0` produced valid hosted RED evidence in
[run 41155355988](https://github.com/howlcipher/howlscene/actions/runs/41155355988):
the new renderer/export contract failed because strict schema rejected
`transitionCover`; the missing-reference assertion failed at the same schema
boundary. The implementation then made the reference assertion specifically
check missing-asset validation. A browser test fixture was corrected twice
after hosted evidence showed that one PNG payload was invalid and that normalized
uploads use WebP. Final GREEN is [run 41157467153](https://github.com/howlcipher/howlscene/actions/runs/41157467153).

## 7. Acceptance matrix

| ID          | Source coverage / state                                                            | Verification                                                |
| ----------- | ---------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| CIN-001     | Starter and editor test added                                                      | CI passed; focused journey incomplete                       |
| CIN-002     | Reuses rich-text editor; not specifically extended                                 | CI passed; focused edit coverage partial                    |
| CIN-003     | Reuses scenery upload and adds independent cover upload                            | Editor artwork journey passed in run 41157467153            |
| CIN-004–005 | Reuses add/duplicate/remove/reorder operations                                     | CI passed; focused scene lifecycle coverage incomplete      |
| CIN-006     | Reuses existing layout controls                                                    | CI passed; dedicated cinematic tests absent                 |
| CIN-007     | Bounded transition schema, resolver, distinction and lifecycle tests               | Unit and lifecycle tests passed                             |
| CIN-008     | Config backup/theme round trip includes cover assets                               | Unit tests passed in run 41157467153                        |
| CIN-009     | Three-theme content preservation test added                                        | Unit tests passed                                           |
| CIN-010–011 | Existing storage and backup paths consume `parseSite`; backup roundtrip test added | CI passed; dedicated cinematic local-save test absent       |
| CIN-012     | Shared renderer and transition-cover ZIP asset contract                            | Unit/build passed; hosted Pages path checks passed          |
| CIN-013     | No new cinematic nested-hosting test                                               | Pending                                                     |
| CIN-014     | Shared semantic HTML path and static markup test                                   | Unit tests passed; no-JS browser test absent                |
| CIN-015     | Existing reduced-motion gate reused; resolver test added                           | Unit tests passed; export browser test absent               |
| CIN-016     | Lifecycle interruption/reentry test added                                          | Lifecycle tests passed                                      |
| CIN-017     | Invalid transition, malformed cover ID, and missing asset rejected                 | Unit tests passed in run 41157467153                        |
| CIN-018     | Original demo not migrated or reverified                                           | Not complete                                                |
| CIN-019     | Public package surfaces re-export core config/motion; new SDK consumer not tested  | Pending                                                     |
| CIN-020     | Existing 1–100 section limit; generic add/remove reused                            | Partially covered; pending hosted CI                        |
| CIN-021     | No preview/export equivalence browser test                                         | Pending                                                     |
| CIN-022     | Decorative transition-cover asset is rendered and included in visible-scene ZIPs   | Unit/export and editor tests passed                         |
| CIN-023     | Transition-cover animation is scene-owned and cancellation tested                  | Lifecycle unit test passed                                  |
| CIN-024     | Theme switching preservation test added                                            | Unit tests passed                                           |
| CIN-025     | No example-specific value is used by the new shared cover field                    | Follow-up contract passes; full unrelated-site test pending |

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
`tests/e2e/cinematic-editor.spec.ts`, `tests/image_replacement.test.ts`, and
`tests/scene_lifecycle.test.ts`. On hosted run `41157467153`, all 171 unit tests
and all 60 Playwright tests passed. No test command, TypeScript compilation, or
build ran locally.

## 10. Browser, export, SDK, visual, accessibility, and performance results

- Browser tests: all 60 Playwright tests passed on one worker in run
  `41157467153`; the Pages production root/project path checks passed in run
  `41157467158`.
- Unit-level ZIP coverage verifies the decorative cover HTML and included asset.
  Dedicated extracted cinematic ZIP browser tests for nested hosting,
  JavaScript-disabled behavior, and reduced motion remain outstanding.
- SDK build/package verification passed in run `41157467153`; a dedicated
  independent consumer using the new transition-cover contract remains
  outstanding.
- Visual regression/screenshots: not captured or reviewed.
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
dependency audit, and license workflow passed in run `41157467153`. The new
moderate minimatch advisory against 10.2.6 was fixed with the 11.0.1 override.
No separate manual third-party licensing assessment was performed.

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
- Latest hosted verification: quality run `41157467153` and Pages run
  `41157467158`, both on commit `4b4583c626a5215219597b857cc3501117d85377`.
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
migrated. The reusable engine still lacks the original demo's full
scene-to-scene camera passage. Dedicated cinematic nested-export and visual
tests, a new SDK consumer test, full acceptance coverage, real user and
assistive-technology acceptance, performance measurements, and independent
review remain. Existing unit and E2E tests pass remotely, but they do not cover
all listed acceptance requirements.

**NOT READY** — demo migration, dedicated cinematic export and SDK consumer
coverage, full automated acceptance, and human review remain. Reevaluate after
those gates have actual evidence.

## Follow-up pull request

Draft [PR #35](https://github.com/howlcipher/howlscene/pull/35) contains the
reusable transition-cover artwork support and the minimatch audit fix. It is
not merged. Final hosted quality run `41157467153` and Pages artifact run
`41157467158` passed on `4b4583c626a5215219597b857cc3501117d85377`. No public
deployment occurred.
