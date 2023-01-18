import type { Filters } from ".";

export const paymentFilters = {
  contact: {
    type: "contact",
  },
  chargeDate: {
    type: "date",
  },
} as const satisfies Filters;

export type PaymentFilterName = keyof typeof paymentFilters;
