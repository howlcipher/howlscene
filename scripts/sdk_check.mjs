import { chromium } from "@playwright/test";
import { createServer } from "node:http";
import { extname, sep } from "node:path";
import { mkdtemp, readFile, writeFile, rm, access } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { execFileSync } from "node:child_process";
const root = resolve(import.meta.dirname, "..");
const temporary = await mkdtemp(join(tmpdir(), "howlscene-consumer-"));
const run = (command, args, cwd = temporary) =>
  execFileSync(command, args, {
    cwd,
    stdio: "pipe",
    encoding: "utf8",
    timeout: 120000,
  });
try {
  const rootPackage = JSON.parse(
    await readFile(join(root, "package.json"), "utf8"),
  );
  const packResult = JSON.parse(
    run(
      "npm",
      ["pack", "--json", "--pack-destination", temporary],
      join(root, "packages/core"),
    ),
  );
  const packed = Array.isArray(packResult)
    ? packResult[0]
    : packResult["@howlscene/core"];
  const tarball = join(temporary, packed.filename);
  const exportPack = JSON.parse(
    run(
      "npm",
      ["pack", "--json", "--pack-destination", temporary],
      join(root, "packages/export"),
    ),
  );
  const exportPacked = Array.isArray(exportPack)
    ? exportPack[0]
    : exportPack["@howlscene/export"];
  const exportTarball = join(temporary, exportPacked.filename);
  await writeFile(
    join(temporary, "package.json"),
    JSON.stringify({
      private: true,
      type: "module",
      dependencies: {
        "@howlscene/core": `file:${tarball}`,
        "@howlscene/export": `file:${exportTarball}`,
        react: rootPackage.dependencies.react,
        "react-dom": rootPackage.dependencies["react-dom"],
      },
      devDependencies: {
        typescript: rootPackage.devDependencies.typescript,
        vite: rootPackage.devDependencies.vite,
        "@types/react": rootPackage.devDependencies["@types/react"],
        "@types/react-dom": rootPackage.devDependencies["@types/react-dom"],
      },
    }),
  );
  run("npm", ["install", "--ignore-scripts", "--no-audit", "--no-fund"]);
  await writeFile(
    join(temporary, "consumer.ts"),
    `import {exportWebsite,serializeBackup,importBackup} from '@howlscene/export';\nimport {Site,parseSite,starterSite,themes,createThemeRegistry,createSectionRegistry,resolvePrimitive,type SiteConfig} from '@howlscene/core';\nimport {createElement} from 'react';\nimport {renderToStaticMarkup} from 'react-dom/server';\nvoid exportWebsite;const restored=importBackup(serializeBackup(starterSite));if(restored.title!==starterSite.title)throw new Error('Export package backup contract failed');\nconst registry=createThemeRegistry({forest:{...themes.ink,name:'Forest',background:'#e8efdf'}});\nconst site: SiteConfig=parseSite({...starterSite,theme:'forest'},registry);\nif(!createSectionRegistry().hero||!resolvePrimitive('fade','calm'))throw new Error('Missing public extension API');\nconst html=renderToStaticMarkup(createElement(Site,{site,themeRegistry:registry}));\nif(!html.includes('data-theme="forest"')||!html.includes(site.sections[0]!.heading)||!themes.ink.name)throw new Error('SDK did not render expected content');\nconsole.log('SDK-001 through SDK-005: independent install, declarations, render and theme selection passed');\n`,
  );
  run(join(temporary, "node_modules/.bin/tsc"), [
    "consumer.ts",
    "--outDir",
    "output",
    "--module",
    "NodeNext",
    "--moduleResolution",
    "NodeNext",
    "--target",
    "ES2022",
    "--strict",
  ]);
  console.log(
    execFileSync("node", ["output/consumer.js"], {
      cwd: temporary,
      encoding: "utf8",
      timeout: 15000,
    }).trim(),
  );
  const installed = join(temporary, "node_modules/@howlscene/core");
  await access(join(installed, "dist/styles.css"));
  const manifest = JSON.parse(
    await readFile(join(installed, "package.json"), "utf8"),
  );
  if (!manifest.exports["./styles.css"])
    throw new Error("Styles are not publicly exported");
  const javascript = await readFile(join(installed, "dist/index.js"), "utf8");
  if (/apps\/editor|lexical/.test(javascript))
    throw new Error("Editor dependency found in engine");
  console.log("SDK CSS export and editor independence verified.");
  await writeFile(
    join(temporary, "index.html"),
    '<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width, initial-scale=1"><title>SDK consumer</title></head><body><div id="root"></div><script type="module" src="./app.ts"></script></body></html>',
  );
  await writeFile(
    join(temporary, "app.ts"),
    `import {exportWebsite} from '@howlscene/export';import {createElement} from 'react';import {createRoot} from 'react-dom/client';import {Site,starterSite,parseSite,createThemeRegistry,themes} from '@howlscene/core';import '@howlscene/core/styles.css';const themeRegistry=createThemeRegistry({forest:{...themes.ink,name:'Forest',background:'#e8efdf'}});const site=parseSite({...starterSite,theme:'forest'},themeRegistry);createRoot(document.getElementById('root')!).render(createElement(Site,{site,themeRegistry}));const button=document.createElement('button');button.textContent='Export consumer website';button.onclick=async()=>{const bytes=await exportWebsite(starterSite);button.textContent='Exported '+bytes.byteLength+' bytes';};document.body.append(button);`,
  );
  run(join(temporary, "node_modules/.bin/vite"), ["build", "--base", "./"]);
  const buildDir = join(temporary, "dist");
  const server = createServer(async (req, res) => {
    try {
      const url = new URL(req.url ?? "/", "http://localhost");
      const path = resolve(
        buildDir,
        "." +
          decodeURIComponent(
            url.pathname.endsWith("/")
              ? url.pathname + "index.html"
              : url.pathname,
          ),
      );
      if (!path.startsWith(buildDir + sep)) {
        res.writeHead(403);
        res.end();
        return;
      }
      const contents = await readFile(path);
      res.writeHead(200, {
        "Content-Type":
          {
            ".html": "text/html",
            ".js": "text/javascript",
            ".css": "text/css",
          }[extname(path)] ?? "application/octet-stream",
      });
      res.end(contents);
    } catch {
      res.writeHead(404);
      res.end();
    }
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  let browser;
  try {
    browser = await chromium.launch();
    const page = await browser.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("requestfailed", (request) => errors.push(request.url()));
    const address = server.address();
    await page.goto(`http://127.0.0.1:${address.port}/`);
    await page
      .getByRole("heading", { name: "Build something worth sharing" })
      .waitFor();
    await page.getByRole("button", { name: "Export consumer website" }).click();
    await page.getByRole("button", { name: /Exported [0-9]+ bytes/ }).waitFor();
    const color = await page
      .locator(".howlscene")
      .evaluate((el) => getComputedStyle(el).backgroundColor);
    if (color !== "rgb(232, 239, 223)" || errors.length)
      throw Error(
        "Clean consumer browser or styles failed: " +
          JSON.stringify({ color, errors }),
      );
    console.log(
      "SDK clean Vite consumer build, browser rendering, custom theme and CSS loading verified.",
    );
  } finally {
    await browser?.close();
    await new Promise((resolve) => server.close(resolve));
  }
} catch (error) {
  if (error.stdout) process.stderr.write(error.stdout);
  if (error.stderr) process.stderr.write(error.stderr);
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await rm(temporary, { recursive: true, force: true });
}
