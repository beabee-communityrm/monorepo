import { build, stop } from "https://deno.land/x/esbuild@v0.20.0/mod.js";
import { crossBuildConfigs } from "../cross-build-configs.ts";

import type { BuildArguments, BuildPlatform, BuildType } from "../types.ts";

export const crossBuildAction = async (argv: BuildArguments) => {
  // Build for specific platform and type
  if (argv.platform && argv.type) {
    const config = crossBuildConfigs[argv.platform][argv.type];
    if (!config) {
      throw new Error(
        `Invalid platform and type combination: ${argv.platform}, ${argv.type}`,
      );
    }
    await build(config);
  }

  // Build for specific platform for all types
  if (argv.platform) {
    for (
      const types of Object.keys(crossBuildConfigs[argv.platform]) as BuildType[]
    ) {
      const config = crossBuildConfigs[argv.platform][types];
      if (!config) continue;
      console.info(`Building ${argv.platform} ${types}`);
      await build(config);
    }
  }

  // Build for all platforms and types
  for (const platforms of Object.keys(crossBuildConfigs) as BuildPlatform[]) {
    for (const types of Object.keys(crossBuildConfigs[platforms]) as BuildType[]) {
      const config = crossBuildConfigs[platforms][types];
      if (!config) continue;
      console.info(`Building ${platforms} ${types}`);
      await build(config);
    }
  }

  return await stop();
};
