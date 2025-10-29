<template>
  <div>
    <AppLabel v-if="label" :label="label" :required="required" />
    <p v-if="description" class="mb-2 text-sm">
      {{ description }}
    </p>
    <VueMultiselect
      :model-value="props.items.find((i) => i.id === props.modelValue)"
      :disabled="disabled"
      :allow-empty="!required"
      :options="items"
      track-by="id"
      label="label"
      :searchable="searchable"
      :show-labels="false"
      :show-pointer="false"
      :placeholder="placeholder"
      @update:model-value="emit('update:modelValue', $event.id)"
    />
    <AppInputError v-if="hasError" :message="validation.$errors[0].$message" />
    <AppInputHelp v-if="infoMessage" :message="infoMessage" />
  </div>
</template>

<script lang="ts" setup generic="T extends string | number">
import useVuelidate from '@vuelidate/core';
import { computed, toRef } from 'vue';
import VueMultiselect from 'vue-multiselect';

import type { SelectItem } from '../../types';
import AppInputError from './AppInputError.vue';
import AppInputHelp from './AppInputHelp.vue';
import AppLabel from './AppLabel.vue';

/**
 * Props for the AppSelect component
 */
export interface AppSelectProps<T extends string | number> {
  /** The label to display */
  label?: string;
  /** The model value of the select */
  modelValue?: T;
  /** The items to display in the select */
  items: SelectItem<T>[];
  /** Whether the select is searchable */
  searchable?: boolean;
  /** The placeholder text for the select */
  placeholder?: string;
  /** Whether the select is disabled */
  disabled?: boolean;
  /** Whether the select is required */
  required?: boolean;
  /** The info message to display */
  infoMessage?: string;
  /** The description to display */
  description?: string;
}

const emit = defineEmits<(e: 'update:modelValue', value: T) => void>();
const props = defineProps<AppSelectProps<T>>();

const isValidOption = (value: T) => {
  return props.items.some((i) => i.id === value) || !(props.required && !value);
};
const rules = computed(() => ({
  v: { isValidOption },
}));

const validation = useVuelidate(rules, { v: toRef(props, 'modelValue') });
const hasError = computed(() => validation.value.$errors.length > 0);
</script>
