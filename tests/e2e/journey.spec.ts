import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import JSZip from "jszip";
import { createServer } from "node:http";
import { mkdtemp, mkdir, readFile, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve, dirname, extname, sep } from "node:path";

test("v1 acceptance: create, restore, back up, export and serve a complete portfolio", async ({
  page,
  browser,
}) => {
  test.setTimeout(90000);
  await page.goto("/editor/");
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByLabel("Start from a template").selectOption("portfolio");
  await page.getByLabel("Visual theme").selectOption("ink");
  await page.getByLabel("Website title").fill("Sam Taylor — selected work");
  await page.getByLabel("Edit heading").fill("Sam Taylor");
  const introduction = page.getByRole("textbox", {
    name: "Rich text introduction",
  });
  await introduction.fill("I make useful software and thoughtful experiences.");
  await introduction.press("ControlOrMeta+a");
  await page.getByRole("button", { name: "Bold", exact: true }).click();
  const preview = page.getByRole("region", { name: "Live website preview" });
  await expect(preview.locator("strong")).toContainText(
    "I make useful software",
  );
  const png = await page.evaluate(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1600;
    canvas.height = 900;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas unavailable");
    context.fillStyle = "#34765e";
    context.fillRect(0, 0, 1600, 900);
    return canvas.toDataURL("image/png").split(",")[1]!;
  });
  await page.getByLabel("Change section image").setInputFiles({
    name: "my-landscape.png",
    mimeType: "image/png",
    buffer: Buffer.from(png, "base64"),
  });
  await page
    .getByLabel("Image description (alt text)")
    .fill("A green landscape illustration");
  await expect(
    preview.getByRole("img", { name: "A green landscape illustration" }),
  ).toBeVisible();
  await page.getByLabel("New section type").selectOption("projects");
  await page
    .getByRole("button", { name: "Add a section", exact: true })
    .click();
  await page.getByLabel("Edit heading").fill("Selected projects");
  await page.getByRole("button", { name: "Add item", exact: true }).click();
  await page
    .getByLabel("Item title", { exact: true })
    .fill("Community garden planner");
  await page
    .getByLabel("Item description", { exact: true })
    .fill("A small application that helps neighbors organize planting days.");
  const projectLink = page.getByLabel("Item link (https:// or mailto:)");
  await projectLink.fill("https://example.com/garden");
  await projectLink.blur();
  await page
    .getByRole("button", { name: "Move section up", exact: true })
    .click();
  await page.getByLabel("Choose animation style").selectOption("cinematic");
  const beforeThemeChange = await preview.locator("main").innerText();
  await page.getByLabel("Visual theme").selectOption("cyber");
  expect(await preview.locator("main").innerText()).toBe(beforeThemeChange);
  await page.getByLabel("Preview size").selectOption("375px");
  expect((await preview.boundingBox())?.width).toBeLessThanOrEqual(375);
  await expect(page.getByRole("status")).toContainText("Saved on this browser");
  await page.reload();
  await expect(page.getByLabel("Website title")).toHaveValue(
    "Sam Taylor — selected work",
  );
  await expect(
    preview.getByRole("heading", { name: "Sam Taylor", exact: true }),
  ).toBeVisible();
  await expect(
    preview.getByRole("link", {
      name: "Community garden planner",
      exact: true,
    }),
  ).toHaveAttribute("href", "https://example.com/garden");
  await expect(
    preview.getByRole("img", { name: "A green landscape illustration" }),
  ).toBeVisible();
  const backupEvent = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Save project backup", exact: true })
    .click();
  const backup = await backupEvent;
  const backupPath = await backup.path();
  if (!backupPath) throw new Error("Backup download missing");
  await page.getByLabel("Website title").fill("Temporary change");
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByLabel("Open project backup").setInputFiles(backupPath);
  await expect(page.getByLabel("Website title")).toHaveValue(
    "Sam Taylor — selected work",
  );
  await expect(page.getByRole("status")).toContainText("Saved on this browser");
  const exportEvent = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Download my website", exact: true })
    .click();
  const website = await exportEvent;
  const websitePath = await website.path();
  if (!websitePath) throw new Error("Website download missing");
  const archive = await JSZip.loadAsync(await readFile(websitePath));
  expect(archive.file("site.js")).not.toBeNull();
  const directory = await mkdtemp(join(tmpdir(), "howlscene-journey-"));
  let mount = "/example-site/";
  const mime: Record<string, string> = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".png": "image/png",
    ".jpeg": "image/jpeg",
    ".jpg": "image/jpeg",
    ".webp": "image/webp",
    ".svg": "image/svg+xml",
    ".woff2": "font/woff2",
  };
  const server = createServer((request, response) => {
    void (async () => {
      const pathname = decodeURIComponent(
        new URL(request.url ?? "/", "http://localhost").pathname,
      );
      if (!pathname.startsWith(mount)) {
        response.writeHead(404);
        response.end("Not found");
        return;
      }
      const relative = pathname.slice(mount.length) || "index.html";
      const filename = resolve(directory, relative);
      if (!filename.startsWith(directory + sep)) {
        response.writeHead(403);
        response.end("Forbidden");
        return;
      }
      try {
        const bytes = await readFile(filename);
        response.writeHead(200, {
          "Content-Type": mime[extname(filename)] ?? "application/octet-stream",
        });
        response.end(bytes);
      } catch {
        response.writeHead(404);
        response.end("Not found");
      }
    })().catch(() => {
      response.writeHead(400);
      response.end("Bad request");
    });
  });
  try {
    for (const [name, entry] of Object.entries(archive.files)) {
      if (entry.dir) continue;
      const filename = resolve(directory, name);
      if (!filename.startsWith(directory + sep))
        throw new Error("Unsafe archive entry");
      await mkdir(dirname(filename), { recursive: true });
      await writeFile(filename, await entry.async("nodebuffer"));
    }
    await new Promise<void>((resolve) =>
      server.listen(0, "127.0.0.1", resolve),
    );
    const address = server.address();
    if (!address || typeof address === "string")
      throw new Error("Static server failed");
    for (const base of ["/example-site/", "/howlscene/project/"]) {
      mount = base;
      for (const javaScriptEnabled of [false, true]) {
        const context = await browser.newContext({
          javaScriptEnabled,
          viewport: { width: 375, height: 900 },
          reducedMotion: "no-preference",
        });
        try {
          const exported = await context.newPage();
          const errors: string[] = [];
          const failures: string[] = [];
          exported.on("pageerror", (error) => errors.push(error.message));
          exported.on("requestfailed", (request) =>
            failures.push(request.url()),
          );
          exported.on("response", (response) => {
            if (response.status() >= 400)
              failures.push(`${response.status()} ${response.url()}`);
          });
          await exported.goto(`http://127.0.0.1:${address.port}${base}`);
          await expect(exported).toHaveTitle("Sam Taylor — selected work");
          await expect(
            exported.getByRole("heading", { name: "Sam Taylor", exact: true }),
          ).toBeVisible();
          await expect(
            exported.getByRole("heading", {
              name: "Selected projects",
              exact: true,
            }),
          ).toBeVisible();
          await expect(
            exported.getByText(
              "I make useful software and thoughtful experiences.",
              { exact: true },
            ),
          ).toBeVisible();
          const image = exported.getByRole("img", {
            name: "A green landscape illustration",
          });
          await image.scrollIntoViewIfNeeded();
          await expect(image).toBeVisible();
          await expect(image).toHaveAttribute(
            "srcset",
            /\/assets\/asset-[a-z0-9-]+\/w480\.webp 480w/,
          );
          await expect
            .poll(() =>
              image.evaluate(
                (element) =>
                  element instanceof HTMLImageElement &&
                  element.complete &&
                  element.naturalWidth > 0,
              ),
            )
            .toBe(true);
          await expect(
            exported.getByRole("link", {
              name: "Community garden planner",
              exact: true,
            }),
          ).toHaveAttribute("href", "https://example.com/garden");
          await exported
            .getByRole("navigation", { name: "Website sections" })
            .getByRole("link", { name: "Sam Taylor", exact: true })
            .click();
          await expect(exported).toHaveURL(/#intro$/);
          if (javaScriptEnabled) {
            await exported
              .getByRole("button", { name: "Disable animation", exact: true })
              .click();
            await expect(
              exported.getByRole("button", {
                name: "Enable animation",
                exact: true,
              }),
            ).toHaveAttribute("aria-pressed", "false");
            expect(
              await exported.evaluate(() =>
                localStorage.getItem("howlscene-motion"),
              ),
            ).toBe("off");
            await exported.reload();
            await expect(
              exported.getByRole("button", {
                name: "Enable animation",
                exact: true,
              }),
            ).toHaveAttribute("aria-pressed", "false");
            const results = await new AxeBuilder({ page: exported })
              .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
              .analyze();
            expect(
              results.violations.filter(
                (violation) =>
                  violation.impact === "serious" ||
                  violation.impact === "critical",
              ),
            ).toEqual([]);
          }
          expect(errors).toEqual([]);
          expect(failures).toEqual([]);
        } finally {
          await context.close();
        }
      }
    }
  } finally {
    if (server.listening)
      await new Promise<void>((resolve, reject) =>
        server.close((error) => (error ? reject(error) : resolve())),
      );
    await rm(directory, { recursive: true, force: true });
  }
});
