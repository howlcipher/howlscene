import { test, expect } from "@playwright/test";

test("EDT-001 EDT-003 EDT-004 EDT-006 guided editing survives history themes and reload", async ({
  page,
}) => {
  await page.goto("/editor/");
  await page.getByLabel("Website title").fill("Alex portfolio");
  await page.getByLabel("Edit heading").fill("Alex builds useful things");
  await page.getByLabel("Visual theme").selectOption("ink");
  await page.getByLabel("New section type").selectOption("projects");
  await page
    .getByRole("button", { name: "Add a section", exact: true })
    .click();
  await page.getByLabel("Edit heading").fill("Selected work");
  await page
    .getByRole("button", { name: "Move section up", exact: true })
    .click();
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await page.getByRole("button", { name: "Redo", exact: true }).click();
  await page.getByLabel("Visual theme").selectOption("cyber");
  await expect(
    page
      .getByRole("region", { name: "Live website preview" })
      .getByRole("heading", { name: "Alex builds useful things" }),
  ).toBeVisible();
  await expect(page.getByRole("status")).toContainText("Saved on this browser");
  await page.reload();
  await expect(page.getByLabel("Website title")).toHaveValue("Alex portfolio");
  await expect(
    page
      .getByRole("region", { name: "Live website preview" })
      .getByRole("heading", { name: "Selected work" }),
  ).toBeVisible();
  const event = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Save project backup", exact: true })
    .click();
  expect((await event).suggestedFilename()).toBe("howlscene-project.json");
});
test("TXT-001 EDT-002 formatting edits update preview without HTML", async ({
  page,
}) => {
  await page.goto("/editor/");
  const textbox = page.getByRole("textbox", { name: "Rich text introduction" });
  await textbox.fill("A thoughtfully made introduction");
  await textbox.press("ControlOrMeta+a");
  await page.getByRole("button", { name: "Bold", exact: true }).click();
  await expect(
    page
      .getByRole("region", { name: "Live website preview" })
      .locator("strong"),
  ).toContainText("A thoughtfully made introduction");
});

test("EDT-007 warns about edits even when browser storage is unavailable", async ({
  page,
}) => {
  await page.addInitScript(() =>
    Object.defineProperty(globalThis, "indexedDB", { value: undefined }),
  );
  await page.goto("/editor/");
  await page.getByLabel("Website title").fill("Do not lose me");
  expect(
    await page.evaluate(() => {
      const event = new Event("beforeunload", { cancelable: true });
      window.dispatchEvent(event);
      return event.defaultPrevented;
    }),
  ).toBe(true);
});
test("AST-001 EDT-005 delayed image preparation preserves newer edits", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const original = globalThis.createImageBitmap;
    Object.defineProperty(globalThis, "createImageBitmap", {
      value: (...args: unknown[]) =>
        new Promise<ImageBitmap>((resolve) => {
          window.addEventListener(
            "finish-image",
            () => {
              void (
                Reflect.apply(
                  original,
                  globalThis,
                  args,
                ) as Promise<ImageBitmap>
              ).then(resolve);
            },
            { once: true },
          );
        }),
    });
  });
  await page.goto("/editor/");
  const image = await page.evaluate(() => {
    const c = document.createElement("canvas");
    c.width = 32;
    c.height = 32;
    const x = c.getContext("2d")!;
    x.fillStyle = "green";
    x.fillRect(0, 0, 32, 32);
    return c.toDataURL().split(",")[1]!;
  });
  await page.getByLabel("Change section image").setInputFiles({
    name: "test.png",
    mimeType: "image/png",
    buffer: Buffer.from(image, "base64"),
  });
  await page.getByLabel("Website title").fill("Newer edit");
  await page.evaluate(() => window.dispatchEvent(new Event("finish-image")));
  await expect(
    page.getByRole("region", { name: "Live website preview" }).locator("img"),
  ).toBeVisible();
  await expect(page.getByLabel("Website title")).toHaveValue("Newer edit");
});

test("EDT-002 website title can be replaced using ordinary keyboard editing", async ({
  page,
}) => {
  await page.goto("/editor/");
  const title = page.getByLabel("Website title");
  await title.focus();
  await title.press("ControlOrMeta+a");
  await title.press("Backspace");
  await expect(title).toHaveValue("");
  await title.pressSequentially("A fresh title");
  await expect(
    page
      .getByRole("region", { name: "Live website preview" })
      .locator(".site-title"),
  ).toHaveText("A fresh title");
});

test("EDT-009 phone preview responds to its own width on a desktop screen", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/editor/");
  const preview = page.getByRole("region", { name: "Live website preview" });
  const heading = preview.locator(".scene h1");
  await expect(heading).toBeVisible();
  const desktop = await heading.evaluate((el) =>
    parseFloat(getComputedStyle(el).fontSize),
  );
  await page.getByLabel("Preview size").selectOption("375px");
  const phone = await heading.evaluate((el) =>
    parseFloat(getComputedStyle(el).fontSize),
  );
  expect(phone).toBeLessThan(desktop);
  expect(
    await preview
      .locator(".site-header")
      .evaluate((el) => getComputedStyle(el).flexDirection),
  ).toBe("column");
});
