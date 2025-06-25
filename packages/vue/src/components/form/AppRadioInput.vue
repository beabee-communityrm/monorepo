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
            ? getFormVariantClasses(variant, 'border')
            : 'border-grey-dark',
          !disabled && selected !== value
            ? getFormVariantClasses(variant, 'hover')
            : '',
          disabled ? 'cursor-not-allowed opacity-50' : '',
        ]"
      >
        <div
          class="h-2.5 w-2.5 rounded-full"
          :class="[
            getFormVariantClasses(variant, 'icon'),
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
import type { AppRadioInputProps, RadioInputValue } from '../../types/form';
import { type FormVariant, getFormVariantClasses } from '../../utils/variants';

// Props interface and value type are now imported from types
export type { AppRadioInputProps, RadioInputValue } from '../../types/form';

withDefaults(defineProps<AppRadioInputProps>(), {
  variant: 'link',
  disabled: false,
  required: false,
  wrapperClass: '',
  labelClass: '',
});

const selected = defineModel<RadioInputValue>();

// Variant classes are now provided by utility functions
</script>
