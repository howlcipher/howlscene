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
  const coverImage = await page.evaluate(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 32;
    canvas.height = 32;
    const context = canvas.getContext("2d")!;
    context.fillStyle = "#718a79";
    context.fillRect(0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/png").split(",")[1]!;
  });
  await page.getByLabel("Change transition cover").setInputFiles({
    name: "mist-cover.png",
    mimeType: "image/png",
    buffer: Buffer.from(coverImage, "base64"),
  });
  const cover = firstScene.locator(".scene-transition-cover");
  await expect(cover).toHaveAttribute("aria-hidden", "true");
  await expect(cover).toHaveAttribute("alt", "");
  await expect(cover).toHaveAttribute("src", /^data:image\/webp;base64,/);
  await page.getByRole("button", { name: "Remove transition cover" }).click();
  await expect(cover).toHaveCount(0);
});
