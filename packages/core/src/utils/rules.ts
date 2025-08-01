import {
  FilterType,
  Filters,
  InvalidRule,
  Rule,
  RuleGroup,
  RuleOperator,
  ValidatedRule,
  ValidatedRuleGroup,
  getMinDateUnit,
  isRuleGroup,
  operatorsByType,
  parseDate,
  validateRuleGroup,
} from '@beabee/beabee-common';

import { BadRequestError } from 'routing-controllers';
import {
  Brackets,
  EntityTarget,
  ObjectLiteral,
  SelectQueryBuilder,
  UpdateQueryBuilder,
  UpdateResult,
  WhereExpressionBuilder,
} from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

import { createQueryBuilder } from '#database';
import { simpleFilterHandler } from '#filter-handlers/simple.filter-handlers';
import { Contact } from '#models';
import type {
  FilterHandler,
  FilterHandlers,
  RichRuleValue,
  SelectResult,
} from '#type/index';

// Operator definitions

const equalityOperatorsWhere = {
  equal: (field: string) => `${field} = :valueA`,
  not_equal: (field: string) => `${field} <> :valueA`,
};

const nullableOperatorsWhere = {
  is_empty: (field: string) => `${field} IS NULL`,
  is_not_empty: (field: string) => `${field} IS NOT NULL`,
};

const blobOperatorsWhere = {
  contains: (field: string) => `${field} ILIKE '%' || :valueA || '%'`,
  not_contains: (field: string) => `${field} NOT ILIKE '%' || :valueA || '%'`,
  is_empty: (field: string) => `${field} = ''`,
  is_not_empty: (field: string) => `${field} <> ''`,
};

const numericOperatorsWhere = {
  ...equalityOperatorsWhere,
  ...nullableOperatorsWhere,
  less: (field: string) => `${field} < :valueA`,
  less_or_equal: (field: string) => `${field} <= :valueA`,
  greater: (field: string) => `${field} > :valueA`,
  greater_or_equal: (field: string) => `${field} >= :valueA`,
  between: (field: string) => `${field} BETWEEN :valueA AND :valueB`,
  not_between: (field: string) => `${field} NOT BETWEEN :valueA AND :valueB`,
};

function withOperators<T extends FilterType>(
  type: T,
  operators: Record<
    keyof (typeof operatorsByType)[T] | 'is_empty' | 'is_not_empty',
    (field: string) => string
  >
) {
  return operators;
}

const operatorsWhereByType: Record<
  FilterType,
  Partial<Record<RuleOperator, (field: string) => string>>
> = {
  text: withOperators('text', {
    ...equalityOperatorsWhere,
    ...blobOperatorsWhere,
    begins_with: (field) => `${field} ILIKE :valueA || '%'`,
    not_begins_with: (field) => `${field} NOT ILIKE :valueA || '%'`,
    ends_with: (field) => `${field} ILIKE '%' || :valueA`,
    not_ends_with: (field) => `${field} NOT ILIKE '%' || :valueA`,
  }),
  blob: withOperators('blob', blobOperatorsWhere),
  date: withOperators('date', numericOperatorsWhere),
  number: withOperators('number', numericOperatorsWhere),
  boolean: withOperators('boolean', {
    ...nullableOperatorsWhere,
    equal: equalityOperatorsWhere.equal,
  }),
  array: withOperators('array', {
    contains: (field) => `${field} ? :valueA`,
    not_contains: (field) => `${field} ? :valueA = FALSE`,
    is_empty: (field) => `${field} ->> 0 IS NULL`,
    is_not_empty: (field) => `${field} ->> 0 IS NOT NULL`,
  }),
  enum: withOperators('enum', {
    ...equalityOperatorsWhere,
    ...nullableOperatorsWhere,
  }),
  contact: withOperators('contact', {
    ...equalityOperatorsWhere,
    ...nullableOperatorsWhere,
  }),
};

// Rule parsing

const dateUnitSql = {
  y: 'year',
  M: 'month',
  d: 'day',
  h: 'hour',
  m: 'minute',
  s: 'second',
} as const;

function simpleField(field: string): string {
  return field;
}

function coalesceField(field: string): string {
  return `COALESCE(${field}, '')`;
}

