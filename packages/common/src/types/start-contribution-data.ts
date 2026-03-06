import type { PaymentFlowParams, SetContributionData } from './index.js';

export interface StartContributionData extends SetContributionData {
  params: PaymentFlowParams;
}
