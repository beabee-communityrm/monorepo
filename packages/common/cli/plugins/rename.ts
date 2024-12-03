import type {
  BuildResult,
  Plugin,
  PluginBuild,
} from "esbuild";

import { extname, join } from "https://deno.land/std@0.212.0/path/mod.js";

const renameExtensions = async (
  from: string,
  to: string,
  directory: string,
) => {
  for await (const dirEntry of Deno.readDir(directory)) {
    const oldPath = join(directory, dirEntry.name);

    if (dirEntry.isDirectory) {
      await renameExtensions(from, to, oldPath);
    } else if (extname(oldPath) === from) {
      const newPath = oldPath.replace(from, to);
      await Deno.rename(oldPath, newPath);
    }
  }
};

/**
 * Rename file extensions after the build is done
 */
export const renameExtPlugin = (
  from = ".js",
  to = ".cjs",
  outdir?: string,
): Plugin => {
  return {
    name: "rename-ext",
    setup(build: PluginBuild) {
      build.onEnd((_result: BuildResult) => {
        outdir ||= build.initialOptions.outdir;
        if (!outdir) {
          throw new Error(`[${this.name}] outdir option is required`);
        }
        renameExtensions(from, to, outdir);
      });
    },
  };
};
