<template>
  <span v-if="readonly">
    <component
      :is="selectedFilterGroup.custom || AppSearchRuleFilterGroup"
      v-if="selectedFilterGroup"
      :filter-group="selectedFilterGroup"
      :rule="rule"
      :locale="locale"
      readonly
      @remove="emit('remove')"
    />
  </span>
  <div v-else>
    <div v-if="filterGroups.length > 1" class="-mx-2 mb-2">
      <AppToggle v-model="selectedFilterGroupId" :items="filterGroups" />
    </div>

    <component
      :is="selectedFilterGroup.custom || AppSearchRuleFilterGroup"
      v-if="selectedFilterGroup"
      :filter-group="selectedFilterGroup"
      :rule="rule"
      :locale="locale"
      @update:rule="emit('update:rule', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import type { BaseLocale } from '@beabee/locale';
import { AppToggle } from '@beabee/vue';

import { computed, ref, watchEffect } from 'vue';

import type { SearchRuleEmits, SearchRuleProps } from '../../types/search';
import AppSearchRuleFilterGroup from './AppSearchRuleFilterGroup.vue';

/**
 * Rule filter component that handles filter group selection and custom components.
 * Now uses internal i18n for all labels and operator text.
 *
 * @param filterGroups - Available filter groups
 * @param rule - The current rule
 * @param readonly - Whether the component is in readonly mode
 * @param locale - Locale for date formatting
 */

interface Props extends SearchRuleProps {
  locale?: BaseLocale;
}

const props = withDefaults(defineProps<Props>(), {
  readonly: false,
  locale: 'en' as BaseLocale,
});

const emit = defineEmits<SearchRuleEmits>();

const selectedFilterGroupId = ref('');

const selectedFilterGroup = computed(() => {
  return props.filterGroups.find((g) => g.id === selectedFilterGroupId.value);
});

// Select the group of the current rule, or the first group
watchEffect(() => {
  let groupId = props.filterGroups[0].id;

  if (props.rule) {
    for (const group of props.filterGroups) {
      if (
        group.items[props.rule.field] ||
        group.itemsMatch?.test(props.rule.field)
      ) {
        groupId = group.id;
        break;
      }
    }
  }

  selectedFilterGroupId.value = groupId;
});
</script>
