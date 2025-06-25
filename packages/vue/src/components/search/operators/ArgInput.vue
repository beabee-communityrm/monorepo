<template>
  <b v-if="readonly">{{ prefix }}{{ readonlyValue }}</b>
  <AppRadioGroup
    v-else-if="item.type === 'boolean'"
    v-model="value"
    :options="[
      [true, labels.yes],
      [false, labels.no],
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
    :relative-placeholder="labels.relativeDatePlaceholder"
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
import type { BaseLocale } from '@beabee/locale';
import { AppInput, AppRadioGroup, AppSelect, formatLocale } from '@beabee/vue';

import { computed } from 'vue';

import type { FilterItem } from '../../../types/search';
import DateInput from './DateInput.vue';

/**
 * Argument input component for different filter types
 * @param modelValue - The current value
 * @param item - The filter item configuration
 * @param readonly - Whether the component is in readonly mode
 * @param labels - Labels for UI text
 * @param locale - Locale for date formatting
 */

interface Props {
  modelValue: RuleValue;
  item: FilterItem;
  readonly: boolean;
  labels: {
    yes: string;
    no: string;
    relativeDatePlaceholder: string;
  };
  locale?: BaseLocale;
}

interface Emits {
  (event: 'update:modelValue', value: RuleValue): void;
}

const props = withDefaults(defineProps<Props>(), {
  locale: 'en' as BaseLocale,
});

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
        return formatLocale(new Date(date), 'P', props.locale);
      }
    }
    case 'boolean':
      return props.modelValue === true ? props.labels.yes : props.labels.no;

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
