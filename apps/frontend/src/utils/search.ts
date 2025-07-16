import {
  type FilterType,
  type RuleOperator,
  nullableOperators,
  operatorsByTypeMap,
} from '@beabee/beabee-common';

import type { OperatorLabels } from '../type/search';

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
