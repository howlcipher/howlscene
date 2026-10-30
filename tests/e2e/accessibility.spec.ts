import { test, expect, type Page, type Locator } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/** Move through the real tab order without programmatic focus or pointer input. */
async function tabTo(page: Page, target: Locator) {
  for (let step = 0; step < 120; step++) {
    if (await target.evaluate((element) => element === document.activeElement))
      return;
    await page.keyboard.press("Tab");
  }
  throw new Error(
    "The control could not be reached through the keyboard tab order.",
  );
}

test("A11Y-001 EDT-009 keyboard-only editing, section creation and backup download", async ({
  page,
}) => {
  await page.goto("/editor/");
  const title = page.getByLabel("Website title");
  await expect(title).toBeVisible();
  await tabTo(page, title);
  await page.keyboard.press("ControlOrMeta+a");
  await page.keyboard.insertText("Keyboard portfolio");
  const theme = page.getByLabel("Visual theme");
  await tabTo(page, theme);
  await page.keyboard.press("Home");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await expect(theme).toHaveValue("ink");
  const add = page.getByRole("button", { name: "Add a section", exact: true });
  await tabTo(page, add);
  await page.keyboard.press("Enter");
  const heading = page.getByLabel("Edit heading");
  await tabTo(page, heading);
  await page.keyboard.press("ControlOrMeta+a");
  await page.keyboard.insertText("Keyboard project");
  const text = page.getByRole("textbox", { name: "Section text" });
  await tabTo(page, text);
  await page.keyboard.press("ControlOrMeta+a");
  await page.keyboard.insertText("Created using the keyboard.");
  const move = page.getByRole("button", {
    name: "Move section up",
    exact: true,
  });
  await tabTo(page, move);
  await page.keyboard.press("Enter");
  const preview = page.getByRole("region", { name: "Live website preview" });
  await expect(
    preview.getByRole("heading", { name: "Keyboard project" }),
  ).toBeVisible();
  await expect(preview).toContainText("Created using the keyboard.");
  const backup = page.getByRole("button", {
    name: "Save project backup",
    exact: true,
  });
  await tabTo(page, backup);
  const download = page.waitForEvent("download");
  await page.keyboard.press("Enter");
  expect((await download).suggestedFilename()).toBe("howlscene-project.json");
  await expect(page.getByRole("status")).toContainText("Saved on this browser");
});

test("A11Y-005 A11Y-007 editor and preview have no serious automated violations or horizontal overflow", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/editor/");
  await expect(page.getByLabel("Website title")).toBeVisible();
  for (const width of [375, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const theme of ["ink", "cyber", "modern"]) {
      await page.getByLabel("Visual theme").selectOption(theme);
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze();
      expect(
        results.violations.filter(
          (violation) =>
            violation.impact === "serious" || violation.impact === "critical",
        ),
        `${theme} at ${width}px`,
      ).toEqual([]);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth + 1,
        ),
        `${theme} at ${width}px must reflow`,
      ).toBe(true);
    }
  }
});

test("THM-001 example theme switching preserves all section content", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/examples/william-elias/");
  await expect(
    page.getByRole("heading", { name: "William Elias", exact: true }),
  ).toBeVisible();
  const content = page.locator(".howlscene main");
  const initial = await content.innerText();
  for (const theme of ["cyber", "modern", "ink"]) {
    await page.getByLabel("Try a theme").selectOption(theme);
    expect(await content.innerText()).toBe(initial);
    await expect(
      page.getByRole("link", { name: "Original portfolio", exact: true }),
    ).toHaveAttribute("href", "https://howlcipher.github.io/william_elias/");
  }
});
