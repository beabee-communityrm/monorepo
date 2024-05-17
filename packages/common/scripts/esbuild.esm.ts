// Build Node.js ESM module with esbuild.
import { build, stop } from "https://deno.land/x/esbuild@v0.20.0/mod.js";
import { transformExtPlugin } from "npm:@gjsify/esbuild-plugin-transform-ext@0.0.4";
import { denoPlugins } from "https://deno.land/x/esbuild_deno_loader@0.9.0/mod.ts";
import { resolve } from "https://deno.land/std@0.212.0/path/mod.ts";

await build({
  plugins: [
    transformExtPlugin({ outExtension: { ".ts": ".js" } }),
    ...denoPlugins({ configPath: resolve("./deno.json") }),
  ],
  entryPoints: ["./src/index.ts", "./src/**/*.ts"],
  outdir: "./dist/esm",
  bundle: false,
  platform: "node",
  target: "es2020",
  format: "esm",
});

stop();
