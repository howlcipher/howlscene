import { test, expect } from "@playwright/test";
import JSZip from "jszip";
import { readFile } from "node:fs/promises";

test("EDT-003 section spacing, alignment and width are saved and exported", async ({
  page,
}) => {
  await page.goto("/editor/");
  await expect(page.getByLabel("Section spacing")).toHaveValue("comfortable");
  await expect(page.getByLabel("Content alignment")).toHaveValue("center");
  await expect(page.getByLabel("Content width")).toHaveValue("normal");

  await page.getByLabel("Section spacing").selectOption("spacious");
  await page.getByLabel("Content alignment").selectOption("start");
  await page.getByLabel("Content width").selectOption("wide");
  const preview = page
    .getByRole("region", { name: "Live website preview" })
    .locator(".scene");
  await expect(preview).toHaveClass(/spacing-spacious/);
  await expect(preview).toHaveClass(/align-start/);
  await expect(preview).toHaveClass(/width-wide/);
  await expect(page.getByRole("status")).toContainText("Saved on this browser");

  await page.reload();
  await expect(page.getByLabel("Section spacing")).toHaveValue("spacious");
  await expect(page.getByLabel("Content alignment")).toHaveValue("start");
  await expect(page.getByLabel("Content width")).toHaveValue("wide");
  const downloading = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download my website" }).click();
  const path = await (await downloading).path();
  if (!path) throw new Error("No website ZIP was created");
  const archive = await JSZip.loadAsync(await readFile(path));
  const html = await archive.file("index.html")!.async("string");
  expect(html).toContain("spacing-spacious");
  expect(html).toContain("align-start");
  expect(html).toContain("width-wide");
});
