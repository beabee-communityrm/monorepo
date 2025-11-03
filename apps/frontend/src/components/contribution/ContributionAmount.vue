<!--
  # ContributionAmount
  A component for selecting and entering contribution amounts.
  Features large numerical input with increment/decrement buttons and preset amount selection.

  Uses internal i18n for:
  - Minimum contribution error: join.minimumContribution
  - Period text: common.perMonth, common.perYear
  - Currency formatting: vue-i18n n() function

  ## Props
  - `modelValue` (number): The current amount value
  - `isMonthly` (boolean): Whether the contribution is monthly
  - `minAmount` (number): Minimum allowed amount
  - `definedAmounts` (number[]): Preset amounts to display as quick choices
  - `disabled` (boolean): Whether the component is disabled

  ## Events
  - `update:modelValue` (number): Emitted when the amount changes

  ## Features
  - Large numerical input with visual prominence
  - Increment/decrement buttons for easy adjustment
  - Keyboard shortcuts (up/down arrows)
  - Preset amount selection buttons
  - Validation with visual error states
  - Currency symbol display
  - Accessibility support with ARIA attributes
-->
<template>
  <div class="flex flex-wrap gap-2">
    <div
      class="flex flex-grow basis-[250px] rounded border border-primary-40 text-sm"
      :class="
        disabled
          ? 'opacity-50'
          : hasError
            ? 'border-danger bg-danger-10'
            : 'bg-white'
      "
    >
      <label class="flex flex-1 items-baseline px-6 font-bold text-body-60">
        <span>{{ generalContent.currencySymbol }}</span>
        <div class="relative mx-1 font-semibold">
          <div class="text-6xl/[7rem]">
            {{ amount || '0' }}
          </div>
          <input
            :value="amount"
            class="absolute inset-0 w-full border-0 text-6xl/[7rem] text-body outline-none"
            :min="minAmount"
            :class="{ 'bg-danger-10': hasError }"
            :disabled="disabled"
            :aria-invalid="hasError"
            :aria-describedby="hasError ? 'amount-error' : undefined"
            @input="handleInput"
            @keydown.up.prevent="0 /* just stop caret moving */"
            @keyup.up="changeAmount(amount + 1)"
            @keyup.down="changeAmount(amount - 1)"
          />
        </div>
        <div class="flex-0">{{ perPeriodText }}</div>
      </label>

      <div class="flex h-full flex-none flex-col">
        <button
          class="amount-button border-b border-l"
          type="button"
          :disabled="disabled"
          :aria-label="t('actions.increase')"
          @click="changeAmount(amount + 1)"
        >
          ▲
        </button>

        <button
          class="amount-button border-l"
          type="button"
          :disabled="disabled"
          :class="{ 'is-invalid': amount <= minAmount }"
          :aria-label="t('actions.decrease')"
          @click="changeAmount(amount - 1)"
        >
          ▼
        </button>
      </div>
    </div>

    <AppChoice
      :model-value="amount"
      :items="
        definedAmounts.map((amount) => ({
          label: n(amount, 'currency'),
          value: amount,
        }))
      "
      :disabled="disabled"
      :size="'xs'"
      @update:model-value="changeAmount($event)"
    />

    <div
      v-if="hasError"
      id="amount-error"
      class="col-span-12 mt-0 text-sm font-semibold text-danger"
      role="alert"
    >
      {{ t('join.minimumContribution') }}
      {{ n(minAmount, 'currency') }} {{ perPeriodText }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ContributionPeriod, type PaymentPeriod } from '@beabee/beabee-common';
import { AppChoice } from '@beabee/vue';

import { generalContent } from '@store/generalContent';
import useVuelidate from '@vuelidate/core';
import { minValue } from '@vuelidate/validators';
import { computed, toRefs } from 'vue';
import { useI18n } from 'vue-i18n';

const { t, n } = useI18n();

/**
 * Props for the ContributionAmount component
 */
export interface ContributionAmountProps {
  /** The current amount value */
  modelValue: number;
  /** Current payment period */
  period: PaymentPeriod;
  /** Minimum allowed amount */
  minAmount: number;
  /** Preset amounts to display as quick choices */
  definedAmounts: number[];
  /** Whether the component is disabled */
  disabled: boolean;
}

const emit = defineEmits(['update:modelValue']);
const props = defineProps<ContributionAmountProps>();

/**
 * Per period text based on contribution type
 */
const perPeriodText = computed(() => {
  return props.period === ContributionPeriod.Monthly
    ? t('common.perMonth')
    : props.period === ContributionPeriod.Annually
      ? t('common.perYear')
      : '';
});

const amount = computed({
  get: () => props.modelValue,
  set: (newAmount) => {
    emit('update:modelValue', newAmount);
    validation.value.amount.$touch();
  },
});

function handleInput(event: Event) {
  changeAmount(Number((event.target as HTMLInputElement).value) || 0, true);
}

function changeAmount(newAmount: number, allowInvalid = false) {
  amount.value = allowInvalid
    ? newAmount
    : Math.max(props.minAmount, newAmount);
}

const hasError = computed(() => validation.value.$errors.length > 0);

const rules = computed(() =>
  props.disabled
    ? { amount: {} }
    : {
        amount: {
          minValue: minValue(toRefs(props).minAmount),
        },
      }
);

const validation = useVuelidate(rules, { amount });
</script>

<style lang="postcss" scoped>
.amount-button {
  @apply h-1/2 border-primary-40 bg-white px-4 py-2 text-primary-70 enabled:hover:bg-primary-5 enabled:hover:text-primary;
  &.is-invalid {
    @apply cursor-not-allowed text-grey;
  }
}
</style>
