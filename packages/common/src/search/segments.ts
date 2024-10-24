import type { Filters } from "../types/index.ts";

export const segmentFilters: Readonly<Filters> = {
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
