<template>
  <section class="mb-8" :class="disabled && 'opacity-50'">
    <p class="mb-2 text-sm leading-normal">
      {{ absorbFeeText }}
    </p>

    <AppCheckbox
      v-model="payFee"
      :disabled="force || disabled"
      :label="absorbFeeLabel"
    />
  </section>
</template>

<script lang="ts" setup>
import { AppCheckbox } from '@beabee/vue';

import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { t, n } = useI18n();

const emit = defineEmits(['update:modelValue']);

const props = defineProps<{
  /** The contribution amount */
  amount: number;
  /** The fee amount */
  fee: number;
  /** Whether absorbing the fee is forced */
  force: boolean;
  /** Whether the fee should be absorbed */
  modelValue: boolean;
  /** Whether the component is disabled */
  disabled: boolean;
}>();

/**
 * Text explaining the fee absorption option
 */
const absorbFeeText = computed(() => {
  return t('join.absorbFeeText', { fee: n(props.fee, 'currency') });
});

/**
 * Label for the fee absorption checkbox
 */
const absorbFeeLabel = computed(() => {
  if (props.force) {
    return t('join.absorbFeeForce', {
      amount: n(props.amount, 'currency'),
      fee: n(props.fee, 'currency'),
    });
  }
  return t('join.absorbFeeOptIn', { fee: n(props.fee, 'currency') });
});

const payFee = computed<boolean>({
  get: () => !props.disabled && props.modelValue,
  set: (value) => emit('update:modelValue', value),
});
</script>
