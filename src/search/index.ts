// *** Definitions for rules ***

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

export type RuleOperator = typeof ruleOperators[number];

export type RuleValue = string | number | boolean;

export interface Rule {
  field: string;
  operator: RuleOperator;
  value: RuleValue[];
}

export interface RuleGroup {
  condition: "AND" | "OR";
  rules: (RuleGroup | Rule)[];
}

interface BaseValidatedRule<T extends FilterType, F extends string, V> {
  type: T;
  field: F;
  operator: keyof typeof operatorsByType[T];
  value: V[];
}

type ValidatedNumberRule<Field extends string> = BaseValidatedRule<
  "number",
  Field,
  number
>;

type ValidatedStringRule<Field extends string> = BaseValidatedRule<
  Exclude<FilterType, "number" | "boolean">,
  Field,
  string
>;

type ValidatedBooleanRule<Field extends string> = BaseValidatedRule<
  "boolean",
  Field,
  boolean
>;

export type ValidatedRule<Field extends string> =
  | ValidatedNumberRule<Field>
  | ValidatedStringRule<Field>
  | ValidatedBooleanRule<Field>;

export interface ValidatedRuleGroup<Field extends string> {
  condition: "AND" | "OR";
  rules: (ValidatedRuleGroup<Field> | ValidatedRule<Field>)[];
}

// *** Definitions for filters ***

export type FilterType =
  | "text"
  | "date"
  | "number"
  | "boolean"
  | "array"
  | "enum"
  | "contact";

export interface FilterOperatorParams {
  args: number;
}

interface BaseFilterArgs {
  type: FilterType;
  nullable?: boolean;
}

export interface EnumFilterArgs<T extends readonly string[] = readonly string[]>
  extends BaseFilterArgs {
  type: "enum";
  options: T;
}

export interface OtherFilterArgs extends BaseFilterArgs {
  type: Exclude<FilterType, "enum">;
}

export type FilterArgs = EnumFilterArgs | OtherFilterArgs;

export type Filters<T extends string = string> = Record<T, FilterArgs>;

// TODO: Merge these with Rules

export type FilterValue = RuleValue;
export type FilterOperator = RuleOperator;

export interface Filter {
  id: string;
  operator: FilterOperator;
  values: FilterValue[];
}

// *** Operator definitions ***

const equalityOperators = {
  equal: { args: 1 },
  not_equal: { args: 1 },
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
  text: {
    ...equalityOperators,
    ...arrayOperators,
    begins_with: { args: 1 },
    ends_with: { args: 1 },
    not_begins_with: { args: 1 },
    not_ends_with: { args: 1 },
  },
  date: numericOperators,
  number: numericOperators,
  boolean: { equal: equalityOperators.equal },
  array: arrayOperators,
  enum: equalityOperators,
  contact: equalityOperators,
} as const;

// More general type to allow mapping while maintaining full type above
export const operatorsByTypeMap: Record<
  FilterType,
  Partial<Record<FilterOperator, FilterOperatorParams>>
> = operatorsByType;

// *** Definitions for pagination ***

export interface Paginated<T> {
  items: T[];
  offset: number;
  count: number;
  total: number;
}

export interface PaginatedQuery {
  limit?: number;
  offset?: number;
  sort?: string;
  order?: "ASC" | "DESC";
  rules?: RuleGroup;
}

export * from "./callouts";
export * from "./contacts";
export * from "./notices";
export * from "./payments";
