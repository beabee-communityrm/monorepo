import { build } from 'esbuild'

let result = await build({
  entryPoints: ['src/app.ts'],
  bundle: true,
  outdir: 'dist',
  format: 'esm',
  platform: 'node',
  external: ['bullmq'],
})
console.log("done", result)