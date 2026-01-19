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
 * Filter handler for paymentType field
 * Determines payment type based on subscriptionId and contact's contributionType
 */
const paymentTypeFilterHandler: FilterHandler = (qb, args) => {
  const value = args.value[0] as PaymentType;

  if (value === 'one-time') {
    qb.where(`${args.fieldPrefix}subscriptionId IS NULL`);
  } else {
    // TODO: implement as soon as payment type is available in table
    // qb.where(args.convertToWhereClause(`${args.fieldPrefix}paymentType`));
  }
};

/**
 * Collection of all payment-related filter handlers
 *
 * Available filters:
 * - contact: Filters by payment's contact (supports "me" value)
 * - paymentType: Filters by payment type (one-time, Automatic, Manual, Gift, None)
 */
export const paymentFilterHandlers: FilterHandlers<string> = {
  contact: contactFilterHandler,
  paymentType: paymentTypeFilterHandler,
};
