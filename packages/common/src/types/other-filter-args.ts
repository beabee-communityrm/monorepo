import type { BaseFilterArgs, FilterType } from './index.js';

export interface OtherFilterArgs extends BaseFilterArgs {
  type: Exclude<FilterType, 'array' | 'enum'>;
}
