import { expect, test } from "@playwright/test";

test("CIN-001 CIN-006 CIN-007 editor creates a cinematic story and changes a scene transition", async ({
  page,
}) => {
  await page.goto("/editor/");
  page.once("dialog", (dialog) => void dialog.accept());
  await page.getByLabel("Start from a template").selectOption("cinematic");
  await expect(page.locator(".howlscene")).toHaveAttribute(
    "data-experience",
    "cinematic",
  );
  await page.getByLabel("Edit heading").fill("A story that belongs to me");
  await page.getByLabel("Transition style").selectOption("mist-reveal");
  const firstScene = page
    .getByRole("region", { name: "Live website preview" })
    .locator(".scene")
    .first();
  await expect(firstScene).toHaveAttribute("data-transition", "mist-reveal");
  await expect(firstScene).toContainText("A story that belongs to me");
});
