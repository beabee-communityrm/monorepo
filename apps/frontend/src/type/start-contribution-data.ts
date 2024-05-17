import type { PaymentMethod } from '@beabee/beabee-common';
import type { SetContributionData } from '@type';

export interface StartContributionData extends SetContributionData {
  paymentMethod: PaymentMethod;
}
