<!--
  # ContactFilterChip
  Read-only summary of one applied contact filter rule, with a button to
  remove it.
-->
<template>
  <span
    class="border-default bg-default flex items-center gap-1.5 rounded-full border py-1 pr-1 pl-3"
  >
    <span>
      <b class="font-semibold">
        <template v-if="callout">{{ callout.title }} · </template>
        {{ item?.label || rule.field }}
      </b>
      {{ operatorLabel }}
      <template v-if="valueLabels.length">
        {{ valueLabels.join(` ${t('advancedSearch.matchWord.AND')} `) }}
      </template>
    </span>
    <UButton
      icon="i-lucide-x"
      color="neutral"
      variant="ghost"
      size="xs"
      :aria-label="t('advancedSearch.removeFilter-nuxt')"
      @click="emit('remove')"
    />
  </span>
</template>

<script lang="ts" setup>
import type { Rule, RuleValue } from '@beabee/beabee-common';
import { formatLocale } from '@beabee/vue';

import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import type { FilterGroups, FilterItem } from '../../../../type/search';
import { createOperatorLabels } from '../../../../utils/rules';
import { buildOperatorItems } from '../../../../utils/search';
import {
  findFilterItem,
  getCalloutIdFromField,
  useCalloutContactFilters,
} from './contacts.interface';

const { t } = useI18n();

const props = defineProps<{
  rule: Rule;
  /** All available filter groups, including the crowdNewsroom group */
  filterGroups: FilterGroups;
}>();

const emit = defineEmits<{ (event: 'remove'): void }>();

const calloutId = computed(() => getCalloutIdFromField(props.rule.field));

const {
  callout,
  participationItems,
  groups: calloutGroups,
} = useCalloutContactFilters(calloutId);

const item = computed(
  () =>
    findFilterItem(props.filterGroups, props.rule.field) ||
    participationItems.value[props.rule.field] ||
    findFilterItem(calloutGroups.value, props.rule.field)
);

const operatorLabels = computed(() => createOperatorLabels(t));

const operatorLabel = computed(() => {
  if (!item.value) return props.rule.operator;
  const operators = buildOperatorItems(operatorLabels.value)[item.value.type];
  return (
    operators.find((o) => o.id === props.rule.operator)?.label ||
    operatorLabels.value.all[props.rule.operator] ||
    props.rule.operator
  );
});

const valueLabels = computed(() =>
  item.value ? props.rule.value.map((v) => formatValue(item.value!, v)) : []
);

function formatValue(item: FilterItem, value: RuleValue): string {
  switch (item.type) {
    case 'date': {
      const date = String(value);
      return date.startsWith('$now') ? date : formatLocale(new Date(date), 'P');
    }
    case 'boolean':
      return value === true ? t('common.yes') : t('common.no');
    case 'enum':
    case 'array':
      return (
        item.options?.find((option) => option.id === value)?.label ||
        String(value)
      );
    default:
      return `${'prefix' in item ? (item.prefix ?? '') : ''}${value}`;
  }
}
</script>
