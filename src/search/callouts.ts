import type { Filters } from ".";
import { ItemStatus } from "../data";

export const calloutFilters = {
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
  },
  expires: {
    type: "date",
  },
  hidden: {
    type: "boolean",
  },
} satisfies Filters;

export type CalloutFilterName = keyof typeof calloutFilters;

export const calloutResponseFilters = {
  contact: {
    type: "contact",
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
  answers: {
    type: "custom",
    nullable: true,
  },
} satisfies Filters;

export type CalloutResponseFilterName = keyof typeof calloutResponseFilters;
