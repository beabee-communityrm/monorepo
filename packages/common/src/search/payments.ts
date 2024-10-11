import type { Filters } from "../types/index.ts";
import { PaymentStatus } from "../data/index.ts";

type PaymentFilters = Readonly<{
  id: { type: "text" };
  contact: { type: "contact" };
  chargeDate: { type: "date" };
  amount: { type: "number" };
  status: { type: "enum"; options: readonly PaymentStatus[] };
}>;

export const paymentFilters: PaymentFilters = {
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
