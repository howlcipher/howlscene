import { expect, test } from "@playwright/test";
import JSZip from "jszip";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";

test("CIN-001 CIN-006 CIN-007 editor creates a cinematic story and changes a scene transition", async ({
  page,
}) => {
  await page.goto("/editor/");
  page.on("dialog", (dialog) => void dialog.accept());
  await page.getByLabel("Start from a template").selectOption("cinematic");
  await expect(page.locator(".howlscene")).toHaveAttribute(
    "data-experience",
    "cinematic",
  );
  await page.getByLabel("Use Camera Journey").check();
  await expect(page.locator(".howlscene")).toHaveAttribute(
    "data-camera-journey",
    "true",
  );
  await expect(page.getByLabel("Camera movement")).toBeVisible();
  await expect(page.getByLabel("Camera intensity")).toBeVisible();
  await expect(page.getByLabel("Parallax depth")).toBeVisible();
  await expect(page.getByLabel("Scroll distance")).toBeVisible();
  await page.getByLabel("Edit heading").fill("A story that belongs to me");
  await page.getByLabel("Transition style").selectOption("mist-reveal");
  const firstScene = page
    .getByRole("region", { name: "Live website preview" })
    .locator(".scene")
    .first();
  await expect(firstScene).toHaveAttribute("data-transition", "mist-reveal");
  await expect(firstScene).toContainText("A story that belongs to me");
  const coverImage = await page.evaluate(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 32;
    canvas.height = 32;
    const context = canvas.getContext("2d")!;
    context.fillStyle = "#718a79";
    context.fillRect(0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/png").split(",")[1]!;
  });
  await page.getByLabel("Change transition cover").setInputFiles({
    name: "mist-cover.png",
    mimeType: "image/png",
    buffer: Buffer.from(coverImage, "base64"),
  });
  const cover = firstScene.locator(".scene-transition-cover");
  await expect(cover).toHaveAttribute("aria-hidden", "true");
  await expect(cover).toHaveAttribute("alt", "");
  await expect(cover).toHaveAttribute("src", /^data:image\/webp;base64,/);
  await page.getByRole("button", { name: "Remove transition cover" }).click();
  await expect(cover).toHaveCount(0);
});

test("CJ-011 editor preview renders two and seven scene Camera Journeys", async ({
  page,
}) => {
  await page.goto("/editor/");
  page.on("dialog", (dialog) => void dialog.accept());
  await page.getByLabel("Start from a template").selectOption("cinematic");
  await page.getByLabel("Use Camera Journey").check();

  const preview = page.getByRole("region", { name: "Live website preview" });
  const scenes = preview.locator(".scene");
  const root = preview.locator(".howlscene");
  await expect(scenes).toHaveCount(5);

  for (let count = 5; count > 2; count -= 1) {
    await page.getByRole("button", { name: "Delete section" }).click();
    await expect(scenes).toHaveCount(count - 1);
  }
  await expect(scenes).toHaveCount(2);
  await scrubPreviewToHandoff(preview);
  await expect(root).toHaveAttribute(
    "data-camera-journey-stage",
    "covered-handoff",
  );
  await expect(preview.locator(".camera-journey-stage")).toHaveCount(1);

  for (let count = 2; count < 7; count += 1) {
    await page.getByRole("button", { name: "Duplicate section" }).click();
    await expect(scenes).toHaveCount(count + 1);
  }
  await expect(scenes).toHaveCount(7);
  await scrubPreviewToHandoff(preview);
  await expect(root).toHaveAttribute(
    "data-camera-journey-stage",
    "covered-handoff",
  );
  await expect(preview.locator(".camera-journey-stage")).toHaveCount(1);
});

async function scrubPreviewToHandoff(
  preview: import("@playwright/test").Locator,
) {
  await preview.evaluate((element) => {
    const container = element.parentElement!;
    const scenes = Array.from(element.querySelectorAll<HTMLElement>(".scene"));
    const containerTop = container.getBoundingClientRect().top;
    const start =
      scenes[0]!.getBoundingClientRect().top -
      containerTop +
      container.scrollTop;
    const end =
      scenes[1]!.getBoundingClientRect().top -
      containerTop +
      container.scrollTop;
    container.scrollTo({ top: start + (end - start) * 0.49 });
  });
}

