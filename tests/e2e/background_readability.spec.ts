import { test, expect } from "@playwright/test";
import JSZip from "jszip";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";

function contrastRatio(foreground: string, background: string): number {
  const luminance = (color: string) => {
    const channels = color.match(/\d+/g)?.map(Number);
    if (!channels || channels.length < 3)
      throw new Error(`Expected an RGB color, got '${color}'`);
    const [red, green, blue] = channels.slice(0, 3).map((channel) => {
      const value = channel / 255;
      return value <= 0.04045
        ? value / 12.92
        : ((value + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * red! + 0.7152 * green! + 0.0722 * blue!;
  };
  const values = [luminance(foreground), luminance(background)].sort(
    (first, second) => second - first,
  );
  return (values[0]! + 0.05) / (values[1]! + 0.05);
}

test("A11Y-SCENE-001 user background images have an opaque readable content surface in preview", async ({
  page,
  browser,
}) => {
  await page.goto("/editor/");
  const preview = page.getByRole("region", { name: "Live website preview" });
  await expect(
    preview.locator(".scene").first().locator("[data-readable-surface]"),
  ).toHaveCount(0);
  const image = await page.evaluate(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 32;
    canvas.height = 32;
    const context = canvas.getContext("2d")!;
    const gradient = context.createLinearGradient(0, 0, 32, 32);
    gradient.addColorStop(0, "#ffffff");
    gradient.addColorStop(1, "#000000");
    context.fillStyle = gradient;
    context.fillRect(0, 0, 32, 32);
    return canvas.toDataURL().split(",")[1]!;
  });
  await page.getByLabel("Change section image").setInputFiles({
    name: "contrast-test.png",
    mimeType: "image/png",
    buffer: Buffer.from(image, "base64"),
  });
  await page.getByLabel("Image treatment").selectOption("background");

  for (const theme of ["modern", "ink", "cyber"]) {
    await page.getByLabel("Visual theme").selectOption(theme);
    const section = preview.locator(".scene").first();
    const surface = section.locator('[data-readable-surface="solid"]');
    await expect(surface).toBeVisible();
    const result = await surface.evaluate((element) => {
      const style = getComputedStyle(element);
      const site = element.closest<HTMLElement>(".howlscene");
      if (!site) throw new Error("Missing site theme tokens");
      return {
        background: style.backgroundColor,
        foreground: style.color,
        themeBackground: getComputedStyle(site).backgroundColor,
        text: element.textContent,
      };
    });
    expect(result.background).toBe(result.themeBackground);
    expect(
      contrastRatio(result.foreground, result.background),
    ).toBeGreaterThanOrEqual(4.5);
    expect(result.text).toContain("Build something worth sharing");
  }

  await page.getByLabel("Visual theme").selectOption("ink");
  const downloading = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download my website" }).click();
  const downloadPath = await (await downloading).path();
  if (!downloadPath) throw new Error("No static website ZIP was created");
  const archive = await JSZip.loadAsync(await readFile(downloadPath));
  const files = new Map<string, Buffer>();
  for (const [name, entry] of Object.entries(archive.files))
    if (!entry.dir) files.set(name, await entry.async("nodebuffer"));

  const mount = "/howlscene/readable-background/";
  const server = createServer((request, response) => {
    const pathname = new URL(request.url ?? "/", "http://localhost").pathname;
    const relative = pathname.startsWith(mount)
      ? pathname.slice(mount.length) || "index.html"
      : "";
    const contents = files.get(relative);
    const contentTypes: Record<string, string> = {
      css: "text/css; charset=utf-8",
      html: "text/html; charset=utf-8",
      png: "image/png",
      webp: "image/webp",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
    };
    response.writeHead(contents ? 200 : 404, {
      "Content-Type":
        contentTypes[relative.split(".").pop()?.toLowerCase() ?? ""] ??
        "application/octet-stream",
    });
    response.end(contents ?? "Not found");
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  try {
    const address = server.address();
    if (!address || typeof address === "string")
      throw new Error("Static export server did not start");
    const context = await browser.newContext({ javaScriptEnabled: false });
    try {
      const published = await context.newPage();
      await published.goto(`http://127.0.0.1:${address.port}${mount}`);
      const surface = published
        .locator(".scene")
        .first()
        .locator('[data-readable-surface="solid"]');
      await expect(surface).toBeVisible();
      const result = await surface.evaluate((element) => {
        const style = getComputedStyle(element);
        const site = element.closest<HTMLElement>(".howlscene");
        if (!site) throw new Error("Missing exported site theme tokens");
        return {
          background: style.backgroundColor,
          foreground: style.color,
          themeBackground: getComputedStyle(site).backgroundColor,
        };
      });
      expect(result.background).toBe(result.themeBackground);
      expect(
        contrastRatio(result.foreground, result.background),
      ).toBeGreaterThanOrEqual(4.5);
      await expect(
        published.getByRole("heading", {
          name: "Build something worth sharing",
          exact: true,
        }),
      ).toBeVisible();
    } finally {
      await context.close();
    }
  } finally {
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
  }
});
