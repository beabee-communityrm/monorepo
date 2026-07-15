import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "src",
  fullyParallel: false, // tests in a single test file are always run in order. this parallelizes only multiple test files
  reporter: "html",
  retries: 3,

  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:4002/",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },

  projects: [
    {
      name: "setup",
      testDir: "src/setup",
      testMatch: /.*\.setup\.ts/,
      use: devices["Desktop Firefox"],
    },
    {
      name: "firefox",
      testDir: "src/tests",
      use: devices["Desktop Firefox"],
      dependencies: ["setup"],
    },
  ],
});
