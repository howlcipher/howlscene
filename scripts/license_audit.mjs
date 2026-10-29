import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const allowed = new Set([
  "MIT",
  "ISC",
  "BSD-2-Clause",
  "BSD-3-Clause",
  "Apache-2.0",
  "CC0-1.0",
  "0BSD",
  "Python-2.0",
  "MPL-2.0",
  "BlueOak-1.0.0",
  "CC-BY-4.0",
  "Zlib",
]);

// Parse a deliberately small SPDX subset. Unknown syntax fails closed; OR needs
// one permitted branch, while AND requires every obligation to be permitted.
function permitted(expression) {
  if (typeof expression !== "string") return false;
  const tokens = expression.match(/\(|\)|AND|OR|[A-Za-z0-9.+-]+/g) ?? [];
  if (tokens.join("") !== expression.replace(/\s/g, "")) return false;
  let position = 0;
  function atom() {
    const token = tokens[position++];
    if (token === "(") {
      const value = or();
      if (tokens[position++] !== ")")
        throw new Error("Unbalanced license expression");
      return value;
    }
    if (!token || ["AND", "OR", ")"].includes(token))
      throw new Error("Missing license identifier");
    return allowed.has(token);
  }
  function and() {
    let value = atom();
    while (tokens[position] === "AND") {
      position++;
      const next = atom();
      value = value && next;
    }
    return value;
  }
  function or() {
    let value = and();
    while (tokens[position] === "OR") {
      position++;
      const next = and();
      value = value || next;
    }
    return value;
  }
  try {
    const result = or();
    return position === tokens.length && result;
  } catch {
    return false;
  }
}

const root = resolve(import.meta.dirname, "..");
const lock = JSON.parse(
  await readFile(resolve(root, "package-lock.json"), "utf8"),
);
const failures = [];
let checked = 0;
for (const [path, entry] of Object.entries(lock.packages ?? {})) {
  if (!path || entry.link || !path.includes("node_modules/")) continue;
  checked++;
  if (!permitted(entry.license))
    failures.push(
      `${path}@${entry.version}: unapproved license ${JSON.stringify(entry.license)}`,
    );
  if (
    !entry.integrity ||
    !entry.resolved?.startsWith("https://registry.npmjs.org/")
  )
    failures.push(`${path}: missing registry provenance or integrity`);
  try {
    const installed = JSON.parse(
      await readFile(resolve(root, path, "package.json"), "utf8"),
    );
    if (installed.version !== entry.version)
      failures.push(`${path}: installed version differs from lockfile`);
    if (!permitted(installed.license))
      failures.push(
        `${path}: installed license is unapproved: ${JSON.stringify(installed.license)}`,
      );
  } catch (error) {
    // Optional platform packages are intentionally absent on other platforms.
    if (error.code !== "ENOENT" || !entry.optional)
      failures.push(
        `${path}: cannot inspect installed package (${error.code ?? error.message})`,
      );
  }
}
console.log(
  `License and registry provenance audit: ${checked} locked packages inspected.`,
);
if (failures.length) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
} else
  console.log(
    "All inspected dependencies satisfy the configured license allowlist.",
  );
