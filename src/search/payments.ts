import type { Filters } from ".";

export const paymentFilters = {
  contact: {
    type: "contact",
  },
  chargeDate: {
    type: "date",
  },
} satisfies Filters;

export type PaymentFilterName = keyof typeof paymentFilters;
