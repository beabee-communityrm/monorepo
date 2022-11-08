import isValid from "date-fns/isValid";
import parseISO from "date-fns/parseISO";

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
const operatorsByTypeMap: Record<
  FilterType,
  Partial<Record<FilterOperator, FilterOperatorParams>>
> = operatorsByType;

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

export class InvalidRule extends Error {
  constructor(readonly rule: Rule, readonly message: string) {
    super();
    Object.setPrototypeOf(this, InvalidRule.prototype);
  }
}

export function validateRule<Field extends string>(
  filters: Filters<Field>,
  rule: Rule
): ValidatedRule<Field> {
  const filter = filters[rule.field as Field];
  if (!filter) {
    throw new InvalidRule(rule, `Invalid field: ${rule.field}`);
  }

  if (rule.operator in nullableOperators) {
    // Field cannot be empty (except text which can always be empty)
    if (!filter.nullable && filter.type !== "text") {
      throw new InvalidRule(
        rule,
        `Invalid nullable operator: field is not nullable`
      );
    }
    if (rule.value.length !== 0) {
      throw new InvalidRule(
        rule,
        `Invalid operator argument count: ${rule.operator} needs 0, ${rule.value.length} given`
      );
    }
  } else {
    const operator = operatorsByTypeMap[filter.type][rule.operator];
    if (!operator) {
      throw new InvalidRule(
        rule,
        `Invalid operator for type: ${filter.type} type doesn't define ${rule.operator}`
      );
    }

    if (operator.args !== rule.value.length) {
      throw new InvalidRule(
        rule,
        `Invalid operator argument count: ${rule.operator} needs ${operator.args}, ${rule.value.length} given`
      );
    }
  }

  const expectedType =
    filter.type === "boolean" || filter.type === "number"
      ? filter.type
      : "string";

  if (rule.value.some((v) => typeof v !== expectedType)) {
    throw new InvalidRule(
      rule,
      `Invalid operator argument type: ${
        rule.operator
      } needs ${expectedType}, ${rule.value.map((v) => typeof v)} given`
    );
  }
  if (
    filter.type === "date" &&
    rule.value.some((v) => !isValid(parseISO(v as string)))
  ) {
    throw new InvalidRule(
      rule,
      `Invalid operator argument: date type needs valid absolute or relative date, ${rule.value} given`
    );
  }

  return {
    ...rule,
    type: filter.type,
  } as ValidatedRule<Field>;
}

export function validateRuleGroup<Field extends string>(
  filters: Filters<Field>,
  ruleGroup: RuleGroup
): ValidatedRuleGroup<Field> {
  const validatedRuleGroup: ValidatedRuleGroup<Field> = {
    condition: ruleGroup.condition,
    rules: [],
  };

  for (const rule of ruleGroup.rules) {
    const valid = isRuleGroup(rule)
      ? validateRuleGroup(filters, rule)
      : validateRule(filters, rule);
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
