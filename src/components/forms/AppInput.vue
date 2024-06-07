<!--
  # AppInput
  This component is a wrapper around a native input element. It adds some extra functionality like validation and error messages.

  ## Props
  - `modelValue` (string | number): The value of the input. This is a required prop.
  - `type` (`'password' | 'email' | 'text' | 'date' | 'time' | 'number' | 'url'`): The type of the input. Defaults to `'text'`.
  - `name` (string): The name of the input. Defaults to `'unknown'`.
  - `label` (string): The label of the input.
  - `infoMessage` (string): An info message to display below the input.
  - `required` (boolean): Whether the input is required or not.
  - `min` (number | string): The minimum value of the input.
  - `max` (number | string): The maximum value of the input.
  - `sameAs` (number | string): The value that this input should be the same as.
  - `pattern` (string): A regex pattern that the input value should match.
  - `hideErrorMessage` (boolean): Whether or not to hide the error message. Defaults to `false`.
  - `prefix` (string): A prefix to display before the input.
  - `suffix` (string): A suffix to display after the input.

  ## Events
  - `update:modelValue` (value: string | number): Emitted when the value of the input changes.
  - `update:isValid` (isValid: boolean): Emitted when the isValid state of the input changes.

  ## Slots
  - `before` (Optional): A slot to display before the input.
  - `after` (Optional): A slot to display after the input.

 -->
<template>
  <AppLabel v-if="label" :label="label" :required="required" />
  <div class="flex items-center">
    <div v-if="$slots.before" class="flex-0 mr-2"><slot name="before" /></div>
    <div
      class="flex flex-1 items-center overflow-hidden rounded border focus-within:shadow-input"
      :class="
        hasError
          ? 'border-danger-70 bg-danger-10'
          : 'border-primary-40 bg-white'
      "
    >
      <span v-if="prefix" class="flex-0 px-2">{{ prefix }}</span>
      <div
        class="flex-1"
        :class="{
          'border-l border-primary-40': prefix,
          'border-r border-primary-40': suffix,
        }"
      >
        <input
          v-model.trim="value"
          class="w-full bg-white/0 p-2 leading-[20px] focus:outline-none"
          :type="type"
          :name="name"
          :required="required"
          :min="min"
          :max="max"
          :pattern="pattern"
          v-bind="$attrs"
          @blur="validation.$touch"
        />
      </div>
      <span v-if="suffix" class="flex-0 px-2">{{ suffix }}</span>
    </div>
    <div v-if="$slots.after" class="flex-0 ml-2"><slot name="after" /></div>
  </div>

  <AppInputError
    v-if="hasError && !hideErrorMessage"
    :message="validation.$errors[0].$message"
  />
  <AppInputHelp v-if="infoMessage" :message="infoMessage" />
</template>

<script lang="ts" setup>
import { computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import useVuelidate from '@vuelidate/core';
import {
  email,
  helpers,
  requiredIf,
  sameAs as sameAsValidator,
  url,
} from '@vuelidate/validators';
import AppInputHelp from './AppInputHelp.vue';
import AppLabel from './AppLabel.vue';
import AppInputError from './AppInputError.vue';

const emit = defineEmits(['update:modelValue', 'update:validation']);
const props = withDefaults(
  defineProps<{
    modelValue?: number | string;
    type?: 'password' | 'email' | 'text' | 'date' | 'time' | 'number' | 'url';
    name?: string;
    label?: string;
    infoMessage?: string;
    required?: boolean;
    min?: number | string;
    max?: number | string;
    sameAs?: number | string;
    pattern?: string;
    hideErrorMessage?: boolean;
    prefix?: string;
    suffix?: string;
  }>(),
  {
    modelValue: undefined,
    type: 'text',
    name: 'unknown',
    label: undefined,
    infoMessage: undefined,
    min: undefined,
    max: undefined,
    sameAs: undefined,
    pattern: undefined,
    prefix: undefined,
    suffix: undefined,
  }
);

const { t } = useI18n();

const value = computed({
  get: () => props.modelValue,
  set: (newValue) => {
    emit(
      'update:modelValue',
      props.type === 'number' ? Number(newValue) : newValue
    );
  },
});

function errorT(key: string, context?: Record<string, unknown>): string {
  const keypath = `form.errors.${props.name}.${key}`;
  return context ? t(keypath, context) : t(keypath);
}

/**
 * Check if the value is greater than or equal to the min value depending on the type of the input.
 * @param value The value to check
 * @returns Whether the value is greater than or equal to the min value
 */
const checkMin = (value: number | string) => {
  if (props.type === 'number') {
    return props.min === undefined || value >= props.min;
  }

  // TODO: `min` for type `date` is untested
  if (props.type === 'date') {
    return (
      props.min === undefined ||
      new Date(value.toString()).getTime() >= new Date(props.min).getTime()
    );
  }

  // TODO: `min` for type `time` is untested
  if (props.type === 'time') {
    return (
      props.min === undefined ||
      new Date(`1970-01-01T${value.toString()}`).getTime() >=
        new Date(`1970-01-01T${props.min}`).getTime()
    );
  }

  // text, email, ...
  return (
    props.min === undefined || (value as string).length >= Number(props.min)
  );
};

/**
 * Check if the value is less than or equal to the max value depending on the type of the input.
 * @param value The value to check
 * @returns Whether the value is less than or equal to the max value
 */
const checkMax = (value: number | string) => {
  if (props.type === 'number') {
    return props.max === undefined || value <= props.max;
  }

  // TODO: `max` for type `date` is untested
  if (props.type === 'date') {
    return (
      props.max === undefined ||
      new Date(value.toString()).getTime() <= new Date(props.max).getTime()
    );
  }

  // TODO: `max` for type `time` is untested
  if (props.type === 'time') {
    return (
      props.max === undefined ||
      new Date(`1970-01-01T${value.toString()}`).getTime() <=
        new Date(`1970-01-01T${props.max}`).getTime()
    );
  }

  // text, email, ...
  return (
    props.max === undefined || (value as string).length <= Number(props.max)
  );
};

const rules = computed(() => ({
  v: {
    required: helpers.withMessage(
      errorT('required'),
      requiredIf(!!props.required)
    ),
    ...(props.type === 'email' && {
      email: helpers.withMessage(errorT('email'), email),
    }),
    ...(props.type === 'url' && {
      url: helpers.withMessage(errorT('url'), url),
    }),
    ...(props.type === 'password' && {
      password: helpers.withMessage(errorT('password'), isPassword),
    }),
    ...(props.min !== undefined && {
      min: helpers.withMessage(
        () => errorT('min', { min: props.min }),
        checkMin
      ),
    }),
    ...(props.max !== undefined && {
      max: helpers.withMessage(
        () => errorT('max', { max: props.max }),
        checkMax
      ),
    }),
    ...(props.sameAs !== undefined && {
      sameAs: helpers.withMessage(
        errorT('sameAs'),
        sameAsValidator(props.sameAs)
      ),
    }),
    ...(props.pattern !== undefined && {
      pattern: helpers.withMessage(
        errorT('pattern'),
        (value: number | string) =>
          new RegExp(`^(?:${props.pattern})$`).test(value.toString())
      ),
    }),
  },
}));

const validation = useVuelidate(rules, { v: value });
const hasError = computed(() => validation.value.$errors.length > 0);

function isPassword(value: string) {
  if (!value) return true;
  return (
    value.length >= 8 &&
    /[0-9]/.test(value) &&
    /[A-Z]/.test(value) &&
    /[a-z]/.test(value)
  );
}

watch(validation, (newState) => {
  emit('update:validation', !newState.$invalid);
});
</script>
