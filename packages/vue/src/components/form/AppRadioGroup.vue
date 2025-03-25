<template>
  <div>
    <AppLabel v-if="label" :label="label" :required="required" />
    <label
      v-for="[value, optLabel] in options"
      :key="value.toString()"
      class="cursor-pointer items-center"
      :class="inline ? 'mr-3 inline-flex align-top' : 'mb-1 flex'"
    >
      <div class="flex items-center">
        <input
          v-model="selected"
          type="radio"
          :name="name"
          :value="value"
          :checked="modelValue === value"
          class="sr-only"
          :required="required"
          :disabled="disabled"
        />
        <div
          class="flex h-5 w-5 items-center justify-center rounded-full border transition-colors focus:outline-none focus:ring-2 focus:ring-primary-40 focus:ring-offset-2"
          :class="[
            selected === value
              ? borderVariantClasses[variant]
              : 'border-grey-dark',
            !disabled && selected !== value ? hoverVariantClasses[variant] : '',
            disabled ? 'cursor-not-allowed opacity-50' : '',
          ]"
        >
          <div
            class="h-2.5 w-2.5 rounded-full"
            :class="[
              dotVariantClasses[variant],
              selected === value ? 'opacity-100' : 'opacity-0',
            ]"
          ></div>
        </div>
      </div>
      <span class="ml-2 flex items-center">{{ optLabel }}</span>
    </label>
  </div>
</template>

<script lang="ts" setup>
import useVuelidate from '@vuelidate/core';
import { requiredIf } from '@vuelidate/validators';
import { computed } from 'vue';
import AppLabel from './AppLabel.vue';

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
  /** Whether radio group is disabled */
  disabled?: boolean;
  /** Color variant of the radio buttons */
  variant?: 'primary' | 'link' | 'danger';
}

const emit = defineEmits<{
  /** Emitted when selection changes */
  (e: 'update:modelValue', value: string | boolean | number | null): void;
}>();

const props = withDefaults(defineProps<AppRadioGroupProps>(), {
  variant: 'link',
  disabled: false,
  required: false,
  inline: false,
});

const selected = computed({
  get: () => props.modelValue,
  set: (newValue) => emit('update:modelValue', newValue || null),
});

// Use a random name to group the inputs if no name provider
const uniqueName = Math.random().toString(16).substring(2);
const name = computed(() => props.name || uniqueName);

const borderVariantClasses = {
  primary: 'border-primary border-2',
  link: 'border-link border-2',
  danger: 'border-danger border-2',
} as const;

const dotVariantClasses = {
  primary: 'bg-primary',
  link: 'bg-link',
  danger: 'bg-danger',
} as const;

const hoverVariantClasses = {
  primary: 'hover:text-primary-120 hover:border-primary-120',
  link: 'hover:text-link-120 hover:border-link-120',
  danger: 'hover:text-danger-120 hover:border-danger-120',
} as const;

const isRequired = computed(() => !!props.required);
useVuelidate({ v: { required: requiredIf(isRequired) } }, { v: selected });
</script>
