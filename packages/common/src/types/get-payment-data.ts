import type { PaymentStatus } from "../data/index.js";

export interface GetPaymentData {
  chargeDate: Date;
  amount: number;
  status: PaymentStatus;
}
