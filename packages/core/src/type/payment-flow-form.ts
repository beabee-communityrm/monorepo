import type { ContributionPeriod } from '@beabee/beabee-common';

export interface PaymentFlowFormStartContribution {
  action: 'start-contribution';
  period: ContributionPeriod;
  monthlyAmount: number;
  payFee: boolean;
}

export interface PaymentFlowFormCreateOneTimePayment {
  action: 'create-one-time-payment';
  amount: number;
  payFee: boolean;
}

export interface PaymentFlowFormUpdatePaymentMethod {
  action: 'update-payment-method';
}

export type PaymentFlowForm =
  | PaymentFlowFormStartContribution
  | PaymentFlowFormCreateOneTimePayment
  | PaymentFlowFormUpdatePaymentMethod;
