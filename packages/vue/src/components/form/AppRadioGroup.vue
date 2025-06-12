<template>
  <div>
    <AppLabel v-if="label" :label="label" :required="required" />
    <AppRadioInput
      v-for="[value, optLabel] in options"
      :key="value.toString()"
      v-model="selected"
      :value="value"
      :name="name"
      :required="required"
      :disabled="disabled"
      :variant="variant"
      :wrapper-class="inline ? 'mr-3 inline-flex align-top' : 'mb-1 flex'"
    >
      {{ optLabel }}
    </AppRadioInput>
  </div>
</template>

<script lang="ts" setup>
import useVuelidate from '@vuelidate/core';
import { requiredIf } from '@vuelidate/validators';
import { computed } from 'vue';

import AppLabel from './AppLabel.vue';
import AppRadioInput, { type AppRadioInputValue } from './AppRadioInput.vue';

/**
 * Props for the AppRadioGroup component
 */
export interface AppRadioGroupProps {
  /** Array of value-label pairs for the radio options */
  options: [AppRadioInputValue, string][];
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

const props = withDefaults(defineProps<AppRadioGroupProps>(), {
  variant: 'link',
  disabled: false,
  required: false,
  inline: false,
});

const selected = defineModel<AppRadioInputValue>();

// Use a random name to group the inputs if no name provider
const uniqueName = Math.random().toString(16).substring(2);
const name = computed(() => props.name || uniqueName);

const isRequired = computed(() => !!props.required);
useVuelidate({ v: { required: requiredIf(isRequired) } }, { v: selected });
</script>
