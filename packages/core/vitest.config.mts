import { resolve } from 'path';
import { loadEnv } from 'vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
    env: loadEnv('test', resolve(process.cwd(), '../../'), ''),
  },
});
