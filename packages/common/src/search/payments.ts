import type { Filters } from "../types/index.ts";
import { PaymentStatus } from "../data/index.ts";

export const paymentFilters: Readonly<Filters> = {
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
      PaymentStatus.Draft,
      PaymentStatus.Pending,
      PaymentStatus.Successful,
      PaymentStatus.Failed,
      PaymentStatus.Cancelled,
    ],
  },
} as const satisfies Filters;
