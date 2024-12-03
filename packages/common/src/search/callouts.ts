import type { Filters } from "../types/index.js";
import { ItemStatus } from "../data/index.js";
import type { TagFiltersType } from "./tags.js";

export const calloutFilters = {
  id: {
    type: "text"
  },
  slug: {
    type: "text"
  },
  title: {
    type: "text"
  },
  status: {
    type: "enum",
    options: [
      ItemStatus.Draft,
      ItemStatus.Scheduled,
      ItemStatus.Open,
      ItemStatus.Ended
    ] satisfies ItemStatus[] as ItemStatus[]
  },
  answeredBy: {
    type: "contact"
  },
  starts: {
    type: "date",
    nullable: true
  },
  expires: {
    type: "date",
    nullable: true
  },
  hidden: {
    type: "boolean"
  },
  channels: {
    type: "array"
  },
  canReview: {
    type: "boolean"
  }
} as const;
calloutFilters satisfies Filters;

export const calloutResponseFilters = {
  id: {
    type: "text"
  },
  contact: {
    type: "contact",
    nullable: true
  },
  calloutId: {
    type: "text"
  },
  createdAt: {
    type: "date"
  },
  updatedAt: {
    type: "date"
  },
  bucket: {
    type: "text",
    nullable: true
  },
  tags: {
    type: "array"
  },
  assignee: {
    type: "contact",
    nullable: true
  },
  answers: {
    type: "blob"
  }
} as const;
calloutResponseFilters satisfies Filters;

export const calloutResponseCommentFilters = {
  id: {
    type: "text"
  },
  calloutId: {
    type: "text"
  },
  responseId: {
    type: "text"
  },
  contact: {
    type: "contact"
  },
  createdAt: {
    type: "date"
  },
  updatedAt: {
    type: "date"
  },
  text: {
    type: "text"
  }
} as const;
calloutResponseCommentFilters satisfies Filters;

export const calloutTagFilters = {
  // ...tagFilters,
  id: {
    type: "text"
  },
  name: {
    type: "text"
  },
  description: {
    type: "text"
  },
  calloutId: {
    type: "text"
  }
} as const;
calloutTagFilters satisfies TagFiltersType & Filters;

export const calloutChannelFilters = {
  id: {
    type: "text"
  },
  name: {
    type: "text"
  },
  description: {
    type: "text"
  },
  calloutId: {
    type: "text"
  }
} as const;
calloutChannelFilters satisfies Filters;

export const calloutReviewerFilters = {
  id: {
    type: "text"
  },
  contact: {
    type: "contact"
  },
  calloutId: {
    type: "text"
  }
} as const;
calloutReviewerFilters satisfies Filters;
