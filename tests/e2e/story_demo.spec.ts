import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { writeFile } from "node:fs/promises";

test("the ink-wash sample renders its five scenes through the shared engine", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/examples/ink-wash-story/");
  await page.addStyleTag({
    content: "html { scroll-behavior: auto !important }",
  });

  const scenes = page.locator(".story-demo .scene");
  await expect(scenes).toHaveCount(5);
  await expect(page.locator(".camera-journey-art").first()).toBeVisible();
  await expect(scenes.locator(".scene-background-image")).toHaveCount(5);
  await expect(page.locator(".story-copy-stage, .story-canvas")).toHaveCount(0);
  await expect(
    page.getByRole("heading", { name: "Lorem ipsum dolor sit amet" }),
  ).toBeVisible();
  await expect(page.locator(".story-demo .howlscene")).toHaveAttribute(
    "data-experience",
    "cinematic",
  );
  await expect(page.locator(".story-demo .howlscene")).toHaveAttribute(
    "data-camera-journey",
    "true",
  );
  await expect(
    page.getByRole("navigation", { name: "Story scenes" }),
  ).toBeVisible();
  await expect
    .poll(() =>
      scenes
        .first()
        .locator(".scene-background-image")
        .evaluate((image: HTMLImageElement) => image.naturalWidth),
    )
    .toBeGreaterThan(0);
});

test("shared cinematic navigation and manual motion controls work", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/examples/ink-wash-story/");

  const sceneTwoSourceArt = page.locator("#scene-2 .scene-background-image");
  await page
    .getByRole("link", { name: "02, Scene 2: Consectetur adipiscing elit" })
    .click();
  await expect(page).toHaveURL(/#scene-2$/);
  await expect(page.locator(".story-demo .howlscene")).toHaveAttribute(
    "data-camera-journey-stage",
    "established",
  );
  await expect(
    page.getByRole("link", {
      name: "02, Scene 2: Consectetur adipiscing elit",
    }),
  ).toHaveAttribute("aria-current", "location");

  const sceneTwoArt = page.locator(".camera-journey-art").nth(0);
  await expect
    .poll(() =>
      sceneTwoArt.evaluate((image: HTMLImageElement) => image.naturalWidth),
    )
    .toBeGreaterThan(0);
  await page.getByRole("button", { name: "Disable animation" }).click();
  await expect(
    page.getByRole("button", { name: "Enable animation" }),
  ).toBeVisible();
  await expect(page.locator(".story-demo .howlscene")).toHaveAttribute(
    "data-motion-enabled",
    "false",
  );
  await expect(page.locator(".camera-journey-art")).toHaveCount(0);
  await expect
    .poll(() =>
      sceneTwoSourceArt.evaluate(
        (image: HTMLImageElement) => getComputedStyle(image).transform,
      ),
    )
    .toBe("none");

  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(
    results.violations.filter(
      (violation) =>
        violation.impact === "serious" || violation.impact === "critical",
    ),
  ).toEqual([]);
});

test("Camera Journey scrubs through the covered handoff and reverses with scroll", async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/examples/ink-wash-story/");
  await page.addStyleTag({
    content: "html { scroll-behavior: auto !important }",
  });
  const root = page.locator(".story-demo .howlscene");
  const first = page.locator("#scene-1");
  const second = page.locator("#scene-2");
  const geometry = await page.evaluate(() => {
    const scenes = Array.from(document.querySelectorAll<HTMLElement>(".scene"));
    return scenes.slice(0, 2).map((scene) => {
      const rect = scene.getBoundingClientRect();
      return rect.top + scrollY;
    });
  });
  const at = async (progress: number) => {
    await page.evaluate(
      ({ start, end, progress }) =>
        window.scrollTo(0, start + (end - start) * progress),
      { start: geometry[0]!, end: geometry[1]!, progress },
    );
  };
  const capture = (name: string) =>
    page.screenshot({
      path: testInfo.outputPath(`${name}.png`),
      animations: "disabled",
    });

  await capture("camera-journey-established");
  await at(0.1);
  await expect(root).toHaveAttribute(
    "data-camera-journey-stage",
    "text-departure",
  );
  await expect
    .poll(() =>
      first
        .locator(".scene-content")
        .evaluate((content) => Number(getComputedStyle(content).opacity)),
    )
    .toBeCloseTo(0.5, 2);
  await capture("camera-journey-copy-departure");
  await at(0.3);
  await expect(root).toHaveAttribute(
    "data-camera-journey-stage",
    "camera-travel",
  );
  await expect
    .poll(() =>
      page
        .locator(".camera-journey-art")
        .first()
        .evaluate((image: HTMLImageElement) => image.style.transform),
    )
    .toContain("scale(");
  const pausedTransform = await page
    .locator(".camera-journey-art")
    .first()
    .evaluate((image: HTMLImageElement) => image.style.transform);
  await page.waitForTimeout(100);
  expect(
    await page
      .locator(".camera-journey-art")
      .first()
      .evaluate((image: HTMLImageElement) => image.style.transform),
  ).toBe(pausedTransform);
  await capture("camera-journey-camera-travel");
  await at(0.49);
  await expect(root).toHaveAttribute(
    "data-camera-journey-stage",
    "covered-handoff",
  );
  await expect
    .poll(() =>
      page
        .locator(".camera-journey-cover")
        .evaluate((cover) => Number(getComputedStyle(cover).opacity)),
    )
    .toBeGreaterThan(0.98);
  await expect(first.locator(".scene-content")).toHaveCSS("opacity", "0");
  await capture("camera-journey-covered-handoff");
  await at(0.68);
  await expect(root).toHaveAttribute(
    "data-camera-journey-stage",
    "landscape-reveal",
  );
  await expect(second.locator(".scene-content")).toHaveCSS("opacity", "0");
  await capture("camera-journey-landscape-reveal");
  await at(0.9);
  await expect(root).toHaveAttribute(
    "data-camera-journey-stage",
    "text-arrival",
  );
  await expect(second.locator(".scene-content")).not.toHaveCSS("opacity", "0");
  await capture("camera-journey-copy-arrival");
  await at(0.49);
  await expect(root).toHaveAttribute(
    "data-camera-journey-stage",
    "covered-handoff",
  );
  await capture("camera-journey-reverse");
});

