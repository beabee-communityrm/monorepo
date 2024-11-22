// Build Node.js ESM module with esbuild.
import { build, type Plugin, stop } from "esbuild";
import { transformExtPlugin } from "@gjsify/esbuild-plugin-transform-ext";

await build({
  plugins: [
    transformExtPlugin({ outExtension: { ".ts": ".js" } }) as Plugin, // TODO: Upgrade plugin type
  ],
  entryPoints: ["./src/index.ts", "./src/**/*.ts"],
  outdir: "./dist/esm",
  bundle: false,
  platform: "node",
  target: "es2020",
  format: "esm",
});

stop();
