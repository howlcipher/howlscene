import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("the ink-wash sample is a complete navigable Lorem Ipsum story", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/examples/ink-wash-story/");

  await expect(
    page.getByRole("heading", { name: "Lorem ipsum dolor sit amet" }),
  ).toBeVisible();
  const scenes = page.locator(".story-demo .scene");
  await expect(scenes).toHaveCount(5);
  await expect(page.locator(".story-art")).toHaveCount(5);
  await expect(
    page.getByRole("navigation", { name: "Story scenes" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "01, Scene 1: Lorem ipsum dolor sit amet" }),
  ).toHaveAttribute("aria-current", "location");
  await expect
    .poll(() =>
      page
        .locator(".story-art")
        .first()
        .evaluate((image: HTMLImageElement) => image.naturalWidth),
    )
    .toBeGreaterThan(0);

  await page
    .getByRole("link", { name: "02, Scene 2: Consectetur adipiscing elit" })
    .click();
  await expect(page).toHaveURL(/#scene-2$/);
  await expect(page.locator("#scene-2")).toHaveAttribute(
    "data-scene-state",
    "active",
  );
  await expect(
    page.getByRole("link", {
      name: "02, Scene 2: Consectetur adipiscing elit",
    }),
  ).toHaveAttribute("aria-current", "location");
  const sceneTwoArt = page.locator(".story-canvas .story-art").nth(1);
  const beforeDisable = await sceneTwoArt.evaluate(
    (image: HTMLImageElement) => getComputedStyle(image).transform,
  );
  expect(beforeDisable).not.toBe("none");

  await page.getByRole("button", { name: "Disable animation" }).click();
  await expect(
    page.getByRole("button", { name: "Enable animation" }),
  ).toBeVisible();
  await expect(page.locator(".story-demo .howlscene")).toHaveAttribute(
    "data-motion-enabled",
    "false",
  );
  await expect
    .poll(() =>
      sceneTwoArt.evaluate(
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

test("the story stays readable at a phone width", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/examples/ink-wash-story/");
  await expect(page.locator(".story-demo .scene")).toHaveCount(5);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Lorem ipsum",
  );
  await expect(
    page.getByRole("navigation", { name: "Story scenes" }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("scrolling blends between pinned landscape scenes", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/examples/ink-wash-story/");
  await page.evaluate(() =>
    window.scrollTo({ top: window.innerHeight * 0.45, behavior: "instant" }),
  );
  await expect
    .poll(() => page.evaluate(() => window.scrollY))
    .toBeGreaterThan(300);
  const scrollPosition = await page.evaluate(() => window.scrollY);
  expect(scrollPosition).toBeLessThan(500);

  const stage = page.locator(".story-canvas");
  await expect(stage).toBeVisible();
  const geometry = await stage.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return {
      position: getComputedStyle(element).position,
      top: Math.round(rect.top),
      height: Math.round(rect.height),
      viewport: window.innerHeight,
    };
  });
  expect(geometry.position).toBe("fixed");
  expect(geometry.top).toBe(0);
  expect(geometry.height).toBe(geometry.viewport);

  await expect
    .poll(() =>
      page
        .locator(".story-canvas .story-art")
        .first()
        .evaluate((image) =>
          Number(getComputedStyle(image.parentElement!).opacity),
        ),
    )
    .toBeLessThan(0.9);
  const [firstOpacity, secondOpacity] = await page
    .locator(".story-canvas .story-art")
    .evaluateAll((images) =>
      images
        .slice(0, 2)
        .map((image) => Number(getComputedStyle(image.parentElement!).opacity)),
    );
  expect(firstOpacity).toBeGreaterThan(0.1);
  expect(firstOpacity).toBeLessThan(0.9);
  expect(secondOpacity).toBeGreaterThan(0.1);
  expect(secondOpacity).toBeLessThan(0.9);

  const copyPanels = page.locator(".story-copy-panel");
  const [firstCopyOpacity, secondCopyOpacity] = await copyPanels.evaluateAll(
    (panels) =>
      panels
        .slice(0, 2)
        .map((panel) => Number(getComputedStyle(panel).opacity)),
  );
  expect(firstCopyOpacity).toBeGreaterThan(0.1);
  expect(firstCopyOpacity).toBeLessThan(0.9);
  expect(secondCopyOpacity).toBeGreaterThan(0.1);
  expect(secondCopyOpacity).toBeLessThan(0.9);
  const copyGeometry = await copyPanels.first().evaluate((panel) => {
    const rect = panel.getBoundingClientRect();
    return { top: rect.top, bottom: rect.bottom, viewport: innerHeight };
  });
  expect(copyGeometry.top).toBeGreaterThan(0);
  expect(copyGeometry.bottom).toBeLessThan(copyGeometry.viewport);
});

test("reduced motion keeps the scene static and content navigable", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/examples/ink-wash-story/");
  const toggle = page.getByRole("button", { name: "Enable animation" });
  await expect(toggle).toBeDisabled();
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
});
