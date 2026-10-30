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
  const beforeDisable = await page
    .locator("#scene-2 .story-art")
    .evaluate((image: HTMLImageElement) => getComputedStyle(image).transform);
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
      page
        .locator("#scene-2 .story-art")
        .evaluate(
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
