import {
  nullableOperators,
  operatorsByTypeMap,
  type FilterType,
  type Rule,
  type RuleOperator,
} from '@beabee/beabee-common';

import i18n from '@lib/i18n';
import type { FilterGroups, FilterItems } from '@type';

const { t } = i18n.global;

export interface SearchRuleProps<R = never> {
  filterGroups: FilterGroups;
  rule: Rule | R | null;
  readonly?: boolean;
}

export interface SearchRuleFilterGroupProps {
  filterGroup: { items: FilterItems };
  rule: Rule;
  readonly?: boolean;
}

export interface SearchRuleEmits {
  (event: 'update:rule', rule: Rule): void;
  (event: 'remove'): void;
}

export const operatorItems = Object.fromEntries(
  Object.entries(operatorsByTypeMap).map(([type, typeOperators]) => [
    type,
    Object.entries(typeOperators).map(([operator]) => ({
      id: operator as RuleOperator,
      label: operatorT(type as FilterType, operator as RuleOperator),
    })),
  ])
);

export const nullableOperatorItems = Object.entries(nullableOperators).map(
  ([operator]) => ({
    id: operator as RuleOperator,
    label: operatorT('all', operator as RuleOperator),
  })
);

export function operatorT(type: FilterType | 'all', operator: RuleOperator) {
  if (operator === 'is_empty' || operator === 'is_not_empty') {
    type = 'all';
  }
  if (type === 'contact') {
    type = 'text';
  }

  return t(`advancedSearch.operators.${type}.${operator}`);
}
