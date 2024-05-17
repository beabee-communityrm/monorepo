<template>
  <div>
    <AppLabel v-if="label" :label="label" :required="required" />
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
<script lang="ts" setup>
import { computed } from 'vue';
import AppCheckbox from './AppCheckbox.vue';
import AppLabel from './AppLabel.vue';
import useVuelidate from '@vuelidate/core';
import { minValue } from '@vuelidate/validators';
import type { SelectItem } from './form.interface';

const emit =
  defineEmits<(e: 'update:modelValue', value: (string | number)[]) => void>();
const props = defineProps<{
  modelValue: (string | number)[];
  options: SelectItem[];
  label?: string;
  inline?: boolean;
  required?: boolean;
}>();

const minRequired = computed(() => (props.required ? 1 : 0));

useVuelidate(
  { v: { min: minValue(minRequired) } },
  { v: computed(() => props.modelValue.length) }
);

function handleUpdate(value: string | number, checked: boolean) {
  if (checked && props.modelValue.includes(value)) return;

  const newModelValue = checked
    ? [...props.modelValue, value]
    : props.modelValue.filter((v) => v !== value);
  emit('update:modelValue', newModelValue);
}
</script>
