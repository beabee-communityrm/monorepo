import {
  type FilterType,
  type Rule,
  type RuleGroup,
  type RuleOperator,
  nullableOperators,
  operatorsByTypeMap,
} from '@beabee/beabee-common';

import type { Component } from 'vue';

// Filter item types
export interface FilterItemOther {
  type: 'text' | 'blob' | 'number' | 'boolean' | 'contact' | 'date';
  label: string;
  nullable?: boolean;
  prefix?: string;
}

export interface FilterItemArray<T extends readonly string[] | undefined> {
  type: 'array';
  label: string;
  nullable?: boolean;
  prefix?: string;
  options?: T extends readonly string[]
    ? { id: T[number]; label: string }[]
    : { id: string; label: string }[];
}

export interface FilterItemEnum<T extends readonly string[]> {
  type: 'enum';
  label: string;
  nullable?: boolean;
  options: { id: T[number]; label: string }[];
}

export type FilterItem =
  | FilterItemOther
  | FilterItemArray<readonly string[] | undefined>
  | FilterItemEnum<readonly string[]>;

export type FilterItems<T extends string = string> = Record<T, FilterItem>;

export interface FilterGroup {
  id: string;
  label: string;
  items: FilterItems;
  custom?: Component;
  itemsMatch?: RegExp;
}

export type FilterGroups = FilterGroup[];

// Rule group with empty states for form handling
export interface RuleGroupWithEmpty {
  condition: 'AND' | 'OR';
  rules: (Rule | RuleGroup | null)[];
}

// Search component props and emits
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

// Labels for operators - now using props instead of i18n
export interface OperatorLabels {
  text: Record<string, string>;
  blob: Record<string, string>;
  number: Record<string, string>;
  enum: Record<string, string>;
  boolean: Record<string, string>;
  contact: Record<string, string>;
  date: Record<string, string>;
  array: Record<string, string>;
  all: Record<string, string>;
}

// Helper function to build operator items from labels
export function buildOperatorItems(labels: OperatorLabels) {
  return Object.fromEntries(
    Object.entries(operatorsByTypeMap).map(([type, typeOperators]) => [
      type,
      Object.entries(typeOperators).map(([operator]) => ({
        id: operator as RuleOperator,
        label: getOperatorLabel(
          labels,
          type as FilterType,
          operator as RuleOperator
        ),
      })),
    ])
  );
}

export function buildNullableOperatorItems(labels: OperatorLabels) {
  return Object.entries(nullableOperators).map(([operator]) => ({
    id: operator as RuleOperator,
    label: getOperatorLabel(labels, 'all', operator as RuleOperator),
  }));
}

function getOperatorLabel(
  labels: OperatorLabels,
  type: FilterType | 'all',
  operator: RuleOperator
): string {
  let labelType = type;
  if (operator === 'is_empty' || operator === 'is_not_empty') {
    labelType = 'all';
  }
  if (labelType === 'contact') {
    labelType = 'text';
  }

  return labels[labelType]?.[operator] || operator;
}
