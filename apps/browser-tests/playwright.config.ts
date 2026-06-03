import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "src/tests",
  fullyParallel: false, // tests in a single test file are always run in order. this parallelizes only multiple test files
  reporter: "html",
  workers: 4,

  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:4002/",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },

  projects: [
    {
      name: "setup",
      testMatch: /.*\.setup\.ts/,
    },
    {
      name: "firefox",
      use: devices["Desktop Firefox"],
      dependencies: ["setup"],
    },
    // {
    //   name: "safari",
    //   use: devices["Desktop Safari"],
    //   dependencies: ["setup"],
    // },
  ],
});
