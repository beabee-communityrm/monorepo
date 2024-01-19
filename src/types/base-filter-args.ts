import type { FilterType } from "./index.ts";

export interface BaseFilterArgs {
  type: FilterType;
  nullable?: boolean;
}
