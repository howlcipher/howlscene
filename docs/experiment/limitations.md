# Known limitations and open gates

HowlScene remains a development preview. A passing automated snapshot does not
establish public v1 readiness.

- Review found an export image filename collision and heading-context defects.
  Both are corrected with regressions; the final local gate passes. Wider review
  remains required before a v1 release.
- Browser automation covers the complete create/edit/restore/backup/export/static
  serving journey, keyboard editing, reduced motion, save failures and competing
  tabs. It does not replace a human nontechnical usability or screen-reader review.
- Nine deterministic preview screenshots pass comparisons. Mobile images have
  been visually inspected for readable text, theme distinction and composition.
  Broader image-rich/long-form exported visual baselines remain to be completed.
- A local performance probe exists. It uses a development server and one device;
  it does not establish production field Core Web Vitals or a 60 FPS guarantee.
- The independent core and export packages install and render from tarballs.
  Public npm publication has not occurred.
- Hosted CI passed for checkpoint `ce06f23`:
  [executed run](https://github.com/howlcipher/howlscene/actions/runs/40878831459).
  The theme-layer increment also passed hosted run `40884610329`.
  Bounded presentation passed hosted run `40887036736`; theme motion passed hosted
  run `40889458958`. GitHub Pages is not configured and no live deployment is claimed.
  Responsive-navigation hosted verification is pending.
- The experiment reference video is unavailable, so reference fidelity cannot be
  scored. No comparison with the independent implementation is claimed.
- Theme manifests declare validated layers referencing trusted, immutable
  artwork registries. Preview and export share that contract. External image-layer
  collection and broader component styling remain required. A bounded navigation
  link treatment is now available; responsive and accessibility manifest controls
  remain incomplete. The integrated gate passes after correcting an aggregate
  asset-validation ordering weakness.
- Presentation defaults now cover four validated CSS settings. Maximum values
  at narrow widths and increased text zoom remain a verification gap. Broader
  responsive/accessibility/motion contracts remain required v1 work.
- Component registration overrides the ten supported section types. Adding a new
  schema-level section type or arbitrary layout identifier still requires core
  changes; this is narrower than the requested general section-authoring contract.
- Rich text supports paragraphs, two heading ranks, bold, italic, links and
  single-level ordered/unordered lists. Arbitrary HTML and nested lists are not
  supported by the portable model.
- Project backups are limited to 30 MiB. A project with maximum-size media and
  extensive text may exceed the backup budget; export rejects it explicitly.
  Do not treat that rejection as a completed backup.
- Imported image validation uses browser decoding; developer export in Node
  performs header validation without a browser decoder.

Browser-local storage can fail or be cleared. Download editable backups. A
published website ZIP is a separate artifact and cannot be reopened as a project.
Browsers without the required exclusive draft-lock API leave automatic saving
paused and explain that backups are needed.

Excluded v1 scope remains excluded: accounts, cloud synchronization, free-position
canvas, e-commerce, full 3D editor, collaboration and plugin marketplace.
Unfinished required v1 work is not reclassified as excluded scope.

- Theme manifests can scale motion down and disable parallax. These are developer
  manifest options, not yet visual-editor controls; human reduced-motion,
  screen-reader and text-zoom review remains open.

- Navigation treatment is now theme-configurable through a closed manifest enum
  used by shared CSS. The editor does not expose navigation or card treatment settings. Broader
  component styling and responsive manifest rules remain incomplete.

- Card presentation now supports outlined, soft, and accent-glow variants for
  shared cards and gallery figures. Other section-component styling remains
  shared and cannot yet be customized by themes.

- The responsive theme contract currently offers only one mobile navigation
  choice at the fixed shared breakpoint. It does not expose arbitrary per-theme
  breakpoints or broader responsive component rules.
