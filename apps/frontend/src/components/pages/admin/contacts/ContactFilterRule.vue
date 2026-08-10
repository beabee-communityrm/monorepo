<!--
  # ContactFilterRule
  A single rule in the contact filter panel: the field it applies to, the
  operator, and the value(s) the operator needs.
-->
<template>
  <div
    class="border-default bg-default flex flex-wrap items-center gap-2 rounded-lg border px-3 py-2.5"
  >
    <UPopover v-model:open="fieldPickerOpen">
      <UButton
        color="neutral"
        variant="ghost"
        trailing-icon="i-lucide-chevron-down"
        class="-ml-2"
      >
        <UBadge v-if="callout" color="neutral" variant="soft">
          {{ callout.title }}
        </UBadge>
        <span class="font-medium">{{ item?.label || rule.field }}</span>
      </UButton>

      <template #content>
        <ContactFilterFieldPicker
          :filter-groups="filterGroups"
          @select="handleSelectField"
        />
      </template>
    </UPopover>

    <template v-if="item">
      <UDropdownMenu :items="operatorMenuItems">
        <UButton
          color="neutral"
          variant="ghost"
          trailing-icon="i-lucide-chevron-down"
        >
          {{ operatorLabel }}
        </UButton>
      </UDropdownMenu>

      <ContactFilterValue
        v-model="value"
        :item="item"
        :operator="rule.operator"
      />
    </template>

    <UButton
      icon="i-lucide-x"
      color="neutral"
      variant="ghost"
      class="hover:text-error ml-auto"
      :aria-label="t('advancedSearch.removeFilter-nuxt')"
      @click="emit('remove')"
    />
  </div>
</template>

<script lang="ts" setup>
import type { Rule, RuleOperator, RuleValue } from '@beabee/beabee-common';

import { operatorsByTypeMap } from '@beabee/beabee-common';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import type { FilterGroups, FilterItem } from '../../../../type/search';
import {
  createNewRule,
  createOperatorLabels,
  getDefaultRuleValue,
} from '../../../../utils/rules';
import {
  buildNullableOperatorItems,
  buildOperatorItems,
} from '../../../../utils/search';
import ContactFilterFieldPicker from './ContactFilterFieldPicker.vue';
import ContactFilterValue from './ContactFilterValue.vue';
import {
  findFilterItem,
  getCalloutIdFromField,
  useCalloutContactFilters,
} from './contacts.interface';

const { t } = useI18n();

const props = defineProps<{
  rule: Rule;
  /** The field groups to pick from, excluding the crowdNewsroom group */
  filterGroups: FilterGroups;
}>();

const emit = defineEmits<{
  (event: 'update:rule', rule: Rule): void;
  (event: 'remove'): void;
}>();

const fieldPickerOpen = ref(false);

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

const value = computed({
  get: () => props.rule.value,
  set: (value: RuleValue[]) => emit('update:rule', { ...props.rule, value }),
});

const operatorLabels = computed(() => createOperatorLabels(t));

const operators = computed(() => {
  if (!item.value) return [];

  const items = [
    ...buildOperatorItems(operatorLabels.value)[item.value.type],
    ...(item.value.nullable
      ? buildNullableOperatorItems(operatorLabels.value)
      : []),
  ];
  // `array` fields already include the empty operators, so drop the duplicates
  return items.filter(
    (operator, i) => items.findIndex((o) => o.id === operator.id) === i
  );
});

const operatorLabel = computed(
  () =>
    operators.value.find((o) => o.id === props.rule.operator)?.label ||
    props.rule.operator
);

const isBlankOperator = (operator: RuleOperator) =>
  operator === 'is_empty' || operator === 'is_not_empty';

const operatorMenuItems = computed(() => {
  const toMenu = (
    operators: { id: RuleOperator; label: string }[],
    groupLabel?: string
  ) =>
    operators.length
      ? [
          ...(groupLabel
            ? [{ label: groupLabel, type: 'label' as const }]
            : []),
          ...operators.map((operator) => ({
            label: operator.label,
            onSelect: () => changeOperator(operator.id),
          })),
        ]
      : [];

  return [
    toMenu(
      operators.value.filter(
        (o) => !o.id.startsWith('not_') && !isBlankOperator(o.id)
      )
    ),
    toMenu(
      operators.value.filter((o) => o.id.startsWith('not_')),
      t('advancedSearch.operatorGroup-nuxt.not')
    ),
    toMenu(
      operators.value.filter((o) => isBlankOperator(o.id)),
      t('advancedSearch.operatorGroup-nuxt.blank')
    ),
  ].filter((group) => group.length);
});

/** Keeps the operator and value when the new field holds the same type */
function handleSelectField(field: string, newItem: FilterItem) {
  fieldPickerOpen.value = false;
  emit(
    'update:rule',
    item.value?.type === newItem.type
      ? { ...props.rule, field }
      : createNewRule(field, newItem.type)
  );
}

function changeOperator(operator: RuleOperator) {
  if (!item.value) return;

  const typeOperators = operatorsByTypeMap[item.value.type];
  const newArgs = typeOperators[operator]?.args || 0;
  const oldArgs = typeOperators[props.rule.operator]?.args || 0;

  emit('update:rule', {
    field: props.rule.field,
    operator,
    value:
      newArgs === oldArgs
        ? props.rule.value
        : new Array(newArgs).fill(getDefaultRuleValue(item.value.type)),
  });
}
</script>
