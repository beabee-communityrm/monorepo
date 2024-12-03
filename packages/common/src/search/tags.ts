import type { Filters } from "../types/index.js";

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

export type TagFiltersType = typeof tagFilters;
