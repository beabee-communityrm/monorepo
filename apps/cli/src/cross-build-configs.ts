import { transformExtPlugin } from "npm:@gjsify/esbuild-plugin-transform-ext@0.0.4";
import { denoPlugins as DenoPlugins } from "https://deno.land/x/esbuild_deno_loader@0.9.0/mod.ts";
import { resolve } from "https://deno.land/std@0.212.0/path/mod.ts";
import { renameExtPlugin } from "./plugins/rename.ts";

import type { EsbuildConfigs } from "./types.ts";

const CJS_OUTDIR = "./dist/cjs";

const denoPlugins = DenoPlugins({
  configPath: resolve(Deno.cwd(), "./deno.jsonc"),
  // loader: "portable",
  // nodeModulesDir: true,
});

export const crossBuildConfigs: EsbuildConfigs = {
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
        // Rename imports
        transformExtPlugin({ outExtension: { ".ts": ".cjs", ".js": ".cjs" } }),
        ...denoPlugins,
        // Rename files
        renameExtPlugin(".js", ".cjs"),
      ],
      entryPoints: ["./src/index.ts", "./src/**/*.ts"],
      outdir: CJS_OUTDIR,
      bundle: false,
      platform: "node",
      target: "node20",
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
