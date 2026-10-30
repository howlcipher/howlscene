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

async function withStaticArchive<T>(
  browser: import("@playwright/test").Browser,
  archive: JSZip,
  mount: string,
  visit: (page: import("@playwright/test").Page) => Promise<T>,
): Promise<T> {
  const files = new Map<string, Buffer>();
  for (const [name, entry] of Object.entries(archive.files))
    if (!entry.dir) files.set(name, await entry.async("nodebuffer"));

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
  const address = server.address();
  if (!address || typeof address === "string")
    throw new Error("Static export server did not start");
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await page.goto(`http://127.0.0.1:${address.port}${mount}`);
    return await visit(page);
  } finally {
    await context.close();
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
  }
}

test("A11Y-SCENE-001 user background images have an opaque readable content surface in preview", async ({
  page,
  browser,
}) => {
  await page.goto("/editor/");
  const preview = page.getByRole("region", { name: "Live website preview" });
  const initialSection = preview.locator(".scene").first();
  await expect(
    initialSection.locator('[data-readable-surface="solid"]'),
  ).toBeVisible();
  await expect(initialSection.locator(".scene-background-image")).toHaveCount(
    0,
  );
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
        accent: getComputedStyle(element.querySelector(".eyebrow")!).color,
        themeBackground: getComputedStyle(site).backgroundColor,
        text: element.textContent,
      };
    });
    expect(result.background).toBe(result.themeBackground);
    expect(
      contrastRatio(result.foreground, result.background),
    ).toBeGreaterThanOrEqual(4.5);
    expect(
      contrastRatio(result.accent, result.background),
    ).toBeGreaterThanOrEqual(4.5);
    expect(result.text).toContain("Build something worth sharing");
  }

  await page.getByLabel("Visual theme").selectOption("ink");
  const downloading = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download my website" }).click();
  const downloadPath = await (await downloading).path();
  if (!downloadPath) throw new Error("No static website ZIP was created");
  const mount = "/howlscene/readable-background/";
  const archive = await JSZip.loadAsync(await readFile(downloadPath));
  await withStaticArchive(browser, archive, mount, async (published) => {
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
        accent: getComputedStyle(element.querySelector(".eyebrow")!).color,
        themeBackground: getComputedStyle(site).backgroundColor,
      };
    });
    expect(result.background).toBe(result.themeBackground);
    expect(
      contrastRatio(result.foreground, result.background),
    ).toBeGreaterThanOrEqual(4.5);
    expect(
      contrastRatio(result.accent, result.background),
    ).toBeGreaterThanOrEqual(4.5);
    await expect(
      published.getByRole("heading", {
        name: "Build something worth sharing",
        exact: true,
      }),
    ).toBeVisible();
  });
});

