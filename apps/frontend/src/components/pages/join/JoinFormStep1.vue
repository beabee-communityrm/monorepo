<template>
  <AuthBox v-if="generalContent.hideContribution">
    <template v-if="!isEmbed">
      <AppTitle>{{ joinContent.title }}</AppTitle>
      <div class="content-message mb-6" v-html="joinContent.subtitle" />
    </template>
    <AppForm
      :button-text="buttonText"
      full-button
      :extract-error-code="extractApiErrorCode"
      @submit="onSubmit"
    >
      <AccountSection v-model:email="data.email" class="mb-6" />
    </AppForm>
  </AuthBox>

  <AuthBox v-else :title="joinContent.title" :preview="preview">
    <template #header>
      <div class="content-message" v-html="joinContent.subtitle" />
    </template>

    <AppForm :button-text="buttonText" full-button @submit="onSubmit">
      <AppContribution
        v-model:amount="data.amount"
        v-model:period="data.period"
        v-model:pay-fee="data.payFee"
        v-model:payment-method="data.paymentMethod"
        :content="joinContent"
        :payment-content="paymentContent"
        :disabled="data.noContribution"
      >
        <AppCheckbox
          v-if="joinContent.showNoContribution"
          v-model="data.noContribution"
          class="mb-4"
          :label="t('join.noContribution')"
        />
        <AccountSection v-model:email="data.email" class="my-6" />
      </AppContribution>
    </AppForm>

    <div class="mt-3 text-center text-xs">
      <p
        v-if="!data.noContribution && paymentContent.taxRateEnabled"
        class="mb-2"
      >
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
  </AuthBox>
</template>
<script lang="ts" setup>
import {
  type ContentJoinData,
  type ContentPaymentData,
} from '@beabee/beabee-common';
import { AppCheckbox, AppForm, AppTitle } from '@beabee/vue';

import beabeeLogo from '@assets/images/beabee-logo.png';
import AuthBox from '@components/AuthBox.vue';
import AppContribution from '@components/contribution/AppContribution.vue';
import { generalContent, isEmbed } from '@store';
import type { JoinFormData } from '@type/join-form-data';
import { extractApiErrorCode } from '@utils/api-error';
import { calcJoinFormTotalAmount } from '@utils/payment';
import useVuelidate from '@vuelidate/core';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import AccountSection from './AccountSection.vue';

const props = defineProps<{
  joinContent: ContentJoinData;
  paymentContent: ContentPaymentData;
  preview?: boolean;
  onSubmit?: () => Promise<void>;
}>();

const { n, t } = useI18n();

const data = defineModel<JoinFormData>({ required: true });

const buttonText = computed(() => {
  const totalAmount = calcJoinFormTotalAmount(
    data.value,
    props.paymentContent.stripeCountry
  );

  return data.value.noContribution
    ? t('join.now')
    : t('join.contribute', {
        contribution: t('join.contribution.' + data.value.period, {
          amount: n(totalAmount, 'currency'),
        }),
      });
});

useVuelidate({ $stopPropagation: true });
</script>
