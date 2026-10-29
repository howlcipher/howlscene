import { test, expect } from "@playwright/test";

test("THM-NAV-002 built-in navigation treatments stay distinct, visible and responsive", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/editor/");
  const preview = page.getByRole("region", { name: "Live website preview" });
  const site = preview.locator(".howlscene");
  const navigation = site.locator(".site-header nav");
  const link = navigation.getByRole("link").first();
  const expectations = {
    modern: {
      treatment: "plain",
      underline: "underline",
      decorationColor: "rgb(22, 36, 57)",
      border: "none",
    },
    ink: {
      treatment: "underline",
      underline: "underline",
      decorationColor: "rgb(73, 96, 82)",
      border: "none",
    },
    cyber: {
      treatment: "framed",
      underline: "none",
      decorationColor: "rgb(244, 243, 255)",
      border: "solid",
    },
  } as const;

  for (const width of [375, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const theme of ["modern", "ink", "cyber"] as const) {
      await page.getByLabel("Visual theme").selectOption(theme);
      const expected = expectations[theme];
      await expect(site).toHaveAttribute(
        "data-theme-navigation-style",
        expected.treatment,
      );
      await expect(link).toBeVisible();
      expect(await link.getAttribute("href")).toMatch(/^#/);
      expect(
        await link.evaluate((element) => {
          const style = getComputedStyle(element);
          return {
            underline: style.textDecorationLine,
            decorationColor: style.textDecorationColor,
            border: style.borderTopStyle,
          };
        }),
      ).toEqual({
        underline: expected.underline,
        decorationColor: expected.decorationColor,
        border: expected.border,
      });
      expect(
        await navigation.evaluate(
          (element) => element.scrollWidth <= element.clientWidth + 1,
        ),
        `${theme} navigation at ${width}px must fit by wrapping`,
      ).toBe(true);
    }
  }
});
