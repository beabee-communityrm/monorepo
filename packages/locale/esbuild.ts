// Build Node.js ESM module with esbuild.
import * as esbuild from "esbuild";
import { extname, join } from "node:path";
import { readdir, rename } from "node:fs/promises";
import { transformExtPlugin } from "@gjsify/esbuild-plugin-transform-ext";
import { normalizeTranslations, generateTemplate } from "./tools/index.ts";
import { localePlugin } from "./tools/esbuild-locale-plugin.ts";

const OUTDIR_ESM = "./dist/esm";
const OUTDIR_CJS = "./dist/cjs";
const CONFIG_PATH = "./src/config.json";
const SOURCE_LOCALES_DIR = "./src/locales";

const isWatch = process.argv.includes("--watch");

async function buildESM(watch = false) {
  const ctx = await esbuild.context({
    plugins: [],
    entryPoints: ["./src/index.ts", "./src/**/*.ts"],
    outdir: OUTDIR_ESM,
    bundle: false,
    platform: "node",
    target: "es2020",
    format: "esm",
  });
  if (watch) await ctx.watch();
  else await ctx.rebuild();
  return ctx;
}

async function buildCJS(watch = false) {
  const ctx = await esbuild.context({
    plugins: [transformExtPlugin({ outExtension: { ".js": ".cjs" } })],
    entryPoints: ["./src/index.ts", "./src/**/*.ts"],
    outdir: OUTDIR_CJS,
    bundle: false,
    platform: "node",
    target: "node16",
    format: "cjs",
  });
  if (watch) await ctx.watch();
  else await ctx.rebuild();
  return ctx;
}

async function buildJSON(outdir: string, watch = false) {
  const ctx = await esbuild.context({
    entryPoints: ["./src/**/*.json"],
    outdir,
    bundle: false,
    loader: { ".json": "copy" },
    plugins: [
      localePlugin({
        configPath: CONFIG_PATH,
        sourceLocalesDir: SOURCE_LOCALES_DIR,
      }),
    ],
  });
  if (watch) await ctx.watch();
  else await ctx.rebuild();
  return ctx;
}

async function main() {
  await normalizeTranslations();
  await generateTemplate();

  if (isWatch) {
    await Promise.all([
      buildESM(true),
      buildCJS(true),
      buildJSON(OUTDIR_ESM, true),
      buildJSON(OUTDIR_CJS, true),
      buildJSON("./dist/types", true),
    ]);
    console.log("Watching for changes...");
    // Keep process alive
    process.stdin.resume();
  } else {
    const esm = await buildESM();
    const cjs = await buildCJS();
    for (const outdir of [OUTDIR_ESM, OUTDIR_CJS, "./dist/types"]) {
      const json = await buildJSON(outdir);
      await json.dispose();
    }
    await renameExtensions(OUTDIR_CJS);
    await esm.dispose();
    await cjs.dispose();
    console.log("Build completed");
  }
}

async function renameExtensions(directory: string) {
  for await (const dirEntry of await readdir(directory, {
    withFileTypes: true,
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
