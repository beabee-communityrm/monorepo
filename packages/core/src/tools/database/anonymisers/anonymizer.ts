/**
 * Core anonymization logic for database records
 */
import { createQueryBuilder, getRepository } from '@beabee/core/database';
import { log as mainLogger } from '@beabee/core/logging';
import { Callout, CalloutResponse } from '@beabee/core/models';

import {
  EntityTarget,
  ObjectLiteral,
  OrderByCondition,
  SelectQueryBuilder,
} from 'typeorm';

import { writeItemsToJsonDump } from './json-dump.js';
import {
  ModelAnonymiser,
  ObjectMap,
  PropertyMap,
  calloutResponsesAnonymiser,
  createAnswersAnonymiser,
} from './models';
import { writeItemsToSqlDump } from './sql-dump.js';
import { stringify } from './utils/stringify.js';

const log = mainLogger.child({ app: 'anonymisers' });

/**
 * Extract only foreign key fields from an anonymizer's object map
 * FK fields are identified by ending with 'Id' or being one of known FK patterns
 *
 * @param objectMap The full object map from an anonymiser
 * @returns A new object map with only FK fields
 */
function extractForeignKeyMap<T>(objectMap: ObjectMap<T>): ObjectMap<T> {
  const fkMap: ObjectMap<T> = {};

  for (const key in objectMap) {
    // Include fields that end with 'Id' (foreign keys)
    // But exclude 'id' itself (primary key)
    if (key !== 'id' && (key.endsWith('Id') || key.endsWith('ID'))) {
      fkMap[key] = objectMap[key];
    }
  }

  return fkMap;
}

/**
 * Anonymize a database item using an object anonymization map
 *
 * @param item The item to anonymize
 * @param objectMap The object map describing how to anonymize the item
 * @param valueMap A map of old values to new values for consistency across records
 * @param copyProps Whether to initially copy the item or start with an empty object
 * @returns The anonymized item
 */
export function anonymiseItem<T>(
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
 * Anonymize callout responses
 *
 * Special case handler: Callout response answers are stored in a nested structure
 * that depends on the callout form schema, so the anonymizer must be created
 * per callout.
 *
 * @param prepareQuery Function to modify the query builder before fetching items
 * @param valueMap Map of old values to new values for consistency
 * @param type Export format (json or sql)
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
      ? writeItemsToJsonDump(CalloutResponse, newResponses)
      : writeItemsToSqlDump(CalloutResponse, newResponses);
  }
}

/**
 * Anonymize and export a model
 *
 * Processes items in batches of 1000 for memory efficiency.
 *
 * @param anonymiser The anonymizer configuration for the model
 * @param prepareQuery Function to filter/modify the query before fetching items
 * @param valueMap Map to track anonymized values for consistency across records
 * @param type Export format (json or sql)
 */
export async function anonymiseModel<T extends ObjectLiteral>(
  anonymiser: ModelAnonymiser<T>,
  prepareQuery: (qb: SelectQueryBuilder<T>) => SelectQueryBuilder<T>,
  valueMap: Map<string, unknown>,
  type: 'json' | 'sql' = 'json'
): Promise<void> {
  const metadata = getRepository(anonymiser.model).metadata;
  log.info(`Anonymising ${metadata.tableName}`);

  // Callout responses require special handling
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

  // Process in batches of 1000
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
      ? writeItemsToJsonDump(anonymiser.model, newItems)
      : writeItemsToSqlDump(anonymiser.model, newItems);
  }
}

/**
 * Export a model as-is without anonymization, but remap foreign keys
 *
 * Used when exporting models that don't contain sensitive data.
 * Processes items in batches of 1000 for memory efficiency.
 * Uses valueMap to remap foreign key references to anonymized models.
 *
 * @param model The model to export
 * @param type Export format (json or sql)
 * @param anonymiser Optional anonymiser to extract FK mappings from
 * @param valueMap Map of old values to new values for FK remapping
 */
export async function exportModelAsIs<T extends ObjectLiteral>(
  model: EntityTarget<T>,
  type: 'json' | 'sql' = 'json',
  anonymiser?: ModelAnonymiser<T>,
  valueMap?: Map<string, unknown>
): Promise<void> {
  const metadata = getRepository(model).metadata;
  log.info(
    `Exporting ${metadata.tableName} without anonymization (FK remapping: ${!!anonymiser})`
  );

  // Order by primary keys for predictable pagination
  const orderBy: OrderByCondition = Object.fromEntries(
    metadata.primaryColumns.map((col) => ['item.' + col.databaseName, 'ASC'])
  );

  // Process in batches of 1000
  for (let i = 0; ; i += 1000) {
    const items = await createQueryBuilder(model, 'item')
      .orderBy(orderBy)
      .offset(i)
      .limit(1000)
      .getMany();

    if (items.length === 0) {
      break;
    }

    // If we have an anonymiser and valueMap, use them to remap FK fields only
    // Extract only FK fields from the anonymiser to avoid anonymizing other data
    const processedItems =
      anonymiser && valueMap
        ? items.map((item) => {
            const fkOnlyMap = extractForeignKeyMap(anonymiser.objectMap);
            return anonymiseItem(item, fkOnlyMap, valueMap);
          })
        : items;

    type === 'json'
      ? writeItemsToJsonDump(model, processedItems)
      : writeItemsToSqlDump(model, processedItems);
  }
}
