import { chromium } from "@playwright/test";
import JSZip from "jszip";
import { closeSdkResources } from "./close_sdk_resources.mjs";
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
  const extensionFixture = `
const artworkRegistry=createArtworkRegistry({
  'forest-canopy':{render:()=>createElement('circle',{'data-original-art':'forest-canopy',cx:720,cy:200,r:160})}
});
const themeRegistry=createThemeRegistry({forest:{...themes.ink,name:'Forest',background:'#e8efdf',presentation:{bodyLineHeight:2,navigationGapRem:2},layers:[{id:'canopy',artwork:'forest-canopy',depth:.3,opacity:.2}]}},artworkRegistry);
const sectionRegistry=createSectionRegistry({},[{id:'notice',renderer:({section})=>createElement('aside',{'data-custom-section':'notice'},section.body)}]);
const layoutRegistry=createLayoutRegistry([{id:'feature-frame',sectionTypes:['custom'],styles:'.layout-feature-frame [data-custom-layout] { display:grid; grid-template-columns:1fr 1fr; }',renderer:({section,intro,image,body,entries,cta})=>createElement('article',{'data-custom-layout':section.id},intro,image,body,entries,cta)}]);
const transitionCover={id:'asset-sdk-mist',mime:'image/png',data:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=',alt:''};
const site:SiteConfig=parseSite({...starterSite,theme:'forest',experience:'cinematic',motion:'cinematic',assets:[transitionCover],sections:[{id:'notice',type:'custom' as const,customType:'notice',layout:'feature-frame',heading:'Developer section',body:'Portable custom content.',transition:'mist-reveal',transitionCover:transitionCover.id}]},themeRegistry,sectionRegistry,layoutRegistry);
`;
  await writeFile(
    join(temporary, "consumer.ts"),
    `import {exportWebsite,serializeBackup,importBackup} from '@howlscene/export';
import {Site,parseSite,starterSite,themes,createArtworkRegistry,createThemeRegistry,createSectionRegistry,createLayoutRegistry,resolvePrimitive,type SiteConfig} from '@howlscene/core';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
${extensionFixture}
const restored=importBackup(serializeBackup(site,themeRegistry,sectionRegistry,layoutRegistry),themeRegistry,sectionRegistry,layoutRegistry);
if(restored.theme!=='forest'||restored.sections[0]!.heading!==site.sections[0]!.heading||restored.sections[0]!.transitionCover!==transitionCover.id||restored.assets[0]!.id!==transitionCover.id)throw new Error('Custom project backup contract failed');
if(!createSectionRegistry().hero||!resolvePrimitive('fade','calm'))throw new Error('Missing public extension API');
const html=renderToStaticMarkup(createElement(Site,{site,themeRegistry,artworkRegistry,sectionRegistry,layoutRegistry}));
if(!html.includes('data-theme="forest"')||!html.includes('data-experience="cinematic"')||!html.includes('data-transition="mist-reveal"')||!html.includes('class="scene-transition-cover"')||!html.includes('data-original-art="forest-canopy"')||!html.includes('data-custom-section="notice"')||!html.includes('data-custom-layout="notice"')||!html.includes('grid-template-columns:1fr 1fr')||!html.includes('Portable custom content.'))throw new Error('SDK did not render configured cinematic scene, cover, artwork, section and layout');
const bytes=await exportWebsite(site,{themeRegistry,artworkRegistry,sectionRegistry,layoutRegistry});
if(!bytes.byteLength)throw new Error('Custom theme static export failed');
console.log('SDK-001 through SDK-006: independent install, declarations, custom artwork, section and layout render, backup and export passed');
`,
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
    `import {exportWebsite} from '@howlscene/export';
import {createElement} from 'react';
import {createRoot} from 'react-dom/client';
import {Site,starterSite,parseSite,createArtworkRegistry,createThemeRegistry,createSectionRegistry,createLayoutRegistry,themes,type SiteConfig} from '@howlscene/core';
import '@howlscene/core/styles.css';
${extensionFixture}
createRoot(document.getElementById('root')!).render(createElement(Site,{site,themeRegistry,artworkRegistry,sectionRegistry,layoutRegistry}));
const button=document.createElement('button');
button.textContent='Export consumer website';
button.onclick=async()=>{
 button.textContent='Exporting consumer website';
 try {
  const bytes=await exportWebsite(site,{themeRegistry,artworkRegistry,sectionRegistry,layoutRegistry});
  (window as Window & {exportBytes?:number[]}).exportBytes=Array.from(bytes);
  button.textContent='Exported '+bytes.byteLength+' bytes';
 } catch(error) {
  button.textContent='Export failed: '+String(error);
  throw error;
 }
};
document.body.append(button);`,
  );
  run(join(temporary, "node_modules/.bin/vite"), ["build", "--base", "./"]);
  const buildDir = join(temporary, "dist");
  const publishedFiles = new Map();
  const mountPrefixes = ["/example-site/", "/howlscene/project/"];
  const server = createServer(async (req, res) => {
    try {
      const url = new URL(req.url ?? "/", "http://localhost");
      const decodedPath = decodeURIComponent(url.pathname);
      const mount = mountPrefixes.find((prefix) =>
        decodedPath.startsWith(prefix),
      );
      if (mount) {
        const relative = decodedPath.slice(mount.length) || "index.html";
        if (
          relative.split("/").some((part) => part === ".." || part === ".") ||
          relative.includes("\\")
        ) {
          res.writeHead(403);
          res.end();
          return;
        }
        const contents = publishedFiles.get(relative);
        if (!contents) {
          res.writeHead(404);
          res.end();
          return;
        }
        res.writeHead(200, {
          "Content-Type":
            {
              ".html": "text/html",
              ".css": "text/css",
              ".js": "text/javascript",
              ".png": "image/png",
              ".svg": "image/svg+xml",
            }[extname(relative)] ?? "application/octet-stream",
        });
        res.end(contents);
        return;
      }
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
    await page.getByRole("heading", { name: "Developer section" }).waitFor();
    await page.locator('[data-custom-section="notice"]').waitFor();
    await page.locator('[data-custom-layout="notice"]').waitFor();
    if (
      (await page
        .locator('[data-custom-layout="notice"]')
        .evaluate((element) => getComputedStyle(element).display)) !== "grid"
    )
      throw Error("Independent browser consumer omitted custom layout CSS");
    await page.getByRole("button", { name: "Export consumer website" }).click();
    await page.waitForFunction(
      () =>
        document
          .querySelector("body > button")
          ?.textContent?.match(/^Exported [0-9]+ bytes$|^Export failed:/),
      { timeout: 5000 },
    );
    const exportStatus = await page
      .getByRole("button", { name: /Exported|Export failed/ })
      .textContent();
    if (!exportStatus?.startsWith("Exported "))
      throw Error(
        "Independent browser export failed: " +
          JSON.stringify({ exportStatus, errors }),
      );
    const artwork = await page
      .locator('circle[data-original-art="forest-canopy"]')
      .count();
    if (!artwork)
      throw Error("Independent browser consumer omitted custom artwork");
    const exported = await page.evaluate(() => globalThis.exportBytes);
    if (!Array.isArray(exported))
      throw Error("Browser did not return custom export bytes");
    const archive = await JSZip.loadAsync(new Uint8Array(exported));
    const exportedHTML = await archive.file("index.html")?.async("string");
    if (
      !exportedHTML?.includes('data-theme="forest"') ||
      !exportedHTML.includes('data-experience="cinematic"') ||
      !exportedHTML.includes('data-transition="mist-reveal"') ||
      !exportedHTML.includes('class="scene-transition-cover"') ||
      !exportedHTML.includes('src="./assets/asset-sdk-mist/original.png"') ||
      !exportedHTML.includes('data-original-art="forest-canopy"') ||
      !exportedHTML.includes('data-custom-section="notice"') ||
      !exportedHTML.includes('data-custom-layout="notice"') ||
      !exportedHTML.includes("grid-template-columns:1fr 1fr") ||
      !exportedHTML.includes("Portable custom content.") ||
      !archive.file("assets/asset-sdk-mist/original.png")
    )
      throw Error(
        "Browser ZIP omitted cinematic cover, custom theme, artwork or content",
      );
    for (const [name, entry] of Object.entries(archive.files)) {
      if (entry.dir) continue;
      if (
        name.startsWith("/") ||
        name.split("/").some((part) => part === ".." || part === ".") ||
        name.includes("\\")
      )
        throw Error("Export ZIP contains unsafe paths");
      publishedFiles.set(name, await entry.async("nodebuffer"));
    }
    for (const javaScriptEnabled of [false, true]) {
      const context = await browser.newContext({
        javaScriptEnabled,
        reducedMotion: "reduce",
      });
      try {
        const published = await context.newPage();
        for (const prefix of mountPrefixes) {
          const failures = [];
          const response = (result) => {
            if (result.status() !== 200)
              failures.push(`${result.status()} ${result.url()}`);
          };
          const request = (result) =>
            failures.push(`Failed request ${result.url()}`);
          const pageError = (error) => failures.push(error.message);
          published.on("response", response);
          published.on("requestfailed", request);
          published.on("pageerror", pageError);
          try {
            const document = await published.goto(
              `http://127.0.0.1:${address.port}${prefix}`,
            );
            if (document?.status() !== 200)
              throw Error("Nested export document failed");
            await published
              .getByRole("heading", { name: "Developer section" })
              .waitFor();
            await published.locator('[data-custom-section="notice"]').waitFor();
            await published.locator('[data-custom-layout="notice"]').waitFor();
            const transitionCover = published.locator(
              ".scene-transition-cover",
            );
            if ((await transitionCover.count()) !== 1)
              throw Error("Nested SDK export omitted the transition cover");
            if (
              (await transitionCover.getAttribute("src")) !==
              "./assets/asset-sdk-mist/original.png"
            )
              throw Error("Nested SDK export used an invalid cover path");
            await published.waitForFunction(
              () =>
                document.querySelector(".scene-transition-cover")
                  ?.naturalWidth === 1,
            );
            if (
              (await published
                .locator('circle[data-original-art="forest-canopy"]')
                .count()) !== 1
            )
              throw Error("Nested static export lost custom SVG");
            const presentation = await published
              .locator(".howlscene")
              .evaluate((element) => ({
                background: getComputedStyle(element).backgroundColor,
                navigationGap: getComputedStyle(
                  element.querySelector(".site-header nav"),
                ).gap,
                headerDisplay: getComputedStyle(
                  element.querySelector(".site-header"),
                ).display,
                customLayoutDisplay: getComputedStyle(
                  element.querySelector('[data-custom-layout="notice"]'),
                ).display,
              }));
            if (
              presentation.background !== "rgb(232, 239, 223)" ||
              presentation.navigationGap !== "32px" ||
              presentation.headerDisplay !== "flex" ||
              presentation.customLayoutDisplay !== "grid"
            )
              throw Error(
                "Nested export CSS did not apply: " +
                  JSON.stringify(presentation),
              );
            if (
              await published
                .locator('input,textarea,select,[aria-label="Website editor"]')
                .count()
            )
              throw Error("Nested export included editing controls");
            if (
              await published
                .getByRole("button", { name: "Export consumer website" })
                .count()
            )
              throw Error("Consumer export UI leaked into published ZIP");
            if (failures.length)
              throw Error(
                "Nested export failed resources: " + JSON.stringify(failures),
              );
          } finally {
            published.off("response", response);
            published.off("requestfailed", request);
            published.off("pageerror", pageError);
          }
        }
      } finally {
        await context.close();
      }
    }
    console.log(
      "SDK browser-generated custom ZIP served at two real nested mounts with JavaScript disabled and enabled; content, artwork, CSS and response checks passed.",
    );
    const color = await page
      .locator(".howlscene")
      .evaluate((el) => getComputedStyle(el).backgroundColor);
    if (color !== "rgb(232, 239, 223)" || errors.length)
      throw Error(
        "Clean consumer browser or styles failed: " +
          JSON.stringify({ color, errors }),
      );
    console.log(
      "SDK clean Vite consumer build, custom artwork, CSS and actual custom-theme browser ZIP verified.",
    );
  } finally {
    await closeSdkResources(browser, server);
  }
} catch (error) {
  if (error.stdout) process.stderr.write(error.stdout);
  if (error.stderr) process.stderr.write(error.stderr);
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await rm(temporary, { recursive: true, force: true });
}
