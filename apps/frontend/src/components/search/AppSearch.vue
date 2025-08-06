<template>
  <div class="mb-8">
    <AppExpandableBox
      v-model:expanded="showExpanded"
      :button-icon="buttonIcon"
      :button-text="t('advancedSearch.button')"
    >
      <template #before><slot /></template>
      <AppSearchForm
        :model-value="modelValue"
        :filter-groups="filterGroups"
        :has-changed="!!hasChanged"
        @update:model-value="emit('update:modelValue', $event)"
        @reset="emit('reset')"
      />
    </AppExpandableBox>

    <div
      v-if="!showExpanded && hasRules && modelValue /* narrow type */"
      class="rounded border border-primary-40 px-4 py-3"
    >
      <AppSearchSummary
        :model-value="modelValue"
        :filter-groups="filterGroups"
        @update:model-value="emit('update:modelValue', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { RuleGroup } from '@beabee/beabee-common';
import { AppExpandableBox } from '@beabee/vue';

import {
  type IconDefinition,
  faFilter,
} from '@fortawesome/free-solid-svg-icons';
import { computed, ref, toRef, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import type { FilterGroups } from '../../type/search';
import AppSearchForm from './AppSearchForm.vue';
import AppSearchSummary from './AppSearchSummary.vue';

const { t } = useI18n();

/**
 * Main search component that provides expandable advanced search functionality.
 * Now uses internal i18n for all labels and operator text.
 *
 * @param filterGroups - Available filter groups
 * @param modelValue - The current rule group
 * @param hasChanged - Whether the search has changes
 * @param buttonIcon - Icon for the advanced search button
 */

interface Props {
  filterGroups: FilterGroups;
  modelValue: RuleGroup | undefined;
  hasChanged?: boolean;
  buttonIcon?: IconDefinition;
}

interface Emits {
  (event: 'update:modelValue', value: RuleGroup): void;
  (event: 'reset'): void;
}

const props = withDefaults(defineProps<Props>(), {
  hasChanged: false,
  buttonIcon: () => faFilter,
});

const emit = defineEmits<Emits>();

const showExpanded = ref(false);

const hasRules = computed(
  () => props.modelValue && props.modelValue.rules.length > 0
);

// Switch back to summary view when rule group changes from outside
watch(toRef(props, 'modelValue'), () => {
  showExpanded.value = false;
});
</script>
