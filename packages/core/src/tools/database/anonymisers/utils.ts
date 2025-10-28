/**
 * Utility functions for database dump operations
 */
import * as fs from 'fs';
import * as path from 'path';

/**
 * Creates a timestamped file path for database dumps
 *
 * @param outputDir Base directory for dumps
 * @param extension File extension (json or sql)
 * @returns Full path with timestamp
 */
export function createDumpFilePath(
  outputDir: string,
  extension: 'json' | 'sql' = 'json'
): string {
  const dumpDir = path.join(outputDir, 'generated-dumps');

  // Validate output directory exists
  if (!fs.existsSync(outputDir)) {
    throw new Error(`Output directory does not exist: ${outputDir}`);
  }

  // Create generated-dumps subdirectory if needed
  if (!fs.existsSync(dumpDir)) {
    fs.mkdirSync(dumpDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  return path.join(dumpDir, `database-dump-${timestamp}.${extension}`);
}

/**
 * Stringify helper that handles Map objects
 * Maps don't stringify well by default, so convert them to arrays
 */
export function stringify(value: any): string {
  return JSON.stringify(value, (key: string, value: any): any => {
    return value instanceof Map ? [...value] : value;
  });
}

/**
 * Default file directory for database dumps
 */
export const DEFAULT_DUMP_DIRECTORY = path.resolve(
  process.cwd(),
  '../../packages/test-utils/database-dumps'
);
