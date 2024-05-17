import type { Filters } from "../types/index.ts";

export const apiKeyFilters = {
  id: {
    type: "text",
  },
  createdAt: {
    type: "date",
  },
} as const satisfies Filters;
