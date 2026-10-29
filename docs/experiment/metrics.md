# Measurement record

These measurements are historical, scoped observations reported during implementation. They are not final-tree verification.

| Observation                           | Recorded value          | Scope and limitation                                                                         |
| ------------------------------------- | ----------------------- | -------------------------------------------------------------------------------------------- |
| Initial feasibility unit run          | 8 passing               | Phase 0 snapshot                                                                             |
| Initial feasibility browser run       | 2 passing               | Phase 0 export/editor snapshot                                                               |
| Later intermediate unit run           | 31 passing              | Before subsequent integration edits                                                          |
| Later intermediate browser run        | 4 passing               | Included contenteditable warning; not a clean release gate                                   |
| Standalone motion browser run         | 3 passing               | Motion subsystem snapshot                                                                    |
| Standalone motion runtime output      | 65.69 kB; 20.44 kB gzip | Reported bundler output units; not an editor bundle or all-site performance measurement      |
| External package consumption          | Passed separately       | Generated tarball, separate install, TypeScript and rendering; rerun after final integration |
| Core branch coverage                  | Not established         | Required thresholds remain unverified                                                        |
| Core Web Vitals and animation FPS     | Not measured            | No claim of meeting targets                                                                  |
| Manual accessibility/usability review | Not completed           | Automated tests cannot establish WCAG conformance                                            |

## Reproduce current checks

Use the commands defined in the current package scripts. The following direct commands support focused verification while integration scripts are being finalized:

```sh
npm ci
npx playwright install chromium
npm run format:check
npm run lint
npx tsc --noEmit
npm test -- --coverage
npm run build
npm run test:e2e
node scripts/sdk_check.mjs
node scripts/license_audit.mjs
npm audit --audit-level=moderate
```

The SDK check requires built package artifacts. Consult the current build configuration before running it. Running these commands is not itself evidence that they pass. Preserve their actual output with the relevant milestone.

[RED evidence](../evidence/) includes configuration/export, rich text, storage, motion, backup, upload, editor, SDK, and race-regression development failures. RED logs document the preimplementation failures; they do not prove GREEN or final regression results.

## Executed continuation snapshot

[Full command output](../evidence/continuation_gate_before_review.txt) records
108 passing unit tests, 31 passing browser tests, passing independent package
consumption and license review. Branch coverage was 88.46% overall, 89.18% core,
91.89% configuration and 93.18% exporter. This snapshot precedes review fixes;
it is not final-tree release evidence.

[Local performance observations](../evidence/local_performance.json) preserve
raw timing, browser/CPU/Node context and limitations. The generated runtime was
68,713 bytes / 21,297 bytes gzip using Node zlib. The fresh ten-section text-only
export took 65.2 ms. These measurements exclude images, use a development server,
and do not establish field Core Web Vitals, animation FPS or comparative results.
The probe now writes `.artifacts/performance.json` so later consumer browser
checks cannot clear its evidence.

## Final continuation gate

[Executed output](../evidence/continuation_final_gate.txt) records 113 passing
unit tests across 30 files and 32 passing browser tests, with no failures.
Formatting, lint, production build/prerendering, independent core/export package
installation and license/provenance checks passed. Final branch coverage:
overall 89.36%, core 89.82%, configuration 91.89%, exporter 97.72%.
The [vulnerability scan](../evidence/continuation_audit.txt) reports zero issues.

The final raw [performance report](../evidence/local_performance.json) supersedes
earlier single-run timing observations. Values naturally vary between runs;
compare its environment and limitations before drawing conclusions.
