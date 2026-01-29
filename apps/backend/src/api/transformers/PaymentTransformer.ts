import { PaymentFilterName, Rule, paymentFilters } from '@beabee/beabee-common';
import { Contact, Payment } from '@beabee/core/models';
import { paymentService } from '@beabee/core/services';
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
import { NotFoundError } from 'routing-controllers';
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
      id: payment.id,
      amount: payment.amount,
      chargeDate: payment.chargeDate,
      status: payment.status,
      ...(opts.with?.includes(GetPaymentWith.Contact) && {
        contact:
          payment.contact && ContactTransformer.convert(payment.contact, auth),
      }),
    };
  }

  /**
   * Non-admin users can only see their own payments
   *
   * @returns The rules for non-admin users
   */
  protected async getNonAdminAuthRules(): Promise<Rule[]> {
    return [{ field: 'contact', operator: 'equal', value: ['me'] }];
  }

  /**
   * Joins the contacts table if the query requested to also load the contacts
   * associated with the payments
   *
   * @param qb The query builder
   * @param fieldPrefix The field prefix
   * @param query The query
   */
  protected modifyQueryBuilder(
    qb: SelectQueryBuilder<Payment>,
    fieldPrefix: string,
    query: ListPaymentsDto
  ): void {
    if (query.with?.includes(GetPaymentWith.Contact)) {
      qb.leftJoinAndSelect(`${fieldPrefix}contact`, 'contact');
    }
  }

  /**
   * Loads the contact roles into the list of contacts after the main query to
   * avoid duplicate joins
   *
   * @param payments The list of payments
   * @param query The query
   */
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

  /**
   * Fetch the invoice URL for a payment if the payment is accessible by the
   * current authorisation context
   *
   * @param auth The current authorisation
   * @param paymentId The payment ID
   * @returns The invoice URL
   */
  async fetchOneInvoiceUrl(auth: AuthInfo, paymentId: string): Promise<string> {
    const payment = await this.fetchOneById(auth, paymentId);
    // Checks if the payment exists and the current auth can access it
    if (payment) {
      const invoiceUrl = await paymentService.fetchInvoiceUrl(payment.id);
      if (invoiceUrl) {
        return invoiceUrl;
      }
    }

    throw new NotFoundError();
  }
}

export default new PaymentTransformer();
