import { test, expect } from "@playwright/test";

test("EDT-ONBOARD-001 the optional beginner guide can be skipped, reopened and completed", async ({
  page,
}) => {
  await page.goto("/editor/");
  const guide = page.getByRole("region", { name: "Getting started guide" });
  await expect(guide).toBeVisible();
  await expect(guide).toContainText("Step 1 of 5");
  await expect(
    page.getByRole("button", { name: "Previous step" }),
  ).toBeDisabled();

  await page.getByRole("button", { name: "Skip guide" }).click();
  await expect(guide).toBeHidden();
  await expect(
    page.getByRole("button", { name: "Getting started" }),
  ).toHaveAttribute("aria-expanded", "false");
  await page.getByRole("button", { name: "Getting started" }).click();
  await expect(guide).toContainText("Step 1 of 5");
  await expect(
    guide.getByRole("heading", { name: "Pick a starting point" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Next step" }).click();
  await expect(guide).toContainText("Step 2 of 5");
  await expect(
    guide.getByRole("heading", { name: "Make the words yours" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Previous step" }).click();
  await expect(guide).toContainText("Step 1 of 5");

  for (let step = 1; step < 5; step += 1)
    await page.getByRole("button", { name: "Next step" }).click();
  await expect(guide).toContainText("Step 5 of 5");
  await expect(
    guide.getByRole("heading", { name: "Save and publish" }),
  ).toBeVisible();
  await expect(guide).toContainText("saved in this browser, not in the cloud");
  await expect(guide).toContainText("editable project backup");
  await expect(guide).toContainText("website ZIP");
  const publishingHelp = guide.getByText(
    "Show step-by-step publishing options",
    {
      exact: true,
    },
  );
  await expect(publishingHelp).toBeVisible();
  await publishingHelp.click();
  await expect(guide).toContainText("Cloudflare Pages");
  await expect(guide).toContainText("GitHub Pages");
  await expect(
    guide.getByRole("link", { name: "Official Cloudflare upload guide" }),
  ).toHaveAttribute(
    "href",
    "https://developers.cloudflare.com/pages/get-started/direct-upload/",
  );
  await page.getByRole("button", { name: "Finish guide" }).click();
  await expect(guide).toBeHidden();

  await page.getByRole("button", { name: "Getting started" }).click();
  await expect(guide).toContainText("Step 1 of 5");
  const helpButton = page.getByRole("button", { name: "Getting started" });
  await helpButton.click();
  await expect(guide).toBeHidden();
  await helpButton.focus();
  await helpButton.press("Enter");
  const next = page.getByRole("button", { name: "Next step" });
  await next.focus();
  await next.press("Enter");
  await expect(guide).toContainText("Step 2 of 5");
});
