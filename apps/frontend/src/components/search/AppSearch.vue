<template>
  <div class="mb-8">
    <AppExpandableBox
      v-model:expanded="showExpanded"
      :button-icon="faFilter"
      :button-text="t('advancedSearch.button')"
    >
      <template #before><slot /></template>
      <AppSearchForm
        :model-value="modelValue"
        :filter-groups="filterGroups"
        :has-changed="!!hasChanged"
        @update:model-value="emit('update:modelValue', $event)"
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

<script lang="ts" setup>
import type { RuleGroup } from '@beabee/beabee-common';
import { AppExpandableBox } from '@beabee/vue';

import { faFilter } from '@fortawesome/free-solid-svg-icons';
import type { FilterGroups } from '@type';
import { computed, ref, toRef, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import AppSearchForm from './AppSearchForm.vue';
import AppSearchSummary from './AppSearchSummary.vue';

const emit = defineEmits<{
  (e: 'update:modelValue', value: RuleGroup): void;
  (e: 'reset'): void;
}>();
const props = defineProps<{
  filterGroups: FilterGroups;
  modelValue: RuleGroup | undefined;
  hasChanged?: boolean;
}>();

const { t } = useI18n();

const showExpanded = ref(false);

const hasRules = computed(
  () => props.modelValue && props.modelValue.rules.length > 0
);

// Switch back to summary view when rule group changes from outside
watch(toRef(props, 'modelValue'), () => {
  showExpanded.value = false;
});
</script>