test("hidden scene copy stays in the reading order without hidden keyboard targets", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/examples/ink-wash-story/");
  await page.addStyleTag({
    content: "html { scroll-behavior: auto !important }",
  });
  const first = page.locator("#scene-1 .scene-content");
  await first.evaluate((content) => {
    const link = document.createElement("a");
    link.href = "#scene-2";
    link.textContent = "A link in the outgoing scene";
    link.dataset.journeyFocusFixture = "true";
    content.append(link);
  });
  const link = page.locator('[data-journey-focus-fixture="true"]');

  const positions = await page.evaluate(() => {
    const scenes = Array.from(document.querySelectorAll<HTMLElement>(".scene"));
    return scenes
      .slice(0, 2)
      .map((scene) => scene.getBoundingClientRect().top + scrollY);
  });
  await page.evaluate(
    ({ start, end }) => window.scrollTo(0, start + (end - start) * 0.49),
    { start: positions[0]!, end: positions[1]! },
  );
  await expect(page.locator(".howlscene")).toHaveAttribute(
    "data-camera-journey-stage",
    "covered-handoff",
  );

  await expect(link).toHaveAttribute("tabindex", "-1");
  await expect(
    page.getByRole("heading", { name: "Lorem ipsum dolor sit amet" }),
  ).toHaveCount(1);
  await expect(first).not.toHaveAttribute("aria-hidden", "true");
  await page.getByRole("button", { name: "Disable animation" }).click();
  await expect(link).not.toHaveAttribute("tabindex", "-1");
});

test("repeated motion toggles keep one temporary stage and restore semantic content", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/examples/ink-wash-story/");
  const root = page.locator(".story-demo .howlscene");
  const stageCount = page.locator(".camera-journey-stage");
  const firstCopy = page.locator("#scene-1 .scene-content");

  for (let cycle = 0; cycle < 4; cycle += 1) {
    await expect(stageCount).toHaveCount(1);
    await page.getByRole("button", { name: "Disable animation" }).click();
    await expect(root).toHaveAttribute("data-motion-enabled", "false");
    await expect(stageCount).toHaveCount(1);
    await expect(firstCopy).not.toHaveAttribute("style", /opacity/);
    await page.getByRole("button", { name: "Enable animation" }).click();
    await expect(root).toHaveAttribute("data-motion-enabled", "true");
    await expect(stageCount).toHaveCount(1);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.evaluate(() => window.scrollTo(0, 0));
    await expect(page.locator(".camera-journey-stage")).toHaveCount(1);
  }
});