/**
 * Takes a rule and returns a field mapping function and the values to compare
 *
 * - For text and blob fields, we add COALESE to the field if it's nullable so
 *   NULL values are treated as empty strings
 * - For date fields, we DATE_TRUNC the field to the day or more specific unit if
 *   provided and turn the value into a Date object
 * - For contact fields, it maps "me" to the contact id
 * - Otherwise, it returns the field and value as is
 * @param rule The rule to prepare
 * @param contact
 * @returns a field mapping function and the values to compare
 */
function prepareRule(
  rule: ValidatedRule<string>,
  contact: Contact | undefined
): [(field: string) => string, RichRuleValue[]] {
  switch (rule.type) {
    case 'blob':
    case 'text':
      // Make NULL an empty string for comparison
      return [rule.nullable ? coalesceField : simpleField, rule.value];

    case 'date': {
      // Compare dates by at least day, but more specific if H/m/s are provided
      const values = rule.value.map((v) => parseDate(v));
      const minUnit = getMinDateUnit(['d', ...values.map(([_, unit]) => unit)]);
      return [
        (field) => `DATE_TRUNC('${dateUnitSql[minUnit]}', ${field})`,
        values.map(([date]) => date),
      ];
    }

    case 'contact':
      return [
        simpleField,
        rule.value.map((v) => {
          // Map "me" to contact id
          if (v === 'me') {
            if (!contact) {
              throw new BadRequestError(
                'No contact provided to map contact field type'
              );
            }
            return contact.id;
          } else {
            return v;
          }
        }),
      ];

    default:
      return [simpleField, rule.value];
  }
}

/**
 * Find the filter handler for a field. If there isn't a specific handler then
 * it will try to find a catch all handler. Catch all handlers end in a "."
 *
 * i.e. "callouts." will match any fields starting with "callouts.", e.g.
 * "callouts.id", "callouts.foo"
 *
 * @param filterHandlers A set of filter handlers
 * @param field The field name
 * @returns The most appropriate filter handler
 */
export function getFilterHandler(
  filterHandlers: FilterHandlers<string> | undefined,
  field: string
): FilterHandler {
  let filterHandler = filterHandlers?.[field];
  // See if there is a catch all field handler for subfields
  if (!filterHandler && field.includes('.')) {
    const catchallField = field.split('.', 1)[0] + '.';
    filterHandler = filterHandlers?.[catchallField];
  }

  return filterHandler || simpleFilterHandler;
}

/**
 * The query builder doesn't support having the same parameter names for
 * different parts of the query and subqueries, so we have to ensure each query
 * parameter has a unique name. We do this by appending a suffix "_<ruleNo>" to
 * the end of each parameter for each rule.
 *
 * @param ruleGroup The rule group
 * @param contact
 * @param filterHandlers
 * @param fieldPrefix
 * @returns
 */
export function convertRulesToWhereClause(
  ruleGroup: ValidatedRuleGroup<string>,
  contact: Contact | undefined,
  filterHandlers: FilterHandlers<string> | undefined,
  fieldPrefix: string
): [Brackets, Record<string, unknown>] {
  const params: Record<string, unknown> = {
    // Some queries need a current date parameter
    now: new Date(),
  };
  let ruleNo = 0;

  function parseRule(rule: ValidatedRule<string>) {
    return (qb: WhereExpressionBuilder): void => {
      const applyOperator = operatorsWhereByType[rule.type][rule.operator];
      if (!applyOperator) {
        // Shouln't be able to happen as rule has been validated
        throw new Error('Invalid ValidatedRule');
      }

      const paramSuffix = '_' + ruleNo;
      const [transformField, value] = prepareRule(rule, contact);

      // Add values as params
      params['valueA' + paramSuffix] = value[0];
      params['valueB' + paramSuffix] = value[1];

      // Add suffixes to parameters but avoid replacing casts e.g. ::boolean
      const addParamSuffix = (field: string) =>
        field.replace(/[^:]:[a-zA-Z]+/g, '$&' + paramSuffix);

      const newParams = getFilterHandler(filterHandlers, rule.field)(qb, {
        fieldPrefix,
        field: rule.field,
        operator: rule.operator,
        type: rule.type,
        value,
        convertToWhereClause: (field) =>
          addParamSuffix(applyOperator(transformField(field))),
        addParamSuffix,
      });

      if (newParams) {
        for (const [key, value] of Object.entries(newParams)) {
          params[key + paramSuffix] = value;
        }
      }

      ruleNo++;
    };
  }

  function parseRuleGroup(ruleGroup: ValidatedRuleGroup<string>) {
    return (qb: WhereExpressionBuilder): void => {
      if (ruleGroup.rules.length > 0) {
        qb.where(ruleGroup.condition === 'AND' ? 'TRUE' : 'FALSE');
        const conditionFn =
          ruleGroup.condition === 'AND' ? 'andWhere' : 'orWhere';
        for (const rule of ruleGroup.rules) {
          qb[conditionFn](
            new Brackets(
              isRuleGroup(rule) ? parseRuleGroup(rule) : parseRule(rule)
            )
          );
        }
      }
    };
  }

  const where = new Brackets(parseRuleGroup(ruleGroup));
  return [where, params];
}

