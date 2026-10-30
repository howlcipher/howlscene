import { defineConfig } from "vite";
import { resolve } from "node:path";
export default defineConfig({
  base: "./",
  build: {
    rollupOptions: {
      input: {
        landing: resolve(import.meta.dirname, "index.html"),
        editor: resolve(import.meta.dirname, "editor/index.html"),
        example: resolve(
          import.meta.dirname,
          "examples/william-elias/index.html",
        ),
        inkStory: resolve(
          import.meta.dirname,
          "examples/ink-wash-story/index.html",
        ),
      },
    },
  },
});
