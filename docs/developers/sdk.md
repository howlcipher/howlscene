# Use HowlScene in another application

`@howlscene/core` provides validated configuration, semantic rendering, portable rich text, theme/section registries, theme resolution, and motion parameters. `@howlscene/export` provides static ZIP export and editable backups. Neither package requires private editor components. Both are development packages prepared for local distribution; no npm publication is claimed.

## Build and install artifacts

From this repository:

```sh
npm ci
npm run build:sdk
npm run build:export
npm pack ./packages/core
npm pack ./packages/export
```

In a separate React application, install the generated archives, using their actual paths:

```sh
npm install /path/to/howlscene-core-0.1.0.tgz /path/to/howlscene-export-0.1.0.tgz react react-dom
```

The packages use ESM and TypeScript declarations. Load `@howlscene/core/styles.css` through your bundler. React is a peer dependency of core; export also requires React DOM. Consult package manifests for supported versions and ordinary dependencies. No CommonJS distribution is provided.

## Render and export the same custom configuration

```tsx
import {
  Site,
  parseSite,
  starterSite,
  themes,
  createThemeRegistry,
  createSectionRegistry,
} from "@howlscene/core";
import {
  exportWebsite,
  serializeBackup,
  importBackup,
} from "@howlscene/export";
import "@howlscene/core/styles.css";

const themeRegistry = createThemeRegistry({
  forest: { ...themes.ink, name: "Forest", accent: "#315b3f" },
});
const sectionRegistry = createSectionRegistry({
  projects: ({ section }) => (
    <div>
      {section.entries.map((entry) => (
        <article key={entry.id}>
          <h3>{entry.title}</h3>
          <p>{entry.body}</p>
        </article>
      ))}
    </div>
  ),
});
const site = parseSite({ ...starterSite, theme: "forest" }, themeRegistry);

export function Portfolio() {
  return (
    <Site
      site={site}
      themeRegistry={themeRegistry}
      sectionRegistry={sectionRegistry}
    />
  );
}

export async function makeDownload() {
  return exportWebsite(site, { themeRegistry, sectionRegistry });
}
const backup = serializeBackup(site, themeRegistry);
const restored = importBackup(backup, themeRegistry);
```

`exportWebsite` returns ZIP bytes. Your application owns download UI and any object URL cleanup. Its export options use the same trusted registries as preview; rendering custom components on a static export must not depend on browser-only globals or effects. Unknown scenery names receive the Modern illustration fallback. Registered custom-layout CSS is included with the renderer. External resources, arbitrary component CSS, and module assets are not discovered or bundled automatically.

For a custom layout component, pass one `createLayoutRegistry` result to
`parseSite`, `Site`, `exportWebsite`, and backup serialization/import. See the
[custom layout guide](custom_layouts.md) for a complete typed example.

Without an explicit registry, export and backup functions support bundled themes. A backup records theme identity and content, not executable component code or a registry implementation. Reopening a custom-theme backup therefore requires the same compatible registry. The standard editor uses built-in registries and safely rejects unsupported themes.

`importBackup` validates portable structure. In a browser, use `importValidatedBackup(text, themeRegistry)` before replacing a project so encoded images are also decoded and checked. Node export validates encoded image headers; browser export additionally decodes images. Do not infer full pixel validity from headers alone.

## Public contracts

Use `parseSite` before rendering untrusted data and handle errors without replacing the current valid project. `resolveTheme` validates overrides and provides resolved tokens plus readability warnings without changing saved preferences. `createSectionRegistry` overrides the ten supported section types; it does not register arbitrary schema discriminators. See [configuration and extension contracts](contracts.md) and [motion](motion.md) for limits and lifecycle requirements.

## Verify distribution consumption

```sh
npm run sdk:check
```

This command builds core and export artifacts and runs the external-consumer script. The script packs both packages, installs their tarballs outside the workspace, checks declaration resolution and public imports, renders configured content, and builds a clean browser consumer with CSS and export integration. It removes temporary files afterward; installing dependencies requires registry access.

Consult current script output and [experiment measurements](../experiment/metrics.md) for actual results. Package consumption checks do not replace exported-site browser tests, accessibility review, or performance measurement. The custom-registry export and backup contract also has focused unit coverage in `tests/custom_export.test.tsx`.
