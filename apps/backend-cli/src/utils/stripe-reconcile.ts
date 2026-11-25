import { PaymentStatus } from '@beabee/beabee-common';
import type { ProviderPayment, ProviderPaymentData } from '@beabee/core/type';

import type {
  StripeLocalPayment,
  StripeMissingPayment,
  StripePaymentMismatch,
} from '../types/sync.js';

const PAYMENT_FIELDS = [
  'status',
  'amount',
  'chargeDate',
  'description',
  'subscriptionId',
  'type',
] as const;

/**
 * Finds the fields of a local payment that differ from its Stripe invoice
 *
 * @param payment The local payment
 * @param data The payment data from the Stripe invoice
 * @returns The names of the differing fields
 */
export function getMismatchedPaymentFields(
  payment: ProviderPaymentData,
  data: ProviderPaymentData
): (keyof ProviderPaymentData)[] {
  return PAYMENT_FIELDS.filter((field) => {
    switch (field) {
      case 'chargeDate':
        return payment.chargeDate.getTime() !== data.chargeDate.getTime();
      // The amount column is a 4-byte float, so compare at that precision
      case 'amount':
        return Math.fround(payment.amount) !== Math.fround(data.amount);
      default:
        return payment[field] !== data[field];
    }
  });
}

function printValue(value: ProviderPaymentData[keyof ProviderPaymentData]) {
  return value instanceof Date ? value.toISOString() : String(value);
}

/**
 * Returns a string representation of a payment mismatch
 *
 * @param mismatch The payment mismatch
 */
export function printPaymentMismatch({
  payment,
  data,
  fields,
}: StripePaymentMismatch): string {
  return fields
    .map(
      (field) =>
        `${field}=${printValue(payment[field])}→${printValue(data[field])}`
    )
    .join(', ');
}

/**
 * Compares Stripe invoices against the local payments with the same ids.
 * Invoices without a payment are only reported for customers of a known
 * contact, other invoices on the Stripe account are not ours.
 *
 * @param invoicePayments The Stripe invoices as payment data
 * @param payments The local payments by id
 * @param contactIdByCustomerId The contact of each known Stripe customer
 * @returns The mismatched and the missing payments
 */
export function classifyInvoicePayments(
  invoicePayments: ProviderPayment[],
  payments: Map<string, StripeLocalPayment>,
  contactIdByCustomerId: Map<string, string>
): { mismatches: StripePaymentMismatch[]; missing: StripeMissingPayment[] } {
  const mismatches: StripePaymentMismatch[] = [];
  const missing: StripeMissingPayment[] = [];

  for (const { id, customerId, data: invoiceData } of invoicePayments) {
    const payment = payments.get(id);
    if (payment) {
      // An invoice stays open after its payment fails, so open is no reason
      // to set a failed payment back to pending
      const data =
        payment.status === PaymentStatus.Failed &&
        invoiceData.status === PaymentStatus.Pending
          ? { ...invoiceData, status: payment.status }
          : invoiceData;

      const fields = getMismatchedPaymentFields(payment, data);
      if (fields.length > 0) {
        mismatches.push({ payment, data, fields });
      }
    } else {
      const contactId = customerId && contactIdByCustomerId.get(customerId);
      if (contactId) {
        missing.push({ id, contactId, data: invoiceData });
      }
    }
  }

  return { mismatches, missing };
}

/**
 * Counts mismatches by their status change, e.g. "draft→successful"
 *
 * @param mismatches The payment mismatches
 * @returns The number of mismatches per status change
 */
export function countStatusChanges(
  mismatches: StripePaymentMismatch[]
): Map<string, number> {
  const counts = new Map<string, number>();
  for (const { payment, data, fields } of mismatches) {
    const change = fields.includes('status')
      ? `${payment.status}→${data.status}`
      : 'status unchanged';
    counts.set(change, (counts.get(change) || 0) + 1);
  }
  return counts;
}
