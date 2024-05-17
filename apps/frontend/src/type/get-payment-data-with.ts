import type {
  GetPaymentWith,
  Noop,
  GetPaymentData,
  GetContactData,
} from '@type';

export type GetPaymentDataWith<With extends GetPaymentWith> = GetPaymentData &
  ('contact' extends With ? { contact: GetContactData | null } : Noop);
