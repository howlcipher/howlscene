# ADR 010: Targeted browser coverage for static exports

## Status

Accepted for a focused compatibility gate. Chromium, Firefox and WebKit pass in
the pinned Playwright container. Direct WebKit launch on the Bazzite host is
unavailable because its GTK/WebKit system libraries are absent; hosted CI must
verify the updated workflow before this increment is merged.

## Context

The editor, unit suite and screenshot baselines run in Chromium. Static HTML is
a release-critical output and should not depend on the editor's JavaScript
runtime. Its semantic content, image paths, responsive section layout and
anchors should be checked in more than one browser engine.

## Options considered

| Option                                                 | Benefits                                                     | Costs                                                                                   |
| ------------------------------------------------------ | ------------------------------------------------------------ | --------------------------------------------------------------------------------------- |
| Keep all browser checks in Chromium                    | Fastest local and hosted runs; one stable visual baseline    | Does not detect browser-engine differences in static export                             |
| Run the complete suite in Chromium, Firefox and WebKit | Broad interaction coverage in every engine                   | Multiplies runtime and duplicates screenshots whose rasterization is expected to differ |
| Run one export-focused scenario in all three engines   | Checks the high-risk published artifact with bounded CI cost | Does not establish full editor compatibility or cross-engine visual fidelity            |

## Decision

Keep the full editor and screenshot suite in Chromium. Run
`EXP-PLATFORM-001` in Chromium, Firefox and WebKit against an actual ZIP created
by the browser editor. The test serves it beneath a nested path with JavaScript
disabled and checks all three bundled themes, image decoding and alt text,
long-form text, desktop/phone image placement, anchors and horizontal overflow.
The browser versions follow the locked Playwright package; CI installs each
engine and its host dependencies using Playwright's documented CI workflow:
[browser installation](https://playwright.dev/docs/browsers) and
[CI setup](https://playwright.dev/docs/ci).

The existing Chromium project stays unnamed and leaves `browserName` at its
default so the established screenshot snapshot paths do not change. The three
additional projects are named and match only the export compatibility test.

This is a functional rendering compatibility check. It does not claim a human
visual review in Firefox or WebKit, complete platform support, WCAG conformance,
or support for every browser version.
