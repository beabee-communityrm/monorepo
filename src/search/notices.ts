import { ItemStatus } from "../data";

export const noticeFilters = {
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
} as const;

export type NoticeFilterName = keyof typeof noticeFilters;
