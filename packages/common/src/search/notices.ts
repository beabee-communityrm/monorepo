import type { Filters } from "../types/index.ts";
import { ItemStatus } from "../data/index.ts";

type NoticeFilters = Readonly<{
  id: { type: "text" };
  createdAt: { type: "date" };
  updatedAt: { type: "date" };
  name: { type: "text" };
  expires: { type: "date"; nullable: true };
  enabled: { type: "boolean" };
  text: { type: "text" };
  status: { type: "enum"; options: readonly ItemStatus[] };
}>;

export const noticeFilters: NoticeFilters = {
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
