<template>
  <AppSearch
    :model-value="modelValue"
    :filter-groups="filterGroups"
    :has-changed="hasChanged"
    :operator-labels="operatorLabels"
    :labels="labels"
    :button-icon="faFilter"
    @update:model-value="emit('update:modelValue', $event)"
    @reset="emit('reset')"
  >
    <slot />
  </AppSearch>
</template>

<script lang="ts" setup>
import type { RuleGroup } from '@beabee/beabee-common';
import { AppSearch, type OperatorLabels } from '@beabee/vue';
import type { FilterGroups } from '@beabee/vue';

import { faFilter } from '@fortawesome/free-solid-svg-icons';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const emit = defineEmits<{
  (e: 'update:modelValue', value: RuleGroup): void;
  (e: 'reset'): void;
}>();
defineProps<{
  filterGroups: FilterGroups;
  modelValue: RuleGroup | undefined;
  hasChanged?: boolean;
}>();

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
</script>
