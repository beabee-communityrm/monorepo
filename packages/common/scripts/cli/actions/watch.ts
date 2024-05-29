import { context } from "https://deno.land/x/esbuild@v0.20.0/mod.js";
import { esbuildConfigs, renameExtensionsForCjs } from "../esbuild.ts";

import type { BuildArguments } from "../types.ts";

export const watchAction = async (argv: BuildArguments) => {
  const config = esbuildConfigs[argv.platform][argv.type];
  if (!config) {
    throw new Error(
      `Invalid platform and type combination: ${argv.platform}, ${argv.type}`,
    );
  }

  // See https://esbuild.github.io/api/#watch
  const ctx = await context(config)

  await ctx.watch()

  // TODO
  // if (argv.platform === "node" && argv.type === "cjs") {
  //   await renameExtensionsForCjs();
  // }
};
