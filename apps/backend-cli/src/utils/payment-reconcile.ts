import { PaymentStatus } from '@beabee/beabee-common';
import type { PaymentData, PaymentRecord } from '@beabee/core/type';

import type {
  LocalPayment,
  MissingPayment,
  PaymentMismatch,
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
 * Finds the fields of a local payment that differ from the payment provider's
 *
 * @param payment The local payment
 * @param data The payment data from the payment provider
 * @returns The names of the differing fields
 */
export function getMismatchedPaymentFields(
  payment: PaymentData,
  data: PaymentData
): (keyof PaymentData)[] {
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

function printValue(value: PaymentData[keyof PaymentData]) {
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
}: PaymentMismatch): string {
  return fields
    .map(
      (field) =>
        `${field}=${printValue(payment[field])}→${printValue(data[field])}`
    )
    .join(', ');
}

/**
 * Compares the payment provider's payments against the local payments with
 * the same ids. Payments without a local payment are only reported for
 * customers of a known contact, as the provider's account can be shared with
 * other integrations.
 *
 * @param records The payment provider's payments
 * @param payments The local payments by id
 * @param contactIdByCustomerId The contact of each known customer
 * @returns The mismatched and the missing payments
 */
export function classifyPaymentRecords(
  records: PaymentRecord[],
  payments: Map<string, LocalPayment>,
  contactIdByCustomerId: Map<string, string>
): { mismatches: PaymentMismatch[]; missing: MissingPayment[] } {
  const mismatches: PaymentMismatch[] = [];
  const missing: MissingPayment[] = [];

  for (const { id, customerId, data: recordData } of records) {
    const payment = payments.get(id);
    if (payment) {
      // A provider can keep a payment pending while it retries a failed
      // attempt, so pending is no reason to set a failed payment back
      const data =
        payment.status === PaymentStatus.Failed &&
        recordData.status === PaymentStatus.Pending
          ? { ...recordData, status: payment.status }
          : recordData;

      const fields = getMismatchedPaymentFields(payment, data);
      if (fields.length > 0) {
        mismatches.push({ payment, data, fields });
      }
    } else {
      const contactId = customerId && contactIdByCustomerId.get(customerId);
      if (contactId) {
        missing.push({ id, contactId, data: recordData });
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
  mismatches: PaymentMismatch[]
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
