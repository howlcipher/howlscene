import { test, expect } from "@playwright/test";

test("THM-RESP-002 theme mobile navigation layouts remain readable and overflow-free", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/editor/");
  await page.getByLabel("New section type").selectOption("about");
  await page
    .getByRole("button", { name: "Add a section", exact: true })
    .click();
  await page.getByLabel("New section type").selectOption("projects");
  await page
    .getByRole("button", { name: "Add a section", exact: true })
    .click();
  const preview = page.getByRole("region", { name: "Live website preview" });
  const site = preview.locator(".howlscene");
  const navigation = site.locator(".site-header nav");

  for (const width of [375, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const theme of ["modern", "ink", "cyber"] as const) {
      await page.getByLabel("Visual theme").selectOption(theme);
      const layout = theme === "cyber" ? "stack" : "wrap";
      await expect(site).toHaveAttribute(
        "data-theme-mobile-navigation",
        layout,
      );
      const direction = await navigation.evaluate(
        (element) => getComputedStyle(element).flexDirection,
      );
      expect(direction).toBe(
        width <= 600 && layout === "stack" ? "column" : "row",
      );
      await expect(navigation.getByRole("link")).toHaveCount(3);
      await expect(navigation.getByRole("link").first()).toBeVisible();
      expect(
        await navigation.evaluate(
          (element) => element.scrollWidth <= element.clientWidth + 1,
        ),
        `${theme} navigation must fit at ${width}px`,
      ).toBe(true);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
      ).toBe(true);
    }
  }
});
