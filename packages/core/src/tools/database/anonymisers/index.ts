import { createQueryBuilder, getRepository } from '@beabee/core/database';
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

// Ensure the database-dump directory exists and generate a timestamped file name
const dumpDir = path.resolve(
  process.cwd(),
  '../../packages/test-utils/database-dump/created'
);
if (!fs.existsSync(dumpDir)) {
  fs.mkdirSync(dumpDir, { recursive: true });
}
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const filePath = path.join(dumpDir, `database-dump-${timestamp}.json`);

// Global JSON dump object to collect all data
let jsonDump: DatabaseDump = {};

// Maps don't stringify well
function stringify(value: any): string {
  return JSON.stringify(value, (key: string, value: any): any => {
    return value instanceof Map ? [...value] : value;
  });
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
  valueMap: Map<string, unknown>
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

    writeItemsJsonDump(CalloutResponse, newResponses);
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
 * Anonymise the items for a model returned by a query builder
 * @param anonymiser The anonymiser for the model
 * @param prepareQuery A function which can modify the query builder before fetching the items
 * @param valueMap A map of old values to new values to use if the same value is encountered multiple times
 */
export async function anonymiseModel<T extends ObjectLiteral>(
  anonymiser: ModelAnonymiser<T>,
  prepareQuery: (qb: SelectQueryBuilder<T>) => SelectQueryBuilder<T>,
  valueMap: Map<string, unknown>
): Promise<void> {
  const metadata = getRepository(anonymiser.model).metadata;
  log.info(`Anonymising ${metadata.tableName}`);
  log.info(filePath);

  // Callout responses are handled separately
  if (anonymiser === calloutResponsesAnonymiser) {
    return await anonymiseCalloutResponses(prepareQuery as any, valueMap);
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

    addItemsToJsonDump(anonymiser.model, newItems);
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
export function saveJsonDump(): void {
  const jsonString = JSON.stringify(jsonDump, null, 2);
  fs.writeFileSync(filePath, jsonString);
  log.info(`JSON dump saved to: ${filePath}`);
}

/**
 * Clear the JSON dump file if it exists
 */
export function clearFile(): void {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}
