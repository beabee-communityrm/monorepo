// Build Node.js ESM module with esbuild.
import { build } from "npm:esbuild@0.19.11";
import { transformExtPlugin } from "npm:@gjsify/esbuild-plugin-transform-ext@0.0.4";

await build({
  plugins: [transformExtPlugin({ outExtension: { ".ts": ".js" } })],
  entryPoints: ["./src/index.ts", "./src/**/*.ts"],
  outdir: "./dist/esm",
  bundle: false,
  platform: "node",
  target: "es2020",
  format: "esm",
});
