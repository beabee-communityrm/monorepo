<template>
  <div class="mb-8">
    <AppExpandableBox
      v-model:expanded="showExpanded"
      :button-icon="buttonIcon"
      :button-text="labels.advancedSearchButton"
    >
      <template #before><slot /></template>
      <AppSearchForm
        :model-value="modelValue"
        :filter-groups="filterGroups"
        :has-changed="!!hasChanged"
        :operator-labels="operatorLabels"
        :labels="labels"
        :locale="locale"
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
        :operator-labels="operatorLabels"
        :labels="labels"
        :locale="locale"
        @update:model-value="emit('update:modelValue', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { RuleGroup } from '@beabee/beabee-common';
import type { BaseLocale } from '@beabee/locale';
import { AppExpandableBox } from '@beabee/vue';

import { computed, ref, toRef, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import type { FilterGroups, OperatorLabels } from '../../types/search';
import AppSearchForm from './AppSearchForm.vue';
import AppSearchSummary from './AppSearchSummary.vue';

/**
 * Main search component that provides expandable advanced search functionality
 * @param filterGroups - Available filter groups
 * @param modelValue - The current rule group
 * @param hasChanged - Whether the search has changes
 * @param locale - Locale for date formatting
 * @param buttonIcon - Icon for the advanced search button
 */

interface Props {
  filterGroups: FilterGroups;
  modelValue: RuleGroup | undefined;
  hasChanged?: boolean;
  locale?: BaseLocale;
  buttonIcon?: any;
}

interface Emits {
  (event: 'update:modelValue', value: RuleGroup): void;
  (event: 'reset'): void;
}

const props = withDefaults(defineProps<Props>(), {
  hasChanged: false,
  locale: 'en' as BaseLocale,
  buttonIcon: undefined,
});

const emit = defineEmits<Emits>();
const { t } = useI18n();

const operatorLabels = computed<OperatorLabels>(() => ({
  text: {
    equal: t('advancedSearch.operators.text.equal'),
    not_equal: t('advancedSearch.operators.text.not_equal'),
    contains: t('advancedSearch.operators.text.contains'),
    not_contains: t('advancedSearch.operators.text.not_contains'),
    begins_with: t('advancedSearch.operators.text.begins_with'),
    not_begins_with: t('advancedSearch.operators.text.not_begins_with'),
    ends_with: t('advancedSearch.operators.text.ends_with'),
    not_ends_with: t('advancedSearch.operators.text.not_ends_with'),
  },
  blob: {
    contains: t('advancedSearch.operators.blob.contains'),
    not_contains: t('advancedSearch.operators.blob.not_contains'),
  },
  number: {
    equal: t('advancedSearch.operators.number.equal'),
    not_equal: t('advancedSearch.operators.number.not_equal'),
    less: t('advancedSearch.operators.number.less'),
    less_or_equal: t('advancedSearch.operators.number.less_or_equal'),
    greater: t('advancedSearch.operators.number.greater'),
    greater_or_equal: t('advancedSearch.operators.number.greater_or_equal'),
    between: t('advancedSearch.operators.number.between'),
    not_between: t('advancedSearch.operators.number.not_between'),
  },
  enum: {
    equal: t('advancedSearch.operators.enum.equal'),
    not_equal: t('advancedSearch.operators.enum.not_equal'),
  },
  boolean: {
    equal: t('advancedSearch.operators.boolean.equal'),
  },
  contact: {
    equal: t('advancedSearch.operators.contact.equal'),
    not_equal: t('advancedSearch.operators.contact.not_equal'),
    contains: t('advancedSearch.operators.contact.contains'),
    not_contains: t('advancedSearch.operators.contact.not_contains'),
    begins_with: t('advancedSearch.operators.contact.begins_with'),
    not_begins_with: t('advancedSearch.operators.contact.not_begins_with'),
    ends_with: t('advancedSearch.operators.contact.ends_with'),
    not_ends_with: t('advancedSearch.operators.contact.not_ends_with'),
  },
  date: {
    equal: t('advancedSearch.operators.date.equal'),
    not_equal: t('advancedSearch.operators.date.not_equal'),
    less: t('advancedSearch.operators.date.less'),
    less_or_equal: t('advancedSearch.operators.date.less_or_equal'),
    greater: t('advancedSearch.operators.date.greater'),
    greater_or_equal: t('advancedSearch.operators.date.greater_or_equal'),
    between: t('advancedSearch.operators.date.between'),
    not_between: t('advancedSearch.operators.date.not_between'),
  },
  array: {
    contains: t('advancedSearch.operators.array.contains'),
    not_contains: t('advancedSearch.operators.array.not_contains'),
  },
  all: {
    is_empty: t('advancedSearch.operators.all.is_empty'),
    is_not_empty: t('advancedSearch.operators.all.is_not_empty'),
  },
}));

const labels = computed(() => ({
  advancedSearchButton: t('advancedSearch.button'),
  createFiltersBefore: t('advancedSearch.createFiltersBefore'),
  createFiltersAfter: t('advancedSearch.createFiltersAfter'),
  conditionTypes: {
    all: t('advancedSearch.createFiltersType.all'),
    any: t('advancedSearch.createFiltersType.any'),
  },
  matchConditions: {
    AND: t('advancedSearch.matchWord.AND'),
    OR: t('advancedSearch.matchWord.OR'),
  },
  addRule: t('advancedSearch.addRule'),
  search: t('actions.search'),
  reset: t('actions.reset'),
  selectFilter: t('advancedSearch.selectFilter'),
  yes: t('common.yes'),
  no: t('common.no'),
  relativeDatePlaceholder: '$now(d:-1)',
  and: t('advancedSearch.matchWord.AND'),
  nestedRules: t('advancedSearch.nestedRules'),
  noNestedRules: t('advancedSearch.noNestedRules'),
}));

const showExpanded = ref(false);

const hasRules = computed(
  () => props.modelValue && props.modelValue.rules.length > 0
);

// Switch back to summary view when rule group changes from outside
watch(toRef(props, 'modelValue'), () => {
  showExpanded.value = false;
});
</script>
