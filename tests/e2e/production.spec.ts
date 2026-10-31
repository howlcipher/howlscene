import { test, expect } from "@playwright/test";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { resolve, sep, extname } from "node:path";

test("production files work at root and GitHub Pages paths with and without JavaScript", async ({
  browser,
}) => {
  test.setTimeout(60000);
  const directory = resolve("dist");
  let mount = "/";
  const mime: Record<string, string> = {
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".json": "application/json",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
    ".woff2": "font/woff2",
    ".woff": "font/woff",
    ".ico": "image/x-icon",
    ".txt": "text/plain; charset=utf-8",
  };
  const server = createServer((request, response) => {
    void (async () => {
      if (request.method !== "GET" && request.method !== "HEAD") {
        response.writeHead(405);
        response.end();
        return;
      }
      if ((request.url?.length ?? 0) > 2048) {
        response.writeHead(414);
        response.end();
        return;
      }
      const pathname = decodeURIComponent(
        new URL(request.url ?? "/", "http://localhost").pathname,
      );
      if (
        !pathname.startsWith(mount) ||
        pathname.includes("\\") ||
        pathname.includes("\0")
      ) {
        response.writeHead(404);
        response.end();
        return;
      }
      const relative = pathname.slice(mount.length);
      if (
        relative
          .split("/")
          .some((segment) => segment === "." || segment === "..")
      ) {
        response.writeHead(403);
        response.end();
        return;
      }
      const filename = resolve(
        directory,
        relative.endsWith("/")
          ? `${relative}index.html`
          : relative || "index.html",
      );
      if (!filename.startsWith(directory + sep)) {
        response.writeHead(403);
        response.end();
        return;
      }
      try {
        const bytes = await readFile(filename);
        response.writeHead(200, {
          "Content-Type": mime[extname(filename)] ?? "application/octet-stream",
          "Content-Length": bytes.byteLength,
        });
        response.end(request.method === "HEAD" ? undefined : bytes);
      } catch {
        response.writeHead(404);
        response.end("Not found");
      }
    })().catch(() => {
      response.writeHead(400);
      response.end("Bad request");
    });
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  try {
    const address = server.address();
    if (!address || typeof address === "string")
      throw new Error("Static server did not start");
    const origin = `http://127.0.0.1:${address.port}`;
    for (const base of ["/", "/howlscene/"]) {
      mount = base;
      for (const artwork of [
        "stone-bridge.webp",
        "clocktower-river.webp",
        "moon-gate.webp",
        "river-city.webp",
        "dusk-skyline.webp",
        "mist-cover.webp",
      ]) {
        const response = await fetch(
          `${origin}${base}examples/ink-wash-story/assets/${artwork}`,
          { signal: AbortSignal.timeout(5000) },
        );
        expect(response.status).toBe(200);
      }
      for (const javaScriptEnabled of [true, false]) {
        const context = await browser.newContext({
          javaScriptEnabled,
          reducedMotion: "reduce",
        });
        try {
          const page = await context.newPage();
          const errors: string[] = [];
          const badResponses: string[] = [];
          const failedRequests: string[] = [];
          const localResponses: string[] = [];
          page.on("pageerror", (error) => errors.push(error.message));
          page.on("requestfailed", (request) =>
            failedRequests.push(
              `${request.failure()?.errorText} ${request.resourceType()} ${request.url()}`,
            ),
          );
          page.on("response", (response) => {
            if (new URL(response.url()).origin === origin) {
              localResponses.push(response.url());
              if (response.status() !== 200)
                badResponses.push(`${response.status()} ${response.url()}`);
            }
          });
          await page.goto(origin + base);
          await expect(
            page.getByRole("heading", { name: /Your story/ }),
          ).toBeVisible();
          await expect(
            page.getByRole("link", { name: "Open the editor" }),
          ).toHaveAttribute("href", "./editor/");
          if (javaScriptEnabled) {
            await page.getByRole("link", { name: "Open the editor" }).click();
            await expect(page).toHaveURL(origin + base + "editor/");
            await expect(page.getByLabel("Website title")).toBeVisible();
            await expect(page.getByRole("status")).toContainText(
              "Saved on this browser",
            );
            await page.goBack();
            await expect(
              page.getByRole("heading", { name: /Your story/ }),
            ).toBeVisible();
          }
          await page
            .getByRole("link", { name: "Explore the cinematic sample" })
            .click();
          await expect(page).toHaveURL(
            origin + base + "examples/ink-wash-story/",
          );
          await expect(
            page.getByRole("heading", {
              name: "Lorem ipsum dolor sit amet",
              exact: true,
            }),
          ).toBeVisible();
          await expect(page.locator(".story-demo .scene")).toHaveCount(5);
          await expect(page.locator(".story-art")).toHaveCount(5);
          await expect(page.locator(".story-transition-cover")).toHaveAttribute(
            "src",
            "./assets/mist-cover.webp",
          );
          const creditsUrl = await page
            .getByRole("link", { name: "Artwork notes" })
            .getAttribute("href");
          expect(creditsUrl).toBeTruthy();
          const creditsResponse = await page.request.get(
            new URL(creditsUrl!, page.url()).href,
          );
          expect(creditsResponse.status()).toBe(200);
          expect(await creditsResponse.text()).toContain(
            "six original landscape illustrations",
          );
          for (const sceneId of [
            "scene-1",
            "scene-2",
            "scene-3",
            "scene-4",
            "scene-5",
          ]) {
            const artwork = page.locator(`#${sceneId} .story-art`);
            await expect(artwork).toHaveAttribute(
              "src",
              /\.\/assets\/.+\.webp$/,
            );
          }
          await page
            .getByRole("link", {
              name: "02, Scene 2: Consectetur adipiscing elit",
            })
            .click();
          await expect(page).toHaveURL(/#scene-2$/);
          await expect(
            page.getByRole("heading", {
              name: "Consectetur adipiscing elit",
              exact: true,
            }),
          ).toBeVisible();
          if (javaScriptEnabled)
            await expect(
              page.getByRole("link", {
                name: "02, Scene 2: Consectetur adipiscing elit",
              }),
            ).toHaveAttribute("aria-current", "location");

          await page.goto(origin + base);
          await page
            .getByRole("link", {
              name: "Explore the developer portfolio example",
            })
            .click();
          await expect(page).toHaveURL(
            origin + base + "examples/william-elias/",
          );
          await expect(
            page.getByRole("heading", { name: "William Elias", exact: true }),
          ).toBeVisible();
          await expect(
            page.getByRole("heading", {
              name: "Independent projects",
              exact: true,
            }),
          ).toBeVisible();
          await expect(
            page.getByRole("link", { name: "Original portfolio", exact: true }),
          ).toHaveAttribute(
            "href",
            "https://howlcipher.github.io/william_elias/",
          );
          if (javaScriptEnabled) {
            await page.getByLabel("Try a theme").selectOption("cyber");
            await expect(page.locator(".howlscene")).toHaveAttribute(
              "data-theme",
              "cyber",
            );
          } else {
            await expect(page.getByLabel("Try a theme")).toBeDisabled();
          }
          expect(errors, `${base} JavaScript=${javaScriptEnabled}`).toEqual([]);
          expect(badResponses).toEqual([]);
          // Chromium blocks script preloads with "csp" when this context disables JavaScript.
          // Exempt only that exact browser policy failure for this server's JS assets.
          const unexpectedFailures = failedRequests.filter((failure) => {
            const prefix = "csp script ";
            if (javaScriptEnabled || !failure.startsWith(prefix)) return true;
            const url = new URL(failure.slice(prefix.length));
            return (
              url.origin !== origin ||
              !url.pathname.startsWith(base + "assets/") ||
              !url.pathname.endsWith(".js")
            );
          });
          expect(unexpectedFailures).toEqual([]);
          expect(localResponses.length).toBeGreaterThan(1);
        } finally {
          await context.close();
        }
      }
    }
  } finally {
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
  }
});
