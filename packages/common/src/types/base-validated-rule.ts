import type { operatorsByType } from '../search/operators.js';
import type { FilterType, ValidatedRuleValue } from './index.js';

export interface BaseValidatedRule<T extends FilterType, F extends string> {
  type: T;
  field: F;
  nullable: boolean;
  operator: keyof (typeof operatorsByType)[T];
  value: ValidatedRuleValue<T>[];
}
