/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  GetPaymentDataWith,
  GetPaymentsQuery,
  GetPaymentWith,
  Paginated,
  Serial,
} from '@beabee/beabee-common';

import { deserializeDate, instance } from '.';
import { deserializeContact } from './contact';

// TODO: how to make this type safe?
export function deserializePayment(
  // data: Serial<GetPaymentDataWith<...>>
  data: any
): any {
  return {
    chargeDate: deserializeDate(data.chargeDate),
    amount: data.amount,
    status: data.status,
    ...(data.contact !== undefined && {
      contact: data.contact && deserializeContact(data.contact),
    }),
  };
}

/** @deprecated use the client instead */
export async function fetchPayments<With extends GetPaymentWith = void>(
  query: GetPaymentsQuery,
  _with?: readonly With[]
): Promise<Paginated<GetPaymentDataWith<With>>> {
  const { data } = await instance.get<
    Paginated<Serial<GetPaymentDataWith<With>>>
  >(`/payment`, { params: { with: _with, ...query } });
  return {
    ...data,
    items: data.items.map((item) => deserializePayment(item)),
  };
}
