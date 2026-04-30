import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "src/tests",
  fullyParallel: false, // tests in a single test file are always run in order. this parallelizes only multiple test files
  reporter: "list",

  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:4002/",
    trace: "on-first-retry",
  },

  projects: [
    {
      name: "chromium",
      use: devices["Desktop Chrome"],
    },
    {
      name: "firefox",
      use: devices["Desktop Firefox"],
    },
    {
      name: "safari",
      use: devices["Desktop Safari"],
    },
  ],
});
