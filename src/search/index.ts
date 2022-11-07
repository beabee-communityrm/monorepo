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

export interface PaginatedQuery {
  limit?: number;
  offset?: number;
  sort?: string;
  order?: "ASC" | "DESC";
  rules?: RuleGroup;
}

// *** Helper methods ***

export function isRuleGroup(
  ruleOrGroup: Rule | RuleGroup
): ruleOrGroup is RuleGroup {
  return "condition" in ruleOrGroup;
}

export function validateRule<Field extends string>(
  filters: Filters<Field>,
  rule: Rule
): ValidatedRule<Field> | false {
  const filter = filters[rule.field as Field];
  if (!filter) {
    return false; // Invalid field
  }

  const operator = operatorsByType[filter.type][rule.operator];
  if (!operator) {
    return false; // Invalid operator
  }

  const expectedType =
    filter.type === "boolean" || filter.type === "number"
      ? filter.type
      : "string";

  if (rule.value.some((v) => typeof v !== expectedType)) {
    return false; // Invalid value type
  }
  if (
    filter.type === "date" &&
    rule.value.some((v) => isNaN(+new Date(v as string)))
  ) {
    return false; // Invalid date
  }

  return {
    ...rule,
    type: filter.type,
  } as ValidatedRule<Field>;
}

export function validateRuleGroup<Field extends string>(
  filters: Filters<Field>,
  ruleGroup: RuleGroup
): ValidatedRuleGroup<Field> | false {
  const validatedRuleGroup: ValidatedRuleGroup<Field> = {
    condition: ruleGroup.condition,
    rules: [],
  };

  for (const rule of ruleGroup.rules) {
    const valid = isRuleGroup(rule)
      ? validateRuleGroup(filters, rule)
      : validateRule(filters, rule);
    if (!valid) {
      return false;
    }
    validatedRuleGroup.rules.push(valid);
  }
  return validatedRuleGroup;
}

export function convertRuleGroupToFilters(
  ruleGroup?: RuleGroup
): Filter[] | null {
  if (!ruleGroup) {
    return null;
  }

  // TODO: how to handle groups?
  const rulesWithoutGroups = ruleGroup.rules.filter(
    (rule) => !isRuleGroup(rule)
  ) as Rule[];

  return rulesWithoutGroups.map((rule) => ({
    id: rule.field,
    operator: rule.operator,
    values: [...rule.value],
  }));
}

export function convertFiltersToRuleGroup(
  matchType: "all" | "any",
  filters: Filter[]
): RuleGroup {
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
