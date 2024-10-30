import type { Filters } from "../types/index.ts";

export const tagFilters = {
  id: {
    type: "text",
  },
  name: {
    type: "text",
  },
  description: {
    type: "text",
  },
} as const;
tagFilters satisfies Filters;
