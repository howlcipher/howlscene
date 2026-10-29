import { test, expect, type Page } from "@playwright/test";
import JSZip from "jszip";
import { readFile } from "node:fs/promises";
import { createServer } from "node:http";

async function presentation(page: Page) {
  return page.locator(".howlscene").evaluate((site) => {
    const paragraph = site.querySelector(".scene p:not(.eyebrow)");
    const cards = site.querySelector(".entry-cards");
    const card = site.querySelector(".entry-cards article");
    const navigation = site.querySelector(".site-header nav");
    if (!paragraph || !cards || !card || !navigation)
      throw Error("Missing presentation fixture content");
    const body = getComputedStyle(paragraph);
    return {
      lineHeight: Number(
        (
          Number.parseFloat(body.lineHeight) / Number.parseFloat(body.fontSize)
        ).toFixed(6),
      ),
      cardGap: getComputedStyle(cards).gap,
      cardRadius: getComputedStyle(card).borderRadius,
      navigationGap: getComputedStyle(navigation).gap,
    };
  });
}
const custom = {
  lineHeight: 2,
  cardGap: "40px",
  cardRadius: "24px",
  navigationGap: "32px",
};
test("THM-PRES-001 manifest presentation affects preview and nested no-script export without changing content", async ({
  page,
  browser,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/tests/fixtures/presentation.html");
  await expect(
    page.getByRole("heading", { name: "A considered portfolio" }),
  ).toBeVisible();
  expect(await presentation(page)).toEqual(custom);
  const site = page.locator(".howlscene");
  await expect(site).toHaveAttribute("data-motion-enabled", "true");
  await expect(site).toHaveAttribute("data-theme-motion-intensity", "0.35");
  await expect(site).toHaveAttribute("data-theme-motion-speed", "1.8");
  await expect(site).toHaveAttribute("data-theme-parallax", "false");
  await page.evaluate(() => window.scrollTo(0, 100));
  expect(
    await site
      .locator(".scenery-layer")
      .first()
      .evaluate((el) => (el as SVGElement).style.transform),
  ).toBe("");
  await page.getByLabel("Fixture theme").selectOption("baseline");
  await expect(site).toHaveAttribute("data-motion-enabled", "true");
  await page.evaluate(() => window.scrollTo(0, 100));
  await expect
    .poll(() =>
      site
        .locator(".scenery-layer")
        .first()
        .evaluate((el) => (el as SVGElement).style.transform),
    )
    .toContain("translate3d");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(site).toHaveAttribute("data-motion-enabled", "false");
  const words = await page.locator(".howlscene main").innerText();
  await page.getByLabel("Fixture theme").selectOption("baseline");
  expect(await presentation(page)).toEqual({
    lineHeight: 1.8,
    cardGap: "24px",
    cardRadius: "11.2px",
    navigationGap: "19.2px",
  });
  expect(await page.locator(".howlscene main").innerText()).toBe(words);
  await page.getByLabel("Fixture theme").selectOption("spacious");
  const downloading = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download contract website" }).click();
  const path = await (await downloading).path();
  if (!path) throw Error("No exported ZIP");
  const zip = await JSZip.loadAsync(await readFile(path));
  const files = new Map<string, Buffer>();
  for (const [name, entry] of Object.entries(zip.files))
    if (!entry.dir) files.set(name, await entry.async("nodebuffer"));
  const mount = "/howlscene/presentation/";
  const server = createServer((req, res) => {
    const url = new URL(req.url ?? "/", "http://localhost");
    const name = url.pathname.startsWith(mount)
      ? url.pathname.slice(mount.length) || "index.html"
      : "missing";
    const bytes = files.get(name);
    res.writeHead(bytes ? 200 : 404, {
      "Content-Type": name.endsWith(".css") ? "text/css" : "text/html",
    });
    res.end(bytes ?? "Missing");
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  try {
    const address = server.address();
    if (!address || typeof address === "string")
      throw Error("No server address");
    const context = await browser.newContext({ javaScriptEnabled: false });
    try {
      const published = await context.newPage();
      await published.goto(`http://127.0.0.1:${address.port}${mount}`);
      await expect(
        published.getByRole("heading", { name: "A considered portfolio" }),
      ).toBeVisible();
      expect(await presentation(published)).toEqual(custom);
      expect(await published.locator(".howlscene main").innerText()).toBe(
        words,
      );
      await published
        .getByRole("link", { name: "Selected work", exact: true })
        .click();
      await expect(published).toHaveURL(/#projects$/);
    } finally {
      await context.close();
    }
  } finally {
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
  }
});
