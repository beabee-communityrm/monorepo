import { exportDatabase } from './export.js';

/**
 * Export a demo database with a subset of data
 * This is a convenience wrapper around exportDatabase with demo subset
 *
 * @param dryRun If true, only logs what would be done
 * @param type Export type: json or sql
 * @param outputDir Optional output directory
 */
export const exportDemo = async (
  dryRun = false,
  type: 'json' | 'sql' = 'json',
  outputDir?: string
): Promise<void> => {
  return exportDatabase(dryRun, type, {
    anonymize: true,
    subset: 'demo',
    outputDir,
  });
};
