/**
 * Utility functions for creating and managing dump file paths
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
 * Default file directory for database dumps
 */
export const DEFAULT_DUMP_DIRECTORY = path.resolve(
  process.cwd(),
  '../../packages/test-utils/database-dumps'
);
