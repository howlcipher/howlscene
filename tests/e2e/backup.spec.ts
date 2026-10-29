import { test, expect } from "@playwright/test";

test("AST-002 AST-004 browser backup validation decodes images before accepting imports", async ({
  page,
}) => {
  await page.goto("/");
  const results = await page.evaluate(async () => {
    const path = "/packages/export/src/backup.ts";
    const { serializeBackup, importValidatedBackup } = await import(path);
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    const asset = {
      id: "asset-test",
      mime: "image/png",
      data: canvas.toDataURL("image/png"),
      alt: "Test image",
    };
    const site = {
      schemaVersion: 1,
      title: "Imported site",
      assets: [asset],
      sections: [
        {
          id: "intro",
          type: "hero",
          heading: "Imported heading",
          image: asset.id,
        },
      ],
    };
    const valid = await importValidatedBackup(serializeBackup(site));
    const failures: string[] = [];
    canvas.width = 8193;
    for (const data of [
      "data:image/png;base64,iVBORw0KGgo=",
      canvas.toDataURL("image/png"),
    ]) {
      try {
        await importValidatedBackup(
          serializeBackup({ ...site, assets: [{ ...asset, data }] }),
        );
        failures.push("accepted");
      } catch (error) {
        failures.push(error instanceof Error ? error.message : "unknown");
      }
    }
    return { title: valid.title, failures };
  });
  expect(results.title).toBe("Imported site");
  expect(results.failures[0]).toMatch(/header.*corrupt|image.*opened/i);
  expect(results.failures[1]).toMatch(/dimensions/i);
});
