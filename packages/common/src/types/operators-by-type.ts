import type { FilterType, RuleOperator, RuleOperatorParams } from './index.js';

export type OperatorsByType = Record<
  FilterType,
  Partial<Record<RuleOperator, RuleOperatorParams>>
>;
