import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import JSZip from "jszip";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";

test("Phase 0: edit, download, extract and serve at root and nested paths without JS", async ({
  page,
  browser,
}) => {
  await page.goto("/editor/");
  await page.getByLabel("Website title").fill("Taylor’s studio");
  await page.getByLabel("Edit heading").fill("Made with care");
  await expect(
    page.getByRole("heading", { name: "Made with care" }),
  ).toBeVisible();
  const downloadEvent = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download my website" }).click();
  const download = await downloadEvent;
  const path = await download.path();
  expect(path).toBeTruthy();
  const zip = await JSZip.loadAsync(await readFile(path!));
  const files = new Map<string, Buffer>();
  for (const [name, entry] of Object.entries(zip.files))
    if (!entry.dir) files.set(name, await entry.async("nodebuffer"));
  let mount = "/";
  const server = createServer((req, res) => {
    const pathname = new URL(req.url ?? "/", "http://localhost").pathname;
    const relative = pathname.startsWith(mount)
      ? pathname.slice(mount.length)
      : "INVALID";
    const name = relative === "" ? "index.html" : relative;
    const file = files.get(name);
    res.writeHead(file ? 200 : 404, {
      "Content-Type": name.endsWith(".css") ? "text/css" : "text/html",
    });
    res.end(file ?? "Missing");
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  try {
    const address = server.address();
    if (!address || typeof address === "string") throw Error("No server");
    for (const javaScriptEnabled of [true, false]) {
      const context = await browser.newContext({ javaScriptEnabled });
      const exported = await context.newPage();
      for (const base of ["/", "/example-site/", "/howlscene/project/"]) {
        mount = base;
        const responses: number[] = [];
        const requested: string[] = [];
        exported.on("request", (r) => requested.push(r.url()));
        exported.on("response", (r) => responses.push(r.status()));
        await exported.goto(`http://127.0.0.1:${address.port}${base}`);
        await expect(exported).toHaveTitle("Taylor’s studio");
        await expect(
          exported.getByRole("heading", { name: "Made with care" }),
        ).toBeVisible();
        await exported
          .getByRole("link", { name: "Made with care", exact: true })
          .click();
        await expect(exported).toHaveURL(/#intro$/);
        expect(responses.every((s) => s === 200)).toBe(true);
        expect(requested).toContain(
          `http://127.0.0.1:${address.port}${base}site.css`,
        );
        expect(
          await exported
            .locator(".howlscene")
            .evaluate((el) => getComputedStyle(el).backgroundColor),
        ).toBe("rgb(244, 245, 247)");
        expect(
          await exported
            .locator("[id]")
            .evaluateAll((els) => new Set(els.map((el) => el.id)).size),
        ).toBe(await exported.locator("[id]").count());
        if (javaScriptEnabled)
          expect(
            (await new AxeBuilder({ page: exported }).analyze()).violations,
          ).toEqual([]);
      }
      await context.close();
    }
  } finally {
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
  }
});

test("editor prevents introduction overflow before export", async ({
  page,
}) => {
  await page.goto("/editor/");
  await expect(page.getByLabel("Edit introduction")).toHaveAttribute(
    "maxlength",
    "30000",
  );
});
