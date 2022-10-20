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

export interface Rule<T> {
  field: T;
  operator: RuleOperator;
  value: RuleValue[];
}

export interface RuleGroup<T> {
  condition: "AND" | "OR";
  rules: (RuleGroup<T> | Rule<T>)[];
}

// *** Definitions for filters ***
// TODO: Combine these with rules

export type FilterType =
  | "text"
  | "date"
  | "number"
  | "boolean"
  | "array"
  | "enum"
  | "contact";

export type FilterValue = RuleValue;
export type FilterOperator = RuleOperator;

export interface FilterOperatorParams {
  args: number;
}

const equal = { args: 1 };

const equalityOperators = { equal, not_equal: { args: 1 } };
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

export const nullableOperators = {
  is_empty: { args: 0 },
  is_not_empty: { args: 0 },
};

export const operatorsByType: Record<
  FilterType,
  Partial<Record<FilterOperator, FilterOperatorParams>>
> = {
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
  boolean: { equal },
  array: arrayOperators,
  enum: equalityOperators,
  contact: equalityOperators,
};

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

export interface Filter {
  id: string;
  operator: FilterOperator;
  values: FilterValue[];
}

// *** Definitions for pagination ***

export interface Paginated<T> {
  items: T[];
  offset: number;
  count: number;
  total: number;
}

export interface PaginatedQuery<T> {
  limit?: number;
  offset?: number;
  sort?: string;
  order?: "ASC" | "DESC";
  rules?: RuleGroup<T>;
}

// *** Helper methods ***

export function isRuleGroup<T>(
  ruleOrGroup: Rule<T> | RuleGroup<T>
): ruleOrGroup is RuleGroup<T> {
  return "condition" in ruleOrGroup;
}

export function validateRule<Field extends string>(
  filters: Filters<Field>,
  rule: Rule<string>
): rule is Rule<Field> {
  const filter = filters[rule.field as Field];
  if (!filter) {
    return false; // Invalid field
  }

  const operator = operatorsByType[filter.type][rule.operator];
  if (!operator) {
    return false; // Invalid operator
  }

  if (operator.args !== rule.value.length) {
    return false; // Invalid number of args
  }

  return true;
}

export function validateRuleGroup<Field extends string>(
  filters: Filters<Field>,
  ruleGroup: RuleGroup<string>
): ruleGroup is RuleGroup<Field> {
  for (const rule of ruleGroup.rules) {
    const valid = isRuleGroup(rule)
      ? validateRuleGroup(filters, rule)
      : validateRule(filters, rule);
    if (!valid) {
      return false;
    }
  }
  return true;
}

export function convertRuleGroupToFilters(
  ruleGroup?: RuleGroup<string>
): Filter[] | null {
  if (!ruleGroup) {
    return null;
  }

  // TODO: how to handle groups?
  const rulesWithoutGroups = ruleGroup.rules.filter(
    (rule) => !isRuleGroup(rule)
  ) as Rule<string>[];

  return rulesWithoutGroups.map((rule) => ({
    id: rule.field,
    operator: rule.operator,
    values: [...rule.value],
  }));
}

export function convertFiltersToRuleGroup(
  matchType: "all" | "any",
  filters: Filter[]
): RuleGroup<string> {
  return {
    condition: matchType === "all" ? "AND" : "OR",
    rules: filters.map((filter) => ({
      field: filter.id,
      operator: filter.operator,
      value: filter.values,
    })),
  };
}

export * from "./callouts";
export * from "./contacts";
export * from "./notices";
export * from "./payments";
