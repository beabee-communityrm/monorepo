// Build Node.js ESM module with esbuild.
import { build } from "esbuild";
import { extname, join } from "node:path";
import { readdir, rename } from "node:fs/promises";
import { transformExtPlugin } from "@gjsify/esbuild-plugin-transform-ext";

const OUTDIR_ESM = "./dist/esm";
const OUTDIR_CJS = "./dist/cjs";

// ESM
await build({
  plugins: [],
  entryPoints: ["./src/index.ts", "./src/**/*.ts"],
  outdir: OUTDIR_ESM,
  bundle: false,
  platform: "node",
  target: "es2020",
  format: "esm",
});

// CJS
await build({
  plugins: [transformExtPlugin({ outExtension: { ".js": ".cjs" } })],
  entryPoints: ["./src/index.ts", "./src/**/*.ts"],
  outdir: OUTDIR_CJS,
  bundle: false,
  platform: "node",
  target: "node16",
  format: "cjs",
});

// The JSON locale files need to be available to both module formats, but also
// in the types directory so they can be used to generate static types
for (const outdir of [OUTDIR_ESM, OUTDIR_CJS, './dist/types']) {
  await build({
    entryPoints: ["./src/**/*.json"],
    outdir,
    bundle: false,
    loader: {
      ".json": "copy"
    }
  })
}

async function renameExtensions(directory) {
  for await (const dirEntry of await readdir(directory, {
    withFileTypes: true,
  })) {
    const oldPath = join(directory, dirEntry.name);

    if (dirEntry.isDirectory()) {
      await renameExtensions(oldPath);
    } else if (extname(oldPath) === ".js") {
      const newPath = oldPath.replace(".js", ".cjs");
      await rename(oldPath, newPath);
    }
  }
}

await renameExtensions(OUTDIR_CJS);
