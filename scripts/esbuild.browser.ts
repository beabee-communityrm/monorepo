// Build browser bundle with esbuild.
import { build, stop } from "https://deno.land/x/esbuild@v0.20.0/mod.js";
import { denoPlugins } from "https://deno.land/x/esbuild_deno_loader@0.9.0/mod.ts";
import { resolve } from "https://deno.land/std@0.212.0/path/mod.ts";

// CDN friendly minified version
await build({
  plugins: [
    ...denoPlugins({ configPath: resolve("./deno.json") }),
  ],
  entryPoints: ["./src/index.browser.ts"],
  outfile: "./dist/browser/beabee-common.min.js",
  bundle: true,
  platform: "browser",
  minify: true,
});

// CDN friendly dev version with sourcemap
await build({
  plugins: [
    ...denoPlugins({ configPath: resolve("./deno.json") }),
  ],
  entryPoints: ["./src/index.browser.ts"],
  outfile: "./dist/browser/beabee-common.js",
  bundle: true,
  sourcemap: true,
  platform: "browser",
  minify: false,
});

// Bundler version for the package.json
await build({
  plugins: [
    ...denoPlugins({ configPath: resolve("./deno.json") }),
  ],
  entryPoints: ["./src/index.ts"],
  outfile: "./dist/browser/index.js",
  bundle: true,
  platform: "browser",
  minify: false,
  format: "esm",
});

stop();
