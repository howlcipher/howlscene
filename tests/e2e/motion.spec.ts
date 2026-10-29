import { test, expect, type Page } from "@playwright/test";
async function mount(page: Page, preset = "cinematic") {
  await page.route("**/motion-fixture", (route) =>
    route.fulfill({
      contentType: "text/html",
      body: "<!doctype html><html><body></body></html>",
    }),
  );
  await page.goto("/motion-fixture");
  await page.evaluate(async (preset) => {
    document.body.innerHTML = `<div class="howlscene" data-motion="${preset}"><button data-motion-toggle></button><a href="#second">Next scene</a><section class="scene" style="min-height:100vh"><div class="scenery"><div class="scenery-layer" data-depth="0.8">Decorative scenery</div></div><h1>Always readable</h1></section><section id="second" class="scene" style="min-height:100vh"><h2>Second scene</h2></section></div>`;
    localStorage.removeItem("howlscene-motion");
    const modulePath = "/packages/core/src/enhance.ts";
    const { enhanceSite } = await import(/* @vite-ignore */ modulePath);
    const root = document.querySelector<HTMLElement>(".howlscene")!;
    (window as unknown as { disposeMotion: () => void }).disposeMotion =
      enhanceSite(root);
  }, preset);
}
test("MOT-002 A11Y-003 reduced motion cancels entry effects immediately", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await mount(page);
  await expect
    .poll(() => page.evaluate(() => document.getAnimations().length))
    .toBeGreaterThan(0);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect
    .poll(() => page.evaluate(() => document.getAnimations().length))
    .toBe(0);
  await expect(
    page.getByRole("heading", { name: "Always readable" }),
  ).toBeVisible();
});
test("MOT-002 MOT-005 scenery follows ordinary scroll and resets when motion stops", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await mount(page);
  await page.evaluate(() => window.scrollTo(0, 200));
  const layer = page.locator(".scenery-layer");
  await expect
    .poll(() => layer.evaluate((element) => element.style.transform))
    .toContain("translate3d");
  const before = await layer.evaluate((element) => element.style.transform);
  await page.evaluate(() => window.scrollTo(0, 350));
  await expect
    .poll(() => layer.evaluate((element) => element.style.transform))
    .not.toBe(before);
  await page.getByRole("button", { name: "Disable animation" }).click();
  await expect
    .poll(() => layer.evaluate((element) => element.style.transform))
    .toBe("");
  await page.evaluate(() => window.scrollTo(0, 100));
  expect(await layer.evaluate((element) => element.style.transform)).toBe("");
  await expect(
    page.getByRole("heading", { name: "Always readable" }),
  ).toBeVisible();
});
test("MOT-003 A11Y-004 manual motion choice persists and anchors work", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await mount(page);
  await page.getByRole("button", { name: "Disable animation" }).click();
  expect(
    await page.evaluate(() => localStorage.getItem("howlscene-motion")),
  ).toBe("off");
  await expect(
    page.getByRole("button", { name: "Enable animation" }),
  ).toHaveAttribute("aria-pressed", "false");
  await expect
    .poll(() => page.evaluate(() => document.getAnimations().length))
    .toBe(0);
  await page.getByRole("link", { name: "Next scene" }).click();
  await expect(page).toHaveURL(/#second$/);
  await expect(
    page.getByRole("heading", { name: "Second scene" }),
  ).toBeInViewport();
});
test("MOT-005 cleanup cancels work and detaches controls", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await mount(page);
  await page.evaluate(() =>
    (window as unknown as { disposeMotion: () => void }).disposeMotion(),
  );
  await page.getByRole("button").click();
  expect(
    await page.evaluate(() => localStorage.getItem("howlscene-motion")),
  ).toBeNull();
  expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
});

test("MOT-004 scene exits crossfade scenery and cancel offscreen work", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await mount(page);
  await page.evaluate(() => {
    document.querySelectorAll(".scene").forEach((scene) => {
      if (scene.querySelector(".scenery")) return;
      const art = document.createElement("div");
      art.className = "scenery";
      art.textContent = "Decorative scenery";
      scene.prepend(art);
    });
  });
  // Remount with scenery present; a viewport-crossing exit must own a finite transition.
  await page.evaluate(async () => {
    (window as unknown as { disposeMotion: () => void }).disposeMotion();
    const path = "/packages/core/src/enhance.ts";
    const { enhanceSite } = await import(path);
    (window as unknown as { disposeMotion: () => void }).disposeMotion =
      enhanceSite(document.querySelector<HTMLElement>(".howlscene")!);
  });
  const first = page.locator(".scene").first();
  await expect(first).toHaveAttribute("data-scene-state", /entering|active/);
  await page.evaluate(() => window.scrollTo(0, window.innerHeight * 0.65));
  await expect(first).toHaveAttribute("data-scene-state", "exiting");
  await expect(first.locator(".scenery")).toHaveCSS(
    "opacity",
    /0\.[7-9][0-9]*|1/,
  );
  await page.evaluate(() => window.scrollTo(0, window.innerHeight * 1.2));
  await expect(first).toHaveAttribute("data-scene-state", "offscreen");
  expect(
    await first.evaluate((el) => el.getAnimations({ subtree: true }).length),
  ).toBe(0);
  await page.getByRole("button", { name: "Disable animation" }).click();
  await expect(
    page.getByRole("heading", { name: "Second scene" }),
  ).toBeVisible();
});
