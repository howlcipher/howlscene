import { copyFileSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig } from "vite";
export default defineConfig({
  build: {
    outDir: "packages/core/dist",
    emptyOutDir: true,
    lib: {
      entry: resolve(import.meta.dirname, "packages/core/src/index.tsx"),
      formats: ["es"],
      fileName: "index",
    },
    rollupOptions: {
      external: ["react", "react/jsx-runtime", "zod", "motion/mini"],
    },
  },
  plugins: [
    {
      name: "howlscene-public-styles",
      closeBundle() {
        copyFileSync(
          resolve(import.meta.dirname, "packages/core/src/scenery.css"),
          resolve(import.meta.dirname, "packages/core/dist/scenery.css"),
        );
        copyFileSync(
          resolve(import.meta.dirname, "packages/core/src/site.css"),
          resolve(import.meta.dirname, "packages/core/dist/styles.css"),
        );
      },
    },
  ],
});
