import type {
  PaymentSourceGoCardlessDirectDebit,
  PaymentSourceManual,
  PaymentSourceStripeBACS,
  PaymentSourceStripeCard,
  PaymentSourceStripePayPal,
  PaymentSourceStripeSEPA,
} from "./index.ts";

export type PaymentSource =
  | PaymentSourceStripeCard
  | PaymentSourceGoCardlessDirectDebit
  | PaymentSourceStripeBACS
  | PaymentSourceStripeSEPA
  | PaymentSourceManual
  | PaymentSourceStripePayPal;
