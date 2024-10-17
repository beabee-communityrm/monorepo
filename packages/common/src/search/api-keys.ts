import type { Filters } from "../types/index.ts";

type ApiKeyFilters = Readonly<{
  id: { type: "text" };
  createdAt: { type: "date" };
}>;

export const apiKeyFilters: ApiKeyFilters = {
  id: {
    type: "text",
  },
  createdAt: {
    type: "date",
  },
} as const satisfies Filters;
