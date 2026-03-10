import { Payment } from '@beabee/core/models';
import { AuthInfo } from '@beabee/core/type';

import { stringify } from 'csv-stringify/sync';
import { SelectQueryBuilder } from 'typeorm';

import { ExportPaymentDto, GetExportQuery } from '#api/dto';

import { BasePaymentTransformer } from './BasePaymentTransformer';

class PaymentExporter extends BasePaymentTransformer<
  ExportPaymentDto,
  GetExportQuery
> {
  convert(payment: Payment): ExportPaymentDto {
    return {
      Id: payment.id,
      Amount: payment.amount,
      ChargeDate: payment.chargeDate.toISOString(),
      Status: payment.status,
      Type: payment.type,
      SubscriptionId: payment.subscriptionId || '',
      ContactId: payment.contactId || '',
      ContactEmail: payment.contact?.email || '',
      ContactFirstName: payment.contact?.firstname || '',
      ContactLastName: payment.contact?.lastname || '',
    };
  }

  protected modifyQueryBuilder(
    qb: SelectQueryBuilder<Payment>,
    fieldPrefix: string
  ): void {
    qb.leftJoinAndSelect(`${fieldPrefix}contact`, 'contact');
    // Load contact roles even though they aren't used in the export because
    // they are eagerly loaded across the codebase
    qb.leftJoinAndSelect(`contact.roles`, 'roles');
  }

  async export(
    auth: AuthInfo,
    query?: GetExportQuery
  ): Promise<[string, string]> {
    const result = await this.fetch(auth, { limit: -1, ...query });

    const exportName = `payments-${new Date().toISOString()}.csv`;
    return [exportName, stringify(result.items, { header: true })];
  }
}

export default new PaymentExporter();
