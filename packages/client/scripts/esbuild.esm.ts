// Build Node.js ESM module with esbuild.
import { build, type Plugin, stop } from "esbuild";
import { transformExtPlugin } from "@gjsify/esbuild-plugin-transform-ext";

await build({
  plugins: [
    transformExtPlugin({ outExtension: { ".js": ".js" } }) as Plugin, // TODO: Upgrade plugin type
  ],
  entryPoints: ["./src/index.js", "./src/**/*.js"],
  outdir: "./dist/esm",
  bundle: false,
  platform: "node",
  target: "es2020",
  format: "esm",
});

stop();
