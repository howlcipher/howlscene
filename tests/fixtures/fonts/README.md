# Test-only visual font fixtures

These six complete, unmodified TTF files pin visual-test typography across Linux environments. They are loaded only by `tests/e2e/visual.spec.ts`; no product source, exporter, package build or production stylesheet imports them. CSS family aliases distinguish test loading and do not modify internal font names. The font files retain their original licenses, separate from HowlScene's MIT code license. No subsetting or format conversion was performed.

## Why these fonts

On 2026-10-28, Chromium's `CSS.getPlatformFontsForNode` reported the fonts actually used in the reviewed local screenshots:

- Ink Wash: Liberation Serif, regular and bold.
- Cyberpunk: DejaVu Sans Mono, regular and bold.
- Modern Professional: Noto Sans, regular and bold.

Host `fc-match` gave different answers for Georgia and monospace. The `node` command enters the local `devbox` container, whose Chromium resolves fonts from both container font directories and host fonts mirrored into `/usr/local/share/fonts`. Therefore host `fc-match` is not evidence of actual browser glyph selection. The fixture choices follow Chromium's observed font selection.

CI run `40798291185` failed visual comparisons while functional browser tests passed. Reviewed Ink Wash actual/expected/diff images showed differences concentrated in glyphs, with scenery and section positions preserved. Before fixture changes, all nine original screenshots passed locally. The fixture solution retains the three typography styles, waits explicitly for both font weights, and leaves screenshot thresholds unchanged.

## Provenance and licenses

- `LiberationSerif-Regular.ttf`, `LiberationSerif-Bold.ttf`: copied unchanged from devbox `/usr/share/fonts/truetype/liberation/`, package `fonts-liberation 1:2.1.5-3build1`. Upstream: <https://github.com/liberationfonts/liberation-fonts>. SIL Open Font License 1.1; copyright and license copied from the installed package into `Liberation-LICENSE.txt`. Reserved Font Names are retained only in unmodified original font files.
- `DejaVuSansMono.ttf`, `DejaVuSansMono-Bold.ttf`: copied unchanged from devbox `/usr/share/fonts/truetype/dejavu/`, package `fonts-dejavu-core 2.37-8build1`. Upstream: <https://dejavu-fonts.github.io/>. Bitstream Vera license, with DejaVu changes in the public domain. Installed package copyright and permission notices are preserved in `DejaVu-LICENSE.txt`. The Debian packaging license section concerns packaging files, which are not included here.
- `NotoSans-Regular.ttf`, `NotoSans-Bold.ttf`: copied unchanged from devbox `/usr/local/share/fonts/google-noto/`, mirrored from host `/usr/share/fonts/google-noto/`, package `google-noto-sans-fonts 20251201-2.fc44`. Embedded copyright: 2022 The Noto Project Authors, <https://github.com/notofonts/latin-greek-cyrillic>. Embedded license: SIL Open Font License 1.1. Copyright and the complete OFL text are preserved in `Noto-LICENSE.txt`; `OFL-1.1.txt` preserves the locally installed full OFL notice used as the license text source.

SHA-256 hashes:

```text
2d67eed9b325ee2e69f906ce4f3f6264d5105230a13352c8494daad4f17b12c8  DejaVuSansMono-Bold.ttf
a54dca07c76d6289e717e75e0a58c0128f6d7269ef3faf76417c9d7d3bba37ab  DejaVuSansMono.ttf
bb033fae52dcbf67a55494a08829aaa788324624d72a195af7f93da3061c928f  LiberationSerif-Bold.ttf
350f4ffd773cae53560c63dca3d89a5070595614fde12f772bf43feb63d81064  LiberationSerif-Regular.ttf
1df075a380fc7cb898acf64c1f7b3b4dd780de3caa860178bf929de35817a913  NotoSans-Bold.ttf
478c558ea716033cd60c03438f628dfa75694dcf6b5f6d505a2f05fd2b4f3823  NotoSans-Regular.ttf
```
