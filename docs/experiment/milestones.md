# Implementation milestones

The current resumption record is [PROGRESS.md](../../PROGRESS.md). Detailed
commands are preserved in [the executed continuation gate](../evidence/continuation_gate_before_review.txt).

| Phase | Implemented and verified in that snapshot                                                                               | Remaining work                                                       |
| ----- | ----------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| 0     | Shared React preview/static HTML, browser ZIP export, root and nested static serving with JavaScript disabled           | Preserve through final gates                                         |
| 1     | Versioned schema, ten sections, registries, portable text, safe URLs, motion, public API; unit/property/contract suites | Review fixes for image path collision and heading hierarchy          |
| 2     | Guided editor, Lexical, responsive images, IndexedDB, undo/redo, backups, previews, competing-tab protection            | Human usability review                                               |
| 3     | Standalone HTML/CSS/runtime/assets ZIP and editable backup; complete browser journey                                    | Collision regression and production deployment verification          |
| 4     | Three procedural layered themes; reduced motion, entry/exit effects, parallax; nine visual comparisons                  | Complete visual/manual accessibility review; missing reference video |
| 5     | William Elias consumer with theme switching and public-source provenance                                                | Production nested-route verification and deployment                  |
| 6     | Build, coverage, independent core/export tarball consumers, license audit, zero-vulnerability scan passed               | Fresh gates after review changes, CI execution, review, publication  |

No hosted deployment or public v1 release is established. The passed snapshot
contained 108 unit tests and 31 browser tests; subsequent edits require fresh
verification. Comparison with the independent track remains pending.
