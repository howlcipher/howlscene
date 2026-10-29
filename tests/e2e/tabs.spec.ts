import { test, expect } from "@playwright/test";

test("EDT-006 competing editor tabs cannot silently overwrite the owning local draft", async ({
  page,
  context,
}) => {
  await page.goto("/editor/");
  await page.getByLabel("Website title").fill("First tab owns this draft");
  await expect(page.getByRole("status")).toContainText("Saved on this browser");
  const second = await context.newPage();
  await second.goto("/editor/");
  await expect(second.getByRole("status")).toContainText(
    /another.*tab|another.*editor|already.*open/i,
  );
  await second
    .getByLabel("Website title")
    .fill("Second tab must not overwrite");
  // Exercise its debounce window before checking the persisted draft.
  await second.waitForTimeout(700);
  await page.reload();
  await expect(page.getByLabel("Website title")).toHaveValue(
    "First tab owns this draft",
  );
  await expect(page.getByRole("status")).toContainText("Saved on this browser");
  await second.close();
});
