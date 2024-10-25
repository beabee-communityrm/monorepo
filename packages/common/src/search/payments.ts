import type { AssertFilters, Filters } from "../types/index.ts";
import { PaymentStatus } from "../data/index.ts";

type PaymentFilters = {
  readonly id: {
    readonly type: "text";
  };
  readonly contact: {
    readonly type: "contact";
  };
  readonly chargeDate: {
    readonly type: "date";
  };
  readonly amount: {
    readonly type: "number";
  };
  readonly status: {
    readonly type: "enum";
    readonly options: [
      PaymentStatus.Draft,
      PaymentStatus.Pending,
      PaymentStatus.Successful,
      PaymentStatus.Failed,
      PaymentStatus.Cancelled,
    ];
  };
};

export const paymentFilters: AssertFilters<PaymentFilters> = {
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
    ] as const satisfies PaymentStatus[],
  },
} as const satisfies Filters;
