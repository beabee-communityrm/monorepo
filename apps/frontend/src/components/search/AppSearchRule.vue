<template>
  <template v-if="readonly">
    <template v-if="rule">
      <b>{{ filterItems[rule.field].label }}</b>
      {{ operatorT(filterItems[rule.field].type, rule.operator) }}
      <AppSearchRuleValue
        :rule="rule"
        :item="filterItems[rule.field]"
        readonly
      />
      <button type="button" class="-mr-2 px-2" @click="emit('remove')">
        <font-awesome-icon :icon="faTimes" />
      </button>
    </template>
  </template>
  <div v-else class="flex items-center gap-2">
    <button
      class="-ml-2 p-2 leading-tight text-primary-80 hover:text-primary"
      type="button"
      @click="emit('remove')"
    >
      <font-awesome-icon :icon="faTimes" />
    </button>
    <AppSelect
      :model-value="rule?.field || ''"
      :items="filterGroupsWithDefault"
      required
      @update:model-value="changeRule"
    />
    <template v-if="rule">
      <AppSelect
        v-if="filterOperatorItems.length > 1"
        :model-value="rule.operator"
        :items="filterOperatorItems"
        required
        @update:model-value="changeOperator($event)"
      />
      <span v-else>{{ filterOperatorItems[0].label }}</span>
      <AppSearchRuleValue :rule="rule" :item="filterItems[rule.field]" />
    </template>
  </div>
</template>
<script lang="ts" setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import AppSelect from '../forms/AppSelect.vue';
import {
  type FilterType,
  nullableOperators,
  operatorsByTypeMap,
  type Rule,
  type RuleOperator,
} from '@beabee/beabee-common';
import AppSearchRuleValue from './AppSearchRuleValue.vue';
import {
  createNewRule,
  type FilterGroup,
  type FilterItems,
  getDefaultValue,
} from './search.interface';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

const emit = defineEmits(['update:rule', 'remove']);
const props = defineProps<{
  filterGroups: FilterGroup[];
  filterItems: FilterItems;
  rule: Rule | null;
  readonly?: boolean;
}>();

const { t } = useI18n();

function operatorT(type: FilterType | 'all', operator: RuleOperator) {
  // TODO: move translations to search.interface.ts
  if (operator === 'is_empty' || operator === 'is_not_empty') {
    type = 'all';
  }
  if (type === 'contact') {
    type = 'text';
  }

  return t(`advancedSearch.operators.${type}.${operator}`);
}

const filterGroupsWithDefault = computed(() => [
  {
    id: '',
    label: t('advancedSearch.selectFilter'),
  },
  ...props.filterGroups.map((group) => ({
    label: group.label,
    items: group.items.map((id) => ({
      id,
      label: props.filterItems[id].label,
    })),
  })),
]);

const operatorItems = Object.fromEntries(
  Object.entries(operatorsByTypeMap).map(([type, typeOperators]) => [
    type,
    Object.entries(typeOperators).map(([operator]) => ({
      id: operator,
      label: operatorT(type as FilterType, operator as RuleOperator),
    })),
  ])
);

const nullableOperatorItems = Object.entries(nullableOperators).map(
  ([operator]) => ({
    id: operator,
    label: operatorT('all', operator as RuleOperator),
  })
);

const filterOperatorItems = computed(() => {
  // Shouldn't be possible as rule must be selected first
  if (!props.rule) return [];

  const args = props.filterItems[props.rule.field];
  return [
    ...operatorItems[args.type],
    ...(args.nullable ? nullableOperatorItems : []),
  ];
});

function changeRule(id: string) {
  const type = props.filterItems[id].type;
  emit('update:rule', createNewRule(id, type));
}

function changeOperator(operator: RuleOperator) {
  // Shouldn't be possible as rule must be selected first
  if (!props.rule) return;

  const type = props.filterItems[props.rule.field].type;
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
        : new Array(newArgs).fill(getDefaultValue(type)),
  });
}
</script>
