import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],

    globalSetup: ['@beabee/test-utils/vitest/docker-compose-setup'],

    environment: 'node',

    hookTimeout: 150000,
  },
});
