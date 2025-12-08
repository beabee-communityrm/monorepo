import { StripeFeeCountry } from './index.js';

export interface ContentPaymentData {
  stripePublicKey: string;
  stripeCountry: StripeFeeCountry;
  taxRateEnabled: boolean;
  taxRate: number;
  noticeText: string;
  showOneTimeDonation: boolean;
}
