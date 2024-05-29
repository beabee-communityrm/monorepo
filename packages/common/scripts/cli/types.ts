import type { Config as EsbuildConfig } from "https://deno.land/x/esbuild@v0.20.0/mod.js";

export type BuildPlatform = "node" | "browser";

export type BuildType = "esm" | "cjs" | "cdn";

export interface BuildArguments {
  type: BuildType;
  platform: BuildPlatform;
}

export type EsbuildConfigs = Record<
  BuildPlatform,
  Record<BuildType, EsbuildConfig | null>
>;