test("CIN-012 CIN-013 CIN-014 CIN-015 CIN-022 exports cinematic cover artwork for root and nested hosting", async ({
  page,
  browser,
}) => {
  await page.goto("/editor/");
  page.on("dialog", (dialog) => void dialog.accept());
  await page.getByLabel("Start from a template").selectOption("cinematic");
  await page.getByLabel("Use Camera Journey").check();
  await page.getByLabel("Edit heading").fill("A story for every path");
  await page.getByLabel("Transition style").selectOption("mist-reveal");
  const coverImage = await page.evaluate(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 32;
    canvas.height = 32;
    const context = canvas.getContext("2d")!;
    context.fillStyle = "#718a79";
    context.fillRect(0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/png").split(",")[1]!;
  });
  await page.getByLabel("Change transition cover").setInputFiles({
    name: "mist-cover.png",
    mimeType: "image/png",
    buffer: Buffer.from(coverImage, "base64"),
  });

  const downloadEvent = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download my website" }).click();
  const downloadPath = await (await downloadEvent).path();
  if (!downloadPath) throw new Error("No cinematic website ZIP was created");
  const archive = await JSZip.loadAsync(await readFile(downloadPath));
  const html = await archive.file("index.html")!.async("string");
  expect(html).toContain('data-experience="cinematic"');
  expect(html).toContain('data-camera-journey="true"');
  expect(html).toContain('data-transition="mist-reveal"');
  expect(html).toContain("A story for every path");
  const coverSource = html.match(
    /<img[^>]*class="scene-transition-cover"[^>]*src="([^"]+)"/,
  )?.[1];
  expect(coverSource).toMatch(/^\.\/assets\/asset-[^/]+\/original\.webp$/);
  expect(archive.file(coverSource!.slice(2))).not.toBeNull();
  expect(archive.file("site.js")).not.toBeNull();

  await scrubPreviewToHandoff(
    page.getByRole("region", { name: "Live website preview" }),
  );
  await expect(
    page
      .getByRole("region", { name: "Live website preview" })
      .locator(".howlscene"),
  ).toHaveAttribute("data-camera-journey-stage", "covered-handoff");
  const previewFrame = await page.evaluate(() => ({
    stage: document.querySelector<HTMLElement>(".preview .howlscene")?.dataset
      .cameraJourneyStage,
    transform: document.querySelector<HTMLElement>(".camera-journey-art")?.style
      .transform,
    coverOpacity: document.querySelector<HTMLElement>(".camera-journey-cover")
      ?.style.opacity,
  }));

  const files = new Map<string, Buffer>();
  for (const [name, entry] of Object.entries(archive.files))
    if (!entry.dir) files.set(name, await entry.async("nodebuffer"));
  let mount = "/";
  const server = createServer((request, response) => {
    const pathname = new URL(request.url ?? "/", "http://localhost").pathname;
    const relative = pathname.startsWith(mount)
      ? pathname.slice(mount.length)
      : "INVALID";
    const name = relative || "index.html";
    const contents = files.get(name);
    const extension = name.slice(name.lastIndexOf("."));
    response.writeHead(contents ? 200 : 404, {
      "Content-Type":
        {
          ".css": "text/css",
          ".html": "text/html",
          ".js": "text/javascript",
          ".webp": "image/webp",
        }[extension] ?? "application/octet-stream",
    });
    response.end(contents ?? "Missing");
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  try {
    const address = server.address();
    if (!address || typeof address === "string") throw new Error("No server");
    for (const target of [
      { base: "/", javaScriptEnabled: true },
      { base: "/howlscene/project/", javaScriptEnabled: false },
      { base: "/howlscene/animated/", javaScriptEnabled: true },
    ]) {
      mount = target.base;
      const context = await browser.newContext({
        javaScriptEnabled: target.javaScriptEnabled,
        reducedMotion:
          target.base === "/howlscene/animated/" ? "no-preference" : "reduce",
      });
      try {
        const exported = await context.newPage();
        const failures: string[] = [];
        exported.on("response", (result) => {
          if (result.status() !== 200)
            failures.push(`${result.status()} ${result.url()}`);
        });
        exported.on("requestfailed", (request) =>
          failures.push(`Failed request ${request.url()}`),
        );
        await exported.goto(`http://127.0.0.1:${address.port}${target.base}`);
        await expect(
          exported.getByRole("heading", { name: "A story for every path" }),
        ).toBeVisible();
        await expect(exported.locator(".scene")).toHaveCount(5);
        await expect(exported.locator(".scene").first()).toHaveAttribute(
          "data-transition",
          "mist-reveal",
        );
        await expect(
          exported.locator(".scene-transition-cover").first(),
        ).toHaveAttribute("src", coverSource!);
        await exported.waitForFunction(
          () =>
            document.querySelector<HTMLImageElement>(".scene-transition-cover")
              ?.naturalWidth === 32,
        );
        if (target.javaScriptEnabled && target.base !== "/howlscene/animated/")
          await expect(
            exported.getByRole("button", { name: "Enable animation" }),
          ).toBeDisabled();
        if (target.base === "/howlscene/animated/") {
          await expect(
            exported.getByRole("button", { name: "Disable animation" }),
          ).toBeVisible();
          await expect(exported.locator(".camera-journey-stage")).toBeVisible();
          await exported.evaluate(() => {
            const scenes = Array.from(
              document.querySelectorAll<HTMLElement>(".scene"),
            );
            const start = scenes[0]!.getBoundingClientRect().top + scrollY;
            const end = scenes[1]!.getBoundingClientRect().top + scrollY;
            window.scrollTo(0, start + (end - start) * 0.49);
          });
          await expect(exported.locator(".howlscene")).toHaveAttribute(
            "data-camera-journey-stage",
            "covered-handoff",
          );
          const exportedFrame = await exported.evaluate(() => ({
            stage:
              document.querySelector<HTMLElement>(".howlscene")?.dataset
                .cameraJourneyStage,
            transform: document.querySelector<HTMLElement>(
              ".camera-journey-art",
            )?.style.transform,
            coverOpacity: document.querySelector<HTMLElement>(
              ".camera-journey-cover",
            )?.style.opacity,
          }));
          expect(exportedFrame.stage).toBe(previewFrame.stage);
          expect(exportedFrame.transform).toBe(previewFrame.transform);
          expect(Number(exportedFrame.coverOpacity)).toBeCloseTo(
            Number(previewFrame.coverOpacity),
            3,
          );
        }
        await exported
          .getByRole("link", { name: "A story for every path", exact: true })
          .click();
        await expect(exported).toHaveURL(/#scene-1$/);
        expect(failures).toEqual([]);
      } finally {
        await context.close();
      }
    }
  } finally {
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
  }
});
