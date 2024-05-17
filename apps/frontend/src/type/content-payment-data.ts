import type { StripeFeeCountry } from '@beabee/beabee-common';

export interface ContentPaymentData {
  stripePublicKey: string;
  stripeCountry: StripeFeeCountry;
  taxRateEnabled: boolean;
  taxRate: number;
}
