import { defineConfig } from 'vitest/config'
import { loadEnv } from 'vite'

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],    
    environment: 'node',
    env: loadEnv('test', process.cwd(), '')
  }
}) 
