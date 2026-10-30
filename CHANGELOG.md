# Changelog

## Unreleased

### Added

- Phase 0 TypeScript, React, Vite, unit-test, and browser-test scaffolding.
- Validated versioned configuration and a shared semantic React renderer.
- Basic browser text editing with a live preview and three initial theme appearances.
- Browser-generated static ZIP containing HTML, CSS, and publishing instructions.
- Initial architecture, contribution, security, and beginner documentation.
- Portable rich text, Lexical controls, guided section editing, bounded history, local draft storage, image normalization, and project backup implementation.
- Original inline SVG/CSS scenery for three themes and progressive motion work.
- Theme and section registry developer APIs, separate package-consumer verification tooling, and CI/license audit scaffolding.
- Browser publishing instructions based on official GitHub Pages and Cloudflare Pages documentation.
- Validated creator overrides for card appearance, navigation link style, and phone navigation layout.
- Deterministic image-rich static-export visual checks across all three themes and representative viewports.
- Browser coverage for maximum theme presentation tokens under 200% root text sizing at 320 CSS pixels.
- End-to-end verification for compatible section layouts across editor preview, local draft reload, phone reflow, and static export.
- A fail-closed GitHub Pages artifact workflow with project-path production checks and a manual, independently approved deployment gate; Pages remains unconfigured.
- Administrator instructions and ADR for the Pages approval gate and the required repository safeguards.
- Protected `main` with pull-request-only updates and the up-to-date `verify` check enforced for admins.
- Added a validated theme-owned section-heading treatment enum with shared preview/export rendering and reviewed visual updates for Ink Wash and Cyberpunk.
- Added an opaque theme-colored copy surface for sections with uploaded background images, with preview and nested no-script export contrast coverage.
- Added a five-step beginner guide with back/next controls, skip and reopen actions, and clear local-save, backup, and publishing explanations.
- Placed all standard section copy on resolved theme-colored surfaces so layered scenery and uploaded backgrounds cannot reduce measured text contrast in preview or static export.
- Use the resolved theme accent for website focus outlines so creator-selected colors retain a visible keyboard indicator in preview and exported sites.
- Check exported-site keyboard focus contrast in Chromium, Firefox, and WebKit with JavaScript disabled.
- Register trusted custom layout renderers with validated section compatibility, shared preview/export slots, and portable backup references.

### Fixed

- Pinned exported-site visual fixtures now override inline theme fonts and verify the loaded, computed font to prevent host-dependent screenshot layout.

### Limitations

- This is not a v1 release. Human usability, assistive-technology review, broader visual acceptance and public deployment remain unfinished; the Pages workflow is prepared but not activated.
- Independent core/export package consumption and configured coverage gates have passed locally; final results are recorded in milestone evidence.
- Test counts and final acceptance status belong in current milestone evidence rather than this change history.
