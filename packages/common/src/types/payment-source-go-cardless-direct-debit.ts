import type { PaymentSourceBase } from "./index.ts";
import type { PaymentMethod } from "../data/index.ts";

export interface PaymentSourceGoCardlessDirectDebit extends PaymentSourceBase {
  method: PaymentMethod.GoCardlessDirectDebit;
  bankName: string;
  accountHolderName: string;
  accountNumberEnding: string;
}
