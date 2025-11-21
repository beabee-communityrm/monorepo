import type {
  PaymentMethod,
  StartContributionData,
} from '@beabee/beabee-common';

export interface SignupContributionData extends StartContributionData {
  paymentMethod: PaymentMethod;
}

export interface SignupOneTimePaymentData {
  amount: number;
  payFee: boolean;
  paymentMethod: PaymentMethod;
  completeUrl: string;
}

export interface SignupData {
  email: string;
  contribution?: SignupContributionData;
  oneTimePayment?: SignupOneTimePaymentData;
}
