import type { Filters } from "../types/index.ts";
import { ItemStatus } from "../data/index.ts";

type CalloutFilters = Readonly<{
  id: { type: "text" };
  slug: { type: "text" };
  title: { type: "text" };
  status: { type: "enum"; options: ItemStatus[] };
  answeredBy: { type: "contact" };
  starts: { type: "date"; nullable: true };
  expires: { type: "date"; nullable: true };
  hidden: { type: "boolean" };
  channels: { type: "array" };
}>;

export const calloutFilters: CalloutFilters = {
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
} as const;

type CalloutResponseFilters = Readonly<{
  id: { type: "text" };
  contact: { type: "contact"; nullable: true };
  calloutId: { type: "text" };
  createdAt: { type: "date" };
  updatedAt: { type: "date" };
  bucket: { type: "text"; nullable: true };
  tags: { type: "array" };
  assignee: { type: "contact"; nullable: true };
  answers: { type: "blob" };
}>;

export const calloutResponseFilters: CalloutResponseFilters = {
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
} as const;

type CalloutResponseCommentFilters = Readonly<{
  id: { type: "text" };
  responseId: { type: "text" };
  contact: { type: "contact" };
  createdAt: { type: "date" };
  updatedAt: { type: "date" };
  text: { type: "text" };
}>;

export const calloutResponseCommentFilters: CalloutResponseCommentFilters = {
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

type CalloutTagFilters = Readonly<{
  id: { type: "text" };
  name: { type: "text" };
  description: { type: "text" };
  calloutId: { type: "text" };
}>;

export const calloutTagFilters: CalloutTagFilters = {
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

type CalloutChannelFilters = Readonly<{
  id: { type: "text" };
  name: { type: "text" };
  description: { type: "text" };
  calloutId: { type: "text" };
}>;

export const calloutChannelFilters: CalloutChannelFilters = {
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
