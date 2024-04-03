import type {
  PaymentSourceGoCardlessDirectDebit,
  PaymentSourceManual,
  PaymentSourceStripeBACS,
  PaymentSourceStripeCard,
  PaymentSourceStripeSEPA,
} from "./index.ts";

export type PaymentSource =
  | PaymentSourceStripeCard
  | PaymentSourceGoCardlessDirectDebit
  | PaymentSourceStripeBACS
  | PaymentSourceStripeSEPA
  | PaymentSourceManual;
