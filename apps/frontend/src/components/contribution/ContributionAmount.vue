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
            @input="handleInput"
            @keydown.up.prevent="0 /* just stop caret moving */"
            @keyup.up="changeAmount(amount + 1)"
            @keyup.down="changeAmount(amount - 1)"
          />
        </div>
        <div class="flex-0">{{ perPeriod }}</div>
      </label>

      <div class="flex h-full flex-none flex-col">
        <button
          class="amount-button border-b border-l"
          type="button"
          :disabled="disabled"
          @click="changeAmount(amount + 1)"
        >
          ▲
        </button>

        <button
          class="amount-button border-l"
          type="button"
          :disabled="disabled"
          :class="{ 'is-invalid': amount <= minAmount }"
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
      class="col-span-12 mt-0 text-sm font-semibold text-danger"
      role="alert"
    >
      {{ t('join.minimumContribution') }}
      {{ n(minAmount, 'currency') }} {{ perPeriod }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, toRefs } from 'vue';
import { useI18n } from 'vue-i18n';
import { minValue } from '@vuelidate/validators';
import useVuelidate from '@vuelidate/core';
import { generalContent } from '../../store';
import AppChoice from '../forms/AppChoice.vue';

const { t, n } = useI18n();

const emits = defineEmits(['update:modelValue']);
const props = defineProps<{
  modelValue: number;
  isMonthly: boolean;
  minAmount: number;
  definedAmounts: number[];
  disabled: boolean;
}>();

const amount = computed({
  get: () => props.modelValue,
  set: (newAmount) => {
    emits('update:modelValue', newAmount);
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

const perPeriod = computed(() => {
  return props.isMonthly ? t('common.perMonth') : t('common.perYear');
});
</script>

<style lang="postcss" scoped>
.amount-button {
  @apply h-1/2 border-primary-40 bg-white px-4 py-2 text-primary-70 enabled:hover:bg-primary-5 enabled:hover:text-primary;
  &.is-invalid {
    @apply cursor-not-allowed text-grey;
  }
}
</style>
