import { test, expect, type Dialog } from "@playwright/test";
test("EDT-008 A11Y-006 item deletion confirms and restores useful keyboard focus", async ({
  page,
}) => {
  await page.goto("/editor/");
  await page.getByLabel("New section type").selectOption("projects");
  await page
    .getByRole("button", { name: "Add a section", exact: true })
    .click();
  await page.getByRole("button", { name: "Add item", exact: true }).click();
  await page.getByLabel("Item title", { exact: true }).fill("Important work");
  const dialogs: string[] = [];
  const dismiss = async (dialog: Dialog) => {
    dialogs.push(dialog.message());
    await dialog.dismiss();
  };
  page.on("dialog", dismiss);
  const remove = page.getByRole("button", {
    name: "Remove item 1",
    exact: true,
  });
  await remove.focus();
  await remove.press("Enter");
  expect(dialogs).toHaveLength(1);
  await expect(page.getByLabel("Item title", { exact: true })).toHaveValue(
    "Important work",
  );
  await expect(remove).toBeFocused();
  page.off("dialog", dismiss);
  page.once("dialog", (dialog) => dialog.accept());
  await remove.press("Enter");
  await expect(page.getByLabel("Item title", { exact: true })).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Add item", exact: true }),
  ).toBeFocused();
  page.once("dialog", (dialog) => dialog.accept());
  await page
    .getByRole("button", { name: "Delete section", exact: true })
    .focus();
  await page.keyboard.press("Enter");
  await expect(page.locator(".section-list [aria-pressed=true]")).toBeFocused();
});
