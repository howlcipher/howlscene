import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import JSZip from "jszip";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";

const themes = ["modern", "ink", "cyber"] as const;
const mount = "/howlscene/accessibility/";
const types: Record<string, string> = {
  css: "text/css; charset=utf-8",
  html: "text/html; charset=utf-8",
  js: "text/javascript; charset=utf-8",
  png: "image/png",
  svg: "image/svg+xml",
  webp: "image/webp",
};

test("A11Y-007 A11Y-008 exported themes reflow with large text and retain accessibility under reduced motion", async ({
  page,
  browser,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/editor/");
  await page.getByLabel("Website title").fill("Accessible Field Notes");
  await page.getByLabel("Edit heading").fill("A shared landscape");
  const imageData = await page.evaluate(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 640;
    canvas.height = 360;
    const context = canvas.getContext("2d");
    if (!context) throw Error("Canvas image creation is unavailable.");
    context.fillStyle = "#e3eef0";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#355b58";
    context.beginPath();
    context.moveTo(0, 260);
    context.lineTo(180, 120);
    context.lineTo(320, 270);
    context.lineTo(480, 100);
    context.lineTo(640, 250);
    context.lineTo(640, 360);
    context.lineTo(0, 360);
    context.closePath();
    context.fill();
    return canvas.toDataURL("image/png").split(",")[1]!;
  });
  await page.getByLabel("Change section image").setInputFiles({
    name: "shared-landscape.png",
    mimeType: "image/png",
    buffer: Buffer.from(imageData, "base64"),
  });
  await page.getByLabel("Image description (alt text)").fill("Painted hills");
  await page.getByLabel("Choose animation style").selectOption("cinematic");
  await page.getByLabel("New section type").selectOption("about");
  await page.getByRole("button", { name: "Add a section" }).click();
  await page.getByLabel("Edit heading").last().fill("More about this work");
  await page
    .getByRole("textbox", { name: "Rich text introduction" })
    .fill(
      "A thoughtful portfolio makes its work easy to explore on every screen. ".repeat(
        5,
      ),
    );
  await page.getByLabel("New section type").selectOption("projects");
  await page.getByRole("button", { name: "Add a section" }).click();
  await page.getByLabel("Edit heading").last().fill("Selected work");
  await page.getByRole("button", { name: "Add item", exact: true }).click();
  await page
    .getByLabel("Item title")
    .fill("A carefully documented responsive project");
  await page
    .getByLabel("Item description")
    .fill(
      "A long description helps people understand the project without relying on decorative motion. ".repeat(
        3,
      ),
    );

  const files = new Map<string, Buffer>();
  let activeTheme: (typeof themes)[number] = themes[0];
  const server = createServer((request, response) => {
    const pathname = new URL(request.url ?? "/", "http://localhost").pathname;
    let relative: string | undefined;
    if (pathname === mount + activeTheme + "/") relative = "index.html";
    else if (pathname.startsWith(mount + activeTheme + "/")) {
      try {
        relative = decodeURIComponent(
          pathname.slice((mount + activeTheme + "/").length),
        );
      } catch {
        relative = undefined;
      }
    }
    const file = relative ? files.get(`${activeTheme}/${relative}`) : undefined;
    const extension = relative?.split(".").pop() ?? "";
    response.writeHead(file ? 200 : 404, {
      "Content-Type": types[extension] ?? "application/octet-stream",
    });
    response.end(file ?? "Not found");
  });
  await new Promise<void>((resolveListen) =>
    server.listen(0, "127.0.0.1", resolveListen),
  );

  let context: Awaited<ReturnType<typeof browser.newContext>> | undefined;
  let zoomContext: Awaited<ReturnType<typeof browser.newContext>> | undefined;
  try {
    const address = server.address();
    if (!address || typeof address === "string") throw Error("No server");
    for (const theme of themes) {
      activeTheme = theme;
      await page.getByLabel("Visual theme").selectOption(theme);
      const downloadEvent = page.waitForEvent("download");
      await page.getByRole("button", { name: "Download my website" }).click();
      const downloadPath = await (await downloadEvent).path();
      if (!downloadPath)
        throw Error(`No ${theme} website archive was created.`);
      const archive = await JSZip.loadAsync(await readFile(downloadPath));
      for (const [name, entry] of Object.entries(archive.files))
        if (!entry.dir)
          files.set(`${theme}/${name}`, await entry.async("nodebuffer"));
    }

    context = await browser.newContext({
      reducedMotion: "reduce",
      javaScriptEnabled: true,
    });
    zoomContext = await browser.newContext({
      reducedMotion: "reduce",
      javaScriptEnabled: false,
    });
    const exported = await context.newPage();
    const zoomed = await zoomContext.newPage();
    const origin = `http://127.0.0.1:${address.port}`;
    for (const theme of themes) {
      activeTheme = theme;
      for (const width of [375, 1440]) {
        await exported.setViewportSize({ width, height: 900 });
        await exported.goto(`${origin}${mount}${theme}/`);
        await expect(exported).toHaveTitle("Accessible Field Notes");
        await expect(
          exported.getByRole("heading", { name: "A shared landscape" }),
        ).toBeVisible();
        await expect(
          exported.getByRole("img", { name: "Painted hills" }),
        ).toBeVisible();
        await expect(exported.locator(".howlscene")).toHaveAttribute(
          "data-theme",
          theme,
        );
        await expect(exported.locator(".howlscene")).toHaveAttribute(
          "data-motion-enabled",
          "false",
        );
        if (width === 375 && theme === "modern") {
          await exported.keyboard.press("Tab");
          const skipLink = exported.locator(".skip-link");
          await expect(skipLink).toBeFocused();
          await expect(skipLink).toBeVisible();
          await exported.keyboard.press("Enter");
          await expect(exported).toHaveURL(/#site-content$/);
        }
        const results = await new AxeBuilder({ page: exported })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
          .analyze();
        expect(
          results.violations.filter(
            (violation) =>
              violation.impact === "serious" || violation.impact === "critical",
          ),
          `${theme} exported site at ${width}px with reduced motion`,
        ).toEqual([]);
        expect(
          await exported.evaluate(
            () => document.documentElement.scrollWidth <= window.innerWidth + 1,
          ),
          `${theme} exported site at ${width}px must not overflow horizontally`,
        ).toBe(true);
      }

      await zoomed.setViewportSize({ width: 320, height: 900 });
      await zoomed.goto(`${origin}${mount}${theme}/`);
      await zoomed.evaluate(() => {
        document.documentElement.style.fontSize = "200%";
      });
      await expect(
        zoomed.getByRole("heading", { name: "A shared landscape" }),
      ).toBeVisible();
      await expect(
        zoomed.getByRole("heading", { name: "Selected work" }),
      ).toBeVisible();
      await expect(
        zoomed.getByRole("heading", {
          name: "A carefully documented responsive project",
        }),
      ).toBeVisible();
      await expect(
        zoomed.locator(".scene-copy").filter({
          hasText: "A thoughtful portfolio makes its work easy to explore",
        }),
      ).toBeVisible();
      const overflow = await zoomed.evaluate(() => {
        const selectors = [
          "html",
          "body",
          ".howlscene",
          ".site-header",
          ".site-header nav",
          ".scene",
          ".scene-copy",
          ".entry-cards",
          ".entry-cards article",
        ];
        return Object.fromEntries(
          selectors.map((selector) => {
            const element = document.querySelector<HTMLElement>(selector);
            return [
              selector,
              element ? element.scrollWidth <= element.clientWidth + 1 : false,
            ];
          }),
        );
      });
      expect(overflow, `${theme} export at 200% text and 320px`).toEqual(
        Object.fromEntries(
          [
            "html",
            "body",
            ".howlscene",
            ".site-header",
            ".site-header nav",
            ".scene",
            ".scene-copy",
            ".entry-cards",
            ".entry-cards article",
          ].map((selector) => [selector, true]),
        ),
      );
    }
  } finally {
    await context?.close();
    await zoomContext?.close();
    await new Promise<void>((resolveClose, reject) =>
      server.close((error) => (error ? reject(error) : resolveClose())),
    );
  }
});
