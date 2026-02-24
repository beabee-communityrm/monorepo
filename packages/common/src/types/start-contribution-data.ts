import type { PaymentMethod } from '../data/index.js';
import type { SetContributionData } from './index.js';
import { PaymentFlowParams } from './payment-flow-params.js';

export interface StartContributionData extends SetContributionData {
  paymentMethod: PaymentMethod;
  paymentFlowParams: PaymentFlowParams;
}
