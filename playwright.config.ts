import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "tests/e2e",
  workers: 1,
  use: { baseURL: "http://127.0.0.1:4173" },
  projects: [
    {
      testIgnore: "**/cross_browser_export.spec.ts",
    },
    {
      name: "chromium-export",
      testMatch: "**/cross_browser_export.spec.ts",
      use: { browserName: "chromium" },
    },
    {
      name: "firefox-export",
      testMatch: "**/cross_browser_export.spec.ts",
      use: { browserName: "firefox" },
    },
    {
      name: "webkit-export",
      testMatch: "**/cross_browser_export.spec.ts",
      use: { browserName: "webkit" },
    },
  ],
  webServer: {
    command: "node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 4173",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: false,
  },
});
