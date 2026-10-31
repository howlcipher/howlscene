import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("the ink-wash sample renders its five scenes through the shared engine", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/examples/ink-wash-story/");

  const scenes = page.locator(".story-demo .scene");
  await expect(scenes).toHaveCount(5);
  await expect(scenes.first().locator(".scene-background-image")).toBeVisible();
  await expect(scenes.locator(".scene-background-image")).toHaveCount(5);
  await expect(page.locator(".story-copy-stage, .story-canvas")).toHaveCount(0);
  await expect(
    page.getByRole("heading", { name: "Lorem ipsum dolor sit amet" }),
  ).toBeVisible();
  await expect(page.locator(".story-demo .howlscene")).toHaveAttribute(
    "data-experience",
    "cinematic",
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

  const sceneTwoArt = page.locator("#scene-2 .scene-background-image");
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

test("the ink-wash story remains readable at a phone width", async ({
  page,
}) => {
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
