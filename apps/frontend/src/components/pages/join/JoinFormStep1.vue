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
      <AccountSection v-model:email="signUpData.email" class="mb-6" />
    </AppForm>
  </AuthBox>

  <AuthBox v-else :title="joinContent.title" :preview="preview">
    <template #header>
      <div class="content-message" v-html="joinContent.subtitle" />
    </template>

    <AppForm :button-text="buttonText" full-button @submit="onSubmit">
      <AppContribution
        v-model:amount="signUpData.amount"
        v-model:period="signUpData.period"
        v-model:pay-fee="signUpData.payFee"
        v-model:payment-method="signUpData.paymentMethod"
        :content="joinContent"
        :payment-content="paymentContent"
        :disabled="signUpData.noContribution"
      >
        <AppCheckbox
          v-if="joinContent.showNoContribution"
          v-model="signUpData.noContribution"
          class="mb-4"
          :label="t('join.noContribution')"
        />
        <AccountSection v-model:email="signUpData.email" class="my-6" />
      </AppContribution>
    </AppForm>

    <div class="mt-3 text-center text-xs">
      <p
        v-if="!signUpData.noContribution && paymentContent.taxRateEnabled"
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
import type {
  ContentJoinData,
  ContentPaymentData,
} from '@beabee/beabee-common';
import { AppCheckbox, AppForm, AppTitle } from '@beabee/vue';

import beabeeLogo from '@assets/images/beabee-logo.png';
import AuthBox from '@components/AuthBox.vue';
import AppContribution from '@components/contribution/AppContribution.vue';
import { generalContent, isEmbed } from '@store';
import { extractApiErrorCode } from '@utils/api-error';
import useVuelidate from '@vuelidate/core';
import { computed, toRef } from 'vue';
import { useI18n } from 'vue-i18n';

import AccountSection from './AccountSection.vue';
import { useJoin } from './use-join';

const props = defineProps<{
  joinContent: ContentJoinData;
  paymentContent: ContentPaymentData;
  preview?: boolean;
  onSubmit?: () => Promise<void>;
}>();

const { t } = useI18n();

const { signUpData, signUpDescription } = useJoin(
  toRef(props, 'paymentContent')
);

const buttonText = computed(() => {
  return signUpData.noContribution
    ? t('join.now')
    : t('join.contribute', signUpDescription.value);
});

useVuelidate({ $stopPropagation: true });
</script>
