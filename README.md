# HowlScene

HowlScene is an early implementation of an open-source website builder and reusable React rendering engine. The intended v1 combines guided editing, portable projects, cinematic themes, and complete static website export.

**Status: development preview. Not ready for public production use.** The guided
editor, shared renderer, three themes, local drafts, portable backups and static
ZIP export work together in automated browser journeys. Human usability and
assistive-technology review, hosted CI and deployment remain release gates.

## Current scope

| Capability                                                           | Status                                                                       |
| -------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Shared renderer, validated configuration, meaningful static HTML/ZIP | Implemented and exercised at root/nested paths, JavaScript on/off            |
| Lexical rich text and portable formatting                            | Implemented with round-trip and browser coverage                             |
| Sections, layouts, visibility, ordering, Undo/Redo                   | Implemented and exercised in the complete journey                            |
| Responsive uploaded images and alt text                              | Implemented, persisted, backed up and exported in browser tests              |
| IndexedDB drafts and project backups                                 | Implemented; failure feedback, async races and competing tabs covered        |
| Desktop/tablet/phone previews                                        | Implemented; responsive and screenshot coverage                              |
| Ink Wash, Cyberpunk, Modern Professional                             | Original layered scenery; automated comparisons, partial visual review       |
| Motion presets, entry/exit, parallax and reduced motion              | Implemented with lifecycle and browser regression coverage                   |
| Independent core and export packages                                 | Built tarballs installed in a separate typed browser consumer                |
| William Elias example                                                | Shared-engine consumer with theme switching and public-source provenance     |
| GitHub Pages workflow                                                | Hosted artifact check passed; Pages and reviewer environments not configured |
| Public deployment and v1 release                                     | Not completed; no live deployment claimed                                    |

Read [the progress journal](PROGRESS.md) for current work, [acceptance traceability](docs/experiment/acceptance.md), and [measurement scope](docs/experiment/metrics.md). The [experiment baseline](docs/experiment/baseline.md) covers this conventional implementation only; the reference video is missing.

## Run locally

Use a supported Node.js version compatible with the locked toolchain, then run:

```sh
npm ci
npx playwright install chromium
npm run dev
```

Open the local address printed by Vite. This setup requires development tools; the user-facing hosted editor is not deployed yet.

```sh
npm run check
```

This runs the checks currently defined in the package scripts. Full release verification also includes coverage, independent SDK consumption, dependency/license audits, extracted-site deployment checks, and human accessibility/usability review. See [measurement commands](docs/experiment/metrics.md). Coverage results are recorded with each tested snapshot; automated checks do not establish WCAG conformance.

## Try the prototype

Change the title, heading, and introduction. Select a theme, then choose **Download my website**. Extract the ZIP and upload all extracted files to a static host. See [getting started](docs/users/getting_started.md) and [publishing](docs/users/publishing.md).

The editor attempts to save drafts in this browser and reports save status. Storage can fail or be cleared. Use **Save project backup** to keep an editable copy. **Download my website** creates a separate published artifact.

## Architecture

`packages/core` owns validated configuration and semantic rendering. Theme manifests select safe shared treatments for cards, navigation, and section headings. Copy in sections with uploaded background images sits on an opaque theme-colored surface for predictable contrast in preview and export. `packages/export` validates input and creates static output using the same renderer. `apps/editor` owns browser controls. The exporter does not depend on editor state or components.

Read [the static export decision](docs/architecture/adr_001_static_export.md) for alternatives and limitations. The original portfolio remains outside this project and read-only. A verified HowlScene demonstration is still an open release gate.

The repository includes a pull-request artifact build and a manually dispatched
GitHub Pages workflow. Public deployment is disabled until an administrator
sets up the two protected reviewer environments, the `github-pages` deployment
environment, and enables the documented repository variable. See the [Pages deployment guide](docs/developers/github_pages_deployment.md)
and [deployment decision](docs/architecture/adr_012_github_pages_release_gate.md).

## Contributing and licensing

Read [CONTRIBUTING.md](CONTRIBUTING.md) and [SECURITY.md](SECURITY.md). Original code is licensed under [MIT](LICENSE). Dependency and asset redistribution review remains a release gate. This repository does not claim exclusive rights to the HowlScene name.

## Developer guides

See [configuration and extension contracts](docs/developers/contracts.md), [custom section registration](docs/developers/custom_sections.md), [package consumption](docs/developers/sdk.md), and [motion](docs/developers/motion.md). Custom themes and section renderers are trusted developer integrations; they do not require editor internals. Public API and export limitations remain documented development boundaries.
