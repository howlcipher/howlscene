import { copyFileSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig } from "vite";
export default defineConfig({
  build: {
    outDir: "packages/export/dist",
    emptyOutDir: true,
    lib: {
      entry: resolve(import.meta.dirname, "packages/export/src/index.tsx"),
      formats: ["es"],
      fileName: "index",
    },
    rollupOptions: {
      external: [
        "react",
        "react/jsx-runtime",
        "react-dom/server",
        "zod",
        "jszip",
        "motion/mini",
      ],
    },
  },
  plugins: [
    {
      name: "export-license",
      closeBundle() {
        copyFileSync("LICENSE", "packages/export/LICENSE");
      },
    },
  ],
});
