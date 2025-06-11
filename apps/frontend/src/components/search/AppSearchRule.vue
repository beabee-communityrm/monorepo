<template>
  <AppSearchRuleFilter
    v-if="readonly"
    :rule="rule"
    :filter-groups="filterGroups"
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
      @update:rule="emit('update:rule', $event)"
    />
  </div>
</template>
<script lang="ts" setup>
import { faTimes } from '@fortawesome/free-solid-svg-icons';

import AppSearchRuleFilter from './AppSearchRuleFilter.vue';
import type { SearchRuleEmits, SearchRuleProps } from './search.interface';

const emit = defineEmits<SearchRuleEmits>();
defineProps<SearchRuleProps>();
</script>
