import type { Payment } from '#models/index';

/** The payment fields that mirror a payment at the payment provider */
export type PaymentData = Pick<
  Payment,
  'amount' | 'chargeDate' | 'description' | 'subscriptionId' | 'status' | 'type'
>;

/** A payment at the payment provider, as the payment it should be stored as */
export interface PaymentRecord {
  id: string;
  customerId: string | null;
  data: PaymentData;
}
