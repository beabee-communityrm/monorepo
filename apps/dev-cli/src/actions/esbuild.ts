import { buildESM } from '@beabee/esbuild';

import type { EsbuildArgs } from '../types/index.ts';

/**
 * Build packages using esbuild (ESM, flat dist/)
 * @param argv Command arguments
 */
export const esbuild = async (argv: EsbuildArgs): Promise<void> => {
  const { entryPoints, watch, baseDir } = argv;
  try {
    const ctx = await buildESM({
      entryPoints,
      outdir: './dist',
      watch,
      baseDir,
    });
    if (watch) {
      console.log('👀 Watching for changes...');
      // Keep process alive
      process.stdin.resume();
    } else {
      await ctx.dispose();
      console.log('Build completed');
    }
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
};
