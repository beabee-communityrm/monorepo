<!--
  # ContactFilterValue
  Value input(s) for a contact filter rule, rendered for the field type and the
  number of arguments the operator takes (none, one, or a range).
-->
<template>
  <template v-for="(_, i) in argCount" :key="i">
    <span v-if="i > 0" class="text-muted">
      {{ t('advancedSearch.matchWord.AND') }}
    </span>

    <UButtonGroup v-if="item.type === 'boolean'">
      <UButton
        v-for="option in booleanOptions"
        :key="String(option.value)"
        :color="value[i] === option.value ? 'primary' : 'neutral'"
        :variant="value[i] === option.value ? 'subtle' : 'outline'"
        :aria-pressed="value[i] === option.value"
        @click="setValue(i, option.value)"
      >
        {{ option.label }}
      </UButton>
    </UButtonGroup>

    <USelect
      v-else-if="selectItems"
      :model-value="String(value[i] ?? '')"
      :items="selectItems"
      variant="subtle"
      class="w-44"
      @update:model-value="setValue(i, $event)"
    />

    <ContactFilterDateInput
      v-else-if="item.type === 'date'"
      :model-value="String(value[i] ?? '')"
      @update:model-value="setValue(i, $event)"
    />

    <UInput
      v-else
      :model-value="String(value[i] ?? '')"
      :type="item.type === 'number' ? 'number' : 'text'"
      :placeholder="item.label.toLowerCase()"
      variant="subtle"
      class="w-44"
      @update:model-value="
        (input: string | number) =>
          setValue(i, item.type === 'number' ? Number(input) : input)
      "
    >
      <template v-if="prefix" #leading>
        <span class="text-muted">{{ prefix }}</span>
      </template>
    </UInput>
  </template>
</template>

<script lang="ts" setup>
import type { RuleOperator, RuleValue } from '@beabee/beabee-common';

import { operatorsByTypeMap } from '@beabee/beabee-common';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import type { FilterItem } from '../../../../type/search';
import ContactFilterDateInput from './ContactFilterDateInput.vue';

const { t } = useI18n();

const props = defineProps<{
  /** The filter item the rule is built on */
  item: FilterItem;
  /** The rule's current operator, which decides how many values are needed */
  operator: RuleOperator;
}>();

const value = defineModel<RuleValue[]>({ required: true });

const argCount = computed(
  () => operatorsByTypeMap[props.item.type][props.operator]?.args ?? 0
);

const booleanOptions = computed(() => [
  { value: true, label: t('common.yes') },
  { value: false, label: t('common.no') },
]);

const selectItems = computed(() =>
  'options' in props.item && props.item.options?.length
    ? props.item.options.map((option) => ({
        label: option.label,
        value: option.id,
      }))
    : undefined
);

const prefix = computed(() =>
  'prefix' in props.item ? props.item.prefix : undefined
);

function setValue(index: number, newValue: RuleValue) {
  value.value = value.value.map((v, i) => (i === index ? newValue : v));
}
</script>
