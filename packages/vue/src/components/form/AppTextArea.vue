<!--
  # AppTextArea
  A textarea input component with validation and character counting.

  ## Features
  - Multi-line text input
  - Character counting with limit support
  - Form validation integration
  - Required field validation
  - Maximum length validation
  - Accessibility features

  ## Props
  - `modelValue`: Current textarea value
  - `maxlength`: Maximum number of characters allowed
  - `required`: Whether the field is required
  - `label`: Input label text
  - Standard textarea attributes

  ## Events
  - `update:modelValue`: Emitted when value changes

  ## Validation
  - Integrates with form validation systems
  - Shows character count and remaining characters
  - Displays validation errors when present
-->
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
        :aria-describedby="
          [
            hasError && `${id}-error`,
            infoMessage && `${id}-info`,
            maxlength !== undefined && `${id}-char-count`,
          ]
            .filter(Boolean)
            .join(' ') || undefined
        "
        :maxlength="maxlength"
        v-bind="$attrs"
        @blur="validation.$touch"
      />
      <div v-if="copyable" class="absolute right-1 top-1">
        <AppCopyButton
          variant="float"
          :text="value?.toString() || ''"
          :disabled="copyButtonDisabled"
        />
      </div>
    </div>
    <AppInputError
      v-if="hasError"
      :id="`${id}-error`"
      :message="validation.$errors[0].$message"
    />
    <!-- Display character count when maxlength is set -->
    <div
      v-if="maxlength !== undefined"
      class="mt-1 text-xs text-grey-dark"
      :id="`${id}-char-count`"
    >
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
/**
 * AppTextArea component providing textarea functionality with validation and character counting
 *
 * @component AppTextArea
 */
import useVuelidate from '@vuelidate/core';
import {
  helpers,
  maxLength as maxLengthValidator,
  requiredIf,
} from '@vuelidate/validators';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import { generateUniqueId } from '../../utils';
import AppCopyButton from '../button/AppCopyButton.vue';
import AppInputError from './AppInputError.vue';
import AppInputHelp from './AppInputHelp.vue';
import AppLabel from './AppLabel.vue';

const { t } = useI18n();

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
  /** Whether the copy button is disabled */
  copyButtonDisabled?: boolean;
  /** Custom ID for the textarea element */
  id?: string;
}

const emit = defineEmits(['update:modelValue', 'update:validation']);
const props = withDefaults(defineProps<AppTextAreaProps>(), {
  modelValue: '',
  name: 'unknown',
  label: undefined,
  infoMessage: undefined,
  required: false,
  disabled: false,
  maxlength: undefined,
  copyable: false,
  copyButtonDisabled: false,
  id: undefined,
});

// Generate unique ID for aria-labels and form associations
const id = props.id || generateUniqueId('textarea');

const value = computed({
  get: () => props.modelValue,
  set: (newValue) => emit('update:modelValue', newValue),
});

// Calculate remaining characters
const remainingChars = computed(() => {
  if (props.maxlength === undefined) return undefined;
  return Math.max(0, props.maxlength - (value.value?.length || 0));
});

// Format character count text using i18n
const characterCountText = computed(() => {
  if (props.maxlength === undefined || remainingChars.value === undefined)
    return '';
  return t('form.characters.remaining', { remaining: remainingChars.value });
});

const rules = computed(() => ({
  v: {
    required: helpers.withMessage(
      t(`form.errors.${props.name}.required`),
      requiredIf(!!props.required)
    ),
    // Add maxLength validation when maxlength prop is provided
    ...(props.maxlength !== undefined && {
      maxLength: helpers.withMessage(
        t(`form.errors.${props.name}.maxLength`, {
          max: props.maxlength,
          remaining: remainingChars.value,
        }),
        maxLengthValidator(props.maxlength)
      ),
    }),
  },
}));

const validation = useVuelidate(rules, { v: value });
const hasError = computed(() => validation.value.$errors.length > 0);
</script>
