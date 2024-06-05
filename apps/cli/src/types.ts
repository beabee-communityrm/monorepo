import type { BuildOptions } from "https://deno.land/x/esbuild@v0.20.0/mod.js";

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

export interface PackageJson {
  name: string;
  version: string;
  dependencies: Record<string, string>;
  scripts: Record<string, string>;
}

export interface DenoJsonc {
  name: string;
  version: string;
  imports: Record<string, string>;
  tasks: Record<string, string>;
}

