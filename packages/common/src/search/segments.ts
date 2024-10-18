import type { Filters } from "../types/index.ts";

type SegmentFilters = Readonly<{
  id: { type: "text" };
  name: { type: "text" };
  description: { type: "text" };
}>;

export const segmentFilters: SegmentFilters = {
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
