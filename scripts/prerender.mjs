import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
const root = resolve(import.meta.dirname, "..");
const { renderLanding, renderExample, injectRoot } = await import(
  pathToFileURL(resolve(root, ".artifacts/prerender/prerender.mjs")).href
);
for (const [relative, render] of [
  ["index.html", renderLanding],
  ["examples/william-elias/index.html", renderExample],
]) {
  const path = resolve(root, "dist", relative);
  const shell = await readFile(path, "utf8");
  const content = render();
  await writeFile(path, injectRoot(shell, content));
  console.log(
    `Prerendered ${relative}: ${Buffer.byteLength(content)} bytes of semantic HTML.`,
  );
}
