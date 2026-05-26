import type {
  CreatePaymentData,
  StartContributionData,
} from '@beabee/beabee-common';

export interface SignupData {
  email: string;
  contribution?: StartContributionData;
  oneTimePayment?: CreatePaymentData;
}
