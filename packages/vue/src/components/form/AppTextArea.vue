<template>
  <div>
    <AppLabel v-if="label" :label="label" :required="required" :for="id" />
    <div class="relative">
      <textarea
        :id="id"
        v-model="value"
        class="w-full rounded border p-2 focus:shadow-input focus:outline-none"
        :class="[
          hasError
            ? 'border-danger-70 bg-danger-10'
            : disabled
              ? 'cursor-not-allowed border-primary-40 bg-grey-lighter'
              : 'border-primary-40 bg-white',
          disabled && 'opacity-60',
          copyable && 'pr-10',
        ]"
        :required="required"
        :disabled="disabled"
        :aria-invalid="hasError"
        :aria-describedby="getAriaDescribedBy"
        :maxlength="maxlength"
        v-bind="$attrs"
        @blur="validation.$touch"
      />
      <div v-if="copyable" class="absolute right-1 top-1">
        <AppCopyButton variant="float" :text="value?.toString() || ''" />
      </div>
    </div>
    <AppInputError
      v-if="hasError"
      :id="`${id}-error`"
      :message="validation.$errors[0].$message"
    />
    <!-- Display character count when maxLength is set -->
    <div v-if="maxlength !== undefined" class="mt-1 text-xs text-grey-dark">
      {{ characterCountText }}
    </div>
    <AppInputHelp
      v-if="infoMessage"
      :id="`${id}-info`"
      :message="infoMessage"
    />
  </div>
</template>

<script lang="ts" setup>
import useVuelidate from '@vuelidate/core';
import {
  helpers,
  maxLength as maxLengthValidator,
  requiredIf,
} from '@vuelidate/validators';
import { computed } from 'vue';

import AppCopyButton from '../button/AppCopyButton.vue';
import AppInputError from './AppInputError.vue';
import AppInputHelp from './AppInputHelp.vue';
import AppLabel from './AppLabel.vue';

/**
 * Props for the AppTextArea component
 */
export interface AppTextAreaProps {
  /** The model value of the textarea */
  modelValue?: string;
  /** The label of the textarea */
  label?: string;
  /** The name of the textarea */
  name?: string;
  /** The info message of the textarea */
  infoMessage?: string;
  /** Whether the textarea is required */
  required?: boolean;
  /** Whether the textarea is disabled */
  disabled?: boolean;
  /** The maximum number of characters allowed */
  maxlength?: number;
  /** Whether the textarea value can be copied to clipboard */
  copyable?: boolean;
  /** Text to display for required field error (e.g., "This field is required") */
  requiredErrorText?: string;
  /** Text template for max length error (e.g., "Must be no more than {max} characters") */
  maxLengthErrorText?: string;
  /** Text template for character count (e.g., "{remaining} of {max} characters remaining") */
  characterCountText?: string;
}

const emit = defineEmits(['update:modelValue']);
const props = withDefaults(defineProps<AppTextAreaProps>(), {
  modelValue: '',
  label: undefined,
  name: 'unknown',
  infoMessage: undefined,
  disabled: false,
  maxlength: undefined,
  copyable: false,
  requiredErrorText: 'This field is required',
  maxLengthErrorText: 'Must be no more than {max} characters',
  characterCountText: '{remaining} of {max} characters remaining',
});

// Generate unique ID for aria-labels and form associations
const id = computed(
  () => `textarea-${Math.random().toString(36).substring(2, 11)}`
);

const value = computed({
  get: () => props.modelValue,
  set: (newValue) => emit('update:modelValue', newValue),
});

// Calculate remaining characters
const remainingChars = computed(() => {
  if (props.maxlength === undefined) return undefined;
  return Math.max(0, props.maxlength - (value.value?.length || 0));
});

// Format character count text
const characterCountText = computed(() => {
  if (props.maxlength === undefined || remainingChars.value === undefined)
    return '';
  return props.characterCountText
    .replace('{remaining}', remainingChars.value.toString())
    .replace('{max}', props.maxlength.toString());
});

const rules = computed(() => ({
  v: {
    required: helpers.withMessage(
      props.requiredErrorText,
      requiredIf(!!props.required)
    ),
    // Add maxLength validation when maxlength prop is provided
    ...(props.maxlength !== undefined && {
      maxLength: helpers.withMessage(
        props.maxLengthErrorText.replace('{max}', props.maxlength.toString()),
        maxLengthValidator(props.maxlength)
      ),
    }),
  },
}));

const validation = useVuelidate(rules, { v: value });
const hasError = computed(() => validation.value.$errors.length > 0);

// Combine IDs for aria-describedby
const getAriaDescribedBy = computed(() => {
  const ids = [];
  if (hasError.value) ids.push(`${id.value}-error`);
  if (props.infoMessage) ids.push(`${id.value}-info`);
  if (props.maxlength !== undefined) ids.push(`${id.value}-char-count`);
  return ids.length ? ids.join(' ') : undefined;
});
</script>
