import type { FilterType } from "./index.js";

export interface BaseFilterArgs {
  type: FilterType;
  nullable?: boolean;
}
