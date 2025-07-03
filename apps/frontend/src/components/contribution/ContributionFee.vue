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

import { AppCheckbox } from '../form';

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
  /** Text explaining the fee absorption */
  absorbFeeText: string;
  /** Label text for the checkbox */
  absorbFeeLabel: string;
}>();

const payFee = computed<boolean>({
  get: () => !props.disabled && props.modelValue,
  set: (value) => emit('update:modelValue', value),
});
</script>
