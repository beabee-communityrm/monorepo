// Build Node.js CommonJS module with esbuild.
import {
  build,
  type Plugin,
  stop,
} from "https://deno.land/x/esbuild@v0.20.0/mod.js";
import { transformExtPlugin } from "npm:@gjsify/esbuild-plugin-transform-ext@0.0.4";
import { extname, join } from "https://deno.land/std@0.212.0/path/mod.ts";

const OUTDIR = "./dist/cjs";

await build({
  plugins: [
    transformExtPlugin({
      outExtension: { ".ts": ".cjs", ".js": ".cjs" },
    }) as Plugin, // TODO: Upgrade plugin type
  ],
  entryPoints: ["./src/index.ts", "./src/**/*.ts"],
  outdir: OUTDIR,
  bundle: false,
  platform: "node",
  target: "node16",
  format: "cjs",
});

async function renameExtensions(directory: string) {
  for await (const dirEntry of Deno.readDir(directory)) {
    const oldPath = join(directory, dirEntry.name);

    if (dirEntry.isDirectory) {
      await renameExtensions(oldPath);
    } else if (extname(oldPath) === ".js") {
      const newPath = oldPath.replace(".js", ".cjs");
      await Deno.rename(oldPath, newPath);
    }
  }
}

await renameExtensions(OUTDIR);

stop();
