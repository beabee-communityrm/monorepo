<!--
  # ContactFilterChip
  Read-only summary of one applied contact filter rule, with a button to
  remove it. A nested rule group can't be summarised, so it's just labelled.
-->
<template>
  <span
    class="flex items-center gap-1.5 rounded-full border border-default bg-default py-1 pr-1 pl-3"
  >
    <span v-if="!simpleRule">{{ t('advancedSearch.nestedRules-nuxt') }}</span>
    <span v-else-if="isBroken" class="text-error">
      {{ t('advancedSearch.invalidRuleError', { rule: field }) }}
    </span>
    <span v-else>
      <b class="font-semibold">
        <template v-if="callout">{{ callout.title }} · </template>
        {{ item?.label || simpleRule.field }}
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
import type { Rule, RuleGroup, RuleValue } from '@beabee/beabee-common';
import { formatLocale } from '@beabee/vue';

import { isRuleGroup } from '@beabee/beabee-common';

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
  rule: Rule | RuleGroup;
  /** All available filter groups, including the crowdNewsroom group */
  filterGroups: FilterGroups;
}>();

const emit = defineEmits<{ (event: 'remove'): void }>();

const simpleRule = computed(() =>
  isRuleGroup(props.rule) ? undefined : props.rule
);
const field = computed(() => simpleRule.value?.field ?? '');
const operator = computed(() => simpleRule.value?.operator ?? '');

const calloutId = computed(() => getCalloutIdFromField(field.value));

const {
  callout,
  participationItems,
  groups: calloutGroups,
} = useCalloutContactFilters(calloutId);

const item = computed(
  () =>
    findFilterItem(props.filterGroups, field.value) ||
    participationItems.value[field.value] ||
    findFilterItem(calloutGroups.value, field.value)
);

/** The field no longer exists, e.g. a deleted CrowdNewsroom question */
const isBroken = computed(
  () => !item.value && (!calloutId.value || !!callout.value)
);

const operatorLabels = computed(() => createOperatorLabels(t));

const operatorLabel = computed(() => {
  if (!item.value) return operator.value;
  const operators = buildOperatorItems(operatorLabels.value)[item.value.type];
  return (
    operators.find((o) => o.id === operator.value)?.label ||
    operatorLabels.value.all[operator.value] ||
    operator.value
  );
});

const valueLabels = computed(() =>
  item.value && simpleRule.value
    ? simpleRule.value.value.map((v) => formatValue(item.value!, v))
    : []
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
