# Implementation milestones

The current resumption record is [PROGRESS.md](../../PROGRESS.md). Detailed
commands are preserved in [the executed continuation gate](../evidence/font_final_gate.txt).

| Phase | Implemented and verified in that snapshot                                                                               | Remaining work                                                                                |
| ----- | ----------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| 0     | Shared React preview/static HTML, browser ZIP export, root and nested static serving with JavaScript disabled           | Preserve through final gates                                                                  |
| 1     | Versioned schema, ten sections, registries, portable text, safe URLs, motion, public API; unit/property/contract suites | Layer registry increment locally verified; broader theme and general section/layout contracts |
| 2     | Guided editor, Lexical, responsive images, IndexedDB, undo/redo, backups, previews, competing-tab protection            | Human usability review                                                                        |
| 3     | Standalone HTML/CSS/runtime/assets ZIP and editable backup; complete browser journey                                    | Public deployment verification (collision regression passes)                                  |
| 4     | Three procedural layered themes; reduced motion, entry/exit effects, parallax; nine visual comparisons                  | Complete visual/manual accessibility review; missing reference video                          |
| 5     | William Elias consumer with theme switching and public-source provenance                                                | Production nested-route verification and deployment                                           |
| 6     | Build, coverage, independent core/export tarball consumers, license audit, zero-vulnerability scan passed               | Hosted baseline passed; current increment verification, review, publication                   |

No hosted deployment or public v1 release is established. The passed snapshot
contains 114 unit tests and 34 browser tests; subsequent edits require fresh
verification. Comparison with the independent track remains pending.

Current branch: `work/theme-layers`. Manifest-driven artwork passes the complete local gate:
130 unit tests, 34 browser tests, independent package consumption and licenses.
The aggregate asset-preflight regression and cleanup correction pass too. The clean hosted baseline is
`ce06f23`, run `40878831459`; this is separate from current-branch verification.

The next bounded presentation increment passes the complete local gate:
134 unit tests, 35 browser tests, installed consumers and licenses. Defaults
preserve all nine screenshots. Broader theme contracts remain required work;
see ADR 003 and current journal for evidence and limits.
