import { createQueryBuilder, getRepository } from '@beabee/core/database';
import { log as mainLogger } from '@beabee/core/logging';
import { Callout, CalloutResponse } from '@beabee/core/models';

import {
  EntityTarget,
  ObjectLiteral,
  OrderByCondition,
  SelectQueryBuilder,
} from 'typeorm';

import { QueryDeepPartialEntity } from '#type/typeorm-utils';

import {
  AnonymisationMap,
  AnonymisationPropertyMap,
  ModelAnonymiser,
  createAnswersAnonymiser,
} from './models.js';

const log = mainLogger.child({ app: 'anonymisers' });

// Maps don't stringify well
function stringify(value: any): string {
  return JSON.stringify(value, (key: string, value: any): any => {
    return value instanceof Map ? [...value] : value;
  });
}

/**
 * Get the new value for a property using the property map, and return the cache key and new value
 *
 * @param propertyMap The map describing how to anonymise the property
 * @param value The current value of the property
 * @param anonymisedValueCache A map of old values to new values to use if the same value is encountered multiple times
 * @returns An object containing the cache key and the new value
 */
function getAnonymisedValue<T>(
  propertyMap: AnonymisationPropertyMap<unknown>,
  value: T,
  anonymisedValueCache: Map<string, unknown>
): { cacheKey: string; newValue: T } {
  if (Array.isArray(propertyMap) && typeof propertyMap[0] === 'symbol') {
    // PropertyMap is type [symbol, (prop: T) => T]
    const [namespace, propertyFn] = propertyMap;
    // Use the symbol to namespace the value key so that the new value is only
    // remapped for other properties in this namespace
    const cacheKey = `${namespace.toString()}-${stringify(value)}`;
    return {
      cacheKey: cacheKey,
      newValue: anonymisedValueCache.get(cacheKey) || propertyFn(value),
    };
  } else if (typeof propertyMap === 'function') {
    // PropertyMap is type (prop: T) => T
    const cacheKey = stringify(value);
    return {
      cacheKey: cacheKey,
      newValue: anonymisedValueCache.get(cacheKey) || propertyMap(value),
    };
  } else {
    // PropertyMap is type ObjectMap — anonymise the object recursively
    const cacheKey = stringify(value);
    return {
      cacheKey: cacheKey,
      newValue: anonymiseItem<T>(value, propertyMap, anonymisedValueCache),
    };
  }
}

/**
 * Anonymise a database item using an object anonymisation map
 *
 * @param item The item to anonymise
 * @param anonymisationMap The map describing how to anonymise the item
 * @param anonymisedValueCache A map of old values to new values to use if the same value is encountered multiple times
 * @param copyItem Whether to create item properties or start from an empty object
 * @returns The anonymised item
 */
function anonymiseItem<T>(
  item: T,
  anonymisationMap: AnonymisationMap<T>,
  anonymisedValueCache: Map<string, unknown> = new Map(),
  copyItem = true
): T {
  const newItem = copyItem ? { ...item } : ({} as T);

  for (const prop in anonymisationMap) {
    const propertyMap = anonymisationMap[prop];

    const value = item[prop];
    if (value && propertyMap) {
      const { cacheKey, newValue } = getAnonymisedValue(
        propertyMap,
        value,
        anonymisedValueCache
      );

      newItem[prop] = newValue;

      // Remember the new value to apply the same mapping if that value is seen again
      anonymisedValueCache.set(cacheKey, newValue);
    }
  }

  return newItem;
}

/**
 * Anonymise the items for a model returned by a query builder using the default strategy of anonymising all items together
 *
 * @param anonymiser The anonymiser for the model
 * @param prepareQuery A function which can modify the query builder before fetching the items
 * @param anonymisedValueCache A map of old values to new values to use if the same value is encountered multiple times
 */
async function anonymiseStandardModel<T extends ObjectLiteral>(
  anonymiser: ModelAnonymiser<T>,
  prepareQuery: (qb: SelectQueryBuilder<T>) => SelectQueryBuilder<T>,
  anonymisedValueCache: Map<string, unknown>
): Promise<void> {
  const metadata = getRepository(anonymiser.model).metadata;

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
      anonymiseItem(item, anonymiser.map, anonymisedValueCache)
    );

    writeItems(anonymiser.model, newItems);
  }
}

/**
 * Anonymise callout responses. This is a special case as the answers are stored
 * in a nested structure that is dependent on the callout form schema, so the
 * anonymiser needs to be created per callout.
 *
 * @param prepareQuery A function which can modify the query builder before fetching the items
 * @param anonymisedValueCache A map of old values to new values to use if the same value is encountered multiple times
 */
async function anonymiseCalloutResponsesModel(
  prepareQuery: (
    qb: SelectQueryBuilder<CalloutResponse>
  ) => SelectQueryBuilder<CalloutResponse>,
  anonymisedValueCache: Map<string, unknown>,
  responseObjectMap: AnonymisationMap<CalloutResponse>
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
      ...anonymiseItem(response, responseObjectMap, anonymisedValueCache),
      // Deliberately don't pass value cache so each answer is anonymised independently
      answers: anonymiseItem(response.answers, answersMap, undefined, false),
    }));

    writeItems(CalloutResponse, newResponses);
  }
}

/**
 * Anonymise the items for a model returned by a query builder
 * @param anonymiser The anonymiser for the model
 * @param prepareQuery A function which can modify the query builder before fetching the items
 * @param anonymisedValueCache A map of old values to new values to use if the same value is encountered multiple times
 */
export async function anonymiseModel<T extends ObjectLiteral>(
  anonymiser: ModelAnonymiser<T>,
  prepareQuery: (qb: SelectQueryBuilder<T>) => SelectQueryBuilder<T>,
  anonymisedValueCache: Map<string, unknown>
): Promise<void> {
  const metadata = getRepository(anonymiser.model).metadata;
  if (Object.keys(anonymiser.map).length === 0) {
    log.info(`Exporting ${metadata.tableName} without anonymising`);
  } else {
    log.info(`Anonymising ${metadata.tableName}`);
  }

  // Callout responses are handled separately
  if (anonymiser.strategy === 'calloutResponsePerCallout') {
    const calloutPrepareQuery = prepareQuery as unknown as (
      qb: SelectQueryBuilder<CalloutResponse>
    ) => SelectQueryBuilder<CalloutResponse>;
    await anonymiseCalloutResponsesModel(
      calloutPrepareQuery,
      anonymisedValueCache,
      anonymiser.map as AnonymisationMap<CalloutResponse>
    );
  } else {
    await anonymiseStandardModel(
      anonymiser,
      prepareQuery,
      anonymisedValueCache
    );
  }
}

/**
 * Output SQL to clear models
 * The output is in the format:
 * DELETE FROM "table";
 * -- Empty params line
 *
 * The empty line is important to ensure the same format as writeItems
 * @param anonymisers The anonymisers for the models to clear
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

/**
 * Write items to the console for export
 * The output is in the format:
 * INSERT INTO "table" ("column1", "column2") VALUES ($1, $2), ($3, $4);
 * ["value1", "value2", "value3", "value4"]
 *
 * @param model The target database model
 * @param items The items to write for export
 */
function writeItems<T extends ObjectLiteral>(
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
