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

test("THM-PRES-005 maximum theme spacing reflows at 200% text size and 320 CSS pixels", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto("/tests/fixtures/presentation.html");
  await page.addStyleTag({
    content:
      ".fixture-controls{max-width:100%}.fixture-controls label,.fixture-controls select,.fixture-controls button{box-sizing:border-box;max-width:100%}",
  });
  await page.evaluate(() => {
    document.documentElement.style.fontSize = "200%";
  });

  for (const theme of ["maximum", "maximum-ink", "maximum-cyber"]) {
    await page.getByLabel("Fixture theme").selectOption(theme);
    const sizes = await page.evaluate(() => {
      const site = document.querySelector<HTMLElement>(".howlscene");
      const paragraph = site?.querySelector(".scene p:not(.eyebrow)");
      const cards = site?.querySelector<HTMLElement>(".entry-cards");
      const card = site?.querySelector<HTMLElement>(".entry-cards article");
      const navigation = site?.querySelector<HTMLElement>(".site-header nav");
      if (!site || !paragraph || !cards || !card || !navigation)
        throw Error("Missing maximum-presentation fixture content");
      return {
        rootFontSize: getComputedStyle(document.documentElement).fontSize,
        paragraphFontSize: getComputedStyle(paragraph).fontSize,
        lineHeight: getComputedStyle(paragraph).lineHeight,
        cardGap: getComputedStyle(cards).gap,
        cardRadius: getComputedStyle(card).borderRadius,
        navigationGap: getComputedStyle(navigation).gap,
      };
    });
    expect(sizes).toEqual({
      rootFontSize: "32px",
      paragraphFontSize: "36px",
      lineHeight: "79.2px",
      cardGap: "96px",
      cardRadius: "64px",
      navigationGap: "96px",
    });

    await expect(
      page.getByRole("heading", { name: "A considered portfolio" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Selected work" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "A considered portfolio" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Selected work" }),
    ).toBeVisible();
    const overflow = await page.evaluate(() => {
      const navigation =
        document.querySelector<HTMLElement>(".site-header nav");
      const cards = document.querySelector<HTMLElement>(".entry-cards");
      const card = document.querySelector<HTMLElement>(".entry-cards article");
      const site = document.querySelector<HTMLElement>(".howlscene");
      const text = site?.querySelectorAll("h1,h2,h3,p,a");
      if (!site || !navigation || !cards || !card)
        throw Error("Missing maximum-presentation layout elements");
      return {
        document: document.documentElement.scrollWidth <= innerWidth + 1,
        site: site.scrollWidth <= site.clientWidth + 1,
        navigation: navigation.scrollWidth <= navigation.clientWidth + 1,
        cards: cards.scrollWidth <= cards.clientWidth + 1,
        card: card.scrollWidth <= card.clientWidth + 1,
        text:
          !!text &&
          Array.from(text).every(
            (element) => element.scrollWidth <= element.clientWidth + 1,
          ),
      };
    });
    expect(overflow).toEqual({
      document: true,
      site: true,
      navigation: true,
      cards: true,
      card: true,
      text: true,
    });
  }
});
