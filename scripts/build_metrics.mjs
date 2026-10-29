import { mkdir, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { performance } from "node:perf_hooks";
const root = resolve(import.meta.dirname, "..");
const output = resolve(root, ".artifacts");
await mkdir(output, { recursive: true });
const before = process.resourceUsage();
const started = performance.now();
const result = spawnSync(
  process.execPath,
  [
    resolve(root, "node_modules/vite/bin/vite.js"),
    "build",
    ...process.argv.slice(2),
  ],
  { cwd: root, encoding: "utf8", maxBuffer: 16 * 1024 * 1024 },
);
const durationMs = performance.now() - started;
const after = process.resourceUsage();
const report = {
  recordedAt: new Date().toISOString(),
  command: [
    "node",
    "node_modules/vite/bin/vite.js",
    "build",
    ...process.argv.slice(2),
  ],
  environment: {
    node: process.version,
    platform: process.platform,
    architecture: process.arch,
  },
  durationMs,
  exitCode: result.status,
  signal: result.signal,
  resourceUsage: {
    scope:
      "Node measurement wrapper only; child build CPU and memory are not exposed by spawnSync",
    userCpuMicroseconds: after.userCPUTime - before.userCPUTime,
    systemCpuMicroseconds: after.systemCPUTime - before.systemCPUTime,
    wrapperPeakRssKiB: after.maxRSS,
  },
  limitations: [
    "One local Vite production build; no TypeScript check is performed here.",
    "Elapsed time includes build child startup; no cache, CPU or filesystem controls are imposed.",
    "These measurements do not establish runtime performance or performance of any other implementation.",
  ],
  error: result.error?.message ?? null,
};
await writeFile(
  resolve(output, "build_output.log"),
  `${result.stdout ?? ""}${result.stderr ?? ""}`,
);
await writeFile(
  resolve(output, "build_metrics.json"),
  JSON.stringify(report, null, 2) + "\n",
);
console.log(JSON.stringify(report, null, 2));
if (result.error || result.status !== 0) process.exitCode = result.status ?? 1;
