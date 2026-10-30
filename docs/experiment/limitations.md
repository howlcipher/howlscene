# Known limitations and open gates

HowlScene remains a development preview. A passing automated snapshot does not
establish public v1 readiness.

- Review found an export image filename collision and heading-context defects.
  Both are corrected with regressions; the final local gate passes. Wider review
  remains required before a v1 release.
- Browser automation covers the complete create/edit/restore/backup/export/static
  serving journey, keyboard editing, reduced motion, save failures, competing
  tabs, and serious/critical automated accessibility checks on actual exported
  theme ZIPs at phone and desktop widths. Exported long text and project cards
  also reflow at 200% root text sizing and 320 CSS pixels with JavaScript
  disabled. This does not simulate browser zoom or replace nontechnical
  usability, screen-reader, or human composition review.
- Nine deterministic preview screenshots and nine image-rich/long-form exported
  screenshots pass comparisons across the three themes and 375/768/1440 px
  viewports. Representative exported captures have been visually inspected for
  readable text, theme distinction and composition. This does not replace human
  accessibility or user review.
- The editor timing probe uses a development server. `PERF-LAB-001` separately
  serves an actual static ZIP at a nested path with Chromium CPU/network
  emulation and records loading, image, motion and runtime observations. Both
  are lab tests: neither establishes physical-device performance, field Core
  Web Vitals, or a 60 FPS guarantee. Older hardware, thermal/GPU effects and
  real-network variability remain unmeasured.
- The independent core and export packages install and render from tarballs.
  Public npm publication has not occurred.
- Hosted CI passed for checkpoint `ce06f23`:
  [executed run](https://github.com/howlcipher/howlscene/actions/runs/40878831459).
  The theme-layer increment also passed hosted run `40884610329`.
  Bounded presentation passed hosted run `40887036736`; theme motion passed hosted
  run `40889458958`; image-rich export visuals and corrected pinned-font fixtures
  passed hosted run `40956127243` after PR #13 merged as `6efd87b`. GitHub Pages
  is not configured and no live deployment is claimed.
- The experiment reference video is unavailable, so reference fidelity cannot be
  scored. No comparison with the independent implementation is claimed.
- GitHub Pages is not configured and no Actions environments or repository
  enable variable exist. `main` now requires pull requests and the up-to-date
  `verify` check, with the rule enforced for admins. The artifact workflow passed
  hosted PR verification, but no public URL exists. Deployment requires two
  independently approved protected environments; do not set the repository
  variable until those controls and the Pages source are verified.
- Theme manifests declare validated layers referencing trusted, immutable
  artwork registries. Preview and export share that contract. External image-layer
  collection and broader component styling remain required. Bounded navigation
  and section-heading treatments are available; responsive and accessibility
  manifest controls remain incomplete. The integrated gate passes after
  correcting an aggregate asset-validation ordering weakness.
- Theme presentation currently has four bounded numeric CSS settings and a
  closed section-heading treatment enum. Maximum line-height, card gap/radius,
  and navigation gap pass automated 200% root text-size reflow at 320 CSS px in
  all three themes with long copy and no tested horizontal overflow. This does
  not simulate browser zoom fully or replace a human zoom review. Broader
  responsive/accessibility/motion contracts remain required v1 work.
- Standard section introductions use opaque panels with the resolved theme
  colors; repeated cards keep their own theme-colored backgrounds, and timelines
  and call-to-action links have flat surfaces. This keeps layered scenery and
  uploaded images from affecting text contrast in preview and static export.
  Artwork is concealed beneath text surfaces, and automated checks do not replace
  human review of contrast, composition, zoom, or assistive-technology behavior.
- Website keyboard-focus outlines use the resolved accent and are tested at 3:1
  against the flat site background. Custom developer-rendered controls placed
  over other surfaces need separate review; this is not a WCAG conformance claim.
- Custom section renderers can now register new safe type IDs while reusing the
  portable section content fields. Arbitrary custom payload schemas, adding
  those types to the standard no-code editor chooser, and arbitrary layout-ID
  registration remain unsupported; the contract is narrower than full plugin
  or CMS behavior.
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

- Navigation and card treatments are available as closed theme defaults and
  creator overrides; section headings have a theme-owned closed treatment enum.
  These settings use shared CSS. Other section-component styling remains shared
  and cannot yet be customized independently.

- Card presentation supports outlined, soft, and accent-glow variants for shared
  cards and gallery figures. Other section-component styling remains shared and
  cannot yet be customized by themes.

- The responsive theme contract and creator override offer only `wrap` or
  `stack` at the fixed shared breakpoint. Arbitrary per-theme breakpoints and
  broader responsive component rules are not supported.

- Text contrast resolution checks flat theme foreground/background and accent
  colors. Standard scene content uses the resolved colors on a flat surface;
  trusted developer renderers can change that presentation and must be reviewed
  independently. This check alone does not establish WCAG conformance.

- Foreground contrast fallback checks the flat theme foreground/background pair
  only. Standard section copy is isolated from underlying scenery and media by
  the opaque surface. Custom renderer behavior still needs review; this is not a
  WCAG conformance determination.

- The editor's flat background/text/accent color overrides are validated and
  contrast-resolved. Standard section copy uses those resolved colors on an
  opaque surface; custom developer-rendered content is outside that guarantee.
  No WCAG conformance claim follows.

- The focused static-export compatibility journey passes in Chromium, Firefox
  and WebKit in the pinned Playwright container. Direct WebKit launch on the
  Bazzite host lacks GTK/WebKit libraries, so local validation uses the
  container. Hosted run `40963619832` verified the updated workflow. Cross-engine
  visual and human platform review remain open.
