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

  // Get tables that exist in the dump and have corresponding entities
  const tablesToProcess: Array<{
    table: string;
    records: any[];
    entity: any;
  }> = [];

  for (const [table, records] of Object.entries(dump)) {
    if (!Array.isArray(records) || records.length === 0) continue;
    const entity = tableToEntity[table];
    tablesToProcess.push({ table, records, entity });
  }

  if (!dryRun) {
    // Clear tables in reverse order to respect foreign key constraints
    log.info('Clearing existing data...');
    for (let i = tablesToProcess.length - 1; i >= 0; i--) {
      const { table, entity } = tablesToProcess[i];
      const repo = dataSource.getRepository(entity);
      await repo.delete({});
      log.info(`Cleared table: ${table}`);
    }
  }

  // Insert data in forward order
  log.info('Inserting new data...');
  for (const { table, records, entity } of tablesToProcess) {
    const repo = dataSource.getRepository(entity);
    if (!dryRun) {
      await repo.save(records);
    }
    log.info(`Seeded table: ${table} with ${records.length} records`);
  }

  log.info('Database seeding complete.');
}
