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
            ? getInputStateClasses('error')
            : disabled
              ? `cursor-not-allowed ${getInputStateClasses('disabled')}`
              : getInputStateClasses('default'),
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
        <AppCopyButton
          variant="float"
          :text="value?.toString() || ''"
          :disabled="copyButtonDisabled"
          :label="copyLabel"
          v-bind="copyButtonProps"
        />
      </div>
    </div>
    <AppInputError
      v-if="hasError"
      :id="errorId"
      :message="validation.$errors[0].$message"
    />
    <!-- Display character count when maxlength is set -->
    <div
      v-if="maxlength !== undefined"
      class="mt-1 text-xs text-grey-dark"
      :id="charCountId"
    >
      {{ characterCountText }}
    </div>
    <AppInputHelp v-if="infoMessage" :id="helpId" :message="infoMessage" />
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

import { useAriaDescribedBy } from '../../composables/useAccessibility';
import type { AppTextAreaProps } from '../../types/form';
import { generateFormFieldId, generateFormFieldIds } from '../../utils/ids';
import { getInputStateClasses } from '../../utils/variants';
import AppCopyButton from '../button/AppCopyButton.vue';
import AppInputError from './AppInputError.vue';
import AppInputHelp from './AppInputHelp.vue';
import AppLabel from './AppLabel.vue';

// Props interface is now imported from types
export type { AppTextAreaProps } from '../../types/form';

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
  copyLabel: undefined,
  copyButtonDisabled: false,
  id: undefined,
  requiredErrorText: 'This field is required',
  maxLengthErrorText: 'Must be no more than {max} characters',
  characterCountText: '{remaining} of {max} characters remaining',
  copyButtonProps: undefined,
});

// Generate unique IDs for accessibility
const baseTextAreaId = computed(
  () => props.id || generateFormFieldId(props.name, 'textarea')
);

const fieldIds = computed(() => generateFormFieldIds(baseTextAreaId.value));
const id = computed(() => fieldIds.value.baseId);
const errorId = computed(() => fieldIds.value.errorId);
const helpId = computed(() => fieldIds.value.helpId);
const charCountId = computed(() => `${id.value}-char-count`);

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

// Use accessibility composable for aria-describedby
const { ariaDescribedBy: getAriaDescribedBy } = useAriaDescribedBy({
  helpId,
  errorId,
  hasHelp: computed(() => !!props.infoMessage),
  hasError: computed(() => hasError.value),
});
</script>
