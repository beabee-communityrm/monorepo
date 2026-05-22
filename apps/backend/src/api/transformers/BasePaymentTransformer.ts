import { PaymentFilterName, Rule, paymentFilters } from '@beabee/beabee-common';
import { paymentFilterHandlers } from '@beabee/core/filter-handlers';
import { Payment } from '@beabee/core/models';

import { BaseTransformer } from './BaseTransformer.js';

export abstract class BasePaymentTransformer<
  GetDto,
  GetOptsDto,
> extends BaseTransformer<Payment, GetDto, PaymentFilterName, GetOptsDto> {
  protected model = Payment;
  protected filters = paymentFilters;
  protected filterHandlers = paymentFilterHandlers;

  /**
   * Non-admin users can only see their own payments
   *
   * @returns The rules for non-admin users
   */
  protected async getNonAdminAuthRules(): Promise<Rule[]> {
    return [{ field: 'contact', operator: 'equal', value: ['me'] }];
  }
}
