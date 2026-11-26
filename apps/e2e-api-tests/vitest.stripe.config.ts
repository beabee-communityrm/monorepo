import { existsSync } from 'fs';
import { resolve } from 'path';
import { defineConfig } from 'vitest/config';

// The Stripe key and the stack's settings come from the root env files.
// Variables that are already set are kept, so .env.test goes first to take
// precedence over .env
for (const name of ['.env.test', '.env']) {
  const file = resolve(__dirname, '../..', name);
  if (existsSync(file)) {
    process.loadEnvFile(file);
  }
}

export default defineConfig({
  test: {
    include: ['src/tests/stripe/**/*.test.ts'],

    environment: 'node',

    fileParallelism: false,

    // Advancing a test clock and the webhooks that follow take a while
    testTimeout: 300000,
  },
});
