<template>
  <div>
    <AppLabel :label="t('common.contributionPeriod.' + period)" />
    <PeriodAmountValue
      v-for="(amount, i) in modelValue"
      :key="i"
      :min-amount="minAmount"
      :model-value="amount"
      @update:model-value="updateAmount(i, $event)"
    />
  </div>
</template>
<script lang="ts" setup>
import { ContributionPeriod } from '@beabee/beabee-common';
import { useI18n } from 'vue-i18n';
import { computed } from 'vue';
import PeriodAmountValue from './PeriodAmountValue.vue';
import AppLabel from '../../../forms/AppLabel.vue';

const emit = defineEmits(['update:modelValue']);
const props = defineProps<{
  period: ContributionPeriod;
  modelValue: number[];
  minMonthlyAmount: number;
}>();

const { t } = useI18n();

const minAmount = computed(() => {
  const ret =
    props.minMonthlyAmount *
    (props.period === ContributionPeriod.Annually ? 12 : 1);
  return ret;
});

function updateAmount(i: number, newAmount: number) {
  const newAmounts = [...props.modelValue];
  newAmounts[i] = newAmount;
  emit('update:modelValue', newAmounts);
}
</script>
