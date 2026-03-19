import type { PaymentMethod } from '../data/index.js';
import type {
  ContentJoinPeriodData,
  PaymentPeriod,
  StripeFeeCountry,
} from './index.js';

export interface ContentJoinData {
  title: string;
  subtitle: string;
  initialAmount: number;
  initialPeriod: PaymentPeriod;
  minMonthlyAmount: number;
  periods: ContentJoinPeriodData[];
  showAbsorbFee: boolean;
  showNoContribution: boolean;
  paymentMethods: PaymentMethod[];
  /** @deprecated Use {@link ContentPaymentData.stripePublicKey} instead. */
  stripePublicKey: string;
  /** @deprecated Use {@link ContentPaymentData.stripeCountry} instead. */
  stripeCountry: StripeFeeCountry;
}
