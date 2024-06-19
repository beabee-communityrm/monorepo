import { context } from "../deps.ts";
import { crossBuildConfigs } from "../cross-build-configs.ts";

import type { BuildArguments, BuildPlatform, BuildType } from "../types.ts";

export const crossWatchAction = async (argv: BuildArguments) => {
  // Watch for specific platform and type
  if (argv.platform && argv.type) {
    const config = crossBuildConfigs[argv.platform][argv.type];
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
      const types of Object.keys(crossBuildConfigs[argv.platform]) as BuildType[]
    ) {
      const config = crossBuildConfigs[argv.platform][types];
      if (!config) continue;
      console.info(`Watching ${argv.platform} ${types}`);
      const ctx = await context(config);
      await ctx.watch();
    }
    return;
  }

  // Watch for all platforms and types
  for (const platforms of Object.keys(crossBuildConfigs) as BuildPlatform[]) {
    for (const types of Object.keys(crossBuildConfigs[platforms]) as BuildType[]) {
      const config = crossBuildConfigs[platforms][types];
      if (!config) continue;
      console.info(`Watching ${platforms} ${types}`);
      const ctx = await context(config);
      await ctx.watch();
    }
  }
};
