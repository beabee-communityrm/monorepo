import type {
  PaymentSourceGoCardlessDirectDebit,
  PaymentSourceManual,
  PaymentSourceStripeBACS,
  PaymentSourceStripeCard,
  PaymentSourceStripePayPal,
  PaymentSourceStripeSEPA,
} from "./index.ts";

export type PaymentSource =
  | PaymentSourceGoCardlessDirectDebit
  | PaymentSourceManual
  | PaymentSourceStripeBACS
  | PaymentSourceStripeCard
  | PaymentSourceStripePayPal
  | PaymentSourceStripeSEPA;
