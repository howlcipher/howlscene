import { test, expect } from "@playwright/test";

const fontFamilies = {
  ink: "HowlScene Test Serif",
  cyber: "HowlScene Test Mono",
  modern: "HowlScene Test Sans",
} as const;
const testFonts = `
@font-face{font-family:"HowlScene Test Serif";src:url("/tests/fixtures/fonts/LiberationSerif-Regular.ttf") format("truetype");font-style:normal;font-weight:400;font-display:block;}
@font-face{font-family:"HowlScene Test Serif";src:url("/tests/fixtures/fonts/LiberationSerif-Bold.ttf") format("truetype");font-style:normal;font-weight:700;font-display:block;}
@font-face{font-family:"HowlScene Test Mono";src:url("/tests/fixtures/fonts/DejaVuSansMono.ttf") format("truetype");font-style:normal;font-weight:400;font-display:block;}
@font-face{font-family:"HowlScene Test Mono";src:url("/tests/fixtures/fonts/DejaVuSansMono-Bold.ttf") format("truetype");font-style:normal;font-weight:700;font-display:block;}
@font-face{font-family:"HowlScene Test Sans";src:url("/tests/fixtures/fonts/NotoSans-Regular.ttf") format("truetype");font-style:normal;font-weight:400;font-display:block;}
@font-face{font-family:"HowlScene Test Sans";src:url("/tests/fixtures/fonts/NotoSans-Bold.ttf") format("truetype");font-style:normal;font-weight:700;font-display:block;}
`;
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
        .getByRole("textbox", { name: "Rich text introduction" })
        .fill(
          "Software, ideas, and small experiments. This portfolio brings them together in one readable place.",
        );
      await page.getByLabel("Visual theme").selectOption(theme);
      await page.getByLabel("Choose animation style").selectOption("none");
      await expect(page.getByRole("status")).toContainText(
        "Saved on this browser",
      );
      const family = fontFamilies[theme];
      await page.addStyleTag({
        content:
          testFonts +
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
      await expect(preview).toHaveScreenshot(`preview-${theme}-${width}.png`, {
        animations: "disabled",
        caret: "hide",
      });
    });
  }
}
