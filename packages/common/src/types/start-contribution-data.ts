import type { PaymentFlowSetupParams, SetContributionData } from './index.js';

export interface StartContributionData extends SetContributionData {
  params: PaymentFlowSetupParams;
}
