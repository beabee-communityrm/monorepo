import { renameExtPlugin } from "./plugins/rename.js";
import type { Plugin } from "esbuild";

import type { EsbuildConfigs } from "./types.js";

export const esbuildConfigs: EsbuildConfigs = {
  node: {
    esm: {
      plugins: [],
      entryPoints: ["./src/index.js", "./src/**/*.js"],
      outdir: "./dist/esm",
      bundle: false,
      platform: "node",
      target: "es2020",
      format: "esm",
    },
    cjs: {
      plugins: [
        renameExtPlugin(".js", ".cjs"),
      ],
      entryPoints: ["./src/index.js", "./src/**/*.js"],
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
      plugins: [],
      entryPoints: ["./src/index.browser.js"],
      outfile: "./dist/browser/beabee-common.js",
      bundle: true,
      sourcemap: true,
      platform: "browser",
      minify: true,
    },
    esm: {
      plugins: [],
      entryPoints: ["./src/index.js"],
      outfile: "./dist/browser/index.js",
      bundle: true,
      platform: "browser",
      minify: false,
      format: "esm",
    },
    cjs: null,
  },
};
