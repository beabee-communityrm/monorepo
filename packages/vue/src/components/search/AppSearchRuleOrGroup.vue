<template>
  <template v-if="rule && isRuleGroup(rule)">
    <span v-if="readonly">{{ labels.nestedRules }}</span>
    <span v-else>{{ labels.noNestedRules }}</span>
  </template>
  <AppSearchRule
    v-else
    :filter-groups="filterGroups"
    :rule="rule"
    :readonly="readonly"
    :operator-labels="operatorLabels"
    :labels="labels"
    :locale="locale"
    @update:rule="$emit('update:rule', $event)"
    @remove="$emit('remove')"
  />
</template>

<script setup lang="ts">
import { type RuleGroup, isRuleGroup } from '@beabee/beabee-common';
import type { BaseLocale } from '@beabee/locale';

import type {
  OperatorLabels,
  SearchRuleEmits,
  SearchRuleProps,
} from '../../types/search';
import AppSearchRule from './AppSearchRule.vue';

/**
 * Rule or group component that handles both individual rules and nested rule groups
 * @param filterGroups - Available filter groups
 * @param rule - The current rule or rule group
 * @param readonly - Whether the component is in readonly mode
 * @param operatorLabels - Labels for operators
 * @param labels - Labels for UI text including nested rules messages
 * @param locale - Locale for date formatting
 */

interface Props extends SearchRuleProps<RuleGroup> {
  operatorLabels: OperatorLabels;
  labels: {
    selectFilter: string;
    yes: string;
    no: string;
    relativeDatePlaceholder: string;
    and: string;
    nestedRules: string;
    noNestedRules: string;
  };
  locale?: BaseLocale;
}

withDefaults(defineProps<Props>(), {
  readonly: false,
  locale: 'en' as BaseLocale,
});

defineEmits<SearchRuleEmits>();
</script>
