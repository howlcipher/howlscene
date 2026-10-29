import { test, expect, type Page } from "@playwright/test";
import JSZip from "jszip";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";

function asRgb(hexColor: string): string {
  const channels = [1, 3, 5].map((offset) =>
    Number.parseInt(hexColor.slice(offset, offset + 2), 16),
  );
  return `rgb(${channels.join(", ")})`;
}

async function headingStyle(page: Page) {
  return page.locator(".howlscene").evaluate((site) => {
    const heading = site.querySelector<HTMLElement>(".scene-copy > h2");
    if (!heading) throw Error("Missing section heading");
    const style = getComputedStyle(heading);
    const range = document.createRange();
    range.selectNodeContents(heading);
    const textBounds = range.getBoundingClientRect();
    const headingBounds = heading.getBoundingClientRect();
    return {
      treatment: site.getAttribute("data-theme-heading-treatment"),
      accent: getComputedStyle(site).getPropertyValue("--scene-accent").trim(),
      bottomStyle: style.borderBottomStyle,
      bottomWidth: style.borderBottomWidth,
      bottomColor: style.borderBottomColor,
      railStyle: style.borderInlineStartStyle,
      railWidth: style.borderInlineStartWidth,
      railColor: style.borderInlineStartColor,
      railPadding: style.paddingInlineStart,
      textInset: textBounds.left - headingBounds.left,
    };
  });
}

test("THM-COMP-002 heading treatments stay distinct in preview and nested no-script export", async ({
  page,
  browser,
}) => {
  await page.setViewportSize({ width: 375, height: 844 });
  await page.goto("/tests/fixtures/presentation.html");
  const site = page.locator(".howlscene");
  const originalContent = await site.locator("main").innerText();

  for (const width of [375, 768, 1440]) {
    await page.setViewportSize({ width, height: 844 });
    for (const [theme, expected] of [
      ["modern", { treatment: "plain", decoration: "none" }],
      ["ink", { treatment: "accent-rule", decoration: "rule" }],
      ["cyber", { treatment: "accent-rail", decoration: "rail" }],
    ] as const) {
      await page.getByLabel("Fixture theme").selectOption(theme);
      const result = await headingStyle(page);
      expect(result.treatment).toBe(expected.treatment);
      expect(result.accent).not.toBe("");
      if (expected.decoration === "rule") {
        expect(result.bottomStyle).toBe("solid");
        expect(result.bottomWidth).toBe("2px");
        expect(result.bottomColor).toBe(asRgb(result.accent));
        expect(result.railStyle).toBe("none");
      } else if (expected.decoration === "rail") {
        expect(result.railStyle).toBe("solid");
        expect(result.railWidth).toBe("4px");
        expect(result.railColor).toBe(asRgb(result.accent));
        expect(result.textInset).toBeCloseTo(
          Number.parseFloat(result.railWidth) +
            Number.parseFloat(result.railPadding),
          1,
        );
        expect(result.bottomStyle).toBe("none");
      } else {
        expect(result.bottomStyle).toBe("none");
        expect(result.railStyle).toBe("none");
      }
      expect(await site.locator("main").innerText()).toBe(originalContent);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
    }
  }

  await page.setViewportSize({ width: 375, height: 844 });
  await page.getByLabel("Fixture theme").selectOption("ink");
  const downloadReady = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download contract website" }).click();
  const downloadPath = await (await downloadReady).path();
  if (!downloadPath) throw Error("No exported ZIP was downloaded");
  const archive = await JSZip.loadAsync(await readFile(downloadPath));
  const files = new Map<string, Buffer>();
  for (const [name, entry] of Object.entries(archive.files))
    if (!entry.dir) files.set(name, await entry.async("nodebuffer"));

  const mount = "/howlscene/theme-heading/";
  const server = createServer((request, response) => {
    const pathname = new URL(request.url ?? "/", "http://localhost").pathname;
    const relative = pathname.startsWith(mount)
      ? pathname.slice(mount.length) || "index.html"
      : "";
    const contents = files.get(relative);
    response.writeHead(contents ? 200 : 404, {
      "Content-Type": relative.endsWith(".css")
        ? "text/css; charset=utf-8"
        : "text/html; charset=utf-8",
    });
    response.end(contents ?? "Not found");
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  try {
    const address = server.address();
    if (!address || typeof address === "string")
      throw Error("Static export server did not start");
    const context = await browser.newContext({ javaScriptEnabled: false });
    try {
      const published = await context.newPage();
      await published.setViewportSize({ width: 375, height: 844 });
      await published.goto(`http://127.0.0.1:${address.port}${mount}`);
      await expect(
        published.getByRole("heading", { name: "Selected work" }),
      ).toBeVisible();
      const exported = await headingStyle(published);
      expect(exported.treatment).toBe("accent-rule");
      expect(exported.bottomStyle).toBe("solid");
      expect(exported.bottomColor).toBe(asRgb(exported.accent));
      await expect(
        published.getByRole("link", { name: "Selected work", exact: true }),
      ).toHaveAttribute("href", "#projects");
    } finally {
      await context.close();
    }
  } finally {
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
  }
});
