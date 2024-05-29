import {
  build,
  Config,
  stop,
} from "https://deno.land/x/esbuild@v0.20.0/mod.js";
import { transformExtPlugin } from "npm:@gjsify/esbuild-plugin-transform-ext@0.0.4";
import { denoPlugins as DenoPlugins } from "https://deno.land/x/esbuild_deno_loader@0.9.0/mod.ts";
import {
  extname,
  join,
  resolve,
} from "https://deno.land/std@0.212.0/path/mod.ts";

import type { EsbuildConfigs } from "./types.ts";

const CJS_OUTDIR = "./dist/cjs";

const denoPlugins = DenoPlugins({
  configPath: resolve("./deno.json"),
});

export const esbuildConfigs: EsbuildConfigs = {
  node: {
    esm: {
      plugins: [
        transformExtPlugin({ outExtension: { ".ts": ".js" } }),
        ...denoPlugins,
      ],
      entryPoints: ["./src/index.ts", "./src/**/*.ts"],
      outdir: "./dist/esm",
      bundle: false,
      platform: "node",
      target: "es2020",
      format: "esm",
    },
    cjs: {
      plugins: [
        transformExtPlugin({ outExtension: { ".ts": ".cjs", ".js": ".cjs" } }),
        ...denoPlugins,
      ],
      entryPoints: ["./src/index.ts", "./src/**/*.ts"],
      outdir: CJS_OUTDIR,
      bundle: false,
      platform: "node",
      target: "node16",
      format: "cjs",
    },
    cdn: null,
  },

  browser: {
    cdn: {
      plugins: [
        ...denoPlugins,
      ],
      entryPoints: ["./src/index.browser.ts"],
      outfile: "./dist/browser/beabee-common.js",
      bundle: true,
      sourcemap: true,
      platform: "browser",
      minify: true,
    },
    esm: {
      plugins: [
        ...denoPlugins,
      ],
      entryPoints: ["./src/index.ts"],
      outfile: "./dist/browser/index.js",
      bundle: true,
      platform: "browser",
      minify: false,
      format: "esm",
    },
    cjs: null,
  },
};

export const renameExtensionsForCjs = async (directory = CJS_OUTDIR) => {
  for await (const dirEntry of Deno.readDir(directory)) {
    const oldPath = join(directory, dirEntry.name);

    if (dirEntry.isDirectory) {
      await renameExtensionsForCjs(oldPath);
    } else if (extname(oldPath) === ".js") {
      const newPath = oldPath.replace(".js", ".cjs");
      await Deno.rename(oldPath, newPath);
    }
  }
};
