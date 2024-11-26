import { FilterHandlers } from "@beabee/core/type";
import { CalloutFilterName } from "@beabee/beabee-common";
import { statusFilterHandler } from "./status.filter-handlers";

/**
 * @fileoverview Filter handlers for callouts, managing status and title filtering
 * @module callout.filter-handlers
 */

/**
 * Collection of filter handlers for callouts
 *
 * @example
 * // Using the callout filter handlers
 * const filter = {
 *   field: 'title',
 *   operator: 'contains',
 *   value: 'Survey'
 * };
 *
 * Available handlers:
 *
 * status: Filters callouts by their current status
 *         Uses the shared status filter handler
 *
 * title:  Filters callouts by their variant title
 *         Performs text search on the callout variant title field (cvd.title)
 */
export const calloutFilterHandlers: FilterHandlers<CalloutFilterName> = {
  status: statusFilterHandler,
  title: (qb, args) => {
    // Filter by variant title
    qb.where(args.convertToWhereClause("cvd.title"));
  }
};