test("CJ-010 CJ-022 CJ-023 bounded navigation cycles retain one stage and stable listener counts", async ({
  page,
}, testInfo) => {
  test.setTimeout(30000);
  await page.setViewportSize({ width: 1440, height: 900 });
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.goto("/examples/ink-wash-story/");
  const root = page.locator(".story-demo .howlscene");
  const stages = page.locator(".camera-journey-stage");
  await expect(root).toHaveAttribute("data-camera-journey-active", "true");
  const positions = await page.evaluate(() =>
    Array.from(document.querySelectorAll<HTMLElement>(".scene")).map(
      (scene) => scene.getBoundingClientRect().top + scrollY,
    ),
  );
  const at = async (index: number) => {
    const start = positions[index]!;
    const end = positions[index + 1]!;
    await page.evaluate(
      (top) => window.scrollTo(0, top),
      start + (end - start) * 0.49,
    );
    await expect(root).toHaveAttribute(
      "data-camera-journey-stage",
      "covered-handoff",
    );
  };
  const session = await page.context().newCDPSession(page);
  await session.send("Performance.enable");
  await session.send("HeapProfiler.enable");
  const sample = async () => {
    await session.send("HeapProfiler.collectGarbage");
    const { metrics } = await session.send("Performance.getMetrics");
    const read = (name: string) =>
      metrics.find((metric: { name: string }) => metric.name === name)?.value ??
      null;
    return {
      jsHeapUsedBytes: read("JSHeapUsedSize"),
      eventListeners: read("JSEventListeners"),
      documentNodes: read("Nodes"),
    };
  };
  const runCycle = async () => {
    await at(3);
    await at(0);
    await page.evaluate(() =>
      document
        .querySelector<HTMLButtonElement>("button[data-motion-toggle]")
        ?.click(),
    );
    await expect(root).toHaveAttribute("data-motion-enabled", "false");
    await page.evaluate(() =>
      document
        .querySelector<HTMLButtonElement>("button[data-motion-toggle]")
        ?.click(),
    );
    await expect(root).toHaveAttribute("data-motion-enabled", "true");
    await at(0);
    await expect(stages).toHaveCount(1);
  };

  try {
    await at(0);
    for (let warmupCycle = 0; warmupCycle < 2; warmupCycle += 1)
      await runCycle();
    const warmup = await sample();
    const cycles = [];
    for (let cycleIndex = 0; cycleIndex < 5; cycleIndex += 1) {
      await runCycle();
      cycles.push(await sample());
    }

    const report = {
      browser: "GitHub-hosted Chromium via Playwright/CDP",
      viewport: { width: 1440, height: 900 },
      warmupCycles: 2,
      warmup,
      cycles,
      limitations: [
        "Heap samples follow explicit V8 garbage collection and do not include all GPU/image memory.",
        "Document node and event-listener counters are browser-wide snapshots, not a complete detached-node audit.",
        "Five bounded cycles provide a regression signal, not proof of leak freedom or physical-device behavior.",
      ],
    };
    const reportPath = testInfo.outputPath("camera-journey-lifecycle.json");
    await writeFile(reportPath, JSON.stringify(report, null, 2) + "\n");
    await testInfo.attach("camera-journey-lifecycle.json", {
      path: reportPath,
      contentType: "application/json",
    });
    for (const key of ["eventListeners", "documentNodes"] as const) {
      const values = [warmup, ...cycles]
        .map((entry) => entry[key])
        .filter((value): value is number => value !== null);
      if (values.length === cycles.length + 1) {
        const tolerance = key === "eventListeners" ? 2 : 8;
        expect(Math.max(...values)).toBeLessThanOrEqual(values[0]! + tolerance);
      }
    }
    expect(pageErrors).toEqual([]);
    await expect(stages).toHaveCount(1);
  } finally {
    await session.detach();
  }
});

test("the ink-wash story remains readable at a phone width", async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/examples/ink-wash-story/");
  await expect(page.locator(".story-demo .scene")).toHaveCount(5);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Lorem ipsum",
  );
  await expect(
    page.getByRole("navigation", { name: "Story scenes" }),
  ).toBeVisible();
  await page.screenshot({
    path: testInfo.outputPath("camera-journey-mobile.png"),
    animations: "disabled",
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("scene transitions use the shared mist preset and preserve reduced motion", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/examples/ink-wash-story/");

  const scenes = page.locator(".story-demo .scene");
  await expect(scenes).toHaveCount(5);
  await expect(
    page.locator('.story-demo .scene[data-transition="mist-reveal"]'),
  ).toHaveCount(5);
  await expect(scenes.locator(".scene-transition-cover")).toHaveCount(5);
  await expect(
    page.getByRole("button", { name: "Enable animation" }),
  ).toBeDisabled();
  await expect(page.locator(".story-demo .howlscene")).toHaveAttribute(
    "data-motion-enabled",
    "false",
  );

  await page
    .getByRole("link", { name: "02, Scene 2: Consectetur adipiscing elit" })
    .click();
  await expect(page).toHaveURL(/#scene-2$/);
  await expect(
    page.getByRole("heading", { name: "Consectetur adipiscing elit" }),
  ).toBeVisible();
  await expect
    .poll(() =>
      page
        .locator("#scene-2 .scene-background-image")
        .evaluate(
          (image: HTMLImageElement) => getComputedStyle(image).transform,
        ),
    )
    .toBe("none");
});
