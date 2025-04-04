<template>
  <AppLabel v-if="label" :label="label" :required="required" />
  <textarea
    v-model="value"
    class="w-full rounded border p-2 focus:shadow-input focus:outline-none"
    :class="
      hasError ? 'border-danger-70 bg-danger-10' : 'border-primary-40 bg-white'
    "
    :required="required"
    v-bind="$attrs"
    @blur="validation.$touch"
  />
  <AppInputError v-if="hasError" :message="validation.$errors[0].$message" />
  <AppInputHelp v-if="infoMessage" :message="infoMessage" />
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import useVuelidate from '@vuelidate/core';
import { helpers, requiredIf } from '@vuelidate/validators';
import { useI18n } from 'vue-i18n';
import AppInputHelp from './AppInputHelp.vue';
import { AppLabel } from '@beabee/vue/components';
import AppInputError from './AppInputError.vue';

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
}

const emit = defineEmits(['update:modelValue']);
const props = withDefaults(defineProps<AppTextAreaProps>(), {
  modelValue: '',
  label: undefined,
  name: 'unknown',
  infoMessage: undefined,
  disabled: false,
});

const { t } = useI18n();

const value = computed({
  get: () => props.modelValue,
  set: (newValue) => emit('update:modelValue', newValue),
});

const rules = computed(() => ({
  v: {
    required: helpers.withMessage(
      t(`form.errors.${props.name}.required`),
      requiredIf(!!props.required)
    ),
  },
}));

const validation = useVuelidate(rules, { v: value });
const hasError = computed(() => validation.value.$errors.length > 0);
</script>
