import type { ContributionPeriod, PaymentMethod } from "../data/index.ts";

export interface Feeable {
    amount: number;
    period: ContributionPeriod;
    paymentMethod: PaymentMethod;
}
