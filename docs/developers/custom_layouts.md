# Register a custom layout

Compatible React applications can register trusted layout components without
changing HowlScene core. A project stores only the registered layout ID. The
same component renders in the preview and in static HTML generated for a
website ZIP.

```tsx
import {
  createLayoutRegistry,
  parseSite,
  Site,
  starterSite,
  themes,
  type LayoutRendererProps,
} from "@howlscene/core";
import {
  exportWebsite,
  importBackup,
  serializeBackup,
} from "@howlscene/export";
import "@howlscene/core/styles.css";

function FeatureFrame({
  section,
  intro,
  image,
  body,
  entries,
  cta,
}: LayoutRendererProps) {
  return (
    <article className="feature-frame" data-layout-section={section.id}>
      {intro}
      {image}
      <div className="feature-frame-copy">{body}</div>
      {entries}
      {cta}
    </article>
  );
}

const layoutRegistry = createLayoutRegistry([
  {
    id: "feature-frame",
    sectionTypes: ["hero", "custom"],
    renderer: FeatureFrame,
    styles:
      ".layout-feature-frame .feature-frame { display: grid; grid-template-columns: 1fr 1fr; }",
  },
]);
const site = parseSite(
  {
    ...starterSite,
    sections: [{ ...starterSite.sections[0], layout: "feature-frame" }],
  },
  themes,
  undefined,
  layoutRegistry,
);

export function Preview() {
  return <Site site={site} layoutRegistry={layoutRegistry} />;
}

export const websiteZip = await exportWebsite(site, { layoutRegistry });
const backup = serializeBackup(site, themes, undefined, layoutRegistry);
const restored = importBackup(backup, themes, undefined, layoutRegistry);
```

`LayoutRendererProps` contains the validated section and the semantic `intro`,
`image`, `body`, `entries`, and `cta` nodes. Preserve the slots your section
uses, including its `h1` or `h2`, and keep keyboard focus visible. Render
synchronously without browser globals, network requests or effects so preview
and static HTML agree.

The `sectionTypes` list must be nonempty and contain unique built-in section
types or `custom`. A site that references an unknown layout or an incompatible
section fails validation. All built-in section/layout pairs accepted by the
v1 schema remain valid for compatibility; the regular editor continues to
show only the combinations in `sectionDefinitions`.

Optional `styles` are trusted developer CSS. They are included in the preview
and exported HTML only while that custom layout is used. Each value is limited
to 50,000 characters and rejects `@import`, `url(...)`, and closing style tags.
Scope selectors under `.layout-<id>`. The layout registry is executable
application code, not project data: never construct it from an imported backup.
Backups store layout IDs and require the same compatible registry on restore.

This API does not add custom layout choices to the standard no-code editor.
Custom editor forms, arbitrary section payloads and plugin loading remain out
of scope. See [ADR 017](../architecture/adr_017_trusted_layout_renderers.md)
and the [developer contracts](contracts.md).
