import { createQueryBuilder, getRepository } from '@beabee/core/database';
import { dataSource } from '@beabee/core/database';
import { log as mainLogger } from '@beabee/core/logging';
import { Callout, CalloutResponse } from '@beabee/core/models';

import * as fs from 'fs';
import * as path from 'path';
import {
  EntityTarget,
  ObjectLiteral,
  OrderByCondition,
  SelectQueryBuilder,
} from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity.js';

import {
  ModelAnonymiser,
  ObjectMap,
  PropertyMap,
  calloutResponsesAnonymiser,
  createAnswersAnonymiser,
} from './models';

interface DatabaseDump {
  [tableName: string]: any[];
}

const log = mainLogger.child({ app: 'anonymisers' });

const fileDirectory = path.resolve(
  process.cwd(),
  '../../packages/test-utils/database-dump'
);

function createFilePathAnonymise(outputDir: string) {
  const dumpDir = path.join(outputDir, 'generated-dumps');
  //check if output dir exists, if not throw error
  if (!fs.existsSync(outputDir)) {
    throw new Error(`Output directory does not exist: ${outputDir}`);
  }
  if (!fs.existsSync(dumpDir)) {
    fs.mkdirSync(dumpDir, { recursive: true });
  }
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  return path.join(dumpDir, `database-dump-${timestamp}.json`);
}

// Global JSON dump object to collect all data
let jsonDump: DatabaseDump = {};

// Maps don't stringify well
function stringify(value: any): string {
  return JSON.stringify(value, (key: string, value: any): any => {
    return value instanceof Map ? [...value] : value;
  });
}

/**
 * Write items to JSON dump
 *
 * @param model The target database model
 * @param items The items to write for export
 */
function addItemsToJsonDump<T extends ObjectLiteral>(
  model: EntityTarget<T>,
  items: T[]
) {
  const tableName = getRepository(model).metadata.tableName;

  if (!jsonDump[tableName]) {
    jsonDump[tableName] = [];
  }

  jsonDump[tableName].push(...items);

  log.info(`Added ${items.length} items to ${tableName}`);
}

/**
 * Write items to JSON dump
 *
 * @param model The target database model
 * @param items The items to write for export
 */
function writeItemsJsonDump<T extends ObjectLiteral>(
  model: EntityTarget<T>,
  items: T[]
) {
  addItemsToJsonDump(model, items);
}

/**
 * Write items to the console for export
 * The output is in the format:
 * INSERT INTO "table" ("column1", "column2") VALUES ($1, $2), ($3, $4);
 * ["value1", "value2", "value3", "value4"]
 *
 * @param model The target database model
 * @param items The items to write for export
 */
function writeItemsToSQLDump<T extends ObjectLiteral>(
  model: EntityTarget<T>,
  items: T[]
) {
  const [query, params] = createQueryBuilder()
    .insert()
    .into(model)
    .values(items as QueryDeepPartialEntity<T>)
    .getQueryAndParameters();

  console.log(query + ';');
  console.log(stringify(params));
}

/**
 * Anonymise callout responses. This is a special case as the answers are stored
 * in a nested structure that is dependent on the callout form schema, so the
 * anonymiser needs to be created per callout.
 *
 * @param prepareQuery A function which can modify the query builder before fetching the items
 * @param valueMap A map of old values to new values to use if the same value is encountered multiple times
 */
async function anonymiseCalloutResponses(
  prepareQuery: (
    qb: SelectQueryBuilder<CalloutResponse>
  ) => SelectQueryBuilder<CalloutResponse>,
  valueMap: Map<string, unknown>,
  type: 'json' | 'sql' = 'json'
): Promise<void> {
  const callouts = await createQueryBuilder(Callout, 'callout').getMany();
  for (const callout of callouts) {
    const answersMap = createAnswersAnonymiser(callout.formSchema.slides);

    const responses = await prepareQuery(
      createQueryBuilder(CalloutResponse, 'item')
    )
      .andWhere('item.calloutId = :id', { id: callout.id })
      .orderBy('item.id', 'ASC')
      .getMany();

    if (responses.length === 0) {
      continue;
    }

    log.info('-- ' + callout.slug);

    const newResponses = responses.map((response) => ({
      ...anonymiseItem(
        response,
        calloutResponsesAnonymiser.objectMap,
        valueMap
      ),
      answers: anonymiseItem(response.answers, answersMap, undefined, false),
    }));

    type === 'json'
      ? writeItemsJsonDump(CalloutResponse, newResponses)
      : writeItemsToSQLDump(CalloutResponse, newResponses);
  }
}

/**
 * Anonymise a database item using an object anonymisation map
 *
 * @param item The item to anonymise
 * @param objectMap The object map describing how to anonymise the item
 * @param valueMap A map of old values to new values to use if the same value is encountered multiple times
 * @param copyProps Whether to initially copy the item or start with an empty object
 * @returns The anonymised item
 */
