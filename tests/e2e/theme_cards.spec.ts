import { test, expect } from "@playwright/test";

test("THM-CARD-002 built-in card treatments preserve readability and responsive grids", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/editor/");
  await page.getByLabel("New section type").selectOption("projects");
  await page
    .getByRole("button", { name: "Add a section", exact: true })
    .click();
  await page.getByRole("button", { name: "Add item", exact: true }).click();
  const preview = page.getByRole("region", { name: "Live website preview" });
  const site = preview.locator(".howlscene");
  const grid = site.locator(".entry-cards").last();
  const card = grid.locator("article").first();
  const themes = {
    modern: {
      treatment: "outlined",
      border: "solid",
      borderColor: "rgb(22, 36, 57)",
      shadow: "none",
      color: "rgb(22, 36, 57)",
      background: "rgb(244, 245, 247)",
    },
    ink: {
      treatment: "soft",
      border: "solid",
      borderColor: "rgba(0, 0, 0, 0)",
      shadow: "visible",
      color: "rgb(38, 59, 54)",
      background: "rgb(238, 233, 220)",
    },
    cyber: {
      treatment: "glow",
      border: "solid",
      borderColor: "rgb(110, 231, 237)",
      shadow: "visible",
      color: "rgb(244, 243, 255)",
      background: "rgb(17, 19, 38)",
    },
  } as const;

  for (const width of [375, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const theme of ["modern", "ink", "cyber"] as const) {
      await page.getByLabel("Visual theme").selectOption(theme);
      const expected = themes[theme];
      await expect(site).toHaveAttribute(
        "data-theme-card-style",
        expected.treatment,
      );
      await expect(card).toBeVisible();
      expect(
        await card.evaluate((element) => {
          const style = getComputedStyle(element);
          return {
            border: style.borderTopStyle,
            borderColor: style.borderTopColor,
            shadow: style.boxShadow,
            color: style.color,
            background: style.backgroundColor,
          };
        }),
      ).toMatchObject({
        border: expected.border,
        borderColor: expected.borderColor,
        color: expected.color,
        background: expected.background,
      });
      if (expected.shadow === "none")
        await expect(card).toHaveCSS("box-shadow", "none");
      else await expect(card).not.toHaveCSS("box-shadow", "none");
      expect(
        await grid.evaluate(
          (element) => element.scrollWidth <= element.clientWidth + 1,
        ),
        `${theme} cards at ${width}px must fit without horizontal overflow`,
      ).toBe(true);
    }
  }
});
