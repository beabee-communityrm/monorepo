import type { Plugin } from "esbuild";

export interface BuildOptions {
  /** Entry points for the build */
  entryPoints: string[];
  /** Output directory */
  outdir: string;
  /** Whether to enable watch mode */
  watch?: boolean;
  /** Additional plugins to include */
  additionalPlugins?: Plugin[];
  /** Global name for IIFE builds */
  globalName?: string;
  /** Whether to bundle files */
  bundle?: boolean;
}
