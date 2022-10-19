export const paymentFilters = {
  member: {
    type: "contact",
  },
  chargeDate: {
    type: "date",
  },
} as const;

export type PaymentFilterName = keyof typeof paymentFilters;
