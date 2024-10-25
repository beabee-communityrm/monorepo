import type { AssertFilters, Filters } from "../types/index.ts";

type SegmentFilters = {
  readonly id: {
    readonly type: "text";
  };
  readonly name: {
    readonly type: "text";
  };
  readonly description: {
    readonly type: "text";
  };
};

export const segmentFilters: AssertFilters<SegmentFilters> = {
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
