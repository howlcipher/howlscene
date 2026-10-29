import { test, expect } from "@playwright/test";

test("MOT-004 MOT-006 rapid theme and anchor changes dispose prior transitions without changing content", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/examples/william-elias/");
  const theme = page.getByLabel("Try a theme");
  const site = page.locator(".howlscene");
  const content = site.locator("main");
  await expect(theme).toBeEnabled();
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          document
            .getAnimations()
            .filter((animation) => animation.playState === "running").length,
      ),
    )
    .toBeGreaterThan(0);
  const original = await content.innerText();
  const sections = await content.locator(".scene").evaluateAll((elements) =>
    elements.map((element) => ({
      id: element.id,
      text: element.textContent,
    })),
  );
  // Each real select change remounts enhancement; anchors exercise scrolling while
  // prior finite animations are still eligible to complete asynchronously.
  for (const [next, destination] of [
    ["cyber", "about"],
    ["ink", "projects"],
    ["modern", "skills"],
    ["cyber", "connect"],
  ] as const) {
    await theme.selectOption(next);
    await site.locator(`nav a[href="#${destination}"]`).click();
    await expect(page).toHaveURL(new RegExp(`#${destination}$`));
  }
  await expect(site).toHaveAttribute("data-theme", "cyber");
  await expect(content.locator("#connect h2")).toBeInViewport();
  expect(await content.innerText()).toBe(original);
  expect(
    await content.locator(".scene").evaluateAll((elements) =>
      elements.map((element) => ({
        id: element.id,
        text: element.textContent,
      })),
    ),
  ).toEqual(sections);
  await site
    .getByRole("button", { name: "Disable animation", exact: true })
    .click();
  await expect(site).toHaveAttribute("data-motion-enabled", "false");
  await expect
    .poll(() => page.evaluate(() => document.getAnimations().length))
    .toBe(0);
  await site.locator('nav a[href="#connect"]').click();
  await expect(content.locator("#connect h2")).toBeInViewport();
  // Let queued observer/frame/completion microtasks run before the final checks.
  await page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      ),
  );
  expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
  expect(await content.innerText()).toBe(original);
  expect(
    await site
      .locator(".scenery-layer")
      .evaluateAll((elements) =>
        elements.every(
          (element) => (element as HTMLElement).style.transform === "",
        ),
      ),
  ).toBe(true);
  expect(errors).toEqual([]);
});
