import type { PaymentMethod } from "../data/index.ts";

export interface PaymentSourceStripeCard {
  method: PaymentMethod.StripeCard;
  last4: string;
  expiryMonth: number;
  expiryYear: number;
}
