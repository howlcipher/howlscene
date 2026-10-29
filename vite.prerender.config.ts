import { defineConfig } from "vite";
import { resolve } from "node:path";
export default defineConfig({
  build: {
    ssr: resolve(import.meta.dirname, "scripts/prerender.tsx"),
    outDir: ".artifacts/prerender",
    emptyOutDir: true,
    rollupOptions: { output: { entryFileNames: "prerender.mjs" } },
  },
});
