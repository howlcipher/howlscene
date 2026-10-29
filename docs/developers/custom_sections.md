# Register a custom section

Custom sections let a developer's compatible application add a section kind
without editing HowlScene core. Project imports contain only a safe identifier
and the existing portable section fields; renderer code remains in the trusted
consumer application.

```tsx
import {
  Site,
  createSectionRegistry,
  parseSite,
  starterSite,
  themes,
} from "@howlscene/core";
import {
  exportWebsite,
  importBackup,
  serializeBackup,
} from "@howlscene/export";
import type { SectionRendererProps } from "@howlscene/core";

function Notice({ section }: SectionRendererProps) {
  return <aside className="entry-cards">{section.body}</aside>;
}

const sectionRegistry = createSectionRegistry({}, [
  { id: "notice", renderer: Notice },
]);
const project = parseSite(
  {
    ...starterSite,
    sections: [
      {
        id: "notice",
        type: "custom",
        customType: "notice",
        heading: "Important information",
        body: "The section's text remains ordinary project content.",
      },
    ],
  },
  themes,
  sectionRegistry,
);
const preview = <Site site={project} sectionRegistry={sectionRegistry} />;
const zip = await exportWebsite(project, { sectionRegistry });
const backup = serializeBackup(project, themes, sectionRegistry);
const restored = importBackup(backup, themes, sectionRegistry);
```

IDs must match `^[a-z][a-z0-9-]{0,63}$`, be unique, and not replace a built-in
section type. Imported configurations cannot register renderers. A project that
references an unregistered custom type or a registry entry without a renderer
fails validation instead of silently losing content or rendering an unknown
component. Use the same registry for validation, rendering, website export, and
backup restore.

The outer renderer continues to own the section landmark, heading, navigation,
rich text, section image, and CTA. A custom renderer receives `section`, its
child `headingLevel`, `assetUrl`, and `asset`; resolve media through those
callbacks and preserve semantic heading structure. Render synchronously without
browser globals, network requests, or effects so preview and static HTML agree.

Custom styles and external assets are not inferred from React components by the
exporter. Use the shipped section classes or package the additional CSS/assets
in your own consuming website. This API does not add custom section types to the
standard browser editor or permit arbitrary user-defined data fields.
