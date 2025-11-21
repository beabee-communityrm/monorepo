import type { PaymentMethod } from '../data/index.js';
import type { SetContributionData } from './index.js';

export interface StartContributionData extends SetContributionData {
  paymentMethod?: PaymentMethod;
  completeUrl: string;
}
