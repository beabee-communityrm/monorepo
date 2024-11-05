import type { BuildOptions } from "esbuild";

export type BuildPlatform = "node" | "browser";

export type BuildType = "esm" | "cjs" | "cdn";

export interface BuildArguments {
  type?: BuildType;
  platform?: BuildPlatform;
}

export interface GenerateIndexArguments {
  paths: string[];
}

export type EsbuildConfigs = Record<
  BuildPlatform,
  Record<BuildType, BuildOptions | null>
>;
