# Deterministic visual font fixture review

Date: 2026-10-28.

GitHub Actions run [40798291185](https://github.com/howlcipher/howlscene/actions/runs/40798291185) failed visual comparisons across local and CI system-font environments. Its downloaded actual/expected/diff artifacts are retained locally under `.artifacts/ci-font-review/`. Before changing the test, all nine original screenshots passed locally (17.4 seconds).

## Diagnosis and test-only change

Chromium `CSS.getPlatformFontsForNode` identified the local fonts used for title, heading, body and motion control text:

| Theme               | Regular and bold families |
| ------------------- | ------------------------- |
| Ink Wash            | Liberation Serif          |
| Cyberpunk           | DejaVu Sans Mono          |
| Modern Professional | Noto Sans                 |

Host `fc-match` returned different font choices and did not describe the actual Chromium rendering environment. The local `node` wrapper enters devbox; Chromium resolves both container fonts and host fonts mirrored into that container.

The visual test now loads six unchanged TTF fixtures through test-only `@font-face` rules, sets the preview font variable to the matching test alias, and explicitly waits for weights 400 and 700. All six fonts retain complete copyright and license notices. An independent reviewer checked metadata, SHA-256 hashes, provenance and licenses: Liberation and Noto use OFL 1.1; DejaVu uses the Bitstream Vera license with public-domain DejaVu changes. No blocking provenance or redistribution issue was found. See [the fixture provenance](../../tests/fixtures/fonts/README.md).

No product source, production stylesheet, exporter or developer package imports these fixtures. No screenshot comparison threshold was changed.

## Intentional baseline updates

The explicit webfont loading initially differed from all nine existing system-font baselines. These failures were preserved under `.artifacts/font-fixture-review/` before updating anything. The implementing reviewer inspected all nine actual images and diffs. Root independently inspected Ink Wash at 375 px, Cyberpunk at 768 px and Modern Professional at 1440 px. Both reviews found glyph/advance and motion-control width changes, with preserved readable content, line wrapping, scenery and section geometry, and no clipping.

Root then approved replacing exactly these nine baselines with the reviewed actual images:

- `preview-ink-{375,768,1440}-linux.png`
- `preview-cyber-{375,768,1440}-linux.png`
- `preview-modern-{375,768,1440}-linux.png`

Image dimensions match the prior baselines: 375×1001, 768×1001 and 1040×1000 (the latter is the editor preview at a 1440 px viewport). `.artifacts/font-fixture-review/review_dimensions.json` records all nine comparisons. The reviewed actual PNGs were copied directly to the expected snapshot files; no blanket update command was used.

## Verification

Normal comparison, with no update flag:

```sh
env -u NO_COLOR node node_modules/@playwright/test/cli.js test tests/e2e/visual.spec.ts --output .artifacts/font-fixture-verify
```

Result: **9 passed, 0 failed, 17.9 seconds**. Scoped ESLint and global TypeScript checks also passed for the fixture implementation.

This verifies the local deterministic fixture run. A subsequent remote Ubuntu CI run is still required; no Ubuntu pass or cross-platform rendering guarantee is claimed here.

## Follow-up: align the preview's raster origin (2026-10-29)

[CI run 40800029407](https://github.com/howlcipher/howlscene/actions/runs/40800029407) passed all three desktop snapshots but still failed the six mobile/tablet snapshots. Self-contained fonts removed font substitution, but the preview remained below the editor controls at these widths. Native control and editor text metrics differed across environments, changing the preview's fractional document position.

A controlled local Ink Wash experiment at 375 px measured:

| Parent editor font  | Preview document Y | Preview viewport Y after screenshot scrolling |
| ------------------- | ------------------ | --------------------------------------------- |
| Default system font | 3393.625           | -0.375                                        |
| Arial               | 3167.875           | -0.125                                        |

The natural preview size was 375×1000 in both cases. The screenshot rounded the fractional bounds outward, capturing 375×1001 pixels and rasterizing text at different subpixel offsets. A CSS translation to an integer box was investigated and rejected because it retained different compositor rasterization.

The test now measures the live preview's existing width and natural height, positions that same element at fixed viewport coordinates `(0, 0)`, and asserts that its measured width and height remain unchanged. The editor workflow and the shared renderer remain real application code; only the theme screenshot's capture origin changes. Responsive editor layout remains covered by separate browser tests.

With fixed positioning, the default-system-font and Arial-parent-font captures were **pixel-identical** (`PIL.ImageChops.difference(...).getbbox()` returned `None`). Both boxes were `(x=0, y=0, width=375, height=1000)`. Coordinate records and PNGs are retained in `.artifacts/ci-third-investigation/coordinates.json`, `fixed-coordinates.json`, `ink375-fixed-normal.png` and `ink375-fixed-arial.png`.

Before any further baseline updates, a normal comparison passed the three desktop images unchanged and failed only the six mobile/tablet images. Those six actuals and diffs were reviewed visually: readable content, line wrapping, scenery and natural layout remained intact; the capture lost the extra fractional-crop row and aligned text/edge rasterization to the integer origin. Root independently reviewed Ink Wash 375 px and Modern Professional 768 px, then approved the correction. Exactly the six reviewed 375 px and 768 px actual PNGs were copied to their expected files. All three desktop baseline files were left untouched. Comparison thresholds remain unchanged.

The six review artifact sets are retained under `.artifacts/ci-third-investigation/visual-origin/`. Verification after the approved copies uses a normal comparison without update flags, with output under `.artifacts/ci-third-investigation/verify-origin/`. The result is recorded below. Remote Ubuntu verification is still required; this evidence does not claim a subsequent Ubuntu pass.

Normal post-correction command:

```sh
env -u NO_COLOR node node_modules/@playwright/test/cli.js test tests/e2e/visual.spec.ts --output .artifacts/ci-third-investigation/verify-origin
```

Result: **9 passed, 0 failed, 17.8 seconds**. Scoped ESLint and global TypeScript checks passed after the origin fixture implementation. No remote Ubuntu result has yet been observed for this correction.
