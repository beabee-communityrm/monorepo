import { build, stop } from "https://deno.land/x/esbuild@v0.20.0/mod.js";
import { esbuildConfigs, renameExtensionsForCjs } from "../esbuild.ts";

import type { BuildPlatform, BuildType } from "../types.ts";

export const buildAllAction = async () => {
  for (const platforms of Object.keys(esbuildConfigs) as BuildPlatform[]) {
    for (const types of Object.keys(esbuildConfigs[platforms]) as BuildType[]) {
      const config = esbuildConfigs[platforms][types];
      if (!config) continue
      console.info(`Building ${platforms} ${types}`);
      await build(config);
    }
  }

  await renameExtensionsForCjs();

  await stop();
};
