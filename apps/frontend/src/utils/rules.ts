import {
  type FilterType,
  type Rule,
  type RuleGroup,
  type RuleOperator,
  type RuleValue,
  isRuleGroup,
  operatorsByType,
  operatorsByTypeMap,
} from '@beabee/beabee-common';

import type {
  FilterGroups,
  OperatorLabels,
  RuleGroupWithEmpty,
} from '../type/search';

/**
 * Get default value for a rule based on its type
 */
export function getDefaultRuleValue(type: FilterType): RuleValue {
  switch (type) {
    case 'boolean':
      return true;
    case 'number':
      return 0;
    default:
      return '';
  }
}

/**
 * Create default operator and value for a given type
 */
function withDefault<T extends FilterType>(
  type: T,
  operator: keyof (typeof operatorsByType)[T]
): Pick<Rule, 'operator' | 'value'> {
  const params = operatorsByTypeMap[type][operator as RuleOperator];
  return {
    operator: operator as RuleOperator,
    value: new Array(params?.args || 0).fill(getDefaultRuleValue(type)),
  };
}

const ruleDefaultsByType: Record<
  FilterType,
  () => Pick<Rule, 'operator' | 'value'>
> = {
  text: () => withDefault('text', 'equal'),
  blob: () => withDefault('blob', 'contains'),
  number: () => withDefault('number', 'equal'),
  enum: () => withDefault('enum', 'equal'),
  boolean: () => withDefault('boolean', 'equal'),
  contact: () => withDefault('contact', 'equal'),
  date: () => withDefault('date', 'equal'),
  array: () => withDefault('array', 'contains'),
};

/**
 * Create a new rule with default operator and value for the given field type
 */
export function createNewRule(field: string, type: FilterType): Rule {
  return {
    field,
    ...ruleDefaultsByType[type](),
  };
}

/**
 * Create a deep copy of a rule
 */
export function copyRule(rule: Rule): Rule {
  return {
    field: rule.field,
    operator: rule.operator,
    value: [...rule.value],
  };
}

/**
 * Create a deep copy of a rule group
 */
export function copyRuleGroup(ruleGroup: RuleGroup): RuleGroup {
  return {
    condition: ruleGroup.condition,
    rules: ruleGroup.rules.map((ruleOrGroup) =>
      isRuleGroup(ruleOrGroup)
        ? copyRuleGroup(ruleOrGroup)
        : copyRule(ruleOrGroup)
    ),
  };
}

/**
 * Check if two rules are equal
 */
export function isRuleEqual(a: Rule, b: Rule): boolean {
  return (
    a.field === b.field &&
    a.operator === b.operator &&
    a.value.length === b.value.length &&
    a.value.every((v, i) => v === b.value[i])
  );
}

/**
 * Check if two rule groups are equal (including empty states)
 */
export function isRuleGroupEqual(
  a: RuleGroupWithEmpty,
  b: RuleGroupWithEmpty
): boolean {
  return (
    a.condition === b.condition &&
    a.rules.length === b.rules.length &&
    a.rules.every((ra, i) => {
      const rb = b.rules[i];
      if (ra === null || rb === null) return ra === rb;

      const raGroup = isRuleGroup(ra);
      const rbGroup = isRuleGroup(rb);
      return (
        raGroup === rbGroup &&
        (raGroup
          ? isRuleGroupEqual(ra, rb as RuleGroup)
          : isRuleEqual(ra, rb as Rule))
      );
    })
  );
}

/**
 * Create operator labels object using i18n translation function
 */
export function createOperatorLabels(
  t: (key: string) => string
): OperatorLabels {
  return {
    text: {
      equal: t('advancedSearch.operators.text.equal'),
      not_equal: t('advancedSearch.operators.text.not_equal'),
      contains: t('advancedSearch.operators.text.contains'),
      not_contains: t('advancedSearch.operators.text.not_contains'),
      begins_with: t('advancedSearch.operators.text.begins_with'),
      not_begins_with: t('advancedSearch.operators.text.not_begins_with'),
      ends_with: t('advancedSearch.operators.text.ends_with'),
      not_ends_with: t('advancedSearch.operators.text.not_ends_with'),
    },
    blob: {
      contains: t('advancedSearch.operators.blob.contains'),
      not_contains: t('advancedSearch.operators.blob.not_contains'),
    },
    number: {
      equal: t('advancedSearch.operators.number.equal'),
      not_equal: t('advancedSearch.operators.number.not_equal'),
      less: t('advancedSearch.operators.number.less'),
      less_or_equal: t('advancedSearch.operators.number.less_or_equal'),
      greater: t('advancedSearch.operators.number.greater'),
      greater_or_equal: t('advancedSearch.operators.number.greater_or_equal'),
      between: t('advancedSearch.operators.number.between'),
      not_between: t('advancedSearch.operators.number.not_between'),
    },
    enum: {
      equal: t('advancedSearch.operators.enum.equal'),
      not_equal: t('advancedSearch.operators.enum.not_equal'),
    },
    boolean: {
      equal: t('advancedSearch.operators.boolean.equal'),
    },
    contact: {
      equal: t('advancedSearch.operators.contact.equal'),
      not_equal: t('advancedSearch.operators.contact.not_equal'),
      contains: t('advancedSearch.operators.contact.contains'),
      not_contains: t('advancedSearch.operators.contact.not_contains'),
      begins_with: t('advancedSearch.operators.contact.begins_with'),
      not_begins_with: t('advancedSearch.operators.contact.not_begins_with'),
      ends_with: t('advancedSearch.operators.contact.ends_with'),
      not_ends_with: t('advancedSearch.operators.contact.not_ends_with'),
    },
    date: {
      equal: t('advancedSearch.operators.date.equal'),
      not_equal: t('advancedSearch.operators.date.not_equal'),
      less: t('advancedSearch.operators.date.less'),
      less_or_equal: t('advancedSearch.operators.date.less_or_equal'),
      greater: t('advancedSearch.operators.date.greater'),
      greater_or_equal: t('advancedSearch.operators.date.greater_or_equal'),
      between: t('advancedSearch.operators.date.between'),
      not_between: t('advancedSearch.operators.date.not_between'),
    },
    array: {
      contains: t('advancedSearch.operators.array.contains'),
      not_contains: t('advancedSearch.operators.array.not_contains'),
    },
    all: {
      is_empty: t('advancedSearch.operators.all.is_empty'),
      is_not_empty: t('advancedSearch.operators.all.is_not_empty'),
    },
  };
}

/**
 * Check if a rule's field exists in any of the filter groups.
 */
function isRuleFieldValid(field: string, filterGroups: FilterGroups): boolean {
  return filterGroups.some(
    (group) => field in group.items || (group.itemsMatch?.test(field) ?? false)
  );
}

/**
 * Check if a rule group is valid for the given filter groups (every rule's field exists).
 * Used to avoid loading the table when a segment has outdated/invalid rules.
 */
export function isRuleGroupValidForFilterGroups(
  ruleGroup: RuleGroup,
  filterGroups: FilterGroups
): boolean {
  for (const ruleOrGroup of ruleGroup.rules) {
    if (isRuleGroup(ruleOrGroup)) {
      if (!isRuleGroupValidForFilterGroups(ruleOrGroup, filterGroups)) {
        return false;
      }
    } else {
      if (!isRuleFieldValid(ruleOrGroup.field, filterGroups)) {
        return false;
      }
    }
  }
  return true;
}
