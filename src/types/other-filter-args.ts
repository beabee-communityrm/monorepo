import type { FilterType, BaseFilterArgs } from './index.ts';

export interface OtherFilterArgs extends BaseFilterArgs {
    type: Exclude<FilterType, "array" | "enum">;
}
