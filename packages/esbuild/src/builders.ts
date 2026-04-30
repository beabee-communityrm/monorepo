import { transformExtPlugin } from '@gjsify/esbuild-plugin-transform-ext';
import * as esbuild from 'esbuild';

import { createWatchLoggerPlugin } from './plugins.ts';
import type { BuildOptions } from './types/index.ts';
import { ensureDir } from './utils.ts';

/**
 * Creates an ESM build configuration
 */
export async function buildESM(options: BuildOptions) {
  ensureDir(options.outdir);

  const plugins = [
    transformExtPlugin({ outExtension: { '.ts': '.js' } }),
    ...(options.additionalPlugins || []),
    ...(options.watch ? [createWatchLoggerPlugin('ESM')] : []),
  ];

  const ctx = await esbuild.context({
    plugins,
    entryPoints: options.entryPoints,
    outdir: options.outdir,
    bundle: options.bundle || false,
    platform: 'node',
    target: 'node24',
    format: 'esm',
    absWorkingDir: options.baseDir,
  });

  if (options.watch) {
    await ctx.watch();
  } else {
    await ctx.rebuild();
  }

  return ctx;
}
