import * as esbuild from "esbuild";
import { transformExtPlugin } from "@gjsify/esbuild-plugin-transform-ext";
import { createWatchLoggerPlugin, createCjsRenamePlugin } from "./plugins.ts";
import type { BuildOptions } from "./types/index.ts";

/**
 * Creates an ESM build configuration
 */
export async function buildESM(options: BuildOptions) {
  const plugins = [
    ...(options.additionalPlugins || []),
    ...(options.watch ? [createWatchLoggerPlugin("ESM")] : []),
  ];

  const ctx = await esbuild.context({
    plugins,
    entryPoints: options.entryPoints,
    outdir: options.outdir,
    bundle: options.bundle || false,
    platform: "node",
    target: "es2020",
    format: "esm",
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
  const plugins = [
    transformExtPlugin({ outExtension: { ".js": ".cjs" } }),
    ...(options.additionalPlugins || []),
    ...(options.watch ? [createWatchLoggerPlugin("CJS")] : []),
    createCjsRenamePlugin(options.outdir),
  ];

  const ctx = await esbuild.context({
    plugins,
    entryPoints: options.entryPoints,
    outdir: options.outdir,
    bundle: options.bundle || false,
    platform: "node",
    target: "node16",
    format: "cjs",
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
export async function buildBrowser(options: BuildOptions) {
  const plugins = [
    ...(options.additionalPlugins || []),
    ...(options.watch ? [createWatchLoggerPlugin("Browser")] : []),
  ];

  const ctx = await esbuild.context({
    plugins,
    entryPoints: options.entryPoints,
    outdir: options.outdir,
    bundle: true,
    sourcemap: true,
    minify: true,
    platform: "browser",
    target: "es2020",
    format: "iife",
    globalName: options.globalName,
  });

  if (options.watch) {
    await ctx.watch();
  } else {
    await ctx.rebuild();
  }

  return ctx;
}

/**
 * Standard build orchestration for packages with ESM, CJS, and Browser builds
 */
export async function buildStandard(
  packageName: string,
  entryPoints: string[],
  globalName: string,
  additionalPlugins?: esbuild.Plugin[],
) {
  const isWatch = process.argv.includes("--watch");

  if (isWatch) {
    console.log("🚀 Starting watch mode...");
    await Promise.all([
      buildESM({
        entryPoints,
        outdir: "./dist/esm",
        watch: true,
        additionalPlugins,
      }),
      buildCJS({
        entryPoints,
        outdir: "./dist/cjs",
        watch: true,
        additionalPlugins,
      }),
      buildBrowser({
        entryPoints: ["./src/index.ts"],
        outdir: "./dist/browser",
        watch: true,
        globalName,
        additionalPlugins,
      }),
    ]);
    console.log("👀 Watching for changes...");
    // Keep process alive
    process.stdin.resume();
  } else {
    const esm = await buildESM({
      entryPoints,
      outdir: "./dist/esm",
      additionalPlugins,
    });
    const cjs = await buildCJS({
      entryPoints,
      outdir: "./dist/cjs",
      additionalPlugins,
    });
    const browser = await buildBrowser({
      entryPoints: ["./src/index.ts"],
      outdir: "./dist/browser",
      globalName,
      additionalPlugins,
    });

    await esm.dispose();
    await cjs.dispose();
    await browser.dispose();
    console.log(`${packageName} build completed`);
  }
}
