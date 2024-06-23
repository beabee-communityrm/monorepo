import { build } from "esbuild";

let result = await build({
  entryPoints: ["src/app.ts"],
  bundle: true,
  sourcemap: true,
  outdir: "dist",
  format: "esm",
  platform: "node",
  external: ["bullmq", "@bull-board/*", "express"],
});
console.log("done", result);
