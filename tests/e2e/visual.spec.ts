import { test, expect } from "@playwright/test";

// Generate baselines explicitly, review them, and commit only intended appearances.
// Motion is disabled through the user's media preference, not timing assumptions.
for (const width of [375, 768, 1440]) {
  for (const theme of ["ink", "cyber", "modern"] as const) {
    test(`visual preview ${theme} ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 1000 });
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto("/editor/");
      await page
        .getByLabel("Website title")
        .fill("A place for thoughtful work");
      await page.getByLabel("Edit heading").fill("Alex builds useful things");
      await page
        .getByRole("textbox", { name: "Rich text introduction" })
        .fill(
          "Software, ideas, and small experiments. This portfolio brings them together in one readable place.",
        );
      await page.getByLabel("Visual theme").selectOption(theme);
      await page.getByLabel("Choose animation style").selectOption("none");
      await expect(page.getByRole("status")).toContainText(
        "Saved on this browser",
      );
      await page.evaluate(() => document.fonts.ready);
      const preview = page.getByRole("region", {
        name: "Live website preview",
      });
      await expect(
        preview.getByRole("heading", { name: "Alex builds useful things" }),
      ).toBeVisible();
      await expect(preview).toHaveScreenshot(`preview-${theme}-${width}.png`, {
        animations: "disabled",
        caret: "hide",
      });
    });
  }
}
