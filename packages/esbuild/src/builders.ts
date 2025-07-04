import { transformExtPlugin } from '@gjsify/esbuild-plugin-transform-ext';
import * as esbuild from 'esbuild';

import { createCjsRenamePlugin, createWatchLoggerPlugin } from './plugins.ts';
import type {
  BuildIIFEOptions,
  BuildOptions,
  BuildStandardOptions,
} from './types/index.ts';
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
    target: 'es2020',
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

/**
 * Creates a CommonJS build configuration
 */
export async function buildCJS(options: BuildOptions) {
  ensureDir(options.outdir);

  const plugins = [
    transformExtPlugin({ outExtension: { '.js': '.cjs', '.ts': '.cjs' } }),
    ...(options.additionalPlugins || []),
    ...(options.watch ? [createWatchLoggerPlugin('CJS')] : []),
    createCjsRenamePlugin(options.outdir, options.baseDir),
  ];

  const ctx = await esbuild.context({
    plugins,
    entryPoints: options.entryPoints,
    outdir: options.outdir,
    bundle: options.bundle || false,
    platform: 'node',
    target: 'node16',
    format: 'cjs',
    absWorkingDir: options.baseDir,
  });

  if (options.watch) {
    await ctx.watch();
  } else {
    await ctx.rebuild();
  }

  return ctx;
}

/**
 * Creates a browser build configuration
 */
export async function buildBrowser(options: BuildIIFEOptions) {
  const plugins = [
    transformExtPlugin({ outExtension: { '.ts': '.js' } }),
    ...(options.additionalPlugins || []),
    ...(options.watch ? [createWatchLoggerPlugin('Browser')] : []),
  ];

  const ctx = await esbuild.context({
    plugins,
    entryPoints: options.entryPoints,
    outdir: options.outdir,
    bundle: true,
    sourcemap: true,
    minify: true,
    platform: 'browser',
    target: 'es2020',
    format: 'iife',
    globalName: options.globalName,
    absWorkingDir: options.baseDir,
  });

  if (options.watch) {
    await ctx.watch();
  } else {
    await ctx.rebuild();
  }

  return ctx;
}

/**
 * Standard build orchestration for packages with ESM and CJS
 */
export async function buildStandard(options: BuildStandardOptions) {
  if (options.watch) {
    console.log('🚀 Starting watch mode...');
  }

  // Create all build contexts
  const [esm, cjs] = await Promise.all([
    buildESM({
      outdir: './dist/esm',
      ...options,
    }),
    buildCJS({
      outdir: './dist/cjs',
      ...options,
    }),
  ]);

  if (options.watch) {
    console.log('👀 Watching for changes...');
    // Keep process alive
    process.stdin.resume();
  } else {
    // Dispose contexts after build is complete
    await Promise.all([esm.dispose(), cjs.dispose()]);
    console.log(`Build completed`);
  }
}
