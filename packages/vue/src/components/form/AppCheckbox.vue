<!--
  # AppCheckbox
  A custom styled checkbox component with variant support and icon functionality.
  Provides consistent styling across the application with accessibility features.
-->
<template>
  <label class="flex cursor-pointer flex-row items-center font-semibold">
    <div class="flex items-center">
      <input
        v-model="value"
        type="checkbox"
        :disabled="disabled"
        :required="required"
        :value="true"
        class="sr-only"
      />
      <div
        class="flex h-5 w-5 items-center justify-center rounded border bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary-40 focus:ring-offset-2"
        :class="[
          value ? borderVariantClasses[variant] : 'border-grey-dark',
          !disabled && !value ? hoverVariantClasses[variant] : '',
          disabled ? 'cursor-not-allowed opacity-50' : '',
        ]"
      >
        <font-awesome-icon
          v-if="value"
          :icon="faCheck"
          class="h-4 w-4"
          :class="iconVariantClasses[variant]"
        />
      </div>
    </div>
    <span v-if="label || icon" class="ml-2 flex items-center">
      <font-awesome-icon v-if="icon" :icon="icon" class="mr-1" />
      {{ label }}
    </span>
  </label>
</template>
<script lang="ts" setup>
/**
 * Custom checkbox component with variant support and optional icon.
 * Provides consistent styling and accessibility features across the application.
 *
 * @component AppCheckbox
 *
 * @example
 * <AppCheckbox v-model="isChecked" label="Accept terms" variant="primary" />
 */
import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import useVuelidate from '@vuelidate/core';
import { sameAs } from '@vuelidate/validators';
import { computed, ref, toRef, watch } from 'vue';

/**
 * Props for the AppCheckbox component
 */
export interface AppCheckboxProps {
  /** Current checked state of the checkbox */
  modelValue?: boolean;
  /** Whether the checkbox is disabled */
  disabled?: boolean;
  /** Label text displayed next to the checkbox */
  label?: string;
  /** Optional icon displayed before the label */
  icon?: IconDefinition;
  /** Whether the checkbox is required (validation) */
  required?: boolean;
  /** Color variant affecting border and icon colors */
  variant?: 'primary' | 'link' | 'danger';
}

/**
 * Events emitted by the AppCheckbox component
 */
const emit = defineEmits<{
  /**
   * Emitted when checkbox state changes
   * @param value - The new boolean value
   */
  (e: 'update:modelValue', value: boolean): void;
}>();

const props = withDefaults(defineProps<AppCheckboxProps>(), {
  variant: 'link',
  disabled: false,
  required: false,
  label: '',
  icon: undefined,
});

const borderVariantClasses = {
  primary: 'border-primary border-2',
  link: 'border-link border-2',
  danger: 'border-danger border-2',
} as const;

const iconVariantClasses = {
  primary: 'text-primary',
  link: 'text-link',
  danger: 'text-danger',
} as const;

const hoverVariantClasses = {
  primary: 'hover:text-primary-120 hover:border-primary-120',
  link: 'hover:text-link-120 hover:border-link-120',
  danger: 'hover:text-danger-120 hover:border-danger-120',
} as const;

const value = ref(false);

/**
 * Sync internal value with modelValue prop
 */
watch(value, () => emit('update:modelValue', value.value));
watch(toRef(props, 'modelValue'), (newValue) => (value.value = newValue), {
  immediate: true,
});

/**
 * Vuelidate validation for required checkboxes
 */
const rules = computed(() =>
  props.required ? { v: { ticked: sameAs(true) } } : { v: {} }
);

useVuelidate(rules, { v: value });
</script>
