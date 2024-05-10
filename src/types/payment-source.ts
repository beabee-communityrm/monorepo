import type {
  PaymentSourceGoCardlessDirectDebit,
  PaymentSourceManual,
  PaymentSourceStripeBACS,
  PaymentSourceStripeCard,
  PaymentSourceStripeLink,
  PaymentSourceStripePayPal,
  PaymentSourceStripeSEPA,
} from "./index.ts";

export type PaymentSource =
  | PaymentSourceGoCardlessDirectDebit
  | PaymentSourceManual
  | PaymentSourceStripeBACS
  | PaymentSourceStripeCard
  | PaymentSourceStripeLink
  | PaymentSourceStripePayPal
  | PaymentSourceStripeSEPA;
