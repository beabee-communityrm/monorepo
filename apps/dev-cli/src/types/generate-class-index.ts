export interface GenerateClassIndexArgs {
  /** Directory containing the .ts files to scan (relative to baseDir) */
  srcDir: string;
  /** Output file path (relative to baseDir) */
  outFile: string;
  /** Name of the exported array constant, e.g. 'entities' or 'migrations' */
  exportName: string;
  /**
   * How to determine the class name to import from each file:
   * - 'filename': class name equals filename without extension
   * - 'parse':    class name parsed from `export class X` in the file
   */
  classNameStrategy: 'filename' | 'parse';
  /** Base directory to resolve paths from */
  baseDir: string;
  /**
   * If true, do not write the file. Instead print what would be written
   * and exit non-zero if the existing file content differs (drift detection).
   */
  check?: boolean;
}
