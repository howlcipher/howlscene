# ADR 007: Safe text contrast for resolved themes

## Status

Accepted for text foreground resolution. The complete local integrated gate passes; hosted
verification is pending in the review pull request. This is a guard for one color pair,
not a claim that a generated site conforms to WCAG.

## Context

Theme manifests accept valid color syntax but a custom theme can pair its text
foreground with a nearly identical background. The renderer already resolves a
low-contrast accent and presents a warning in the editor. Leaving body text
unreadable weakens the same safety boundary. WCAG 2.2 SC 1.4.3 sets a 4.5:1
minimum contrast ratio for ordinary text at AA, with exceptions such as large
text and incidental text ([W3C specification](https://www.w3.org/TR/WCAG22/#contrast-minimum)).

## Options

| Option                                                                   | Benefit                                                                        | Cost                                                                            |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------- |
| Reject theme manifests with low foreground contrast                      | Guarantees only resolvable foreground/background pairs reach rendering         | Prevents opening or previewing legacy projects and gives no accessible fallback |
| Keep the chosen colors without warning                                   | Preserves visual intent exactly                                                | Can make primary content unreadable                                             |
| Resolve an accessible foreground while preserving the saved theme values | Keeps content readable, preserves editing intent, and supports a clear warning | The displayed text color can differ from a custom theme's requested color       |

## Decision

During `resolveTheme`, if foreground/background contrast is below 4.5:1, display
whichever of opaque black or white has the higher contrast against the opaque
background. Keep the manifest and project data unchanged, and return a warning
that the editor can display. Theme accent resolution continues against the same
background and uses the already resolved foreground as a safe final fallback.
The shared `Site` renderer applies the result to both preview and static export.

This only checks the manifest's flat foreground/background pair. It cannot
measure contrast where text overlaps scenery, gradients, uploaded backgrounds,
images, or user-supplied trusted artwork. Manual contrast and assistive technology
review remain necessary. This does not support custom per-component contrast
roles or arbitrary accessible palettes.

## Verification

Tests use an intentionally low-contrast custom theme and assert a 4.5:1-or-higher
resolved pair, warning, unchanged source data, and identical fallback color in
shared rendering and exported HTML. Existing built-in themes retain their current
colors. Automated contrast checks do not establish WCAG conformance.
