import { config } from '@beabee/core/config';
import { dataSource } from '@beabee/core/database';
import { runApp } from '@beabee/core/server';
import { writeJsonToDB } from '@beabee/core/tools/database/anonymisers/index';

import * as fs from 'fs';
import readline from 'readline';

/**
 * Import data from JSON dump file
 *
 * @param filePath Path to the JSON dump file
 * @param dryRun If true, only logs what would be done
 */
async function importFromJson(filePath: string, dryRun = false): Promise<void> {
  console.log(`Importing from JSON file: ${filePath}`);
  await writeJsonToDB(dryRun, filePath);
}

/**
 * Import data from SQL dump file
 * File format: first line is SQL, second is params (repeated)
 *
 * @param filePath Path to the SQL dump file
 */
async function importFromSqlFile(filePath: string): Promise<void> {
  console.log(`Importing from SQL file: ${filePath}`);

  await dataSource.manager.transaction(async (manager) => {
    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });

    let query = '';
    for await (const line of rl) {
      if (query) {
        console.log('Running ' + query.substring(0, 100) + '...');
        await manager.query(query, line !== '' ? JSON.parse(line) : undefined);
        query = '';
      } else {
        query = line;
      }
    }
  });
}

/**
 * Import database from JSON or SQL dump file
 *
 * @param filePath Path to the dump file (optional, defaults to test data dump)
 * @param type Import type: json or sql (auto-detected from extension if not specified)
 * @param dryRun If true, only logs what would be done (JSON only)
 */
export const importDatabase = async (
  filePath?: string,
  type?: 'json' | 'sql',
  dryRun = false
): Promise<void> => {
  if (!config.dev) {
    console.error("Can't import to live database");
    process.exit(1);
  }

  // Auto-detect type from file extension if not specified
  // If filePath is provided, detect from extension
  // If not provided, use type to determine default path
  let detectedType: 'json' | 'sql';
  let resolvedFilePath: string;

  if (filePath && filePath.trim() !== '') {
    // File path was explicitly provided
    detectedType = type || (filePath.endsWith('.json') ? 'json' : 'sql');
    resolvedFilePath = filePath;
    console.log(`Using provided file path: ${resolvedFilePath}`);
  } else {
    // No file path provided, use default based on type
    detectedType = type || 'json';
    const extension = detectedType === 'json' ? 'json' : 'sql';
    resolvedFilePath = `../../packages/test-utils/database-dumps/database-dump.${extension}`;
    console.log(
      `Using default file path for type '${detectedType}': ${resolvedFilePath}`
    );
  }

  if (!fs.existsSync(resolvedFilePath)) {
    console.error(`File not found: ${resolvedFilePath}`);
    process.exit(1);
  }

  await runApp(async () => {
    if (detectedType === 'json') {
      await importFromJson(resolvedFilePath, dryRun);
    } else {
      await importFromSqlFile(resolvedFilePath);
    }
    console.log('Import completed successfully');
  });
};
