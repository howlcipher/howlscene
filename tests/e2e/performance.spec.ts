import { test, expect } from "@playwright/test";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { gzipSync } from "node:zlib";
import { cpus } from "node:os";

test("controlled local editor, export and animation timing observations", async ({
  page,
  browser,
}, testInfo) => {
  test.setTimeout(60000);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.addInitScript(() => {
    const measurements: {
      lcpMs: number | null;
      layoutShifts: { time: number; value: number }[];
      observers: PerformanceObserver[];
    } = { lcpMs: null, layoutShifts: [], observers: [] };
    (
      window as unknown as { howlPerformance: typeof measurements }
    ).howlPerformance = measurements;
    const supported = PerformanceObserver.supportedEntryTypes;
    if (supported.includes("largest-contentful-paint")) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries())
          measurements.lcpMs = entry.startTime;
      });
      observer.observe({ type: "largest-contentful-paint", buffered: true });
      measurements.observers.push(observer);
    }
    if (supported.includes("layout-shift")) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const shift = entry as PerformanceEntry & {
            hadRecentInput: boolean;
            value: number;
          };
          if (!shift.hadRecentInput)
            measurements.layoutShifts.push({
              time: shift.startTime,
              value: shift.value,
            });
        }
      });
      observer.observe({ type: "layout-shift", buffered: true });
      measurements.observers.push(observer);
    }
  });
  const navigationStarted = performance.now();
  await page.goto("/editor/");
  await expect(page.getByLabel("Website title")).toBeVisible();
  const editorReadyMs = performance.now() - navigationStarted;
  await page.getByLabel("Website title").fill("Measured portfolio");
  await page
    .getByLabel("Edit heading")
    .fill("A representative local editing session");
  await page.getByLabel("Visual theme").selectOption("ink");
  await page.getByLabel("Choose animation style").selectOption("cinematic");
  await expect(page.getByRole("status")).toContainText("Saved on this browser");
  const observations = await page.evaluate(async () => {
    const measurements = (
      window as unknown as {
        howlPerformance: {
          lcpMs: number | null;
          layoutShifts: { time: number; value: number }[];
          observers: PerformanceObserver[];
        };
      }
    ).howlPerformance;
    const intervals: number[] = [];
    let previous: number | undefined;
    let scheduled = 0;
    try {
      await new Promise<void>((resolve) => {
        const sample = (time: number) => {
          if (previous !== undefined) intervals.push(time - previous);
          previous = time;
          if (intervals.length >= 60) resolve();
          else scheduled = requestAnimationFrame(sample);
        };
        scheduled = requestAnimationFrame(sample);
      });
    } finally {
      cancelAnimationFrame(scheduled);
    }
    for (const observer of measurements.observers) observer.disconnect();
    const sorted = [...intervals].sort((a, b) => a - b);
    let maximumWindow = 0;
    let windowTotal = 0;
    let windowStart = 0;
    let previousShift = 0;
    for (const shift of measurements.layoutShifts) {
      if (
        previousShift === 0 ||
        shift.time - previousShift > 1000 ||
        shift.time - windowStart > 5000
      ) {
        windowStart = shift.time;
        windowTotal = 0;
      }
      windowTotal += shift.value;
      previousShift = shift.time;
      maximumWindow = Math.max(maximumWindow, windowTotal);
    }
    const supported = PerformanceObserver.supportedEntryTypes;
    const navigation = performance.getEntriesByType("navigation")[0] as
      PerformanceNavigationTiming | undefined;
    return {
      navigation: {
        durationMs: navigation?.duration ?? null,
        domContentLoadedMs: navigation?.domContentLoadedEventEnd ?? null,
        loadEventEndMs: navigation?.loadEventEnd ?? null,
      },
      lcpObservedMs: measurements.lcpMs,
      clsObserved: supported.includes("layout-shift") ? maximumWindow : null,
      layoutShifts: measurements.layoutShifts,
      frameIntervals: {
        samples: intervals.length,
        p50Ms: sorted[Math.floor(sorted.length * 0.5)] ?? null,
        p95Ms: sorted[Math.floor(sorted.length * 0.95)] ?? null,
        rawMs: intervals,
      },
      supportedPerformanceEntries: supported,
    };
  });
  const exported = await page.evaluate(async () => {
    const corePath = "/packages/core/src/index.tsx";
    const exportPath = "/packages/export/src/index.tsx";
    const { starterSite, parseSite } = await import(
      /* @vite-ignore */ corePath
    );
    const { exportWebsite } = await import(/* @vite-ignore */ exportPath);
    const types = [
      "hero",
      "about",
      "rich_text",
      "projects",
      "experience",
      "skills",
      "media",
      "gallery",
      "contact",
      "cta",
    ];
    const site = parseSite({
      ...starterSite,
      title: "Ten section performance fixture",
      motion: "cinematic",
      sections: types.map((type, index) => ({
        ...starterSite.sections[0],
        id: `section-${index}`,
        type,
        heading: `Section ${index + 1}`,
        body: "Readable representative website content. ".repeat(20),
      })),
    });
    const started = performance.now();
    const bytes = await exportWebsite(site);
    return {
      durationMs: performance.now() - started,
      zipBytes: bytes.byteLength,
      sectionCount: site.sections.length,
      includesImages: false,
    };
  });
  let jsHeapUsedBytes: number | null = null;
  let heapMeasurementError: string | null = null;
  try {
    const session = await page.context().newCDPSession(page);
    try {
      await session.send("Performance.enable");
      const { metrics } = await session.send("Performance.getMetrics");
      jsHeapUsedBytes =
        metrics.find((metric) => metric.name === "JSHeapUsedSize")?.value ??
        null;
    } finally {
      await session.detach();
    }
  } catch (error) {
    heapMeasurementError =
      error instanceof Error
        ? error.message
        : "CDP heap observation unavailable";
  }
  const runtime = await readFile(resolve("packages/export/generated/site.js"));
  const compressedRuntimeBytes = gzipSync(runtime).byteLength;
  const report = {
    recordedAt: new Date().toISOString(),
    environment: {
      node: process.version,
      platform: process.platform,
      architecture: process.arch,
      cpuModel: cpus()[0]?.model ?? null,
      browser: browser.version(),
      browserName: testInfo.project.use.browserName ?? "chromium",
      headless: testInfo.project.use.headless ?? true,
      viewport: { width: 1440, height: 1000 },
      server: "Vite development server on GitHub-hosted runner loopback",
      networkEmulation: "none",
      cpuEmulation: "none",
    },
    editorReadyMs,
    ...observations,
    export: exported,
    heap: { jsHeapUsedBytes, error: heapMeasurementError },
    runtime: {
      bytes: runtime.byteLength,
      gzipBytes: compressedRuntimeBytes,
      budgetGzipBytes: 250 * 1024,
    },
    limitations: [
      "Single controlled GitHub-hosted CI observation, not a field Core Web Vitals assessment.",
      "LCP and CLS were observed during an editor interaction session; INP is not measured.",
      "Animation-frame intervals describe scheduling on this GitHub-hosted runner and are not an animation FPS guarantee.",
      "Heap is one CDP observation after editor workflow and export, without forced GC or a leak test.",
      "Export timing excludes dynamic module import and uses a ten-section text-only fixture.",
      "Runtime budget excludes editor JavaScript, images and HTML/CSS.",
    ],
  };
  const output = resolve(".artifacts/performance.json");
  await mkdir(resolve(".artifacts"), { recursive: true });
  await writeFile(output, JSON.stringify(report, null, 2) + "\n");
  await testInfo.attach("performance.json", {
    path: output,
    contentType: "application/json",
  });
  expect(compressedRuntimeBytes).toBeLessThan(250 * 1024);
});
