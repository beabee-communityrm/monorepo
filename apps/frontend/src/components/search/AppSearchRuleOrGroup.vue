<template>
  <template v-if="rule && isRuleGroup(rule)">
    <span v-if="readonly">{{ t('advancedSearch.nestedRules') }}</span>
    <span v-else>{{ t('advancedSearch.noNestedRules') }}</span>
  </template>
  <AppSearchRule
    v-else
    :filter-groups="filterGroups"
    :filter-items="filterItems"
    :rule="rule"
    :readonly="readonly"
    @update:rule="$emit('update:rule', $event)"
  />
</template>
<script lang="ts" setup>
import { isRuleGroup, type Rule, type RuleGroup } from '@beabee/beabee-common';
import { useI18n } from 'vue-i18n';
import AppSearchRule from './AppSearchRule.vue';
import type { FilterGroup, FilterItems } from './search.interface';

defineEmits(['update:rule']);
defineProps<{
  filterGroups: FilterGroup[];
  filterItems: FilterItems;
  rule: Rule | RuleGroup | null;
  readonly?: boolean;
}>();

const { t } = useI18n();
</script>
