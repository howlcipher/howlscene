import { test, expect } from "@playwright/test";
import { visualFontFamilies, visualFontFaceCss } from "./visual_font_fixture";
// Tests pin the fonts Chromium used for the reviewed baselines. Production keeps
// its system font choices; these unmodified licensed fixtures never enter builds.
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
        .getByRole("textbox", { name: "Section text" })
        .fill(
          "Software, ideas, and small experiments. This portfolio brings them together in one readable place.",
        );
      await page.getByLabel("Visual theme").selectOption(theme);
      await page.getByLabel("Choose animation style").selectOption("none");
      await expect(page.getByRole("status")).toContainText(
        "Saved on this browser",
      );
      const family = visualFontFamilies[theme];
      await page.addStyleTag({
        content:
          visualFontFaceCss("/tests/fixtures/fonts") +
          `.preview .howlscene{--scene-font:"${family}" !important;}`,
      });
      const loaded = await page.evaluate(async (family) => {
        const faces = await Promise.all(
          [400, 700].map((weight) =>
            document.fonts.load(`${weight} 16px "${family}"`),
          ),
        );
        await document.fonts.ready;
        return faces.map((matches) => matches.length);
      }, family);
      expect(loaded).toEqual([1, 1]);
      const preview = page.getByRole("region", {
        name: "Live website preview",
      });
      await expect(
        preview.getByRole("heading", { name: "Alex builds useful things" }),
      ).toBeVisible();
      // Mobile/tablet controls have OS-dependent line metrics. Keep the live
      // preview's measured size, but paint this theme fixture at an integer
      // viewport origin so editor layout cannot alter glyph rasterization.
      const originalBox = await preview.boundingBox();
      if (!originalBox)
        throw new Error("The preview has no measurable layout.");
      await preview.evaluate((element, measuredWidth) => {
        Object.assign(element.style, {
          position: "fixed",
          top: "0px",
          left: "0px",
          width: `${measuredWidth}px`,
          zIndex: "9999",
        });
      }, originalBox.width);
      const captureBox = await preview.boundingBox();
      expect(captureBox).toEqual({
        x: 0,
        y: 0,
        width: originalBox.width,
        height: originalBox.height,
      });
      await expect(preview).toHaveScreenshot(`preview-${theme}-${width}.png`, {
        animations: "disabled",
        caret: "hide",
      });
    });
  }
}
