import type { BaseFilterArgs, FilterType } from "./index.ts";

export interface OtherFilterArgs extends BaseFilterArgs {
  type: Exclude<FilterType, "array" | "enum">;
}