/** @depreciated remove once SegmentService has been cleaned up */
export function buildSelectQuery<
  Entity extends ObjectLiteral,
  Field extends string,
>(
  entity: EntityTarget<Entity>,
  ruleGroup: ValidatedRuleGroup<Field> | undefined,
  contact?: Contact,
  filterHandlers?: FilterHandlers<Field>
): SelectQueryBuilder<Entity> {
  const qb = createQueryBuilder(entity, 'item');
  if (ruleGroup) {
    qb.where(
      ...convertRulesToWhereClause(ruleGroup, contact, filterHandlers, 'item.')
    );
  }
  return qb;
}

export async function batchUpdate<
  Entity extends ObjectLiteral,
  Field extends string,
>(
  entity: EntityTarget<Entity>,
  filters: Filters<Field>,
  ruleGroup: RuleGroup,
  updates: QueryDeepPartialEntity<Entity>,
  contact?: Contact,
  filterHandlers?: FilterHandlers<Field>,
  queryCallback?: (qb: UpdateQueryBuilder<Entity>, fieldPrefix: string) => void
): Promise<UpdateResult> {
  try {
    const validatedRuleGroup = validateRuleGroup(filters, ruleGroup);

    const qb = createQueryBuilder()
      .update(entity, updates)
      .where(
        ...convertRulesToWhereClause(
          validatedRuleGroup,
          contact,
          filterHandlers,
          ''
        )
      );

    queryCallback?.(qb, '');

    return await qb.execute();
  } catch (err) {
    if (err instanceof InvalidRule) {
      const err2: any = new BadRequestError(err.message);
      err2.rule = err.rule;
      throw err2;
    } else {
      throw err;
    }
  }
}

/**
 * Selects entities based on filter rules without performing updates.
 * Returns a SelectResult object similar to UpdateResult for consistency.
 *
 * @param entity - The entity to select from
 * @param filters - Available filters for the entity
 * @param ruleGroup - Rules to filter entities
 * @param contact - Optional contact for permission checks
 * @param filterHandlers - Optional custom filter handlers
 * @param queryCallback - Optional callback to modify the query
 * @returns SelectResult containing raw results and affected count
 *
 * @example
 * const result = await batchSelect(
 *   Contact,
 *   filters,
 *   ruleGroup,
 *   auth?.contact,
 *   filterHandlers
 * );
 * const ids = result.raw.map(r => r.id);
 */
export async function batchSelect<
  Entity extends ObjectLiteral,
  Field extends string,
>(
  entity: EntityTarget<Entity>,
  filters: Filters<Field>,
  ruleGroup: RuleGroup,
  contact?: Contact,
  filterHandlers?: FilterHandlers<Field>,
  queryCallback?: (qb: SelectQueryBuilder<Entity>, fieldPrefix: string) => void
): Promise<SelectResult> {
  try {
    const validatedRuleGroup = validateRuleGroup(filters, ruleGroup);

    const qb = createQueryBuilder(entity, 'entity')
      .select(['entity.id'])
      .where(
        ...convertRulesToWhereClause(
          validatedRuleGroup,
          contact,
          filterHandlers,
          'entity.'
        )
      );

    queryCallback?.(qb, 'entity.');

    const raw = await qb.getRawMany();

    return {
      raw: raw.map((r) => ({ id: r.entity_id })),
      affected: raw.length,
    };
  } catch (err) {
    if (err instanceof InvalidRule) {
      const err2: any = new BadRequestError(err.message);
      err2.rule = err.rule;
      throw err2;
    } else {
      throw err;
    }
  }
}
