<template>
  <div>
    <AppLabel v-if="label" :label="label" :required="required" :for="id" />
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
      ]"
      :required="required"
      :disabled="disabled"
      :aria-invalid="hasError"
      :aria-describedby="getAriaDescribedBy"
      v-bind="$attrs"
      @blur="validation.$touch"
    />
    <AppInputError
      v-if="hasError"
      :id="`${id}-error`"
      :message="validation.$errors[0].$message"
    />
    <AppInputHelp
      v-if="infoMessage"
      :id="`${id}-info`"
      :message="infoMessage"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import useVuelidate from '@vuelidate/core';
import { helpers, requiredIf } from '@vuelidate/validators';
import { useI18n } from 'vue-i18n';
import AppInputHelp from './AppInputHelp.vue';
import AppLabel from './AppLabel.vue';
import AppInputError from './AppInputError.vue';

const emit = defineEmits(['update:modelValue']);
const props = withDefaults(
  defineProps<{
    modelValue?: string;
    label?: string;
    name?: string;
    infoMessage?: string;
    required?: boolean;
    disabled?: boolean;
  }>(),
  {
    modelValue: '',
    label: undefined,
    name: 'unknown',
    infoMessage: undefined,
    disabled: false,
  }
);

const { t } = useI18n();

// Generate unique ID for aria-labels and form associations
const id = computed(
  () => `textarea-${Math.random().toString(36).substring(2, 11)}`
);

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

// Combine IDs for aria-describedby
const getAriaDescribedBy = computed(() => {
  const ids = [];
  if (hasError.value) ids.push(`${id.value}-error`);
  if (props.infoMessage) ids.push(`${id.value}-info`);
  return ids.length ? ids.join(' ') : undefined;
});
</script>
