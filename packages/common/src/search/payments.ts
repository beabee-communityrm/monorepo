import type { Filters } from "../types/index.js";
import { PaymentStatus } from "../data/index.js";

export const paymentFilters = {
  id: {
    type: "text"
  },
  contact: {
    type: "contact"
  },
  chargeDate: {
    type: "date"
  },
  amount: {
    type: "number"
  },
  status: {
    type: "enum",
    options: [
      PaymentStatus.Draft,
      PaymentStatus.Pending,
      PaymentStatus.Successful,
      PaymentStatus.Failed,
      PaymentStatus.Cancelled
    ] satisfies readonly PaymentStatus[] as readonly PaymentStatus[]
  }
} as const;
paymentFilters satisfies Filters;
