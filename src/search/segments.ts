import type { Filters } from "../types/index.ts";

export const segmentFilters = {
  id: {
    type: "text",
  },
  name: {
    type: "text",
  },
  description: {
    type: "text",
  },
} as const satisfies Filters;
