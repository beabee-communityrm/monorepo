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
    @update:rule="$emit('update:rule', $event)"
    @remove="$emit('remove')"
  />
</template>
<script lang="ts" setup>
import { isRuleGroup, type RuleGroup } from '@beabee/beabee-common';
import { useI18n } from 'vue-i18n';
import AppSearchRule from './AppSearchRule.vue';

import type { SearchRuleEmits, SearchRuleProps } from './search.interface';

defineEmits<SearchRuleEmits>();
defineProps<SearchRuleProps<RuleGroup>>();

const { t } = useI18n();
</script>
