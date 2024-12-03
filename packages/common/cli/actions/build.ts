import { build, stop } from "esbuild";
import { esbuildConfigs } from "../esbuild.js";

import type { BuildArguments, BuildPlatform, BuildType } from "../types.js";

export const buildAction = async (argv: BuildArguments) => {
  // Build for specific platform and type
  if (argv.platform && argv.type) {
    const config = esbuildConfigs[argv.platform][argv.type];
    if (!config) {
      throw new Error(
        `Invalid platform and type combination: ${argv.platform}, ${argv.type}`
      );
    }
    await build(config);
  }

  // Build for specific platform for all types
  if (argv.platform) {
    for (const types of Object.keys(
      esbuildConfigs[argv.platform]
    ) as BuildType[]) {
      const config = esbuildConfigs[argv.platform][types];
      if (!config) continue;
      console.info(`Building ${argv.platform} ${types}`);
      await build(config);
    }
  }

  // Build for all platforms and types
  for (const platforms of Object.keys(esbuildConfigs) as BuildPlatform[]) {
    for (const types of Object.keys(esbuildConfigs[platforms]) as BuildType[]) {
      const config = esbuildConfigs[platforms][types];
      if (!config) continue;
      console.info(`Building ${platforms} ${types}`);
      await build(config);
    }
  }

  return await stop();
};
