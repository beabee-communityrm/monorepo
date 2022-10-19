import { ItemStatus } from "../data";

export const calloutFilterNames = [
  "title",
  "status",
  "answeredBy",
  "starts",
  "expires",
  "hidden",
] as const;

export type CalloutFilterName = typeof calloutFilterNames[number];

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
