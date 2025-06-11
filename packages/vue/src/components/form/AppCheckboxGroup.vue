<template>
  <div>
    <AppLabel v-if="label" :label="label" :required="required" />
    <p v-if="description" class="mb-3 text-sm">
      {{ description }}
    </p>
    <AppCheckbox
      v-for="option in options"
      :key="option.id"
      :model-value="modelValue.includes(option.id)"
      :label="option.label"
      class="!font-normal"
      @update:model-value="handleUpdate(option.id, $event)"
    />
  </div>
</template>
<script lang="ts" setup generic="T extends string | number">
import useVuelidate from '@vuelidate/core';
import { minValue } from '@vuelidate/validators';
import { computed } from 'vue';

import type { SelectItem } from '../../types/form.interface';
import AppCheckbox from './AppCheckbox.vue';
import AppLabel from './AppLabel.vue';

export interface AppCheckboxGroupProps<T extends string | number> {
  /** The model value of the checkbox group */
  modelValue: T[];
  /** The options for the checkbox group */
  options: SelectItem<T>[];
  /** The label of the checkbox group */
  label?: string;
  /** The description of the checkbox group */
  description?: string;
  /** Whether the checkbox group is inline */
  inline?: boolean;
  /** Whether the checkbox group is required */
  required?: boolean;
}

const emit = defineEmits<(e: 'update:modelValue', value: T[]) => void>();
const props = defineProps<AppCheckboxGroupProps<T>>();

const minRequired = computed(() => (props.required ? 1 : 0));

useVuelidate(
  { v: { min: minValue(minRequired) } },
  { v: computed(() => props.modelValue.length) }
);

function handleUpdate(value: T, checked: boolean) {
  if (checked && props.modelValue.includes(value)) return;

  const newModelValue = checked
    ? [...props.modelValue, value]
    : props.modelValue.filter((v) => v !== value);
  emit('update:modelValue', newModelValue);
}
</script>
