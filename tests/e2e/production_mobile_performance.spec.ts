import { test, expect } from "@playwright/test";
import JSZip from "jszip";
import { createServer } from "node:http";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { resolve, extname } from "node:path";
import { gzipSync } from "node:zlib";
import { cpus } from "node:os";

const mount = "/howlscene/performance/";
const viewport = { width: 390, height: 844 };
const mimeTypes: Record<string, string> = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

test("PERF-LAB-001 measure an image-rich production export on a constrained mobile profile", async ({
  page,
  browser,
}, testInfo) => {
  test.setTimeout(90000);
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/editor/");
  await page.getByLabel("Website title").fill("Field Notes Studio");
  await page.getByLabel("Edit heading").fill("A field atlas");
  const longCopy =
    "The published page carries an image, carefully paced copy, and an animation that can be stopped at any time. ".repeat(
      8,
    );
  await page
    .getByText("Plain text alternative (removes formatting when edited)", {
      exact: true,
    })
    .click();
  await page.getByRole("textbox", { name: "Edit introduction" }).fill(longCopy);

  const imageData = await page.evaluate(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 675;
    const context = canvas.getContext("2d");
    if (!context) throw Error("Canvas image creation is unavailable.");
    const sky = context.createLinearGradient(0, 0, 0, canvas.height);
    sky.addColorStop(0, "#b7d5e4");
    sky.addColorStop(0.58, "#f0dbb5");
    sky.addColorStop(1, "#8da29a");
    context.fillStyle = sky;
    context.fillRect(0, 0, canvas.width, canvas.height);
    for (let index = 0; index < 8; index += 1) {
      context.fillStyle = `rgba(38, 63, 72, ${0.12 + index * 0.025})`;
      context.beginPath();
      context.moveTo(0, 320 + index * 30);
      context.lineTo(170 + index * 80, 170 + index * 24);
      context.lineTo(370 + index * 95, 350 + index * 26);
      context.lineTo(700 + index * 40, 180 + index * 34);
      context.lineTo(1200, 370 + index * 25);
      context.lineTo(1200, 675);
      context.lineTo(0, 675);
      context.closePath();
      context.fill();
    }
    return canvas.toDataURL("image/png").split(",")[1]!;
  });
  await page.getByLabel("Change section image").setInputFiles({
    name: "field-atlas.png",
    mimeType: "image/png",
    buffer: Buffer.from(imageData, "base64"),
  });
  await page.getByLabel("Image description (alt text)").fill("Layered hills");
  await page.getByLabel("Visual theme").selectOption("ink");
  await page.getByLabel("Choose animation style").selectOption("cinematic");

  const downloadEvent = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download my website" }).click();
  const downloadPath = await (await downloadEvent).path();
  if (!downloadPath) throw Error("No production website ZIP was created.");
  const archive = await JSZip.loadAsync(await readFile(downloadPath));
  const files = new Map<string, Buffer>();
  for (const [name, entry] of Object.entries(archive.files))
    if (!entry.dir) files.set(name, await entry.async("nodebuffer"));

  const runtime = files.get("site.js");
  if (!runtime)
    throw Error("The cinematic export is missing its local runtime.");
  const imageFiles = [...files.entries()].filter(([name]) =>
    name.startsWith("assets/"),
  );
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
    response.writeHead(file ? 200 : 404, {
      "Content-Type":
        mimeTypes[extname(filename ?? "")] ?? "application/octet-stream",
    });
    response.end(file ?? "Not found");
  });
  await new Promise<void>((resolveListen) =>
    server.listen(0, "127.0.0.1", resolveListen),
  );

  try {
    const address = server.address();
    if (!address || typeof address === "string")
      throw Error("No static server");
    const context = await browser.newContext({
      viewport,
      deviceScaleFactor: 1,
      isMobile: true,
      hasTouch: true,
      reducedMotion: "no-preference",
    });
    let session: Awaited<ReturnType<typeof context.newCDPSession>> | undefined;
    try {
      const exported = await context.newPage();
      await exported.addInitScript(() => {
        const measures: {
          lcpMs: number | null;
          layoutShifts: { time: number; value: number }[];
          longTasksMs: number[];
          observers: PerformanceObserver[];
        } = { lcpMs: null, layoutShifts: [], longTasksMs: [], observers: [] };
        (
          window as unknown as { __howlscenePerf: typeof measures }
        ).__howlscenePerf = measures;
        const supported = PerformanceObserver.supportedEntryTypes;
        if (supported.includes("largest-contentful-paint")) {
          const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries())
              measures.lcpMs = entry.startTime;
          });
          observer.observe({
            type: "largest-contentful-paint",
            buffered: true,
          });
          measures.observers.push(observer);
        }
        if (supported.includes("layout-shift")) {
          const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              const shift = entry as PerformanceEntry & {
                hadRecentInput: boolean;
                value: number;
              };
              if (!shift.hadRecentInput)
                measures.layoutShifts.push({
                  time: shift.startTime,
                  value: shift.value,
                });
            }
          });
          observer.observe({ type: "layout-shift", buffered: true });
          measures.observers.push(observer);
        }
        if (supported.includes("longtask")) {
          const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries())
              measures.longTasksMs.push(entry.duration);
          });
          observer.observe({ type: "longtask", buffered: true });
          measures.observers.push(observer);
        }
      });

      session = await context.newCDPSession(exported);
      await session.send("Emulation.setCPUThrottlingRate", { rate: 4 });
      await session.send("Network.enable");
      await session.send("Network.emulateNetworkConditions", {
        offline: false,
        latency: 150,
        downloadThroughput: 200 * 1024,
        uploadThroughput: 94 * 1024,
        connectionType: "cellular3g",
      });
      const origin = `http://127.0.0.1:${address.port}`;
      const badResponses: string[] = [];
      const failedRequests: string[] = [];
      exported.on("response", (response) => {
        if (
          new URL(response.url()).origin === origin &&
          response.status() !== 200
        )
          badResponses.push(`${response.status()} ${response.url()}`);
      });
      exported.on("requestfailed", (request) =>
        failedRequests.push(`${request.failure()?.errorText} ${request.url()}`),
      );
      await exported.goto(`${origin}${mount}`);
      await expect(exported).toHaveTitle("Field Notes Studio");
      await expect(
        exported.getByRole("heading", { name: "A field atlas" }),
      ).toBeVisible();
      await expect(exported.locator(".howlscene")).toHaveAttribute(
        "data-theme",
        "ink",
      );
      await expect(exported.locator(".howlscene")).toHaveAttribute(
        "data-motion-enabled",
        "true",
      );
      const image = exported.locator("img.section-image").first();
      await expect(image).toHaveAttribute("alt", "Layered hills");
      await expect
        .poll(() =>
          image.evaluate(
            (element) => (element as HTMLImageElement).naturalWidth,
          ),
        )
        .toBeGreaterThan(0);
      await expect(image).toHaveCSS("float", "none");
      await exported.evaluate(() => document.fonts.ready);
      await exported.waitForTimeout(1000);

      const browserMeasures = await exported.evaluate(async () => {
        const state = (
          window as unknown as {
            __howlscenePerf: {
              lcpMs: number | null;
              layoutShifts: { time: number; value: number }[];
              longTasksMs: number[];
              observers: PerformanceObserver[];
            };
          }
        ).__howlscenePerf;
        const frameIntervals: number[] = [];
        let previous: number | undefined;
        let requestId = 0;
        try {
          await new Promise<void>((resolveFrame) => {
            const tick = (time: number) => {
              if (previous !== undefined) frameIntervals.push(time - previous);
              previous = time;
              if (frameIntervals.length >= 60) resolveFrame();
              else requestId = requestAnimationFrame(tick);
            };
            requestId = requestAnimationFrame(tick);
          });
        } finally {
          cancelAnimationFrame(requestId);
          for (const observer of state.observers) observer.disconnect();
        }
        const sorted = [...frameIntervals].sort((a, b) => a - b);
        const shifts = [...state.layoutShifts].sort((a, b) => a.time - b.time);
        let cls = 0;
        let sessionValue = 0;
        let sessionStart = 0;
        let previousShiftTime = 0;
        for (const shift of shifts) {
          if (
            previousShiftTime === 0 ||
            shift.time - previousShiftTime > 1000 ||
            shift.time - sessionStart > 5000
          ) {
            sessionStart = shift.time;
            sessionValue = 0;
          }
          sessionValue += shift.value;
          cls = Math.max(cls, sessionValue);
          previousShiftTime = shift.time;
        }
        const resources = performance
          .getEntriesByType("resource")
          .filter((entry) => entry.name.startsWith(location.origin))
          .map((entry) => {
            const resource = entry as PerformanceResourceTiming;
            return {
              name: new URL(resource.name).pathname,
              kind: resource.initiatorType,
              transferBytes: resource.transferSize,
              encodedBytes: resource.encodedBodySize,
              durationMs: resource.duration,
            };
          });
        const navigation = performance.getEntriesByType("navigation")[0] as
          PerformanceNavigationTiming | undefined;
        return {
          navigation: {
            durationMs: navigation?.duration ?? null,
            responseStartMs: navigation?.responseStart ?? null,
            domContentLoadedMs: navigation?.domContentLoadedEventEnd ?? null,
            loadEventEndMs: navigation?.loadEventEnd ?? null,
          },
          lcpMs: state.lcpMs,
          cls,
          longTasksMs: state.longTasksMs,
          frameIntervalsMs: {
            samples: frameIntervals.length,
            p50: sorted[Math.floor(sorted.length * 0.5)] ?? null,
            p95: sorted[Math.floor(sorted.length * 0.95)] ?? null,
            maximum: sorted.at(-1) ?? null,
          },
          image: await exportedImageMetrics(),
          resources,
        };
        async function exportedImageMetrics() {
          const element =
            document.querySelector<HTMLImageElement>("img.section-image");
          if (!element) return null;
          return {
            currentSrc: element.currentSrc,
            naturalWidth: element.naturalWidth,
            naturalHeight: element.naturalHeight,
            alt: element.alt,
          };
        }
      });
      expect(browserMeasures.lcpMs).toBeGreaterThan(0);
      expect(browserMeasures.frameIntervalsMs.samples).toBe(60);
      const imageResource = browserMeasures.resources.find((resource) =>
        resource.name.includes("/assets/"),
      );
      expect(
        imageResource,
        JSON.stringify(browserMeasures.resources),
      ).toBeDefined();
      expect(imageResource!.encodedBytes).toBeGreaterThan(0);
      expect(imageResource!.encodedBytes).toBeLessThan(500 * 1024);

      await exported.getByRole("button", { name: "Disable animation" }).click();
      await expect(exported.locator(".howlscene")).toHaveAttribute(
        "data-motion-enabled",
        "false",
      );
      const headingVisibleWithMotionOff = await exported
        .getByRole("heading", { name: "A field atlas" })
        .isVisible();
      expect(headingVisibleWithMotionOff).toBe(true);
      const anchor = exported.locator("nav a").first();
      const anchorHref = await anchor.getAttribute("href");
      expect(anchorHref).toMatch(/^#[A-Za-z0-9_-]+$/);
      const navigationStarted = await exported.evaluate(() =>
        performance.now(),
      );
      await anchor.click();
      await expect(exported).toHaveURL(new RegExp(`${anchorHref}$`));
      const anchorNavigationMs =
        (await exported.evaluate(() => performance.now())) - navigationStarted;
      expect(badResponses).toEqual([]);
      expect(failedRequests).toEqual([]);

      const jsBytes = runtime.byteLength;
      const report = {
        recordedAt: new Date().toISOString(),
        environment: {
          node: process.version,
          platform: process.platform,
          architecture: process.arch,
          cpuModel: cpus()[0]?.model ?? null,
          browser: browser.version(),
          browserName: testInfo.project.use.browserName ?? "chromium",
          viewport,
          deviceScaleFactor: 1,
          cpuThrottleRate: 4,
          networkEmulation: {
            roundTripLatencyMs: 150,
            downloadBytesPerSecond: 200 * 1024,
            uploadBytesPerSecond: 94 * 1024,
          },
          server: "static HTTP server serving the browser-generated ZIP",
          mount,
        },
        export: {
          fileCount: files.size,
          siteRuntimeBytes: jsBytes,
          siteRuntimeGzipBytes: gzipSync(runtime).byteLength,
          runtimeBudgetGzipBytes: 250 * 1024,
          assetFiles: imageFiles.map(([name, data]) => ({
            name,
            bytes: data.byteLength,
          })),
        },
        observation: browserMeasures,
        anchorNavigationMs,
        accessibility: {
          imageAltPresent: browserMeasures.image?.alt === "Layered hills",
          contentVisibleWithMotionOff: headingVisibleWithMotionOff,
        },
        limitations: [
          "A single local lab observation under Playwright CDP CPU/network emulation, not a physical mobile-device or field Core Web Vitals result.",
          "The image is a generated fixture and the tested copy is representative, not a user workload distribution.",
          "Animation frame intervals come from one Chromium session and do not guarantee 60 FPS on other hardware.",
          "The export runtime gzip figure excludes HTML, CSS, fonts and image resources.",
        ],
      };
      expect(report.export.siteRuntimeGzipBytes).toBeLessThan(
        report.export.runtimeBudgetGzipBytes,
      );
      const output = resolve(".artifacts/production_mobile_performance.json");
      await mkdir(resolve(".artifacts"), { recursive: true });
      await writeFile(output, `${JSON.stringify(report, null, 2)}\n`);
      await testInfo.attach("production-mobile-performance.json", {
        path: output,
        contentType: "application/json",
      });
    } finally {
      await session?.detach();
      await context.close();
    }
  } finally {
    await new Promise<void>((resolveClose, reject) =>
      server.close((error) => (error ? reject(error) : resolveClose())),
    );
  }
});
