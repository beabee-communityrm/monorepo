<template>
  <div>
    <AppChoice
      v-if="showPeriod"
      :model-value="period"
      :items="[
        {
          label: t('common.contributionPeriod.monthly'),
          value: ContributionPeriod.Monthly,
        },
        {
          label: t('common.contributionPeriod.annually'),
          value: ContributionPeriod.Annually,
        },
      ]"
      variant="collapsed"
      class="mb-4"
      @update:model-value="updatePeriod"
    />

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
      <span class="flex-0 select-none px-4">{{ t('join.customAmount') }}</span>
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
import { ContributionPeriod } from '@beabee/beabee-common';

const { t, n } = useI18n();

const props = defineProps<{
  minMonthlyAmount: number;
  presetAmounts: number[];
  showPeriod: boolean;
}>();

const amount = defineModel<number>('amount', { required: true });
const period = defineModel<ContributionPeriod>('period', { required: true });

const hasError = computed(() => validation.value.$errors.length > 0);
const isPresetAmount = computed(() =>
  props.presetAmounts.includes(amount.value)
);

const minAmount = computed(
  () =>
    props.minMonthlyAmount *
    (period.value === ContributionPeriod.Annually ? 12 : 1)
);

const rules = computed(() => ({
  amount: { minValue: minValue(minAmount) },
}));

const validation = useVuelidate(rules, { amount });

// Update the amount when the user switches the period
function updatePeriod(newPeriod: ContributionPeriod) {
  if (period.value !== newPeriod) {
    const newAmount =
      newPeriod === ContributionPeriod.Annually
        ? amount.value * 12
        : Math.floor(amount.value / 12);

    amount.value = newAmount;
    period.value = newPeriod;
  }
}
</script>
