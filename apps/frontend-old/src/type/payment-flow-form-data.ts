import type { PaymentMethod, PaymentPeriod } from '@beabee/beabee-common';

export interface PaymentFlowFormData {
  email: string;
  amount: number;
  period: PaymentPeriod;
  paymentMethod: PaymentMethod;
}
