<template>
  <b v-if="readonly">{{ prefix }}{{ readonlyValue }}</b>
  <AppRadioGroup
    v-else-if="item.type === 'boolean'"
    v-model="value"
    :options="[
      [true, t('common.yes')],
      [false, t('common.no')],
    ]"
    inline
    required
  />
  <AppSelect
    v-else-if="item.type === 'enum' || (item.type === 'array' && item.options)"
    v-model="value"
    :items="item.options || []"
    required
  />
  <DateInput
    v-else-if="item.type === 'date'"
    v-model="value"
    relative-placeholder="$now(d:-1)"
  />
  <AppInput
    v-else
    v-model="value"
    :type="
      item.type === 'contact' || item.type === 'array' || item.type === 'blob'
        ? 'text'
        : item.type
    "
    :prefix="prefix"
    required
    hide-error-message
    class="min-w-[10rem]"
  />
</template>

<script setup lang="ts">
import type { RuleValue } from '@beabee/beabee-common';
import { AppInput, AppRadioGroup, AppSelect, formatLocale } from '@beabee/vue';

import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import type { FilterItem } from '../../../type/search';
import DateInput from './DateInput.vue';

const { t } = useI18n();

/**
 * Argument input component for different filter types.
 * Now uses internal i18n for yes/no labels and hardcoded relative date placeholder.
 *
 * @param modelValue - The current value
 * @param item - The filter item configuration
 * @param readonly - Whether the component is in readonly mode
 */

interface Props {
  modelValue: RuleValue;
  item: FilterItem;
  readonly: boolean;
}

interface Emits {
  (event: 'update:modelValue', value: RuleValue): void;
}

const props = defineProps<Props>();

const emit = defineEmits<Emits>();

const value = computed({
  // modelValue has a different type depending on the item.type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get: () => props.modelValue as any,
  set: (modelValue) => emit('update:modelValue', modelValue),
});

const prefix = computed(() =>
  'prefix' in props.item ? props.item.prefix : ''
);

const readonlyValue = computed(() => {
  switch (props.item.type) {
    case 'date': {
      const date = props.modelValue as string;
      if (date.startsWith('$now')) {
        return props.modelValue;
      } else {
        return formatLocale(new Date(date), 'P');
      }
    }
    case 'boolean':
      return props.modelValue === true ? t('common.yes') : t('common.no');

    case 'array':
    case 'enum':
      return (
        props.item.options?.find((opt) => opt.id === props.modelValue)?.label ||
        props.modelValue
      );

    default:
      return props.modelValue;
  }
});
</script>
