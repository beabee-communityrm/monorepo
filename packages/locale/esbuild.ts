// Build Node.js CJS module with esbuild.
import {
  buildCJS,
  createCopyPlugin,
  generateFallbackTranslations,
  generateTemplate,
  isWatchMode,
  normalizeTranslations,
} from '@beabee/esbuild';

import * as esbuild from 'esbuild';

import { config } from './src/config.ts';

const OUTDIR_CJS = './dist/cjs';
const SOURCE_LOCALES_DIR = './src/locales';
const FALLBACK_LOCALES_DIR = './dist/locales-with-fallback';
const TEMPLATE_PATH = './src/template.json';

const isWatch = isWatchMode();

async function buildJSON(outdir: string, watch = false) {
  const dirName = outdir.includes('cjs') ? 'JSON-CJS' : 'JSON-Types';

  const ctx = await esbuild.context({
    entryPoints: [], // No actual entry points needed, just using for the plugin system
    outdir,
    bundle: false,
    write: false, // We handle file writing in our copy plugin
    plugins: [
      createCopyPlugin({
        sourceDir: SOURCE_LOCALES_DIR,
        outdir,
        dirName,
        isWatch: watch,
      }),
    ],
  });

  if (watch) await ctx.watch();
  else await ctx.rebuild();
  return ctx;
}

async function main() {
  // Prepare locale files
  await normalizeTranslations(SOURCE_LOCALES_DIR);
  await generateTemplate(SOURCE_LOCALES_DIR, TEMPLATE_PATH);

  // Generate fallback translations to output directory
  // This ensures TypeScript imports can use files with fallbacks without modifying sources
  await generateFallbackTranslations(
    config,
    SOURCE_LOCALES_DIR,
    FALLBACK_LOCALES_DIR
  );

  const entryPoints = ['./src/index.ts', './src/**/*.ts'];

  if (isWatch) {
    console.log('🚀 Starting watch mode...');
    await Promise.all([
      buildCJS({ entryPoints, outdir: OUTDIR_CJS, watch: true }),
      buildJSON(OUTDIR_CJS, true),
      buildJSON('./dist/types', true),
    ]);
    console.log('👀 Watching for changes...');
    // Keep process alive
    process.stdin.resume();
  } else {
    const cjs = await buildCJS({ entryPoints, outdir: OUTDIR_CJS });

    for (const outdir of [OUTDIR_CJS, './dist/types']) {
      const json = await buildJSON(outdir);
      await json.dispose();
    }

    await cjs.dispose();
    console.log('@beabee/locale build completed');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
