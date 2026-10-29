import { test, expect } from "@playwright/test";

test("MOT-007 long cinematic content grows naturally and remains reachable with ordinary document scrolling", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.setViewportSize({ width: 768, height: 800 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/editor/");
  await page.getByLabel("Choose animation style").selectOption("cinematic");
  await page
    .getByRole("combobox", { name: "Layout", exact: true })
    .selectOption("wide");
  await page
    .getByText("Plain text alternative (removes formatting when edited)", {
      exact: true,
    })
    .click();
  const ending = "End of the long story: every word remains available.";
  const paragraphs = Array.from(
    { length: 75 },
    (_, index) =>
      `Paragraph ${index + 1}. A long story needs room to breathe. Ordinary scrolling must preserve every sentence, every example, and the final thought without trapping the reader.`,
  );
  const body = [...paragraphs, "UnbrokenWord" + "x".repeat(1200), ending].join(
    "\n",
  );
  expect(body.length).toBeGreaterThan(10000);
  await page
    .getByRole("textbox", { name: "Edit introduction", exact: true })
    .fill(body);
  const preview = page.getByRole("region", { name: "Live website preview" });
  const scene = preview.locator(".scene").first();
  const last = scene.getByText(ending, { exact: true });
  await expect(last).toBeAttached();
  for (const width of [768, 375]) {
    await page.setViewportSize({ width, height: 800 });
    for (const theme of ["ink", "cyber", "modern"]) {
      await page.getByLabel("Visual theme").selectOption(theme);
      await expect(preview.locator(".howlscene")).toHaveAttribute(
        "data-theme",
        theme,
      );
      const geometry = await scene.evaluate((element) => {
        const last = element.querySelector(".scene-copy > p:last-of-type");
        if (!last) throw new Error("Missing final paragraph");
        return {
          height: element.getBoundingClientRect().height,
          viewport: innerHeight,
          bottom: element.getBoundingClientRect().bottom,
          lastBottom: last.getBoundingClientRect().bottom,
        };
      });
      expect(geometry.height).toBeGreaterThan(geometry.viewport * 2);
      expect(geometry.lastBottom).toBeLessThanOrEqual(geometry.bottom + 1);
      // Click readable content to leave the textarea, then use normal browser
      // document navigation rather than changing scroll positions in a fixture.
      await scene.getByRole("heading", { level: 1 }).click();
      await page.keyboard.press("ControlOrMeta+End");
      await expect(last).toBeInViewport();
      await expect(preview.locator("footer")).toBeInViewport();
      expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth + 1,
        ),
      ).toBe(true);
      expect(await scene.innerText()).toContain(ending);
    }
  }
  expect(errors).toEqual([]);
});