test("A11Y-SCENE-002 native theme scenery stays behind opaque copy surfaces", async ({
  page,
  browser,
}) => {
  await page.goto("/editor/");
  const preview = page.getByRole("region", { name: "Live website preview" });
  await page.getByLabel("New section type").selectOption("projects");
  await page
    .getByRole("button", { name: "Add a section", exact: true })
    .click();
  await page.getByLabel("Edit heading").last().fill("Selected work");
  await page.getByRole("button", { name: "Add item" }).click();
  await page.getByLabel("Item title").fill("Readable project card");
  await page.getByLabel("New section type").selectOption("experience");
  await page
    .getByRole("button", { name: "Add a section", exact: true })
    .click();
  await page.getByLabel("Edit heading").last().fill("Experience");
  await page.getByRole("button", { name: "Add item" }).click();
  await page.getByLabel("Item title").last().fill("Readable timeline item");

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
        accent: getComputedStyle(element.querySelector(".eyebrow")!).color,
        themeBackground: getComputedStyle(site).backgroundColor,
        text: element.textContent,
      };
    });
    expect(result.background).toBe(result.themeBackground);
    expect(
      contrastRatio(result.foreground, result.background),
    ).toBeGreaterThanOrEqual(4.5);
    expect(
      contrastRatio(result.accent, result.background),
    ).toBeGreaterThanOrEqual(4.5);
    expect(result.text).toContain("Build something worth sharing");

    const projectCard = preview.locator(".entry-cards article").first();
    const projectSurface = await projectCard.evaluate((element) => {
      const site = element.closest<HTMLElement>(".howlscene");
      if (!site) throw new Error("Missing site theme tokens");
      return {
        hasOuterSurface:
          element.parentElement?.closest("[data-readable-surface]") !== null,
        background: getComputedStyle(element).backgroundColor,
        foreground: getComputedStyle(element).color,
        themeBackground: getComputedStyle(site).backgroundColor,
      };
    });
    expect(projectSurface.hasOuterSurface).toBe(false);
    expect(projectSurface.background).toBe(projectSurface.themeBackground);
    expect(
      contrastRatio(projectSurface.foreground, projectSurface.background),
    ).toBeGreaterThanOrEqual(4.5);

    const timeline = preview.locator(".entry-timeline");
    await expect(timeline).toHaveAttribute("data-readable-surface", "solid");
    const timelineSurface = await timeline.evaluate((element) => {
      const site = element.closest<HTMLElement>(".howlscene");
      if (!site) throw new Error("Missing site theme tokens");
      return {
        background: getComputedStyle(element).backgroundColor,
        foreground: getComputedStyle(element).color,
        themeBackground: getComputedStyle(site).backgroundColor,
      };
    });
    expect(timelineSurface.background).toBe(timelineSurface.themeBackground);
    expect(
      contrastRatio(timelineSurface.foreground, timelineSurface.background),
    ).toBeGreaterThanOrEqual(4.5);
  }

  for (const theme of ["modern", "ink", "cyber"]) {
    await page.getByLabel("Visual theme").selectOption(theme);
    const downloading = page.waitForEvent("download");
    await page.getByRole("button", { name: "Download my website" }).click();
    const downloadPath = await (await downloading).path();
    if (!downloadPath) throw new Error("No static website ZIP was created");
    const archive = await JSZip.loadAsync(await readFile(downloadPath));
    await withStaticArchive(
      browser,
      archive,
      `/howlscene/native-scenery-${theme}/`,
      async (published) => {
        const surface = published
          .locator(".scene")
          .first()
          .locator('[data-readable-surface="solid"]');
        await expect(surface).toBeVisible();
        const result = await surface.evaluate((element) => {
          const style = getComputedStyle(element);
          const site = element.closest<HTMLElement>(".howlscene");
          if (!site) throw new Error("Missing exported theme tokens");
          return {
            background: style.backgroundColor,
            foreground: style.color,
            accent: getComputedStyle(element.querySelector(".eyebrow")!).color,
            themeBackground: getComputedStyle(site).backgroundColor,
            text: element.textContent,
          };
        });
        expect(result.background).toBe(result.themeBackground);
        expect(
          contrastRatio(result.foreground, result.background),
        ).toBeGreaterThanOrEqual(4.5);
        expect(
          contrastRatio(result.accent, result.background),
        ).toBeGreaterThanOrEqual(4.5);
        expect(result.text).toContain("Build something worth sharing");

        const projectCard = published.locator(".entry-cards article").first();
        const projectSurface = await projectCard.evaluate((element) => {
          const site = element.closest<HTMLElement>(".howlscene");
          if (!site) throw new Error("Missing exported site theme tokens");
          return {
            hasOuterSurface:
              element.parentElement?.closest("[data-readable-surface]") !==
              null,
            background: getComputedStyle(element).backgroundColor,
            foreground: getComputedStyle(element).color,
            themeBackground: getComputedStyle(site).backgroundColor,
          };
        });
        expect(projectSurface.hasOuterSurface).toBe(false);
        expect(projectSurface.background).toBe(projectSurface.themeBackground);
        expect(
          contrastRatio(projectSurface.foreground, projectSurface.background),
        ).toBeGreaterThanOrEqual(4.5);
        const timeline = published.locator(".entry-timeline");
        await expect(timeline).toHaveAttribute(
          "data-readable-surface",
          "solid",
        );
        const timelineSurface = await timeline.evaluate((element) => {
          const site = element.closest<HTMLElement>(".howlscene");
          if (!site) throw new Error("Missing exported site theme tokens");
          return {
            background: getComputedStyle(element).backgroundColor,
            foreground: getComputedStyle(element).color,
            themeBackground: getComputedStyle(site).backgroundColor,
          };
        });
        expect(timelineSurface.background).toBe(
          timelineSurface.themeBackground,
        );
        expect(
          contrastRatio(timelineSurface.foreground, timelineSurface.background),
        ).toBeGreaterThanOrEqual(4.5);
      },
    );
  }
});
