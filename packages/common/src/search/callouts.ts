import type { Filters } from "../types/index.ts";
import { ItemStatus } from "../data/index.ts";

export const calloutFilters: Readonly<Filters> = {
  id: {
    type: "text",
  },
  slug: {
    type: "text",
  },
  title: {
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
  answeredBy: {
    type: "contact",
  },
  starts: {
    type: "date",
    nullable: true,
  },
  expires: {
    type: "date",
    nullable: true,
  },
  hidden: {
    type: "boolean",
  },
  channels: {
    type: "array",
  },
} as const satisfies Filters;

export const calloutResponseFilters: Readonly<Filters> = {
  id: {
    type: "text",
  },
  contact: {
    type: "contact",
    nullable: true,
  },
  calloutId: {
    type: "text",
  },
  createdAt: {
    type: "date",
  },
  updatedAt: {
    type: "date",
  },
  bucket: {
    type: "text",
    nullable: true,
  },
  tags: {
    type: "array",
  },
  assignee: {
    type: "contact",
    nullable: true,
  },
  answers: {
    type: "blob",
  },
} as const satisfies Filters;

export const calloutResponseCommentFilters: Readonly<Filters> = {
  id: {
    type: "text",
  },
  responseId: {
    type: "text",
  },
  contact: {
    type: "contact",
  },
  createdAt: {
    type: "date",
  },
  updatedAt: {
    type: "date",
  },
  text: {
    type: "text",
  },
} as const satisfies Filters;

export const calloutTagFilters: Readonly<Filters> = {
  id: {
    type: "text",
  },
  name: {
    type: "text",
  },
  description: {
    type: "text",
  },
  calloutId: {
    type: "text",
  },
} as const satisfies Filters;

export const calloutChannelFilters: Readonly<Filters> = {
  id: {
    type: "text",
  },
  name: {
    type: "text",
  },
  description: {
    type: "text",
  },
  calloutId: {
    type: "text",
  },
} as const satisfies Filters;
