export interface EsbuildArgs {
  /** Entry points for the build */
  entryPoints: string[];
  /** Enable watch mode */
  watch: boolean;
  /** Base directory to resolve paths from */
  baseDir: string;
}
