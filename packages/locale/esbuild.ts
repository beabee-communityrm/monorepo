// Build Node.js ESM module with esbuild.
import * as esbuild from "esbuild";
import { extname, join } from "node:path";
import { readdir, rename, copyFile, mkdir } from "node:fs/promises";
import { watch, existsSync } from "node:fs";
import { transformExtPlugin } from "@gjsify/esbuild-plugin-transform-ext";
import { normalizeTranslations, generateTemplate } from "./tools/index.ts";
import { localePlugin } from "./tools/esbuild-locale-plugin.ts";

const OUTDIR_ESM = "./dist/esm";
const OUTDIR_CJS = "./dist/cjs";
const CONFIG_PATH = "./src/config.json";
const SOURCE_LOCALES_DIR = "./src/locales";

const isWatch = process.argv.includes("--watch");

function createWatchLoggerPlugin(name: string) {
  return {
    name: `watch-logger-${name}`,
    setup(build: any) {
      build.onEnd((result: any) => {
        if (result.errors.length > 0) {
          console.log(
            `🔴 [${new Date().toLocaleTimeString()}] ${name} build failed with ${result.errors.length} errors`,
          );
        } else {
          console.log(
            `✅ [${new Date().toLocaleTimeString()}] ${name} rebuild completed`,
          );
        }
      });
    },
  };
}

function createCopyPlugin(outdir: string, dirName: string) {
  return {
    name: `copy-plugin-${dirName}`,
    setup(build: any) {
      let copying = false;

      const copyFiles = async () => {
        if (copying) return;
        copying = true;

        try {
          // Ensure output directory exists
          const localesOutDir = join(outdir, "locales");
          if (!existsSync(localesOutDir)) {
            await mkdir(localesOutDir, { recursive: true });
          }

          // Process with locale plugin logic
          const localePluginInstance = localePlugin({
            configPath: CONFIG_PATH,
            sourceLocalesDir: SOURCE_LOCALES_DIR,
          });

          // Copy JSON files manually
          const files = await readdir(SOURCE_LOCALES_DIR);
          const jsonFiles = files.filter((file) => file.endsWith(".json"));

          for (const file of jsonFiles) {
            const sourcePath = join(SOURCE_LOCALES_DIR, file);
            const targetPath = join(localesOutDir, file);
            await copyFile(sourcePath, targetPath);
          }

          console.log(
            `📋 [${new Date().toLocaleTimeString()}] ${dirName} copied ${jsonFiles.length} locale files`,
          );
        } catch (error) {
          console.error(
            `❌ [${new Date().toLocaleTimeString()}] ${dirName} copy failed:`,
            error,
          );
        } finally {
          copying = false;
        }
      };

      // Initial copy on build
      build.onEnd(copyFiles);

      // Watch mode: Monitor source files for changes
      if (isWatch) {
        const watcher = watch(
          SOURCE_LOCALES_DIR,
          { recursive: true },
          async (eventType, filename) => {
            if (filename && filename.endsWith(".json")) {
              console.log(
                `📄 [${new Date().toLocaleTimeString()}] ${dirName} detected change: ${filename}`,
              );
              await copyFiles();
            }
          },
        );

        build.onDispose(() => {
          watcher.close();
        });
      }
    },
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
    format: "esm",
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
    ],
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
  const dirName = outdir.includes("esm")
    ? "JSON-ESM"
    : outdir.includes("cjs")
      ? "JSON-CJS"
      : "JSON-Types";
  const ctx = await esbuild.context({
    entryPoints: [], // No actual entry points needed, just using for the plugin system
    outdir,
    bundle: false,
    write: false, // We handle file writing in our copy plugin
    plugins: [
      createCopyPlugin(outdir, dirName),
      ...(watch ? [createWatchLoggerPlugin(dirName)] : []),
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
    console.log("🚀 Starting watch mode...");
    await Promise.all([
      buildESM(true),
      buildCJS(true),
      buildJSON(OUTDIR_ESM, true),
      buildJSON(OUTDIR_CJS, true),
      buildJSON("./dist/types", true),
    ]);
    console.log("👀 Watching for changes...");
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
