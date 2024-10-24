import type { Filters } from "../types/index.ts";
import { ItemStatus } from "../data/index.ts";

export const noticeFilters: Readonly<Filters> = {
  id: {
    type: "text",
  },
  createdAt: {
    type: "date",
  },
  updatedAt: {
    type: "date",
  },
  name: {
    type: "text",
  },
  expires: {
    type: "date",
    nullable: true,
  },
  enabled: {
    type: "boolean",
  },
  text: {
    type: "text",
  },
  status: {
    type: "enum",
    options: [
      ItemStatus.Draft,
      ItemStatus.Scheduled,
      ItemStatus.Open,
      ItemStatus.Ended,
    ],
  },
} as const satisfies Filters;
