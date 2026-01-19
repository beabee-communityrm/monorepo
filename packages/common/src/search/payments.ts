import { PaymentStatus } from '../data/index.js';
import { PaymentType } from '../data/payment-type.js';
import type { Filters } from '../types/index.js';

export const paymentFilters = {
  id: {
    type: 'text',
  },
  contact: {
    type: 'contact',
  },
  chargeDate: {
    type: 'date',
  },
  amount: {
    type: 'number',
  },
  status: {
    type: 'enum',
    options: [
      PaymentStatus.Draft,
      PaymentStatus.Pending,
      PaymentStatus.Successful,
      PaymentStatus.Failed,
      PaymentStatus.Cancelled,
    ] satisfies readonly PaymentStatus[] as readonly PaymentStatus[],
  },
  paymentType: {
    type: 'enum',
    options: [
      PaymentType.Prorated,
      PaymentType.Recurring,
      PaymentType.OneTime,
    ] satisfies readonly PaymentType[] as readonly PaymentType[],
  },
} as const;
paymentFilters satisfies Filters;
