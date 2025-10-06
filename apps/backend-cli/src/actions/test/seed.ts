import { dataSource } from '@beabee/core/database';
import { runApp } from '@beabee/core/server';

import * as fs from 'fs';
import * as path from 'path';

const fileDirectory = path.resolve(
  process.cwd(),
  '../../packages/test-utils/database-dump'
);

/**
 * Load a JSON dump to seed the database with test data using TypeORM repositories.
 *
 * @param dryRun If true, only logs what would be done (not used here, for API consistency)
 * @param fileName Optional path to the JSON dump file
 */
export const seed = async (
  dryRun = false,
  fileName = 'database-dump.json'
): Promise<void> => {
  await runApp(async () => {
    const filePath = path.join(fileDirectory, fileName);
    console.log(`Start seeding...`);
    console.log(`Reading from file: ${filePath}`);
    const dump = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    // Get entity metadata from the dataSource
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
      if (!entity) {
        console.warn(`No entity found for table: ${table}, skipping.`);
        continue;
      }
      tablesToProcess.push({ table, records, entity });
    }

    if (!dryRun) {
      // Clear tables in reverse order to respect foreign key constraints
      console.log('Clearing existing data...');
      for (let i = tablesToProcess.length - 1; i >= 0; i--) {
        const { table, entity } = tablesToProcess[i];
        const repo = dataSource.getRepository(entity);
        await repo.delete({});
        console.log(`Cleared table: ${table}`);
      }
    }

    // Insert data in forward order
    console.log('Inserting new data...');
    for (const { table, records, entity } of tablesToProcess) {
      const repo = dataSource.getRepository(entity);
      if (!dryRun) {
        await repo.save(records);
      }
      console.log(`Seeded table: ${table} with ${records.length} records`);
    }
    console.log('Database seeding complete.');
  });
};
