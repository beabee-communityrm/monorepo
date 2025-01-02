import type {
  GetContactData,
  GetPaymentData,
  GetPaymentWith,
  Noop
} from "./index.js";

export type GetPaymentDataWith<With extends GetPaymentWith> = GetPaymentData &
  ("contact" extends With ? { contact: GetContactData | null } : Noop);
