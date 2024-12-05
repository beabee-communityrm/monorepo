import type { Filters } from "../types/index.js";

export const apiKeyFilters = {
  id: {
    type: "text"
  },
  createdAt: {
    type: "date"
  }
} as const;

apiKeyFilters satisfies Filters;
