import type { PaymentMethod } from "../data/index.ts";

export interface PaymentSourceStripeCardActual {
  method: PaymentMethod.StripeCard;
  isLink: false;
  last4: string;
  expiryMonth: number;
  expiryYear: number;
}

export interface PaymentSourceStripeCardLink {
  method: PaymentMethod.StripeCard;
  isLink: true;
  emai: string;
}

export type PaymentSourceStripeCard =
  | PaymentSourceStripeCardActual
  | PaymentSourceStripeCardLink;
