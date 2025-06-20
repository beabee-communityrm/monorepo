<template>
  <ul class="flex flex-wrap items-center gap-2 text-sm text-body-80">
    <template v-for="(rule, i) in modelValue.rules" :key="i">
      <li class="rounded-full border border-primary-70 bg-primary-10 px-2 py-1">
        <AppSearchRuleOrGroup
          :filter-groups="filterGroups"
          :rule="rule"
          :operator-labels="operatorLabels"
          :labels="labels"
          :locale="locale"
          readonly
          @remove="handleRemove(i)"
        />
      </li>
      <li class="font-bold uppercase last:hidden">
        {{ labels.matchConditions[modelValue.condition] }}
      </li>
    </template>
  </ul>
</template>

<script setup lang="ts">
import type { RuleGroup } from '@beabee/beabee-common';
import type { BaseLocale } from '@beabee/locale';

import type { FilterGroups, OperatorLabels } from '../../types/search';
import AppSearchRuleOrGroup from './AppSearchRuleOrGroup.vue';

/**
 * Search summary component that displays active rules in a compact format
 * @param modelValue - The current rule group
 * @param filterGroups - Available filter groups
 * @param operatorLabels - Labels for operators
 * @param labels - Labels for UI text
 * @param locale - Locale for date formatting
 */

interface Props {
  modelValue: RuleGroup;
  filterGroups: FilterGroups;
  operatorLabels: OperatorLabels;
  labels: {
    selectFilter: string;
    yes: string;
    no: string;
    relativeDatePlaceholder: string;
    and: string;
    nestedRules: string;
    noNestedRules: string;
    matchConditions: {
      AND: string;
      OR: string;
    };
  };
  locale?: BaseLocale;
}

interface Emits {
  (event: 'update:modelValue', value: RuleGroup): void;
}

const props = withDefaults(defineProps<Props>(), {
  locale: 'en' as BaseLocale,
});

const emit = defineEmits<Emits>();

function handleRemove(i: number) {
  emit('update:modelValue', {
    condition: props.modelValue.condition,
    rules: props.modelValue.rules.filter((_, index) => index !== i),
  });
}
</script>
