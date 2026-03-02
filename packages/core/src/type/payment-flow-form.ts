import type { ContributionPeriod, PaymentMethod } from '@beabee/beabee-common';

export interface PaymentFlowFormStartContribution {
  action: 'start-contribution';
  period: ContributionPeriod;
  monthlyAmount: number;
  payFee: boolean;
  paymentMethod: PaymentMethod;
}

export interface PaymentFlowFormCreateOneTimePayment {
  action: 'create-one-time-payment';
  amount: number;
  payFee: boolean;
  paymentMethod: PaymentMethod;
}

export interface PaymentFlowFormUpdatePaymentMethod {
  action: 'update-payment-method';
  paymentMethod: PaymentMethod;
}

export type PaymentFlowForm =
  | PaymentFlowFormStartContribution
  | PaymentFlowFormCreateOneTimePayment
  | PaymentFlowFormUpdatePaymentMethod;
