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
} as const;

export type CalloutFilterName = keyof typeof calloutFilters;

export const calloutResponseFilters = {
  member: {
    type: "contact",
  },
  poll: {
    type: "text",
  },
} as const;

export type CalloutResponseFilterName = keyof typeof calloutResponseFilters;
