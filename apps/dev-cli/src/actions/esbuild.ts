import { buildStandard } from "@beabee/esbuild";
import { resolve } from "node:path";
import type { EsbuildArgs } from "../types/index.ts";

/**
 * Build packages using esbuild
 * @param argv Command arguments
 */
export const esbuild = async (argv: EsbuildArgs): Promise<void> => {
  const { packageName, globalName, entryPoints, watch, baseDir } = argv;

  console.log(`Building package: ${packageName}`);
  console.log(`Global name: ${globalName}`);
  console.log(`Entry points: ${entryPoints.join(", ")}`);
  console.log(`Watch mode: ${watch ? "enabled" : "disabled"}`);
  console.log(`Base directory: ${baseDir}`);

  try {
    // Change to the base directory to ensure correct relative paths
    const originalCwd = process.cwd();
    process.chdir(baseDir);

    // Add watch flag to process.argv if watch mode is enabled
    if (watch && !process.argv.includes("--watch")) {
      process.argv.push("--watch");
    }

    await buildStandard(packageName, entryPoints, globalName).catch((err) => {
      console.error(err);
      process.exit(1);
    });

    // Restore original working directory
    process.chdir(originalCwd);
  } catch (error) {
    console.error("Build failed:", error);
    process.exit(1);
  }
};
