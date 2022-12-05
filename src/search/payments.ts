export const paymentFilters = {
  contact: {
    type: "contact",
  },
  chargeDate: {
    type: "date",
  },
} as const;

export type PaymentFilterName = keyof typeof paymentFilters;
