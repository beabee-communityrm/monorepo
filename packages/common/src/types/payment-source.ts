import type {
  PaymentSourceGoCardlessDirectDebit,
  PaymentSourceManual,
  PaymentSourceStripeBACS,
  PaymentSourceStripeCard,
  PaymentSourceStripePayPal,
  PaymentSourceStripeSEPA
} from "./index.js";

export type PaymentSource =
  | PaymentSourceGoCardlessDirectDebit
  | PaymentSourceManual
  | PaymentSourceStripeBACS
  | PaymentSourceStripeCard
  | PaymentSourceStripePayPal
  | PaymentSourceStripeSEPA;
