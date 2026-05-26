import { PaymentType } from '@beabee/beabee-common';
import { FilterHandler, FilterHandlers } from '@beabee/core/type';

/**
 * @fileoverview Payment filter handlers for managing payment-related queries and filters
 * @module payment.filter-handlers
 */

/**
 * Filter handler for contact field
 * Handles the "me" special value by mapping it to the authenticated contact's ID
 */
const contactFilterHandler: FilterHandler = (qb, args) => {
  qb.where(args.convertToWhereClause(`${args.fieldPrefix}contactId`));
};

/**
 * Collection of all payment-related filter handlers
 *
 * Available filters:
 * - contact: Filters by payment's contact (supports "me" value)
 */
export const paymentFilterHandlers: FilterHandlers<string> = {
  contact: contactFilterHandler,
};
