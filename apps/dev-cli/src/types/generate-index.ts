export interface GenerateIndexArgs {
  /** Directories where index files should be generated */
  paths: string[];
  /** File extension to use for imports (.js, .ts, or none) */
  extension: "js" | "ts" | "none";
  /** Base directory to resolve paths from */
  baseDir: string;
}
