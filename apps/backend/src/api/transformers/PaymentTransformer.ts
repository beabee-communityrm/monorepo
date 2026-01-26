import { PaymentFilterName, Rule, paymentFilters } from '@beabee/beabee-common';
import { Contact, Payment } from '@beabee/core/models';
import { AuthInfo } from '@beabee/core/type';

import {
  GetPaymentDto,
  GetPaymentOptsDto,
  GetPaymentWith,
  ListPaymentsDto,
} from '@api/dto/PaymentDto';
import { BaseTransformer } from '@api/transformers/BaseTransformer';
import ContactTransformer, {
  loadContactRoles,
} from '@api/transformers/ContactTransformer';
import { TransformPlainToInstance } from 'class-transformer';
import { SelectQueryBuilder } from 'typeorm';

class PaymentTransformer extends BaseTransformer<
  Payment,
  GetPaymentDto,
  PaymentFilterName,
  GetPaymentOptsDto
> {
  protected model = Payment;
  protected filters = paymentFilters;

  @TransformPlainToInstance(GetPaymentDto)
  convert(
    payment: Payment,
    auth: AuthInfo,
    opts: GetPaymentOptsDto
  ): GetPaymentDto {
    return {
      amount: payment.amount,
      chargeDate: payment.chargeDate,
      status: payment.status,
      type: payment.type,
      ...(opts.with?.includes(GetPaymentWith.Contact) && {
        contact:
          payment.contact && ContactTransformer.convert(payment.contact, auth),
      }),
    };
  }

  protected async getNonAdminAuthRules(): Promise<Rule[]> {
    return [{ field: 'contact', operator: 'equal', value: ['me'] }];
  }

  protected modifyQueryBuilder(
    qb: SelectQueryBuilder<Payment>,
    fieldPrefix: string,
    query: ListPaymentsDto
  ): void {
    if (query.with?.includes(GetPaymentWith.Contact)) {
      qb.leftJoinAndSelect(`${fieldPrefix}contact`, 'contact');
    }
  }

  protected async modifyItems(
    payments: Payment[],
    query: ListPaymentsDto
  ): Promise<void> {
    if (query.with?.includes(GetPaymentWith.Contact)) {
      const contacts = payments
        .map((p) => p.contact)
        .filter((c): c is Contact => !!c);

      await loadContactRoles(contacts);
    }
  }
}

export default new PaymentTransformer();
