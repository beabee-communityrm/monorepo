import type { PaymentMethod } from "../data/index.ts";

export interface PaymentSourceGoCardlessDirectDebit {
  method: PaymentMethod.GoCardlessDirectDebit;
  bankName: string;
  accountHolderName: string;
  accountNumberEnding: string;
}
