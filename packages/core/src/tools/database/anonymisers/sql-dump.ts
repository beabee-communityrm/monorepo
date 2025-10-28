/**
 * SQL dump management
 * Handles writing, initialization, and finalization of SQL database dumps
 */
import { createQueryBuilder, getRepository } from '@beabee/core/database';
import { log as mainLogger } from '@beabee/core/logging';

import * as fs from 'fs';
import { EntityTarget, ObjectLiteral } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity.js';

import { ModelAnonymiser } from './models.js';
import { createDumpFilePath } from './utils/dump-file-path.js';
import { stringify } from './utils/stringify.js';

const log = mainLogger.child({ app: 'anonymisers' });

// Global SQL dump file stream for SQL exports
let sqlDumpStream: fs.WriteStream | null = null;

/**
 * Write items to SQL dump file as INSERT statements
 *
 * Output format (alternating lines):
 * - SQL query: INSERT INTO "table" ("column1", "column2") VALUES ($1, $2), ($3, $4);
 * - JSON params: ["value1", "value2", "value3", "value4"]
 *
 * @param model The target database model
 * @param items The items to write for export
 */
export function writeItemsToSqlDump<T extends ObjectLiteral>(
  model: EntityTarget<T>,
  items: T[]
): void {
  if (!sqlDumpStream) {
    throw new Error(
      'SQL dump stream not initialized. Call initializeSqlDump first.'
    );
  }

  const [query, params] = createQueryBuilder()
    .insert()
    .into(model)
    .values(items as QueryDeepPartialEntity<T>)
    .getQueryAndParameters();

  sqlDumpStream.write(query + ';\n');
  sqlDumpStream.write(stringify(params) + '\n');
}

/**
 * Initialize the SQL dump file stream
 *
 * Creates a new timestamped SQL dump file and writes DELETE statements
 * to clear existing data.
 *
 * @param anonymisers Model anonymizers to initialize (used for DELETE statements)
 * @param outputDir Base directory for the dump file
 * @returns The file path where SQL dump is being written
 */
export function initializeSqlDump(
  anonymisers: ModelAnonymiser<ObjectLiteral>[],
  outputDir = '/opt/packages/test-utils/database-dumps'
): string {
  const sqlFilePath = createDumpFilePath(outputDir, 'sql');

  sqlDumpStream = fs.createWriteStream(sqlFilePath, { flags: 'w' });

  // Write DELETE statements at the beginning (in reverse order for foreign keys)
  for (let i = anonymisers.length - 1; i >= 0; i--) {
    const tableName = getRepository(anonymisers[i].model).metadata.tableName;
    sqlDumpStream.write(`DELETE FROM "${tableName}";\n`);
    sqlDumpStream.write('\n'); // Empty params line
  }

  log.info(`SQL dump initialized: ${sqlFilePath}`);
  return sqlFilePath;
}

/**
 * Close and finalize the SQL dump file
 *
 * @param dryRun If true, only log what would be done
 * @returns Promise that resolves when the stream is closed
 */
export async function saveSqlDump(dryRun = false): Promise<void> {
  if (!sqlDumpStream) {
    log.warn('No SQL dump stream to close');
    return;
  }

  return new Promise((resolve, reject) => {
    if (dryRun) {
      log.info('[Dry run] SQL dump would be finalized');
      sqlDumpStream = null;
      resolve();
      return;
    }

    sqlDumpStream!.on('finish', () => {
      log.info('SQL dump saved successfully');
      sqlDumpStream = null;
      resolve();
    });

    sqlDumpStream!.on('error', (error) => {
      log.error('Error closing SQL dump stream:', error);
      sqlDumpStream = null;
      reject(error);
    });

    sqlDumpStream!.end();
  });
}

/**
 * Output SQL DELETE statements to clear models
 *
 * Output format (for each model):
 * - SQL query: DELETE FROM "table";
 * - Empty line (to match writeItems format)
 *
 * Models are cleared in reverse order to handle foreign key constraints.
 *
 * @param anonymisers Model anonymizers to clear
 */
export function clearModels(
  anonymisers: ModelAnonymiser<ObjectLiteral>[]
): void {
  // Reverse order to handle foreign keys correctly
  for (let i = anonymisers.length - 1; i >= 0; i--) {
    console.log(
      `DELETE FROM "${getRepository(anonymisers[i].model).metadata.tableName}";`
    );
    console.log(); // Empty params line (maintains consistency with writeItems format)
  }
}
