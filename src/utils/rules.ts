import { InvalidRule } from "../error";
import {
  Filter,
  Filters,
  nullableOperators,
  operatorsByTypeMap,
  Rule,
  RuleGroup,
  ValidatedRule,
  ValidatedRuleGroup,
} from "../search";
import { isValidDate } from "./date";

export function isRuleGroup(
  ruleOrGroup: Rule | RuleGroup
): ruleOrGroup is RuleGroup {
  return "condition" in ruleOrGroup;
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
    rule.value.some((v) => !isValidDate(v as string))
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
