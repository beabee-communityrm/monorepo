<template>
  <ul class="flex flex-wrap items-center gap-2 text-sm text-body-80">
    <template v-for="(rule, i) in modelValue.rules" :key="i">
      <li class="rounded-full border border-primary-70 bg-primary-10 px-2 py-1">
        <AppSearchRuleOrGroup
          :filter-groups="filterGroups"
          :rule="rule"
          :operator-labels="operatorLabels"
          :locale="locale"
          readonly
          @remove="handleRemove(i)"
        />
      </li>
      <li class="font-bold uppercase last:hidden">
        {{ t(`advancedSearch.matchWord.${modelValue.condition}`) }}
      </li>
    </template>
  </ul>
</template>

<script setup lang="ts">
import type { RuleGroup } from '@beabee/beabee-common';
import type { BaseLocale } from '@beabee/locale';

import { useI18n } from 'vue-i18n';

import type { FilterGroups, OperatorLabels } from '../../types/search';
import AppSearchRuleOrGroup from './AppSearchRuleOrGroup.vue';

const { t } = useI18n();

/**
 * Search summary component that displays active rules in a compact format.
 * Now uses internal i18n for match conditions and simplified since child
 * components handle their own labels.
 *
 * @param modelValue - The current rule group
 * @param filterGroups - Available filter groups
 * @param operatorLabels - Labels for operators
 * @param locale - Locale for date formatting
 */

interface Props {
  modelValue: RuleGroup;
  filterGroups: FilterGroups;
  operatorLabels: OperatorLabels;
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
