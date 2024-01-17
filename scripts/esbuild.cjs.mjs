import esbuild from "esbuild";
import fs from "fs/promises";
import path from "path";
import { transformExtPlugin } from "@gjsify/esbuild-plugin-transform-ext";

const OUTDIR = "./dist/cjs";

await esbuild.build({
  plugins: [
    transformExtPlugin({ outExtension: { ".ts": ".cjs", ".js": ".cjs" } }),
  ],
  entryPoints: ["./src/index.ts", "./src/**/*.ts"],
  outdir: OUTDIR,
  bundle: false,
  platform: "node",
  target: "node16",
  format: "cjs",
});

async function renameExtensions(directory) {
  const files = await fs.readdir(directory);

  for (const file of files) {
    const oldPath = path.join(directory, file);
    const stats = await fs.stat(oldPath);

    if (stats.isDirectory()) {
      await renameExtensions(oldPath);
    } else if (path.extname(oldPath) === ".js") {
      const newPath = oldPath.replace(".js", ".cjs");
      await fs.rename(oldPath, newPath);
    }
  }
}

await renameExtensions(OUTDIR);
