import type { PaymentStatus, PaymentType } from '../data/index.js';

export interface GetPaymentData {
  id: string;
  chargeDate: Date;
  amount: number;
  status: PaymentStatus;
  type: PaymentType;
}
