import type {
  GetContactData,
  GetPaymentData,
  GetPaymentWith,
  Noop,
} from "./index.ts";

export type GetPaymentDataWith<With extends GetPaymentWith> =
  & GetPaymentData
  & ("contact" extends With ? { contact: GetContactData | null } : Noop);
