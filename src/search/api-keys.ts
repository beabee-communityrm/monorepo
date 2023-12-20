import { Filters } from ".";

const apiKeyFilters = {
  id: {
    type: "text",
  },
  createdAt: {
    type: "date",
  },
} as const satisfies Filters;

export type ApiKeyFilterName = keyof typeof apiKeyFilters;
