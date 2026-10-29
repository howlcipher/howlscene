import { test, expect } from "@playwright/test";
import JSZip from "jszip";
import { readFile } from "node:fs/promises";

test("EDT-011 creators customize card and mobile navigation styles across themes, reload and export", async ({
  page,
}) => {
  await page.goto("/editor/");
  await page.getByLabel("Visual theme").selectOption("cyber");
  await page.getByRole("button", { name: "Add a section" }).click();
  await page.getByRole("button", { name: "Add item" }).click();
  await page.getByLabel("Item title").last().fill("Readable project card");

  const preview = page.getByRole("region", { name: "Live website preview" });
  const site = preview.locator(".howlscene");
  await page.getByText("More style choices", { exact: true }).click();
  await page.getByLabel("Card appearance").selectOption("soft");
  await page.getByLabel("Navigation link style").selectOption("underline");
  await page.getByLabel("Phone navigation layout").selectOption("stack");

  await expect(site).toHaveAttribute("data-theme-card-style", "soft");
  await expect(site).toHaveAttribute(
    "data-theme-navigation-style",
    "underline",
  );
  await expect(site).toHaveAttribute("data-theme-mobile-navigation", "stack");
  const card = preview.locator(".entry-cards article").last();
  await expect(card).toHaveCSS("border-top-color", "rgba(0, 0, 0, 0)");
  await expect
    .poll(() => card.evaluate((element) => getComputedStyle(element).boxShadow))
    .not.toBe("none");

  await page.getByLabel("Visual theme").selectOption("ink");
  await expect(site).toHaveAttribute("data-theme-card-style", "soft");
  await expect(site).toHaveAttribute(
    "data-theme-navigation-style",
    "underline",
  );
  await expect(site).toHaveAttribute("data-theme-mobile-navigation", "stack");

  await page.setViewportSize({ width: 375, height: 900 });
  await expect
    .poll(() =>
      preview
        .locator(".site-header nav")
        .evaluate((element) => getComputedStyle(element).flexDirection),
    )
    .toBe("column");
  await expect(page.getByRole("status")).toContainText("Saved on this browser");
  await page.reload();
  const reloadedSite = page
    .getByRole("region", { name: "Live website preview" })
    .locator(".howlscene");
  await expect(reloadedSite).toHaveAttribute("data-theme-card-style", "soft");
  await expect(reloadedSite).toHaveAttribute(
    "data-theme-navigation-style",
    "underline",
  );
  await expect(reloadedSite).toHaveAttribute(
    "data-theme-mobile-navigation",
    "stack",
  );

  const downloading = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download my website" }).click();
  const path = await (await downloading).path();
  if (!path) throw new Error("No website ZIP was created");
  const archive = await JSZip.loadAsync(await readFile(path));
  const html = await archive.file("index.html")!.async("string");
  expect(html).toContain('data-theme-card-style="soft"');
  expect(html).toContain('data-theme-navigation-style="underline"');
  expect(html).toContain('data-theme-mobile-navigation="stack"');
  expect(html).toContain("Readable project card");
});
