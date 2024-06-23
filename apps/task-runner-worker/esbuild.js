import { build } from "esbuild";

let result = await build({
  entryPoints: ["src/app.ts"],
  bundle: true,
  sourcemap: true,
  outdir: "dist",
  format: "esm",
  platform: "node",
  external: [
    "bullmq",
    "@beabee/core",
    "@beabee/config",
    "@beabee/locales",
    "@beabee/models",
  ],
});
console.log("done", result);
