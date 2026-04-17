import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  fullyParallel: false, // tests in a single test file are always run in order. this parallelizes only multiple test files
  reporter: 'list',

  use: {
    baseURL: 'http://localhost:3000/', // URL to use when nothing is specified. Eg. page.goTo('/')
    trace: 'on-first-retry',
  },
  
  projects: [
    {
      name: 'chromium',
      use: devices['Desktop Chrome'],
    },
    {
      name: 'firefox',
      use: devices['Desktop Firefox'],
    },
    {
      name: 'safari',
      use: devices['Desktop Safari'],
    }
    ]
});