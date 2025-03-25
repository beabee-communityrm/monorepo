<template>
  <div>
    <AppLabel v-if="label" :label="label" :required="required" />
    <label
      v-for="[value, optLabel] in options"
      :key="value.toString()"
      class="items-baseline"
      :class="inline ? 'mr-3 inline-flex align-top' : 'mb-1 flex'"
    >
      <input
        v-model="selected"
        type="radio"
        :name="name"
        :value="value"
        :checked="modelValue === value"
        class="mr-1.5"
        :required="required"
      />
      {{ optLabel }}
    </label>
  </div>
</template>

<script lang="ts" setup>
import useVuelidate from '@vuelidate/core';
import { requiredIf } from '@vuelidate/validators';
import { computed } from 'vue';
import { AppLabel } from '@beabee/vue/components';

/**
 * Props for the AppRadioGroup component
 */
export interface AppRadioGroupProps {
  /** Currently selected value */
  modelValue?: string | boolean | number | null;
  /** Array of value-label pairs for the radio options */
  options: [string | boolean | number, string][];
  /** Name attribute for the radio group */
  name?: string;
  /** Label for the entire radio group */
  label?: string;
  /** Whether to display radio options inline */
  inline?: boolean;
  /** Whether selection is required */
  required?: boolean;
}

const emit = defineEmits<{
  /** Emitted when selection changes */
  (e: 'update:modelValue', value: string | boolean | number | null): void;
}>();

const props = defineProps<AppRadioGroupProps>();

const selected = computed({
  get: () => props.modelValue,
  set: (newValue) => emit('update:modelValue', newValue || null),
});

// Use a random name to group the inputs if no name provider
const uniqueName = Math.random().toString(16).substring(2);
const name = computed(() => props.name || uniqueName);

const isRequired = computed(() => !!props.required);
useVuelidate({ v: { required: requiredIf(isRequired) } }, { v: selected });
</script>
