<template>
  <div>
    <AppLabel :label="t('common.contributionPeriod.' + period)" />
    <AppRepeatable
      v-model="amounts"
      :add-label="'Add amount'"
      :new-item="() => 0"
    >
      <template #default="{ index }">
        <div class="max-w-[8rem]">
          <AppInput
            v-model="amounts[index]"
            type="number"
            :min="minAmount"
            :prefix="generalContent.currencySymbol"
            required
            class="block"
          />
        </div>
      </template>
    </AppRepeatable>
  </div>
</template>
<script lang="ts" setup>
import { ContributionPeriod } from '@beabee/beabee-common';
import { useI18n } from 'vue-i18n';
import { computed } from 'vue';
import AppLabel from '../../../forms/AppLabel.vue';
import AppRepeatable from '@components/forms/AppRepeatable.vue';
import { generalContent } from '@store/generalContent';
import AppInput from '@components/forms/AppInput.vue';

const props = defineProps<{
  period: ContributionPeriod;
  minMonthlyAmount: number;
}>();

const { t } = useI18n();

const amounts = defineModel<number[]>({ required: true });

const minAmount = computed(() => {
  const ret =
    props.minMonthlyAmount *
    (props.period === ContributionPeriod.Annually ? 12 : 1);
  return ret;
});
</script>
