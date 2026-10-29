import { test, expect } from "@playwright/test";
import JSZip from "jszip";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { visualFontFamilies, visualFontFaceCss } from "./visual_font_fixture";

const fontFiles = [
  "LiberationSerif-Regular.ttf",
  "LiberationSerif-Bold.ttf",
  "DejaVuSansMono.ttf",
  "DejaVuSansMono-Bold.ttf",
  "NotoSans-Regular.ttf",
  "NotoSans-Bold.ttf",
];
const themes = ["modern", "ink", "cyber"] as const;
const widths = [375, 768, 1440] as const;
const imageAlt = "An original geometric sunrise over layered hills";
const cardTitles = ["Dawn study", "Quiet paths", "The open horizon"];

test("EXP-VISUAL-001 image-rich, long-form exports match reviewed theme and viewport baselines", async ({
  page,
  browser,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/editor/");
  await page.getByLabel("Website title").fill("Field Notes Studio");
  await page.getByLabel("Edit heading").fill("A landscape in progress");
  await page
    .getByText("Plain text alternative (removes formatting when edited)", {
      exact: true,
    })
    .click();
  const longCopy = Array.from(
    { length: 8 },
    (_, index) =>
      `Field note ${index + 1}. Light travels slowly across the ridgeline, revealing paths, old pines, and the shape of the valley. A careful record leaves enough room for each observation and keeps every line readable on a narrow screen.`,
  ).join("\n");
  await page.getByRole("textbox", { name: "Edit introduction" }).fill(longCopy);

  const image = await page.evaluate(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 640;
    canvas.height = 360;
    const context = canvas.getContext("2d")!;
    const sky = context.createLinearGradient(0, 0, 0, canvas.height);
    sky.addColorStop(0, "#df8e71");
    sky.addColorStop(0.62, "#f4d2a2");
    sky.addColorStop(1, "#d8ddd0");
    context.fillStyle = sky;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#ffe6a1";
    context.beginPath();
    context.arc(500, 92, 45, 0, Math.PI * 2);
    context.fill();
    const ridge = (points: [number, number][], color: string) => {
      context.beginPath();
      context.moveTo(...points[0]!);
      for (const point of points.slice(1)) context.lineTo(...point);
      context.lineTo(canvas.width, canvas.height);
      context.lineTo(0, canvas.height);
      context.closePath();
      context.fillStyle = color;
      context.fill();
    };
    ridge(
      [
        [0, 245],
        [105, 130],
        [190, 220],
        [305, 115],
        [405, 230],
        [515, 145],
        [640, 250],
      ],
      "#879a9a",
    );
    ridge(
      [
        [0, 295],
        [150, 205],
        [258, 285],
        [380, 190],
        [510, 290],
        [640, 212],
      ],
      "#435e62",
    );
    ridge(
      [
        [0, 330],
        [125, 278],
        [270, 320],
        [420, 264],
        [560, 326],
        [640, 288],
      ],
      "#283f48",
    );
    return canvas.toDataURL("image/png").split(",")[1]!;
  });
  await page.getByLabel("Change section image").setInputFiles({
    name: "geometric-sunrise.png",
    mimeType: "image/png",
    buffer: Buffer.from(image, "base64"),
  });
  await page.getByLabel("Image description (alt text)").fill(imageAlt);
  await page.getByLabel("Image treatment").selectOption("background");

  await page.getByLabel("New section type").selectOption("projects");
  await page.getByRole("button", { name: "Add a section" }).click();
  await page.getByLabel("Edit heading").last().fill("Selected landscapes");
  const addItem = page.getByRole("button", { name: "Add item", exact: true });
  for (const title of cardTitles) {
    await addItem.click();
    await page.getByLabel("Item title").last().fill(title);
    await page
      .getByLabel("Item description")
      .last()
      .fill("An original image, useful words, and enough space to breathe.");
    await page
      .getByLabel("Item image")
      .last()
      .selectOption({ label: imageAlt });
  }

  const preview = page.getByRole("region", { name: "Live website preview" });
  await expect(preview.locator("img")).toHaveCount(4);
  for (const theme of themes) {
    await page.getByLabel("Visual theme").selectOption(theme);
    await page.getByLabel("Choose animation style").selectOption("none");
    const downloading = page.waitForEvent("download");
    await page.getByRole("button", { name: "Download my website" }).click();
    const path = await (await downloading).path();
    if (!path) throw new Error(`No ${theme} export was created`);
    const archive = await JSZip.loadAsync(await readFile(path));
    const files = new Map<string, Buffer>();
    for (const [name, entry] of Object.entries(archive.files))
      if (!entry.dir) files.set(name, await entry.async("nodebuffer"));
    expect(files.has("index.html")).toBe(true);
    for (const title of cardTitles)
      expect(files.get("index.html")?.toString("utf8")).toContain(title);

    const originalHtml = files.get("index.html")!.toString("utf8");
    const fixtureStyles = [
      visualFontFaceCss("./visual-fonts"),
      ...themes.map(
        (id) =>
          `.howlscene[data-theme="${id}"]{--scene-font:"${visualFontFamilies[id]}"!important;}`,
      ),
      ".howlscene{scroll-behavior:auto!important}",
    ].join("\n");
    const html = originalHtml.replace(
      "</head>",
      '<link rel="stylesheet" href="./visual-fixture.css"></head>',
    );
    expect(html).not.toBe(originalHtml);
    files.set("index.html", Buffer.from(html));
    files.set("visual-fixture.css", Buffer.from(fixtureStyles));
    for (const file of fontFiles)
      files.set(
        `visual-fonts/${file}`,
        await readFile(join(process.cwd(), "tests/fixtures/fonts", file)),
      );

    const server = createServer((request, response) => {
      const pathname = new URL(request.url ?? "/", "http://localhost").pathname;
      const name = pathname.startsWith("/image-rich/")
        ? pathname.slice("/image-rich/".length) || "index.html"
        : "";
      const file = files.get(name);
      const extension = name.split(".").pop();
      const contentTypes: Record<string, string> = {
        css: "text/css",
        html: "text/html",
        png: "image/png",
        ttf: "font/ttf",
      };
      response.writeHead(file ? 200 : 404, {
        "Content-Type":
          contentTypes[extension ?? ""] ?? "application/octet-stream",
      });
      response.end(file ?? "Missing");
    });
    await new Promise<void>((resolve) =>
      server.listen(0, "127.0.0.1", resolve),
    );
    const exportedContext = await browser.newContext({
      javaScriptEnabled: false,
      reducedMotion: "reduce",
    });
    const exported = await exportedContext.newPage();
    try {
      const address = server.address();
      if (!address || typeof address === "string") throw Error("No server");
      for (const width of widths) {
        await exported.setViewportSize({ width, height: 900 });
        await exported.goto(`http://127.0.0.1:${address.port}/image-rich/`);
        await expect(exported).toHaveTitle("Field Notes Studio");
        await expect(
          exported.getByRole("heading", { name: "A landscape in progress" }),
        ).toBeVisible();
        await expect(exported.locator(".howlscene")).toHaveAttribute(
          "data-theme",
          theme,
        );
        const fontFamily = visualFontFamilies[theme];
        const loadedFontWeights = await exported.evaluate(async (family) => {
          const loaded = await Promise.all(
            [400, 700].map((weight) =>
              document.fonts.load(`${weight} 16px "${family}"`),
            ),
          );
          await document.fonts.ready;
          return loaded.map((faces) => faces.length);
        }, fontFamily);
        expect(loadedFontWeights).toEqual([1, 1]);
        const computedFontFamily = await exported
          .locator(".howlscene")
          .evaluate((element) => getComputedStyle(element).fontFamily);
        expect(computedFontFamily).toContain(fontFamily);
        const images = exported.locator("img");
        await expect(images).toHaveCount(4);
        for (const imageElement of await images.all()) {
          await imageElement.scrollIntoViewIfNeeded();
          await expect(imageElement).toHaveAttribute("alt", imageAlt);
          await expect
            .poll(() =>
              imageElement.evaluate(
                (imageElement) =>
                  (imageElement as HTMLImageElement).naturalWidth,
              ),
            )
            .toBeGreaterThan(0);
        }
        await exported.evaluate(() => window.scrollTo(0, 0));
        await expect(exported).toHaveScreenshot(
          `export-image-rich-${theme}-${width}.png`,
          { fullPage: true, animations: "disabled", caret: "hide" },
        );
      }
    } finally {
      await exportedContext.close();
      await new Promise<void>((resolve, reject) =>
        server.close((error) => (error ? reject(error) : resolve())),
      );
    }
  }
});
