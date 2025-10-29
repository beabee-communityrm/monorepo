/**
 * Database import and seeding functionality
 * Handles importing data from JSON dump files into the database
 */
import { dataSource } from '@beabee/core/database';
import { log as mainLogger } from '@beabee/core/logging';

import { isJSON } from 'class-validator';
import * as fs from 'fs';
import * as path from 'path';

import { validateDumpStructure } from './json-dump.js';
import { DEFAULT_DUMP_DIRECTORY } from './utils/dump-file-path.js';
import { topologicalSortTables } from './utils/table-ordering.js';

const log = mainLogger.child({ app: 'anonymisers' });

/**
 * Import a JSON dump into the database
 *
 * Process:
 * 1. Read and validate the JSON dump file
 * 2. Clear existing data (in reverse order for foreign keys)
 * 3. Insert new data (in forward order)
 *
 * @param dryRun If true, only log what would be done
 * @param filePath Path to the JSON dump file
 */
export async function writeJsonToDB(
  dryRun = false,
  filePath = path.join(DEFAULT_DUMP_DIRECTORY, 'database-dump.json')
): Promise<void> {
  log.info('Start seeding...');
  log.info(`Reading from file: ${filePath}`);

  // Read and validate file
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  if (!isJSON(fileContent)) {
    throw new Error(`Invalid JSON format in file: ${filePath}`);
  }

  const dump = JSON.parse(fileContent);

  if (!validateDumpStructure(dump)) {
    throw new Error(`Invalid dump structure in file: ${filePath}`);
  }

  // Map table names to entity classes
  const entityMetas = dataSource.entityMetadatas;
  const tableToEntity = Object.fromEntries(
    entityMetas.map((meta) => [meta.tableName, meta.target])
  );

  // Get tables that exist in the dump
  const dumpTables = Object.keys(dump).filter(
    (table) => Array.isArray(dump[table]) && dump[table].length > 0
  );

  // Get ALL table names from entity metadata
  const allTableNames = entityMetas.map((meta) => meta.tableName);

  // Sort ALL tables by foreign key dependencies for proper deletion order
  // We need to sort all tables, not just dump tables, to ensure proper clearing
  const sortedAllTableNames = topologicalSortTables(
    Array.from(entityMetas),
    allTableNames
  );

  // Sort only dump tables for insertion
  const sortedDumpTableNames = topologicalSortTables(
    Array.from(entityMetas),
    dumpTables
  );

  log.info(`Processing tables in order: ${sortedDumpTableNames.join(', ')}`);

  // Build array of tables to process in dependency order
  const tablesToProcess: Array<{
    table: string;
    records: any[];
    entity: any;
  }> = sortedDumpTableNames.map((table) => ({
    table,
    records: dump[table],
    entity: tableToEntity[table],
  }));

  if (!dryRun) {
    // Clear ALL tables in REVERSE order to respect foreign key constraints
    // (child tables with FKs must be deleted before parent tables)
    // We clear ALL tables, not just dump tables, to avoid FK constraint violations
    log.info('Clearing existing data from all tables (reverse order)...');
    for (let i = sortedAllTableNames.length - 1; i >= 0; i--) {
      const tableName = sortedAllTableNames[i];
      const entity = tableToEntity[tableName];
      if (entity) {
        const repo = dataSource.getRepository(entity);
        const count = await repo.count();
        if (count > 0) {
          await repo.delete({});
          log.info(`Cleared table: ${tableName} (${count} records)`);
        }
      }
    }
  }

  // Insert data in FORWARD order to respect foreign key constraints
  // (parent tables must be inserted before child tables with FKs)
  log.info('Inserting new data (forward order)...');
  for (const { table, records, entity } of tablesToProcess) {
    const repo = dataSource.getRepository(entity);
    if (!dryRun) {
      await repo.save(records);
    }
    log.info(`Seeded table: ${table} with ${records.length} records`);
  }

  log.info('Database seeding complete.');
}
