import { test, expect } from "@playwright/test";
import JSZip from "jszip";
import { readFile } from "node:fs/promises";

test("EDT-005 uploaded section image position is editable, saved and exported", async ({
  page,
}) => {
  await page.goto("/editor/");
  await expect(page.getByLabel("Image position")).toHaveCount(0);
  const image = await page.evaluate(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 32;
    canvas.height = 32;
    const context = canvas.getContext("2d")!;
    context.fillStyle = "green";
    context.fillRect(0, 0, 32, 32);
    return canvas.toDataURL().split(",")[1]!;
  });
  await page.getByLabel("Change section image").setInputFiles({
    name: "position.png",
    mimeType: "image/png",
    buffer: Buffer.from(image, "base64"),
  });
  await expect(
    page.getByRole("region", { name: "Live website preview" }).locator("img"),
  ).toBeVisible();
  await page.getByLabel("Image treatment").selectOption("background");
  await page.getByLabel("Image position").selectOption("top");
  const preview = page.getByRole("region", { name: "Live website preview" });
  await expect(preview.locator("img")).toHaveCSS("object-position", "50% 0%");
  await expect(page.getByRole("status")).toContainText("Saved on this browser");
  await page.reload();
  await expect(page.getByLabel("Image position")).toHaveValue("top");
  await expect(
    page.getByRole("region", { name: "Live website preview" }).locator("img"),
  ).toHaveCSS("object-position", "50% 0%");

  const downloading = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download my website" }).click();
  const path = await (await downloading).path();
  if (!path) throw new Error("No website ZIP was created");
  const archive = await JSZip.loadAsync(await readFile(path));
  const html = await archive.file("index.html")!.async("string");
  expect(html).toContain("object-position:top");
  expect(html).toContain("scene-background-image");
});
