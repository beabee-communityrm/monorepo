import { build, stop } from "https://deno.land/x/esbuild@v0.20.0/mod.js";
import { esbuildConfigs, renameExtensionsForCjs } from "../esbuild.ts";

import type { BuildArguments } from "../types.ts";

export const buildAction = async (argv: BuildArguments) => {
  const config = esbuildConfigs[argv.platform][argv.type];
  if (!config) {
    throw new Error(
      `Invalid platform and type combination: ${argv.platform}, ${argv.type}`,
    );
  }
  await build(config);

  if (argv.platform === "node" && argv.type === "cjs") {
    await renameExtensionsForCjs();
  }

  await stop();
};
