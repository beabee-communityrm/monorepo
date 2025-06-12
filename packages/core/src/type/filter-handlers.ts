import { FilterType, RuleOperator, RuleValue } from '@beabee/beabee-common';

import { WhereExpressionBuilder } from 'typeorm';

/**
 * Represents a rule value that can be either a basic RuleValue or a Date
 */
export type RichRuleValue = RuleValue | Date;

/**
 * Arguments passed to a filter handler function
 *
 * @property fieldPrefix - Prefix for table aliases in the query (e.g., "item.")
 * @property type - The type of filter (e.g., "string", "number", "date")
 * @property field - The field name being filtered
 * @property operator - The filter operator (e.g., "equal", "contains")
 * @property value - Array of filter values
 * @property convertToWhereClause - Helper function to convert a field to a WHERE clause
 * @property addParamSuffix - Helper function to add unique parameter suffixes
 */
export interface FilterHandlerArgs {
  fieldPrefix: string;
  type: FilterType;
  field: string;
  operator: RuleOperator;
  value: RichRuleValue[];
  /**
   * Applies transformations, applies operators and adds parameter suffixes
   * to a field name to create a valid WHERE clause.
   * @param field - The field name to convert
   * @returns
   */
  convertToWhereClause: (field: string) => string;
  addParamSuffix: (field: string) => string;
}

/**
 * A function that handles filtering for a specific field in a query.
 *
 * @param qb - The TypeORM query builder to modify
 * @param args - Filter configuration and helper functions
 * @returns Optional object containing parameters for the query
 */
export type FilterHandler = (
  qb: WhereExpressionBuilder,
  args: FilterHandlerArgs
) => void | Record<string, unknown>;

/**
 * Maps field names to their corresponding filter handlers.
 *
 * Used to define custom filtering logic for specific fields in a model.
 * Each handler can implement complex query logic like subqueries or joins.
 *
 * @template Field - String literal type of available field names
 *
 * @example
 * ```typescript
 * const handlers: FilterHandlers<"email" | "tags"> = {
 *   email: (qb, args) => {
 *     qb.where(`email = :value`, { value: args.value[0] });
 *   },
 *   tags: tagFilter
 * };
 * ```
 */
export type FilterHandlers<Field extends string> = {
  [K in Field]?: FilterHandler;
};
