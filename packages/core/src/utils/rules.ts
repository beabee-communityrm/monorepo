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

import {
  Brackets,
  EntityTarget,
  ObjectLiteral,
  SelectQueryBuilder,
  UpdateQueryBuilder,
  UpdateResult,
  WhereExpressionBuilder,
} from 'typeorm';

import { createQueryBuilder } from '#database';
import { BadRequestError } from '#errors/BadRequestError';
import { simpleFilterHandler } from '#filter-handlers/simple.filter-handlers';
import { Contact } from '#models';
import type {
  FilterHandler,
  FilterHandlers,
  RichRuleValue,
  SelectResult,
} from '#type/index';
import { QueryDeepPartialEntity } from '#type/typeorm-utils';

// Standard operator definitions
//
// These map each rule operator to an SQL condition template. `:valueA` and
// `:valueB` are placeholders for the rule's values; they get a unique
// per-rule suffix (e.g. :valueA_0) when the clause is built.

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

/**
 * Identity function that type-checks that every operator the type supports
 * (as defined by operatorsByType) has an SQL template, so validation and SQL
 * generation can't drift apart.
 */
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
 * Some filter types need normalizing before an operator template can be
 * applied: the column may need wrapping in SQL and the values may need
 * converting from their wire format.
 *
 * @param rule The rule to prepare
 * @param contact The contact the rules are evaluated for, resolves "me"
 * @returns transformField, which wraps the column expression the operator
 *   will be applied to, and the prepared comparison values
 */
function prepareRule(
  rule: ValidatedRule<string>,
  contact: Contact | undefined
): { transformField: (field: string) => string; values: RichRuleValue[] } {
  switch (rule.type) {
    case 'blob':
    case 'text':
      // Nullable columns coalesce to '' so NULL behaves like an empty string
      return {
        transformField: rule.nullable ? coalesceField : simpleField,
        values: rule.value,
      };

    case 'date': {
      // Compare only as precisely as the values require: day by default, finer
      // if any value carries a time (e.g. "2022-12-01T10:30" compares by minute)
      const values = rule.value.map((v) => parseDate(v));
      const minUnit = getMinDateUnit(['d', ...values.map(([_, unit]) => unit)]);
      return {
        transformField: (field) =>
          `DATE_TRUNC('${dateUnitSql[minUnit]}', ${field})`,
        values: values.map(([date]) => date),
      };
    }

    case 'contact':
      return {
        transformField: simpleField,
        values: rule.value.map((v) => {
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
      };

    default:
      return { transformField: simpleField, values: rule.value };
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
 * Converts a validated rule group into a WHERE clause and its parameters,
 * ready to be passed to a TypeORM query builder.
 *
 * Each rule is converted by its filter handler (see getFilterHandler); the
 * default handler compares `<fieldPrefix><field>` against the rule's values
 * using the operator SQL templates above. Groups become bracketed AND/OR
 * chains and can be nested.
 *
 * The returned params contain:
 * - `valueA_<n>` / `valueB_<n>`: the rule values, suffixed per rule because
 *   the query builder doesn't allow reusing a parameter name across the
 *   query and its subqueries
 * - any extra suffixed params returned by filter handlers
 * - `now`: the current date, available unsuffixed to any rule that needs it
 *
 * @param ruleGroup The validated rule group
 * @param contact The contact the rules are evaluated for, resolves "me"
 * @param filterHandlers Field-specific handlers, falls back to a simple comparison
 * @param fieldPrefix The alias prefix of the outer query, e.g. "item."
 * @returns A Brackets clause and the parameters it references
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
  // Shared across nested groups so suffixes are unique query-wide
  let ruleNo = 0;

  function buildRuleWhere(rule: ValidatedRule<string>) {
    return (qb: WhereExpressionBuilder): void => {
      const applyOperator = operatorsWhereByType[rule.type][rule.operator];
      if (!applyOperator) {
        // Shouldn't be able to happen as rule has been validated
        throw new Error('Invalid ValidatedRule');
      }

      const paramSuffix = '_' + ruleNo;

      const { transformField, values } = prepareRule(rule, contact);

      // Apply a suffix to the parameters to ensure they are unique query-wide.
      // They are always set, even if the operator uses fewer values; unused
      // params are simply never referenced
      params['valueA' + paramSuffix] = values[0];
      params['valueB' + paramSuffix] = values[1];

      // Suffixes any ":name" params in the given SQL, skipping casts like
      // ::boolean
      const addParamSuffix = (field: string) =>
        field.replace(/[^:]:[a-zA-Z]+/g, '$&' + paramSuffix);

      // This is where the rule actually becomes SQL: the field's filter
      // handler writes the WHERE condition onto the query builder. The default
      // handler applies convertToWhereClause to the field; custom handlers can
      // write anything, e.g. a subquery on a related table, and can return
      // extra params
      const extraParams = getFilterHandler(filterHandlers, rule.field)(qb, {
        fieldPrefix,
        field: rule.field,
        operator: rule.operator,
        type: rule.type,
        value: values,
        // The full conversion for a column expression: field transform +
        // operator template + param suffix
        convertToWhereClause: (field) =>
          addParamSuffix(applyOperator(transformField(field))),
        addParamSuffix,
      });

      // Suffix any extra params from the handler, just like the rule values
      if (extraParams) {
        for (const [key, value] of Object.entries(extraParams)) {
          params[key + paramSuffix] = value;
        }
      }

      ruleNo++;
    };
  }

  function buildGroupWhere(ruleGroup: ValidatedRuleGroup<string>) {
    return (qb: WhereExpressionBuilder): void => {
      if (ruleGroup.rules.length > 0) {
        // Seed with the identity element of the condition (TRUE for AND,
        // FALSE for OR) so every rule can then be chained uniformly with
        // andWhere/orWhere
        qb.where(ruleGroup.condition === 'AND' ? 'TRUE' : 'FALSE');
        const conditionFn =
          ruleGroup.condition === 'AND' ? 'andWhere' : 'orWhere';
        for (const rule of ruleGroup.rules) {
          qb[conditionFn](
            new Brackets(
              isRuleGroup(rule) ? buildGroupWhere(rule) : buildRuleWhere(rule)
            )
          );
        }
      }
    };
  }

  const where = new Brackets(buildGroupWhere(ruleGroup));
  return [where, params];
}

/** @deprecated remove once SegmentService has been cleaned up */
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

/** Rules come from user input, so invalid rules are client errors */
function rethrowAsBadRequest(err: unknown): never {
  if (err instanceof InvalidRule) {
    // Attach the offending rule so the API can return it to the client
    throw Object.assign(new BadRequestError(err.message), { rule: err.rule });
  }
  throw err;
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
    rethrowAsBadRequest(err);
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
  filterHandlers?: FilterHandlers<Field>
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

    const raw = await qb.getRawMany();

    return {
      raw: raw.map((r) => ({ id: r.entity_id })),
      affected: raw.length,
    };
  } catch (err) {
    rethrowAsBadRequest(err);
  }
}
