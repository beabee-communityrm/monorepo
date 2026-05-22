<template>
  <template v-if="readonly">
    <template v-if="rule && ruleFilterItem">
      <b>{{ ruleFilterItem.label }}</b>
      {{ getOperatorLabel(ruleFilterItem.type, rule.operator) }}
      <AppSearchRuleFilterGroupItem
        :rule="rule"
        :item="ruleFilterItem"
        readonly
      />
      <button type="button" class="-mr-2 px-2" @click="emit('remove')">
        <font-awesome-icon :icon="faTimes" />
      </button>
    </template>
    <template v-else>
      <p class="text-sm font-semibold text-danger">
        {{ t('advancedSearch.invalidRuleError', { rule: rule }) }}
      </p>
    </template>
  </template>

  <div v-else class="flex items-center gap-2">
    <AppSelect
      :model-value="rule?.field || ''"
      :placeholder="t('advancedSearch.selectFilter')"
      :items="filterItems"
      required
      class="basis-2/5"
      @update:model-value="changeRule"
    />
    <template v-if="rule && ruleFilterItem">
      <AppSelect
        v-if="filterOperatorItems.length > 1"
        :model-value="rule.operator"
        :items="filterOperatorItems"
        required
        class="basis-[200px]"
        @update:model-value="changeOperator($event)"
      />
      <span v-else>{{ filterOperatorItems[0].label }}</span>
      <div class="flex-1">
        <AppSearchRuleFilterGroupItem :rule="rule" :item="ruleFilterItem" />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { type RuleOperator, operatorsByTypeMap } from '@beabee/beabee-common';
import { AppSelect } from '@beabee/vue';

import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import type {
  SearchRuleEmits,
  SearchRuleFilterGroupProps,
} from '../../type/search';
import {
  createNewRule,
  createOperatorLabels,
  getDefaultRuleValue,
} from '../../utils/rules';
import {
  buildNullableOperatorItems,
  buildOperatorItems,
} from '../../utils/search';
import AppSearchRuleFilterGroupItem from './AppSearchRuleFilterGroupItem.vue';

const { t } = useI18n();

const props = withDefaults(defineProps<SearchRuleFilterGroupProps>(), {
  readonly: false,
});

const emit = defineEmits<SearchRuleEmits>();

// Create operator labels using internal i18n
const operatorLabels = computed(() => createOperatorLabels(t));

const operatorItems = computed(() => buildOperatorItems(operatorLabels.value));
const nullableOperatorItems = computed(() =>
  buildNullableOperatorItems(operatorLabels.value)
);

const ruleFilterItem = computed(() => {
  return props.rule ? props.filterGroup.items[props.rule.field] : undefined;
});

const filterItems = computed(() => {
  return Object.entries(props.filterGroup.items).map(([id, item]) => ({
    id,
    label: item.label,
  }));
});

const filterOperatorItems = computed(() => {
  const item = ruleFilterItem.value;
  // Shouldn't be possible as rule must be selected first
  if (!item) return [];

  return [
    ...operatorItems.value[item.type],
    ...(item.nullable ? nullableOperatorItems.value : []),
  ];
});

function getOperatorLabel(type: string, operator: RuleOperator): string {
  let labelType = type;
  if (operator === 'is_empty' || operator === 'is_not_empty') {
    labelType = 'all';
  }
  if (labelType === 'contact') {
    labelType = 'text';
  }

  return (
    operatorLabels.value[labelType as keyof typeof operatorLabels.value]?.[
      operator
    ] || operator
  );
}

function changeRule(id: string) {
  const type = props.filterGroup.items[id].type;
  emit('update:rule', createNewRule(id, type));
}

function changeOperator(operator: RuleOperator) {
  // Shouldn't be possible as rule must be selected first
  if (!props.rule) return;

  const type = props.filterGroup.items[props.rule.field].type;
  const oldOperator = props.rule.operator;
  const typeOperators = operatorsByTypeMap[type];
  const newArgs = (operator && typeOperators[operator]?.args) || 0;
  const oldArgs = (oldOperator && typeOperators[oldOperator]?.args) || 0;

  emit('update:rule', {
    field: props.rule.field,
    operator,
    value:
      newArgs === oldArgs
        ? props.rule.value
        : new Array(newArgs).fill(getDefaultRuleValue(type)),
  });
}
</script>
