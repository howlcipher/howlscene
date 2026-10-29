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
