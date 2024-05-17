import type { PaymentStatus } from '@beabee/beabee-common';

export interface GetPaymentData {
  chargeDate: Date;
  amount: number;
  status: PaymentStatus;
}
