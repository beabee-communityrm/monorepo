import type {
  PaymentStatus,
  PaymentType,
  RefundReason,
  RefundStatus,
} from '../data/index.js';

export interface GetPaymentData {
  id: string;
  chargeDate: Date;
  amount: number;
  status: PaymentStatus;
  type: PaymentType;
  refundStatus: RefundStatus;
  refundReason: RefundReason;
}
