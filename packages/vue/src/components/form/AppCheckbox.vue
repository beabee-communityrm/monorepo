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
 * A custom checkbox component with variant support
 * Used for enabling/disabling features or settings.
 */
import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import useVuelidate from '@vuelidate/core';
import { sameAs } from '@vuelidate/validators';
import { computed, ref, toRef, watch } from 'vue';

export interface AppCheckboxProps {
  /** The model value of the checkbox */
  modelValue?: boolean;
  /** Whether the checkbox is disabled */
  disabled?: boolean;
  /** The label of the checkbox */
  label?: string;
  /** The icon of the checkbox */
  icon?: IconDefinition;
  /** Whether the checkbox is required */
  required?: boolean;
  /** Color variant of the checkbox */
  variant?: 'primary' | 'link' | 'danger';
}

const emit = defineEmits(['update:modelValue']);
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
watch(value, () => emit('update:modelValue', value.value));
watch(toRef(props, 'modelValue'), (newValue) => (value.value = newValue), {
  immediate: true,
});

const rules = computed(() =>
  props.required ? { v: { ticked: sameAs(true) } } : { v: {} }
);

useVuelidate(rules, { v: value });
</script>
