import type { OperatorsByType } from "../types/index.ts";

const equalityOperators = {
  equal: { args: 1 },
  not_equal: { args: 1 },
};
const stringOperators = {
  begins_with: { args: 1 },
  ends_with: { args: 1 },
  not_begins_with: { args: 1 },
  not_ends_with: { args: 1 },
};
const numericOperators = {
  ...equalityOperators,
  between: { args: 2 },
  not_between: { args: 2 },
  less: { args: 1 },
  greater: { args: 1 },
  less_or_equal: { args: 1 },
  greater_or_equal: { args: 1 },
};
const arrayOperators = {
  contains: { args: 1 },
  not_contains: { args: 1 },
};
// Special operator can be applied across all fields if they are nullable
export const nullableOperators = {
  is_empty: { args: 0 },
  is_not_empty: { args: 0 },
};

export const operatorsByType = {
  text: { ...equalityOperators, ...arrayOperators, ...stringOperators },
  blob: arrayOperators,
  date: numericOperators,
  number: numericOperators,
  boolean: { equal: equalityOperators.equal },
  array: { ...arrayOperators, ...nullableOperators },
  enum: equalityOperators,
  contact: equalityOperators,
} as const satisfies OperatorsByType;

// More general type to allow mapping while maintaining full type above
export const operatorsByTypeMap: OperatorsByType = operatorsByType;

export const ruleOperators = [
  "equal",
  "not_equal",
  "less",
  "less_or_equal",
  "greater",
  "greater_or_equal",
  "between",
  "not_between",
  "begins_with",
  "not_begins_with",
  "contains",
  "not_contains",
  "ends_with",
  "not_ends_with",
  "is_empty",
  "is_not_empty",
] as const;
