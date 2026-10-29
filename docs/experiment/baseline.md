# Conventional implementation baseline

## Track boundary

This record covers Track A, the conventional TypeScript and React HowlScene implementation in this repository. It makes no comparison claims about another implementation. Work on this track must not read or modify another track's repository or coordinate its implementation decisions.

The reference video mentioned in the experiment direction has not been supplied. Visual fidelity to that reference cannot be evaluated. Record the missing input rather than inventing reference observations.

## Product and stack

The target is a browser-based guided website editor with an independently usable rendering package and browser-generated static export. The stack uses React, TypeScript, Vite, Lexical, Motion, Zod, JSZip, IndexedDB, Vitest, fast-check, Playwright, and axe tooling. The lockfile is the authoritative dependency graph.

Phase 0 chose browser-compatible React static rendering to share content semantics with the live preview. See [ADR 001](../architecture/adr_001_static_export.md). Static export must preserve meaningful HTML when JavaScript is unavailable and use relative deployment paths. Animation is progressive enhancement.

## Measurement discipline

Record the command, tested revision or working-tree state, environment, output, and limitations for each measurement. Earlier successful runs are milestone evidence; they do not verify later edits. Keep RED failures and regression seeds. Do not treat an available control or source module as proof of a complete user journey.

Initial output targets include less than 250 KiB compressed published runtime JavaScript, accessible no-script content, and successful root and nested static mounts. No final Core Web Vitals, frame-rate, or manual accessibility result is established.