function anonymiseItem<T>(
  item: T,
  objectMap: ObjectMap<T>,
  valueMap: Map<string, unknown> = new Map(),
  copyProps = true
): T {
  const newItem = copyProps ? Object.assign({}, item) : ({} as T);

  for (const prop in objectMap) {
    const propertyMap = objectMap[prop] as PropertyMap<unknown>;
    const oldValue = item[prop];
    if (oldValue && propertyMap) {
      const valueKey = stringify(oldValue);

      const newValue =
        typeof propertyMap === 'function'
          ? valueMap.get(valueKey) || propertyMap(oldValue)
          : anonymiseItem(oldValue, propertyMap, valueMap);

      newItem[prop] = newValue;

      valueMap.set(valueKey, newValue);
    }
  }

  return newItem;
}

/**
 * Anonymise the items for a model returned by a query builder
 * @param anonymiser The anonymiser for the model
 * @param prepareQuery A function which can modify the query builder before fetching the items
 * @param valueMap A map of old values to new values to use if the same value is encountered multiple times
 */
export async function anonymiseModel<T extends ObjectLiteral>(
  anonymiser: ModelAnonymiser<T>,
  prepareQuery: (qb: SelectQueryBuilder<T>) => SelectQueryBuilder<T>,
  valueMap: Map<string, unknown>,
  type: 'json' | 'sql' = 'json'
): Promise<void> {
  const metadata = getRepository(anonymiser.model).metadata;
  log.info(`Anonymising ${metadata.tableName}`);

  // Callout responses are handled separately
  if (anonymiser === calloutResponsesAnonymiser) {
    return await anonymiseCalloutResponses(
      prepareQuery as any,
      valueMap,
      (type = type)
    );
  }

  // Order by primary keys for predictable pagination
  const orderBy: OrderByCondition = Object.fromEntries(
    metadata.primaryColumns.map((col) => ['item.' + col.databaseName, 'ASC'])
  );

  for (let i = 0; ; i += 1000) {
    const items = await prepareQuery(
      createQueryBuilder(anonymiser.model, 'item')
    )
      .orderBy(orderBy)
      .offset(i)
      .limit(1000)
      .getMany();

    if (items.length === 0) {
      break;
    }

    const newItems = items.map((item) =>
      anonymiseItem(item, anonymiser.objectMap, valueMap)
    );

    type === 'json'
      ? writeItemsJsonDump(anonymiser.model, newItems)
      : writeItemsToSQLDump(anonymiser.model, newItems);
  }
}

/**
 * Initialize the JSON dump by clearing existing data
 * @param anonymisers The model anonymisers to initialize tables for
 */
export function initializeJsonDump(
  anonymisers: ModelAnonymiser<ObjectLiteral>[]
) {
  jsonDump = {};

  // Initialize empty arrays for each table
  for (const anonymiser of anonymisers) {
    const tableName = getRepository(anonymiser.model).metadata.tableName;
    jsonDump[tableName] = [];
    log.info(`Initialized table: ${tableName}`);
  }
}

/**
 * Save the JSON dump to file
 */
export function saveJsonDump(
  dryRun = false,
  outputDir = '/opt/packages/test-utils/database-dump'
): void {
  const jsonString = JSON.stringify(jsonDump, null, 2);
  const filePathAnonymise = createFilePathAnonymise(outputDir);
  if (!dryRun) {
    fs.writeFileSync(filePathAnonymise, jsonString);
    log.info(outputDir);
    log.info(`JSON dump saved to: ${filePathAnonymise}`);
  } else {
    log.info(`[Dry run] JSON dump would be saved to: ${filePathAnonymise}`);
  }
}

/**
 * Write a JSON dump to the database
 */
export async function writeJsonToDB(
  dryRun = false,
  fileName = 'database-dump.json'
): Promise<void> {
  const filePathSeed = path.join(fileDirectory, fileName);

  log.info('Start seeding...');
  log.info(`Reading from file: ${filePathSeed}`);
  const dump = JSON.parse(fs.readFileSync(filePathSeed, 'utf-8'));

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

/**
 * Output SQL to clear models
 * The ouput is in the format:
 * DELETE FROM "table";
 * -- Empty params line
 *
 * The empty line is important to ensure the same format as writeItems
 * @param anonymisers
 */
export function clearModels(anonymisers: ModelAnonymiser<ObjectLiteral>[]) {
  // Reverse order to clear foreign keys correctly
  for (let i = anonymisers.length - 1; i >= 0; i--) {
    console.log(
      `DELETE FROM "${getRepository(anonymisers[i].model).metadata.tableName}";`
    );
    console.log(); // Empty params line
  }
}
