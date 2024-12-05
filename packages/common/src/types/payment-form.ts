import { ContributionPeriod } from "../data/index.js";

export interface PaymentForm {
  monthlyAmount: number;
  period: ContributionPeriod;
  payFee: boolean;
  prorate: boolean;
}
