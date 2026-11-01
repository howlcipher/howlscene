import { defineConfig } from "vitest/config";
export default defineConfig({
  test: {
    maxWorkers: 1,
    css: { include: /.*/ },
    include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"],
    coverage: {
      provider: "v8",
      include: [
        "packages/core/src/**/*.{ts,tsx}",
        "packages/export/src/**/*.{ts,tsx}",
        "apps/editor/{document,model,storage}.ts",
      ],
      // The DOM controller is exercised in the remote Playwright browser suite.
      // Keep unit branch thresholds focused on code runnable in Vitest's Node environment.
      exclude: ["packages/core/src/camera_journey_controller.ts"],
      reporter: [["text", { skipFull: false }], "json", "html"],
      thresholds: {
        "**/packages/core/src/**": { branches: 85 },
        "**/packages/core/src/config.ts": { branches: 90 },
        "**/packages/export/src/**": { branches: 90 },
      },
    },
  },
});
