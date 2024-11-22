// Build Browser module
import { build, stop } from "esbuild";

await build({
  entryPoints: ["./src/index.browser.ts"],
  outdir: "./dist/browser",
  bundle: true,
  sourcemap: true,
  platform: "browser",
  minify: true,
});

stop();
