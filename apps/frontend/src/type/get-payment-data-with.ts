import type {
  GetPaymentWith,
  Noop,
  GetPaymentData,
  GetContactData,
} from '@beabee/beabee-common';

export type GetPaymentDataWith<With extends GetPaymentWith> = GetPaymentData &
  ('contact' extends With ? { contact: GetContactData | null } : Noop);
