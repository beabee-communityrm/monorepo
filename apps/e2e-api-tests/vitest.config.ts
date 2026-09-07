import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],

    environment: 'node',

    // Tests share one running stack, so state one file changes (e.g. the
    // newsletter groups) must not leak into another file mid-run
    fileParallelism: false,

    testTimeout: 10000,
  },
});
