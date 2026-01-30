import { StripeFeeCountry } from './index.js';

export interface ContentPaymentData {
  stripePublicKey: string;
  stripeCountry: StripeFeeCountry;
  taxRate: number | null;
  noticeText: string;
}
