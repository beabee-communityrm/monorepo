import type { PaymentStatus } from "../data/index.ts";

export interface GetPaymentData {
  chargeDate: Date;
  amount: number;
  status: PaymentStatus;
}
