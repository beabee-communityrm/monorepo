<template>
  <AppForm :button-text="'Next: payment'" full-button @submit="onSubmit">
    <ContributionAmount
      v-model:amount="amount"
      v-model:period="period"
      :min-monthly-amount="joinContent.minMonthlyAmount"
      :preset-amounts="joinContent.presetAmounts[period]"
      show-period
      class="mb-6"
    />
    <p class="mb-6 text-center">
      or you can make a
      <router-link to="/donate" class="font-semibold underline"
        >one time contribution</router-link
      >
    </p>
  </AppForm>

  <div class="mt-3 text-center text-xs">
    <p v-if="paymentContent.taxRateEnabled" class="mb-2">
      {{ t('join.tax.included', { taxRate: paymentContent.taxRate }) }}
    </p>
    <p class="mb-2">
      {{ t('join.notice') }}
      <a
        class="text-link underline hover:text-primary"
        :href="generalContent.privacyLink"
        target="_blank"
        rel="noreferrer"
        >{{ t('join.privacy') }}</a
      >.
    </p>
    <p>
      <a href="https://beabee.io" target="_blank">
        <img class="inline" :src="beabeeLogo" width="30" />
        {{ t('join.poweredBy') }}
      </a>
    </p>
  </div>
</template>
<script lang="ts" setup>
import {
  ContributionPeriod,
  type ContentJoinData,
  type ContentPaymentData,
} from '@beabee/beabee-common';
import { useI18n } from 'vue-i18n';
import useVuelidate from '@vuelidate/core';
import { generalContent } from '@store';

import AppForm from '@components/forms/AppForm.vue';
import ContributionAmount from '@components/contribution/ContributionAmount.vue';

import beabeeLogo from '@assets/images/beabee-logo.png';

defineProps<{
  joinContent: ContentJoinData;
  paymentContent: ContentPaymentData;
  preview?: boolean;
  onSubmit?: () => Promise<void>;
}>();

const amount = defineModel<number>('amount', { required: true });
const period = defineModel<ContributionPeriod>('period', { required: true });

const { t } = useI18n();

// Stops errors propagating to membership builder parent
useVuelidate({ $stopPropagation: true });
</script>
