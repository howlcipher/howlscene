import { expect, it } from "vitest";
import JSZip from "jszip";
import {
  createSectionRegistry,
  createThemeRegistry,
  parseSite,
  starterSite,
  themes,
} from "../packages/core/src/index";
import { exportWebsite } from "../packages/export/src/index";
import {
  serializeBackup,
  importBackup,
  importValidatedBackup,
} from "../packages/export/src/backup";
const registry = createThemeRegistry({
  forest: { ...themes.ink, name: "Forest", accent: "#123456" },
});
const site = parseSite({ ...starterSite, theme: "forest" }, registry);
it("custom developer themes and trusted section renderers export through the same registries", async () => {
  const sections = createSectionRegistry({
    hero: () => (
      <article>
        <h3>Custom forest content</h3>
      </article>
    ),
  });
  const zip = await JSZip.loadAsync(
    await exportWebsite(site, {
      themeRegistry: registry,
      sectionRegistry: sections,
    }),
  );
  const html = await zip.file("index.html")!.async("string");
  expect(html).toContain("Custom forest content");
  expect(html).toContain("--scene-accent:#123456");
  expect(html).toContain('data-theme="forest"');
  expect(html).toContain("scenery-orbit");
  expect(html).not.toContain("<script");
  await expect(exportWebsite(site)).rejects.toThrow(/theme|register/i);
});
it("custom theme project backups round trip only when their registry is supplied", async () => {
  const backup = serializeBackup(site, registry);
  expect(importBackup(backup, registry)).toEqual(site);
  await expect(importValidatedBackup(backup, registry)).resolves.toEqual(site);
  expect(() => importBackup(backup)).toThrow(/theme|register/i);
  expect(() => serializeBackup(site)).toThrow(/theme|register/i);
});
