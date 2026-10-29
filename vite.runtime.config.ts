import { resolve } from "node:path";
import { defineConfig } from "vite";
export default defineConfig({
  build: {
    outDir: "packages/export/generated",
    emptyOutDir: true,
    lib: {
      entry: resolve(import.meta.dirname, "packages/core/src/runtime.ts"),
      name: "HowlSceneRuntime",
      formats: ["iife"],
      fileName: () => "site.js",
    },
  },
});
