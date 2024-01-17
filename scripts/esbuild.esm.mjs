import esbuild from "esbuild";
import { transformExtPlugin } from "@gjsify/esbuild-plugin-transform-ext";

await esbuild.build({
  plugins: [transformExtPlugin({ outExtension: { ".ts": ".js" } })],
  entryPoints: ["./src/index.ts", "./src/**/*.ts"],
  outdir: "./dist/esm",
  bundle: false,
  platform: "node",
  target: "es2020",
  format: "esm",
});
