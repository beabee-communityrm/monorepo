import type { FilterType, RuleOperator, RuleOperatorParams } from "./index.ts";

export type OperatorsByType = Record<
  FilterType,
  Partial<Record<RuleOperator, RuleOperatorParams>>
>;
