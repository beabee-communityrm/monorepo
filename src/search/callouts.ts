import type { Filters } from ".";
import { ItemStatus } from "../data";

export const calloutFilters = {
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
} as const satisfies Filters;

export type CalloutFilterName = keyof typeof calloutFilters;

export const calloutResponseFilters = {
  id: {
    type: "text",
  },
  contact: {
    type: "contact",
    nullable: true,
  },
  callout: {
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

export type CalloutResponseFilterName = keyof typeof calloutResponseFilters;

export const calloutResponseCommentFilters = {
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

export type CalloutResponseCommentFilterName =
  keyof typeof calloutResponseCommentFilters;

export const calloutTagFilters = {
  id: {
    type: "text",
  },
  name: {
    type: "text",
  },
  description: {
    type: "text",
  },
  calloutSlug: {
    type: "text",
  },
} as const satisfies Filters;

export type CalloutTagFilterName = keyof typeof calloutTagFilters;
