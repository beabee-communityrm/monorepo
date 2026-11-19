import type {
  StripeCreatedWindow,
  StripeInvoicePayment,
  StripeLocalPayment,
  StripeMissingPayment,
  StripePaymentData,
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
  payment: StripePaymentData,
  data: StripePaymentData
): (keyof StripePaymentData)[] {
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

function printValue(value: StripePaymentData[keyof StripePaymentData]) {
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
  invoicePayments: StripeInvoicePayment[],
  payments: Map<string, StripeLocalPayment>,
  contactIdByCustomerId: Map<string, string>
): { mismatches: StripePaymentMismatch[]; missing: StripeMissingPayment[] } {
  const mismatches: StripePaymentMismatch[] = [];
  const missing: StripeMissingPayment[] = [];

  for (const { id, customerId, data } of invoicePayments) {
    const payment = payments.get(id);
    if (payment) {
      const fields = getMismatchedPaymentFields(payment, data);
      if (fields.length > 0) {
        mismatches.push({ payment, data, fields });
      }
    } else {
      const contactId = customerId && contactIdByCustomerId.get(customerId);
      if (contactId) {
        missing.push({ id, contactId, data });
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

/**
 * Splits a time range into consecutive windows of one calendar month, for
 * listing Stripe objects by creation time. Each window ends where the next
 * begins, so together they cover the range exactly once.
 *
 * Without `since` the first window has no start and without `until` the last
 * has no end, so objects older or newer than expected are still covered.
 *
 * @param oldest Where to start splitting if there is no `since`
 * @param now Where to stop splitting if there is no `until`
 * @param since The start of the range, if it is limited
 * @param until The end of the range, if it is limited
 * @returns The windows as Stripe `created` filters
 */
export function getCreatedWindows(
  oldest: Date,
  now: Date,
  since: Date | undefined,
  until: Date | undefined
): StripeCreatedWindow[] {
  const from = since || oldest;
  const to = until || now;

  const windows: StripeCreatedWindow[] = [];
  let start = since && Math.floor(since.getTime() / 1000);
  for (let month = from.getUTCMonth() + 1; ; month++) {
    const cut = Date.UTC(from.getUTCFullYear(), month, 1);
    if (cut >= to.getTime()) break;

    windows.push({
      ...(start !== undefined && { gte: start }),
      lt: cut / 1000,
    });
    start = cut / 1000;
  }
  windows.push({
    ...(start !== undefined && { gte: start }),
    ...(until && { lte: Math.floor(until.getTime() / 1000) }),
  });

  return windows;
}
