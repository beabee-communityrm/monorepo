<template>
  <AppSearch
    :model-value="modelValue"
    :filter-groups="filterGroups"
    :has-changed="hasChanged"
    :button-icon="faFilter"
    @update:model-value="emit('update:modelValue', $event)"
    @reset="emit('reset')"
  >
    <slot />
  </AppSearch>
</template>

<script lang="ts" setup>
import type { RuleGroup } from '@beabee/beabee-common';

import { faFilter } from '@fortawesome/free-solid-svg-icons';

import type { FilterGroups } from '../../type/search';
import AppSearch from './VueAppSearch.vue';

const emit = defineEmits<{
  (e: 'update:modelValue', value: RuleGroup): void;
  (e: 'reset'): void;
}>();
defineProps<{
  filterGroups: FilterGroups;
  modelValue: RuleGroup | undefined;
  hasChanged?: boolean;
}>();
</script>
