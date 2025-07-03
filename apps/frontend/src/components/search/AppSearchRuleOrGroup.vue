<template>
  <template v-if="rule && isRuleGroup(rule)">
    <span v-if="readonly">{{ t('advancedSearch.nestedRules') }}</span>
    <span v-else>{{ t('advancedSearch.noNestedRules') }}</span>
  </template>
  <AppSearchRule
    v-else
    :filter-groups="filterGroups"
    :rule="rule"
    :readonly="readonly"
    :locale="locale"
    @update:rule="$emit('update:rule', $event)"
    @remove="$emit('remove')"
  />
</template>

<script setup lang="ts">
import { type RuleGroup, isRuleGroup } from '@beabee/beabee-common';
import type { BaseLocale } from '@beabee/locale';

import { useI18n } from 'vue-i18n';

import type { SearchRuleEmits, SearchRuleProps } from '../../types/search';
import AppSearchRule from './AppSearchRule.vue';

const { t } = useI18n();

/**
 * Rule or group component that handles both individual rules and nested rule groups.
 * Now uses internal i18n for nested rules messages.
 *
 * @param filterGroups - Available filter groups
 * @param rule - The current rule or rule group
 * @param readonly - Whether the component is in readonly mode
 * @param locale - Locale for date formatting
 */

interface Props extends SearchRuleProps<RuleGroup> {
  locale?: BaseLocale;
}

withDefaults(defineProps<Props>(), {
  readonly: false,
  locale: 'en' as BaseLocale,
});

defineEmits<SearchRuleEmits>();
</script>
