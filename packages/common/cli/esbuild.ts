import { transformExtPlugin } from "@gjsify/esbuild-plugin-transform-ext";
import { denoPlugins as DenoPlugins } from "@luca/esbuild-deno-loader";
import { renameExtPlugin } from "./plugins/rename.ts";
import type { Plugin } from "esbuild";

import type { EsbuildConfigs } from "./types.ts";

const denoPlugins = DenoPlugins({
  nodeModulesDir: "auto"
});

export const esbuildConfigs: EsbuildConfigs = {
  node: {
    esm: {
      plugins: [
        transformExtPlugin({ outExtension: { ".ts": ".js" } }) as Plugin, // TODO: Upgrade plugin type
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
        transformExtPlugin({ outExtension: { ".ts": ".cjs", ".js": ".cjs" } }) as Plugin, // TODO: Upgrade plugin type
        ...denoPlugins,
        // Rename files
        renameExtPlugin(".js", ".cjs"),
      ],
      entryPoints: ["./src/index.ts", "./src/**/*.ts"],
      outdir: "./dist/cjs",
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
