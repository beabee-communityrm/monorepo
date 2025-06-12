import type { FilterHandler } from '#type';

/**
 * @fileoverview Simple filter handler implementation for basic where clause filtering
 * @module simple.filter-handlers
 */

/**
 * A basic filter handler that creates a simple WHERE clause
 *
 * This handler takes the provided field and creates a basic WHERE clause using
 * the query builder. It automatically prefixes the field name with the provided
 * field prefix.
 *
 * @example
 * // Using the simple filter handler
 * const filter = {
 *   field: 'status',
 *   operator: 'equals',
 *   value: 'active'
 * };
 * simpleFilterHandler(queryBuilder, {
 *   field: filter.field,
 *   fieldPrefix: 'user.',
 *   convertToWhereClause: // conversion function
 * });
 * // Results in: WHERE user.status = 'active'
 */
export const simpleFilterHandler: FilterHandler = (qb, args) => {
  qb.where(args.convertToWhereClause(`${args.fieldPrefix}${args.field}`));
};
