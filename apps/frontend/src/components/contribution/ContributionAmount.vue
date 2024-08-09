<template>
  <div>
    <AppChoice
      v-model="amount"
      :items="
        presetAmounts.map((amount) => ({
          label: n(amount, 'currency'),
          value: amount,
        }))
      "
      :cols="2"
    >
      <template #default="{ item }">
        <span class="inline-block p-1.5">{{ item.label }}</span>
      </template>
    </AppChoice>

    <label
      class="group mt-2 flex items-center rounded border font-semibold focus-within:border-link focus-within:bg-link-10"
      :class="
        isPresetAmount
          ? 'border-grey-light bg-grey-lighter'
          : 'border-link bg-link-10'
      "
    >
      <span class="flex-0 select-none px-4">Custom amount</span>
      <div
        class="flex flex-1 border-l bg-white p-4 group-focus-within:border-link"
        :class="isPresetAmount ? 'border-grey-light' : 'border-link'"
      >
        <span class="flex-0">{{ generalContent.currencySymbol }}</span>
        <input
          v-model.number="amount"
          type="number"
          :min="minAmount"
          class="w-full flex-1 outline-none"
        />
      </div>
    </label>

    <div
      v-if="hasError"
      class="col-span-12 mt-2 text-center text-sm font-semibold text-danger"
      role="alert"
    >
      {{ t('join.minimumContribution') }}
      {{ n(minAmount, 'currency') }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { minValue } from '@vuelidate/validators';
import useVuelidate from '@vuelidate/core';
import AppChoice from '../forms/AppChoice.vue';
import { generalContent } from '@store/generalContent';

const { t, n } = useI18n();

const emits = defineEmits(['update:modelValue']);
const props = defineProps<{
  modelValue: number;
  minAmount: number;
  presetAmounts: number[];
}>();

const amount = computed({
  get: () => props.modelValue,
  set: (newAmount) => {
    emits('update:modelValue', newAmount);
    validation.value.amount.$touch();
  },
});

const hasError = computed(() => validation.value.$errors.length > 0);
const isPresetAmount = computed(() =>
  props.presetAmounts.includes(amount.value)
);

const rules = computed(() => ({
  amount: { minValue: minValue(props.minAmount) },
}));

const validation = useVuelidate(rules, { amount });
</script>
