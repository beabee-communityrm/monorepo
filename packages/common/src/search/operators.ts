import type { OperatorsByType } from "../types/index.ts";

const equalityOperators = {
  equal: { args: 1 },
  not_equal: { args: 1 },
} as const;

const orderedOperators = {
  between: { args: 2 },
  not_between: { args: 2 },
  less: { args: 1 },
  greater: { args: 1 },
  less_or_equal: { args: 1 },
  greater_or_equal: { args: 1 },
} as const;

const stringOperators = {
  begins_with: { args: 1 },
  ends_with: { args: 1 },
  not_begins_with: { args: 1 },
  not_ends_with: { args: 1 },
} as const;

const numericOperators = {
  ...equalityOperators,
  ...orderedOperators,
} as typeof orderedOperators & typeof equalityOperators;

const arrayOperators = {
  contains: { args: 1 },
  not_contains: { args: 1 },
} as const;

// Special operator can be applied across all fields if they are nullable
export const nullableOperators = {
  is_empty: { args: 0 },
  is_not_empty: { args: 0 },
} as const;

export const operatorsByType = {
  text: { ...equalityOperators, ...arrayOperators, ...stringOperators } as
    & typeof equalityOperators
    & typeof stringOperators
    & typeof arrayOperators,
  blob: arrayOperators as typeof arrayOperators,
  date: numericOperators as typeof numericOperators,
  number: numericOperators as typeof numericOperators,
  boolean: { equal: equalityOperators.equal as typeof equalityOperators.equal },
  array: { ...arrayOperators, ...nullableOperators } as
    & typeof arrayOperators
    & typeof nullableOperators,
  enum: equalityOperators as typeof equalityOperators,
  contact: equalityOperators as typeof equalityOperators,
} as const;

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
