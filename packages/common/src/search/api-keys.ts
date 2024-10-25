import type { AssertFilters, Filters } from "../types/index.ts";

type ApiKeyFilters = {
  readonly id: {
    readonly type: "text";
  };
  readonly createdAt: {
    readonly type: "date";
  };
};

export const apiKeyFilters: AssertFilters<ApiKeyFilters> = {
  id: {
    type: "text",
  },
  createdAt: {
    type: "date",
  },
} as const satisfies Filters;
