import { buildStandard } from "@beabee/esbuild";
import { resolve } from "node:path";
import type { EsbuildArgs } from "../types/index.ts";

/**
 * Build packages using esbuild
 * @param argv Command arguments
 */
export const esbuild = async (argv: EsbuildArgs): Promise<void> => {
  const { globalName, entryPoints, watch, baseDir } = argv;
  try {
    await buildStandard({
      entryPoints,
      globalName,
      watch,
      baseDir
    }).catch((err) => {
      console.error(err);
      process.exit(1);
    });
  } catch (error) {
    console.error("Build failed:", error);
    process.exit(1);
  }
};
