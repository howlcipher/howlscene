import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("the ink-wash sample renders its five scenes through the shared engine", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/examples/ink-wash-story/");
  await page.addStyleTag({
    content: "html { scroll-behavior: auto !important }",
  });

  const scenes = page.locator(".story-demo .scene");
  await expect(scenes).toHaveCount(5);
  await expect(page.locator(".camera-journey-art").first()).toBeVisible();
  await expect(scenes.locator(".scene-background-image")).toHaveCount(5);
  await expect(page.locator(".story-copy-stage, .story-canvas")).toHaveCount(0);
  await expect(
    page.getByRole("heading", { name: "Lorem ipsum dolor sit amet" }),
  ).toBeVisible();
  await expect(page.locator(".story-demo .howlscene")).toHaveAttribute(
    "data-experience",
    "cinematic",
  );
  await expect(page.locator(".story-demo .howlscene")).toHaveAttribute(
    "data-camera-journey",
    "true",
  );
  await expect(
    page.getByRole("navigation", { name: "Story scenes" }),
  ).toBeVisible();
  await expect
    .poll(() =>
      scenes
        .first()
        .locator(".scene-background-image")
        .evaluate((image: HTMLImageElement) => image.naturalWidth),
    )
    .toBeGreaterThan(0);
});

test("shared cinematic navigation and manual motion controls work", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/examples/ink-wash-story/");

  const sceneTwoSourceArt = page.locator("#scene-2 .scene-background-image");
  await page
    .getByRole("link", { name: "02, Scene 2: Consectetur adipiscing elit" })
    .click();
  await expect(page).toHaveURL(/#scene-2$/);
  await expect(page.locator(".story-demo .howlscene")).toHaveAttribute(
    "data-camera-journey-stage",
    "established",
  );
  await expect(
    page.getByRole("link", {
      name: "02, Scene 2: Consectetur adipiscing elit",
    }),
  ).toHaveAttribute("aria-current", "location");

  const sceneTwoArt = page.locator(".camera-journey-art").nth(0);
  await expect
    .poll(() =>
      sceneTwoArt.evaluate((image: HTMLImageElement) => image.naturalWidth),
    )
    .toBeGreaterThan(0);
  await page.getByRole("button", { name: "Disable animation" }).click();
  await expect(
    page.getByRole("button", { name: "Enable animation" }),
  ).toBeVisible();
  await expect(page.locator(".story-demo .howlscene")).toHaveAttribute(
    "data-motion-enabled",
    "false",
  );
  await expect(page.locator(".camera-journey-art")).toHaveCount(0);
  await expect
    .poll(() =>
      sceneTwoSourceArt.evaluate(
        (image: HTMLImageElement) => getComputedStyle(image).transform,
      ),
    )
    .toBe("none");

  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(
    results.violations.filter(
      (violation) =>
        violation.impact === "serious" || violation.impact === "critical",
    ),
  ).toEqual([]);
});

test("Camera Journey scrubs through the covered handoff and reverses with scroll", async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/examples/ink-wash-story/");
  await page.addStyleTag({
    content: "html { scroll-behavior: auto !important }",
  });
  const root = page.locator(".story-demo .howlscene");
  const first = page.locator("#scene-1");
  const second = page.locator("#scene-2");
  const geometry = await page.evaluate(() => {
    const scenes = Array.from(document.querySelectorAll<HTMLElement>(".scene"));
    return scenes.slice(0, 2).map((scene) => {
      const rect = scene.getBoundingClientRect();
      return rect.top + scrollY;
    });
  });
  const at = async (progress: number) => {
    await page.evaluate(
      ({ start, end, progress }) =>
        window.scrollTo(0, start + (end - start) * progress),
      { start: geometry[0]!, end: geometry[1]!, progress },
    );
  };
  const capture = (name: string) =>
    page.screenshot({
      path: testInfo.outputPath(`${name}.png`),
      animations: "disabled",
    });

  await capture("camera-journey-established");
  await at(0.1);
  await expect(root).toHaveAttribute(
    "data-camera-journey-stage",
    "text-departure",
  );
  await expect
    .poll(() =>
      first
        .locator(".scene-content")
        .evaluate((content) => Number(getComputedStyle(content).opacity)),
    )
    .toBeCloseTo(0.5, 2);
  await capture("camera-journey-copy-departure");
  await at(0.3);
  await expect(root).toHaveAttribute(
    "data-camera-journey-stage",
    "camera-travel",
  );
  await expect
    .poll(() =>
      page
        .locator(".camera-journey-art")
        .first()
        .evaluate((image: HTMLImageElement) => image.style.transform),
    )
    .toContain("scale(");
  await capture("camera-journey-camera-travel");
  await at(0.49);
  await expect(root).toHaveAttribute(
    "data-camera-journey-stage",
    "covered-handoff",
  );
  await expect
    .poll(() =>
      page
        .locator(".camera-journey-cover")
        .evaluate((cover) => Number(getComputedStyle(cover).opacity)),
    )
    .toBeGreaterThan(0.98);
  await expect(first.locator(".scene-content")).toHaveCSS("opacity", "0");
  await capture("camera-journey-covered-handoff");
  await at(0.68);
  await expect(root).toHaveAttribute(
    "data-camera-journey-stage",
    "landscape-reveal",
  );
  await expect(second.locator(".scene-content")).toHaveCSS("opacity", "0");
  await capture("camera-journey-landscape-reveal");
  await at(0.9);
  await expect(root).toHaveAttribute(
    "data-camera-journey-stage",
    "text-arrival",
  );
  await expect(second.locator(".scene-content")).not.toHaveCSS("opacity", "0");
  await capture("camera-journey-copy-arrival");
  await at(0.49);
  await expect(root).toHaveAttribute(
    "data-camera-journey-stage",
    "covered-handoff",
  );
  await capture("camera-journey-reverse");
});

test("the ink-wash story remains readable at a phone width", async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/examples/ink-wash-story/");
  await expect(page.locator(".story-demo .scene")).toHaveCount(5);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Lorem ipsum",
  );
  await expect(
    page.getByRole("navigation", { name: "Story scenes" }),
  ).toBeVisible();
  await page.screenshot({
    path: testInfo.outputPath("camera-journey-mobile.png"),
    animations: "disabled",
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("scene transitions use the shared mist preset and preserve reduced motion", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/examples/ink-wash-story/");

  const scenes = page.locator(".story-demo .scene");
  await expect(scenes).toHaveCount(5);
  await expect(
    page.locator('.story-demo .scene[data-transition="mist-reveal"]'),
  ).toHaveCount(5);
  await expect(scenes.locator(".scene-transition-cover")).toHaveCount(5);
  await expect(
    page.getByRole("button", { name: "Enable animation" }),
  ).toBeDisabled();
  await expect(page.locator(".story-demo .howlscene")).toHaveAttribute(
    "data-motion-enabled",
    "false",
  );

  await page
    .getByRole("link", { name: "02, Scene 2: Consectetur adipiscing elit" })
    .click();
  await expect(page).toHaveURL(/#scene-2$/);
  await expect(
    page.getByRole("heading", { name: "Consectetur adipiscing elit" }),
  ).toBeVisible();
  await expect
    .poll(() =>
      page
        .locator("#scene-2 .scene-background-image")
        .evaluate(
          (image: HTMLImageElement) => getComputedStyle(image).transform,
        ),
    )
    .toBe("none");
});
