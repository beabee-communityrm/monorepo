export interface EsbuildArgs {
  /** Package name for the build */
  packageName: string;
  /** Global name for browser builds */
  globalName: string;
  /** Entry points for the build */
  entryPoints: string[];
  /** Enable watch mode */
  watch: boolean;
  /** Base directory to resolve paths from */
  baseDir: string;
}
