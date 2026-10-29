import { test, expect } from "@playwright/test";
import JSZip from "jszip";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";

const themes = ["modern", "ink", "cyber"] as const;
const mount = "/howlscene/platform-review/";

test("EXP-PLATFORM-001 image exports retain content and responsive layout without JavaScript", async ({
  page,
  browser,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/editor/");
  await page.getByLabel("Website title").fill("Field Notes Across Browsers");
  await page.getByLabel("New section type").selectOption("about");
  await page.getByRole("button", { name: "Add a section" }).click();
  await page.getByLabel("Edit heading").last().fill("A shared landscape");
  const longCopy =
    "Across three engines, this description remains available in meaningful HTML and wraps naturally beside the landscape. ".repeat(
      10,
    ) +
    "AnUnbrokenWordThatMustStillFitTheAvailableViewportWithoutHorizontalOverflow";
  await page
    .getByRole("textbox", { name: "Rich text introduction" })
    .fill(longCopy);

  const imageData = await page.evaluate(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 320;
    canvas.height = 180;
    const context = canvas.getContext("2d");
    if (!context) throw Error("Canvas image creation is unavailable.");
    context.fillStyle = "#dce9f1";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#385a69";
    context.beginPath();
    context.moveTo(0, 160);
    context.lineTo(100, 40);
    context.lineTo(190, 160);
    context.lineTo(260, 70);
    context.lineTo(320, 160);
    context.closePath();
    context.fill();
    return canvas.toDataURL("image/png").split(",")[1]!;
  });
  await page.getByLabel("Change section image").setInputFiles({
    name: "platform-landscape.png",
    mimeType: "image/png",
    buffer: Buffer.from(imageData, "base64"),
  });
  await page.getByLabel("Image description (alt text)").fill("Painted hills");
  const layout = page
    .locator("label")
    .filter({ hasText: /^Layout/ })
    .locator("select");
  await layout.selectOption("split");

  const files = new Map<string, Buffer>();
  const server = createServer((request, response) => {
    const pathname = new URL(request.url ?? "/", "http://localhost").pathname;
    let filename: string | undefined;
    if (pathname === mount) filename = "index.html";
    else if (pathname.startsWith(mount)) {
      try {
        filename = decodeURIComponent(pathname.slice(mount.length));
      } catch {
        filename = undefined;
      }
    }
    const file = filename ? files.get(filename) : undefined;
    const extension = filename?.split(".").pop();
    const contentTypes: Record<string, string> = {
      css: "text/css",
      html: "text/html",
      png: "image/png",
      svg: "image/svg+xml",
      webp: "image/webp",
      jpeg: "image/jpeg",
      jpg: "image/jpeg",
    };
    response.writeHead(file ? 200 : 404, {
      "Content-Type":
        contentTypes[extension ?? ""] ?? "application/octet-stream",
    });
    response.end(file ?? "Not found");
  });
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    await new Promise<void>((resolve) =>
      server.listen(0, "127.0.0.1", resolve),
    );
    const address = server.address();
    if (!address || typeof address === "string") throw Error("No server");
    const exported = await context.newPage();
    for (const theme of themes) {
      await page.getByLabel("Visual theme").selectOption(theme);
      const downloadEvent = page.waitForEvent("download");
      await page.getByRole("button", { name: "Download my website" }).click();
      const downloadPath = await (await downloadEvent).path();
      if (!downloadPath)
        throw Error(`No ${theme} website archive was created.`);
      const archive = await JSZip.loadAsync(await readFile(downloadPath));
      files.clear();
      for (const [name, entry] of Object.entries(archive.files))
        if (!entry.dir) files.set(name, await entry.async("nodebuffer"));

      for (const width of [1280, 375]) {
        await exported.setViewportSize({ width, height: 900 });
        await exported.goto(`http://127.0.0.1:${address.port}${mount}`);
        await expect(exported).toHaveTitle("Field Notes Across Browsers");
        await expect(
          exported.getByRole("heading", { name: "A shared landscape" }),
        ).toBeVisible();
        await expect(exported.getByText(longCopy)).toBeVisible();
        await expect(exported.locator(".howlscene")).toHaveAttribute(
          "data-theme",
          theme,
        );
        const section = exported.locator(".scene.layout-split").last();
        const image = section.locator("img.section-image");
        await expect(image).toHaveAttribute("alt", "Painted hills");
        await expect
          .poll(() =>
            image.evaluate(
              (element) => (element as HTMLImageElement).naturalWidth,
            ),
          )
          .toBe(320);
        await expect(image).toHaveCSS("float", width <= 600 ? "none" : "right");
        expect(
          await exported
            .locator("html")
            .evaluate((element) => element.scrollWidth <= element.clientWidth),
        ).toBe(true);
        const sectionLink = exported.locator("nav a").nth(1);
        const anchor = await sectionLink.getAttribute("href");
        expect(anchor).toMatch(/^#/);
        await sectionLink.click();
        await expect(exported).toHaveURL(new RegExp(`${anchor}$`));
        await expect(section).toBeInViewport();
      }
    }
  } finally {
    await context.close();
    if (server.listening)
      await new Promise<void>((resolve, reject) =>
        server.close((error) => (error ? reject(error) : resolve())),
      );
  }
});
