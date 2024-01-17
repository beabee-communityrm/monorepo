import type { Filters } from "./index.ts";
import { PaymentStatus } from "../data/index.ts";

export const paymentFilters = {
  id: {
    type: "text",
  },
  contact: {
    type: "contact",
  },
  chargeDate: {
    type: "date",
  },
  amount: {
    type: "number",
  },
  status: {
    type: "enum",
    options: [
      PaymentStatus.Successful,
      PaymentStatus.Pending,
      PaymentStatus.Failed,
      PaymentStatus.Cancelled,
    ],
  },
} as const satisfies Filters;

export type PaymentFilterName = keyof typeof paymentFilters;
