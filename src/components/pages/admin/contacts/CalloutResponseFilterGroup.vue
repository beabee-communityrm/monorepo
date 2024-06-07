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
    :readonly="readonly"
    :class="!readonly && 'mt-2 border-l border-primary-20 pl-2'"
    @update:rule="emit('update:rule', $event)"
    @remove="emit('remove')"
  />
</template>
<script lang="ts" setup>
import { ItemStatus, contactCalloutFilters } from '@beabee/beabee-common';
import { computed, onBeforeMount, ref, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';

import AppSelect from '@components/forms/AppSelect.vue';

import { fetchCallout, fetchCallouts } from '@utils/api/callout';

import { type GetCalloutData, type GetCalloutDataWith } from '@type';
import type {
  SearchRuleEmits,
  SearchRuleFilterGroupProps,
} from '@components/search/search.interface';
import { useCalloutResponseFilters } from '../callout-responses.interface';
import AppSearchRuleFilter from '@components/search/AppSearchRuleFilter.vue';
import { withLabel } from '@utils/rules';

const emit = defineEmits<SearchRuleEmits>();
const props = defineProps<SearchRuleFilterGroupProps>();

const { t } = useI18n();

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
    ? await fetchCallout(selectedCalloutId.value, ['form'])
    : undefined;
});

onBeforeMount(async () => {
  // TODO: handle pagination
  callouts.value = (
    await fetchCallouts({
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
