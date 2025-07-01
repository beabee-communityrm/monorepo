<template>
  <AppSearchRuleFilter
    v-if="readonly"
    :rule="rule"
    :filter-groups="filterGroups"
    :operator-labels="operatorLabels"
    :locale="locale"
    readonly
    @remove="emit('remove')"
  />
  <div v-else class="flex items-center gap-2">
    <button
      class="-ml-2 p-2 leading-tight text-primary-80 hover:text-primary"
      type="button"
      @click="emit('remove')"
    >
      <font-awesome-icon :icon="faTimes" />
    </button>
    <AppSearchRuleFilter
      class="flex-1"
      :rule="rule"
      :filter-groups="filterGroups"
      :operator-labels="operatorLabels"
      :locale="locale"
      @update:rule="emit('update:rule', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import type { BaseLocale } from '@beabee/locale';

import { faTimes } from '@fortawesome/free-solid-svg-icons';

import type {
  OperatorLabels,
  SearchRuleEmits,
  SearchRuleProps,
} from '../../types/search';
import AppSearchRuleFilter from './AppSearchRuleFilter.vue';

/**
 * Search rule component that wraps rule filter with remove functionality.
 * Now simplified since child components handle their own i18n internally.
 *
 * @param filterGroups - Available filter groups
 * @param rule - The current rule
 * @param readonly - Whether the component is in readonly mode
 * @param operatorLabels - Labels for operators
 * @param locale - Locale for date formatting
 */

interface Props extends SearchRuleProps {
  operatorLabels: OperatorLabels;
  locale?: BaseLocale;
}

withDefaults(defineProps<Props>(), {
  readonly: false,
  locale: 'en' as BaseLocale,
});

const emit = defineEmits<SearchRuleEmits>();
</script>
