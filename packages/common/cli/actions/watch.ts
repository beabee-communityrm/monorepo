import { context } from "esbuild";
import { esbuildConfigs } from "../esbuild.ts";

import type { BuildArguments, BuildPlatform, BuildType } from "../types.ts";

export const watchAction = async (argv: BuildArguments) => {
  // Watch for specific platform and type
  if (argv.platform && argv.type) {
    const config = esbuildConfigs[argv.platform][argv.type];
    if (!config) {
      throw new Error(
        `Invalid platform and type combination: ${argv.platform}, ${argv.type}`,
      );
    }
    const ctx = await context(config);
    await ctx.watch();
    return;
  }

  // Watch for specific platform for all types
  if (argv.platform && !argv.type) {
    for (
      const types of Object.keys(esbuildConfigs[argv.platform]) as BuildType[]
    ) {
      const config = esbuildConfigs[argv.platform][types];
      if (!config) continue;
      console.info(`Watching ${argv.platform} ${types}`);
      const ctx = await context(config);
      await ctx.watch();
    }
    return;
  }

  // Watch for all platforms and types
  for (const platforms of Object.keys(esbuildConfigs) as BuildPlatform[]) {
    for (const types of Object.keys(esbuildConfigs[platforms]) as BuildType[]) {
      const config = esbuildConfigs[platforms][types];
      if (!config) continue;
      console.info(`Watching ${platforms} ${types}`);
      const ctx = await context(config);
      await ctx.watch();
    }
  }
};
