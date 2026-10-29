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

test("EDT-012 compatible layout presets change composition in preview and export", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/editor/");
  await page.getByLabel("New section type").selectOption("about");
  await page.getByRole("button", { name: "Add a section" }).click();
  await page.getByLabel("Edit heading").last().fill("About the field");

  const image = await page.evaluate(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 320;
    canvas.height = 180;
    const context = canvas.getContext("2d");
    if (!context) throw Error("Canvas image creation is unavailable.");
    context.fillStyle = "#dce9f1";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#385a69";
    context.beginPath();
    context.moveTo(0, 160);
    context.lineTo(100, 40);
    context.lineTo(190, 160);
    context.lineTo(260, 70);
    context.lineTo(320, 160);
    context.closePath();
    context.fill();
    return canvas.toDataURL("image/png").split(",")[1]!;
  });
  await page.getByLabel("Change section image").setInputFiles({
    name: "field-study.png",
    mimeType: "image/png",
    buffer: Buffer.from(image, "base64"),
  });
  await page.getByLabel("Image description (alt text)").fill("Painted hills");

  const preview = page.getByRole("region", { name: "Live website preview" });
  const section = preview.locator(".scene").last();
  const sectionImage = section.locator("img.section-image");
  const layout = page
    .locator("label")
    .filter({ hasText: /^Layout/ })
    .locator("select");
  await expect(layout).toHaveValue("wide");
  await expect(layout.locator("option")).toHaveText([
    "wide",
    "split",
    "centered",
  ]);
  await expect(sectionImage).toBeVisible();
  await expect(sectionImage).toHaveAttribute("alt", "Painted hills");

  await layout.selectOption("split");
  await expect(section).toHaveClass(/layout-split/);
  await expect(sectionImage).toHaveCSS("float", "right");
  await page.getByLabel("Preview size").selectOption("375px");
  await expect(sectionImage).toHaveCSS("float", "none");
  await page.getByLabel("Preview size").selectOption("100%");
  await layout.selectOption("centered");
  await expect(section).toHaveClass(/layout-centered/);
  await layout.selectOption("split");
  await expect(page.getByRole("status")).toContainText("Saved on this browser");

  await page.reload();
  await page.getByRole("button", { name: "About the field" }).click();
  await expect(
    page
      .locator("label")
      .filter({ hasText: /^Layout/ })
      .locator("select"),
  ).toHaveValue("split");
  const reloadedSection = page
    .getByRole("region", { name: "Live website preview" })
    .locator(".scene")
    .last();
  await expect(reloadedSection).toHaveClass(/layout-split/);
  await expect(reloadedSection.locator("img.section-image")).toHaveAttribute(
    "alt",
    "Painted hills",
  );

  const downloading = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download my website" }).click();
  const path = await (await downloading).path();
  if (!path) throw Error("No website ZIP was created");
  const archive = await JSZip.loadAsync(await readFile(path));
  const html = await archive.file("index.html")!.async("string");
  expect(html).toContain("layout-split");
  expect(html).toContain("About the field");
  expect(html).toContain('alt="Painted hills"');
});
