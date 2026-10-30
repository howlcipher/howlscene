import { test, expect } from "@playwright/test";
test("product routes lead to a real editor and consumer example", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("link", { name: "Open the editor", exact: false })
    .click();
  await expect(page).toHaveURL(/\/editor\/$/);
  await expect(page.getByLabel("Website title")).toBeVisible();
  await expect(page.getByRole("status")).toContainText("Saved on this browser");
  await page.goto("/examples/william-elias/");
  await expect(
    page.getByRole("heading", { name: "William Elias", exact: true }),
  ).toBeVisible();
  await page.goto("/examples/ink-wash-story/");
  await expect(
    page.getByRole("heading", { name: "Lorem ipsum dolor sit amet" }),
  ).toBeVisible();
});
