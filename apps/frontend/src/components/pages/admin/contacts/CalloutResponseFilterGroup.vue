<template>
  <span v-if="readonly">
    <b>{{ selectedCallout?.title || '???' }}</b> /
  </span>
  <AppSelect
    v-else
    v-model="selectedCalloutId"
    :placeholder="t('contacts.advancedSearch.selectCallout')"
    :items="calloutItems"
    searchable
  />

  <AppSearchRuleFilter
    v-if="selectedCallout"
    :rule="rule"
    :filter-groups="filterGroupsWithExtras"
    :operator-labels="operatorLabels"
    :labels="labels"
    :readonly="readonly"
    :class="!readonly && 'mt-2 border-l border-primary-20 pl-2'"
    @update:rule="emit('update:rule', $event)"
    @remove="emit('remove')"
  />
</template>
<script lang="ts" setup>
import {
  type GetCalloutData,
  type GetCalloutDataWith,
  ItemStatus,
  contactCalloutFilters,
} from '@beabee/beabee-common';
import { AppSelect } from '@beabee/vue';
import {
  AppSearchRuleFilter,
  type OperatorLabels,
  withLabel,
} from '@beabee/vue';
import type { SearchRuleEmits, SearchRuleFilterGroupProps } from '@beabee/vue';

import { client } from '@utils/api';
import { computed, onBeforeMount, ref, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';

import { useCalloutResponseFilters } from '../callout-responses.interface';

const emit = defineEmits<SearchRuleEmits>();
const props = defineProps<SearchRuleFilterGroupProps>();

const { t } = useI18n();

// Labels for the search components using proper i18n translations
const operatorLabels: OperatorLabels = {
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
};

const labels = {
  selectFilter: t('advancedSearch.selectFilter'),
  yes: t('common.yes'),
  no: t('common.no'),
  relativeDatePlaceholder: '$now(d:-1)',
  and: t('advancedSearch.matchWord.AND'),
  nestedRules: t('advancedSearch.nestedRules'),
  noNestedRules: t('advancedSearch.noNestedRules'),
  matchConditions: {
    AND: t('advancedSearch.matchWord.AND'),
    OR: t('advancedSearch.matchWord.OR'),
  },
};

const callouts = ref<GetCalloutData[]>([]);
const selectedCalloutId = ref('');

const selectedCallout = ref<GetCalloutDataWith<'form'>>();

const calloutItems = computed(() => {
  return callouts.value.map((callout) => ({
    id: callout.id,
    label: callout.title,
  }));
});

const selectedCalloutPrefix = computed(() =>
  selectedCallout.value ? `callouts.${selectedCallout.value.id}.` : ''
);

const { filterGroups } = useCalloutResponseFilters(
  selectedCallout,
  computed(() => `${selectedCalloutPrefix.value}responses.`)
);

const filterGroupsWithExtras = computed(() => [
  {
    ...filterGroups.value[0],
    items: {
      [selectedCalloutPrefix.value + 'hasAnswered']: withLabel(
        contactCalloutFilters.hasAnswered,
        t('contacts.advancedSearch.hasAnswered')
      ),
      ...filterGroups.value[0].items,
    },
  },
  filterGroups.value[1],
]);

// Set the callout ID to the current rule when it changes
watchEffect(() => {
  selectedCalloutId.value = props.rule ? props.rule.field.split('.')[1] : '';
});

// Load the selected callout
watchEffect(async () => {
  selectedCallout.value = selectedCalloutId.value
    ? await client.callout.get(selectedCalloutId.value, ['form'])
    : undefined;
});

onBeforeMount(async () => {
  // TODO: handle pagination
  callouts.value = (
    await client.callout.list({
      rules: {
        condition: 'OR',
        rules: [
          { field: 'status', operator: 'equal', value: [ItemStatus.Open] },
          { field: 'status', operator: 'equal', value: [ItemStatus.Ended] },
        ],
      },
      sort: 'title',
    })
  ).items;
});
</script>
