# Contributing to HowlScene

HowlScene is in Phase 0. Keep changes focused on verified behavior and preserve the boundary between the engine, editor, and exporter.

## Development workflow

1. Install the locked dependencies with `npm ci`.
2. Define acceptance criteria and write a useful failing test before production behavior.
3. Run it and record the actual RED failure and its cause.
4. Implement the smallest correct change, then refactor.
5. Run `npm run check` after the final implementation change.
6. Update documentation and requirement traceability with actual evidence.

Use `npm run format` to format files. Do not weaken accurate tests, suppress type errors, invent verification results, or regenerate screenshot baselines solely to hide failures. Add focused regression coverage before fixing a confirmed defect.

## Review expectations

Significant abstractions need independent review. Review configuration safety, keyboard behavior, exported HTML, nested deployment paths, dependency boundaries, and user-facing errors. An exported ZIP must be extracted, served, and tested independently; generating a file alone is insufficient.

Keep user content separate from themes. Share semantic rendering between preview and export. Do not add editor imports to the reusable engine. Validate untrusted data before changing an existing project. Avoid unsupported external dependencies and document licenses for bundled assets.

Never modify `howlcipher/william_elias` as part of HowlScene work. Use only appropriate public source material for its future demonstration.

## Release gate

The current check command does not establish v1 readiness. Release requires the complete editor journey, local persistence and backups, all required themes and sections, clean external package consumption, export security, browser and accessibility review, coverage gates, licensing review, and documented performance measurements. Publishing credentials and branch protection are separate operational requirements.
