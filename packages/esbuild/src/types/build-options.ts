import type { Plugin } from "esbuild";

export interface BuildStandardOptions {
  /** Entry points for the build */
  entryPoints: string[];
  /** Whether to enable watch mode */
  watch?: boolean;
  /** Additional plugins to include */
  additionalPlugins?: Plugin[];
  /** Whether to bundle files */
  bundle?: boolean;
  /** Base directory */
  baseDir?: string;
}

export interface BuildOptions extends BuildStandardOptions {
  /** Output directory */
  outdir: string;
}

export interface BuildIIFEOptions extends BuildOptions {
  /** Global name for IIFE builds */
  globalName?: string;
}
