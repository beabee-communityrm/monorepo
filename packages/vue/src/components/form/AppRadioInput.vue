<template>
  <label class="flex cursor-pointer items-center" :class="wrapperClass">
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
    <span class="ml-2 flex items-center" :class="labelClass">
      <slot>{{ label }}</slot>
    </span>
  </label>
</template>

<script lang="ts" setup>
/**
 * Possible value for the AppRadioInput component
 */
export type AppRadioInputValue = string | boolean | number;

/**
 * Props for the AppRadioInput component
 */
export interface AppRadioInputProps {
  /** Value of this radio option */
  value: AppRadioInputValue;
  /** Name attribute for the radio input */
  name: string;
  /** Label text for this radio option */
  label?: string;
  /** CSS class for the wrapper */
  wrapperClass?: string;
  /** CSS class for the label */
  labelClass?: string;
  /** Whether selection is required */
  required?: boolean;
  /** Whether radio input is disabled */
  disabled?: boolean;
  /** Color variant of the radio button */
  variant?: 'primary' | 'link' | 'danger';
}

withDefaults(defineProps<AppRadioInputProps>(), {
  variant: 'link',
  disabled: false,
  required: false,
  wrapperClass: '',
  labelClass: '',
});

const selected = defineModel<AppRadioInputValue>();

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
</script>
