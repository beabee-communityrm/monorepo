import type { PaymentSourceBase } from "./index.ts";
import type { PaymentMethod } from "../data/index.ts";

export interface PaymentSourceStripeCardActual extends PaymentSourceBase {
  method: PaymentMethod.StripeCard;
  isLink: false;
  last4: string;
  expiryMonth: number;
  expiryYear: number;
}

export interface PaymentSourceStripeCardLink extends PaymentSourceBase {
  method: PaymentMethod.StripeCard;
  isLink: true;
  email: string;
}

export type PaymentSourceStripeCard =
  | PaymentSourceStripeCardActual
  | PaymentSourceStripeCardLink;
