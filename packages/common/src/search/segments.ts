import type { Filters } from "../types/index.js";

export const segmentFilters = {
  id: {
    type: "text"
  },
  name: {
    type: "text"
  },
  description: {
    type: "text"
  }
} as const;
segmentFilters satisfies Filters;
