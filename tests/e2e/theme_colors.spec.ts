import { test, expect } from "@playwright/test";
import JSZip from "jszip";
import { readFile } from "node:fs/promises";

async function chooseColor(
  page: import("@playwright/test").Page,
  label: string,
  value: string,
) {
  await page.getByLabel(label, { exact: true }).evaluate((element, color) => {
    const input = element as HTMLInputElement;
    const setValue = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value",
    )?.set;
    setValue?.call(input, color);
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }, value);
}

test("EDT-010 creators can change text and background colors, switch themes, reload and export", async ({
  page,
}) => {
  await page.goto("/editor/");
  const preview = page.getByRole("region", { name: "Live website preview" });
  const site = preview.locator(".howlscene");
  const content = await preview.locator("main").innerText();

  await chooseColor(page, "Background color", "#767676");
  await chooseColor(page, "Text color", "#767676");
  await chooseColor(page, "Accent color", "#767676");
  await expect(site).toHaveCSS("--scene-bg", "#767676");
  await expect(site).toHaveCSS("--scene-fg", "#000000");
  await expect(site).toHaveCSS("--scene-accent", "#000000");
  await expect(page.getByText(/higher-contrast color is shown/)).toBeVisible();

  for (const theme of ["ink", "cyber"] as const) {
    await page.getByLabel("Visual theme").selectOption(theme);
    await expect(site).toHaveCSS("--scene-bg", "#767676");
    await expect(site).toHaveCSS("--scene-fg", "#000000");
    await expect(site).toHaveCSS("--scene-accent", "#000000");
    expect(await preview.locator("main").innerText()).toBe(content);
  }

  await expect(page.getByRole("status")).toContainText("Saved on this browser");
  await page.reload();
  await expect(page.getByLabel("Background color")).toHaveValue("#767676");
  await expect(page.getByLabel("Text color")).toHaveValue("#767676");
  await expect(page.getByLabel("Accent color")).toHaveValue("#767676");
  const siteAfterReload = page
    .getByRole("region", { name: "Live website preview" })
    .locator(".howlscene");
  await expect(siteAfterReload).toHaveCSS("--scene-fg", "#000000");

  const downloading = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download my website" }).click();
  const path = await (await downloading).path();
  if (!path) throw new Error("No website ZIP was created");
  const archive = await JSZip.loadAsync(await readFile(path));
  const html = await archive.file("index.html")!.async("string");
  expect(html).toContain("--scene-bg:#767676");
  expect(html).toContain("--scene-fg:#000000");
  expect(html).toContain("--scene-accent:#000000");
  expect(html).toContain("Build something worth sharing");
});
