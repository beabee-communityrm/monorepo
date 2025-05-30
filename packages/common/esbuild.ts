// Build Node.js ESM module with esbuild.
import * as esbuild from "esbuild";
import { extname, join } from "node:path";
import { readdir, rename } from "node:fs/promises";
import { transformExtPlugin } from "@gjsify/esbuild-plugin-transform-ext";

const OUTDIR_ESM = "./dist/esm";
const OUTDIR_CJS = "./dist/cjs";
const OUTDIR_BROWSER = "./dist/browser";

const isWatch = process.argv.includes("--watch");

function createWatchLoggerPlugin(name: string) {
  return {
    name: `watch-logger-${name}`,
    setup(build: any) {
      build.onEnd((result: any) => {
        if (result.errors.length > 0) {
          console.log(
            `🔴 [${new Date().toLocaleTimeString()}] ${name} build failed with ${result.errors.length} errors`
          );
        } else {
          console.log(
            `✅ [${new Date().toLocaleTimeString()}] ${name} rebuild completed`
          );
        }
      });
    }
  };
}

function createCjsRenamePlugin() {
  return {
    name: "cjs-rename-plugin",
    setup(build: any) {
      build.onEnd(async (result: any) => {
        if (result.errors.length === 0) {
          await renameExtensions(OUTDIR_CJS);
        }
      });
    }
  };
}

async function buildESM(watch = false) {
  const ctx = await esbuild.context({
    plugins: watch ? [createWatchLoggerPlugin("ESM")] : [],
    entryPoints: ["./src/index.ts", "./src/**/*.ts"],
    outdir: OUTDIR_ESM,
    bundle: false,
    platform: "node",
    target: "es2020",
    format: "esm"
  });
  if (watch) await ctx.watch();
  else await ctx.rebuild();
  return ctx;
}

async function buildCJS(watch = false) {
  const ctx = await esbuild.context({
    plugins: [
      transformExtPlugin({ outExtension: { ".js": ".cjs" } }),
      ...(watch ? [createWatchLoggerPlugin("CJS")] : []),
      createCjsRenamePlugin()
    ],
    entryPoints: ["./src/index.ts", "./src/**/*.ts"],
    outdir: OUTDIR_CJS,
    bundle: false,
    platform: "node",
    target: "node16",
    format: "cjs"
  });
  if (watch) await ctx.watch();
  else await ctx.rebuild();
  return ctx;
}

async function buildBrowser(watch = false) {
  const ctx = await esbuild.context({
    plugins: watch ? [createWatchLoggerPlugin("Browser")] : [],
    entryPoints: ["./src/index.ts"],
    outdir: OUTDIR_BROWSER,
    bundle: true,
    sourcemap: true,
    minify: true,
    platform: "browser",
    target: "es2020",
    format: "iife",
    globalName: "BeabeeCommon"
  });
  if (watch) await ctx.watch();
  else await ctx.rebuild();
  return ctx;
}

async function main() {
  if (isWatch) {
    console.log("🚀 Starting watch mode...");
    await Promise.all([buildESM(true), buildCJS(true), buildBrowser(true)]);
    console.log("👀 Watching for changes...");
    // Keep process alive
    process.stdin.resume();
  } else {
    const esm = await buildESM();
    const cjs = await buildCJS();
    const browser = await buildBrowser();

    await esm.dispose();
    await cjs.dispose();
    await browser.dispose();
    console.log("Build completed");
  }
}

async function renameExtensions(directory: string) {
  for await (const dirEntry of await readdir(directory, {
    withFileTypes: true
  })) {
    const oldPath = join(directory, dirEntry.name);

    if (dirEntry.isDirectory()) {
      await renameExtensions(oldPath);
    } else if (extname(oldPath) === ".js") {
      const newPath = oldPath.replace(".js", ".cjs");
      await rename(oldPath, newPath);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
