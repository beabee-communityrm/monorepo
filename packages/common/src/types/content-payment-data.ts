import { StripeFeeCountry } from './index.js';

export interface ContentPaymentData {
  stripePublicKey: string;
  stripeCountry: StripeFeeCountry;
  taxRateRecurring: number | null;
  taxRateOneTime: number | null;
  noticeText: string;
  showOneTimeDonation: boolean;
}
