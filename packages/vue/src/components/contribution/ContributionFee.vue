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
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import { AppCheckbox } from '../form';

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
 * Internal currency formatter using vue-i18n
 */
const currencyFormatter = (value: number): string => n(value, 'currency');

/**
 * Absorb fee explanation text using internal i18n
 */
const absorbFeeText = computed(() =>
  t('join.absorbFeeText', { fee: currencyFormatter(props.fee) })
);

/**
 * Absorb fee checkbox label using internal i18n
 */
const absorbFeeLabel = computed(() => {
  const template = props.force ? 'join.absorbFeeForce' : 'join.absorbFeeOptIn';
  return t(template, {
    fee: currencyFormatter(props.fee),
    amount: currencyFormatter(props.amount),
  });
});

const payFee = computed<boolean>({
  get: () => !props.disabled && props.modelValue,
  set: (value) => emit('update:modelValue', value),
});
</script>
