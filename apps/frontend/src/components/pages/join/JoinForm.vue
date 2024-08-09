<template>
  <AuthBox v-if="generalContent.hideContribution">
    <template v-if="!isEmbed">
      <AppTitle>{{ joinContent.title }}</AppTitle>
      <div class="content-message mb-6" v-html="joinContent.subtitle" />
    </template>
    <AppForm :button-text="buttonText" full-button @submit="onSubmit">
      <AccountSection v-model:email="signUpData.email" class="mb-6" />
    </AppForm>
  </AuthBox>

  <AuthBox v-else :title="joinContent.title" :preview="preview">
    <template #header>
      <div class="content-message" v-html="joinContent.subtitle" />
    </template>

    <div class="mb-6">Navigation controls</div>

    <AppForm :button-text="buttonText" full-button @submit="onSubmit">
      <ContributionPeriodVue v-model="signUpData.period" class="mb-6" />

      <ContributionAmount
        v-model="signUpData.amount"
        :min-amount="
          joinContent.minMonthlyAmount *
          (signUpData.period === ContributionPeriod.Annually ? 12 : 1)
        "
        :preset-amounts="joinContent.presetAmounts[signUpData.period]"
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
import {
  ContributionPeriod,
  type ContentJoinData,
  type ContentPaymentData,
} from '@beabee/beabee-common';
import { computed, toRef, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import useVuelidate from '@vuelidate/core';
import { generalContent, isEmbed } from '@store';
import { useJoin } from './use-join';

import AccountSection from './AccountSection.vue';
import AppForm from '@components/forms/AppForm.vue';
import AuthBox from '@components/AuthBox.vue';
import AppTitle from '@components/AppTitle.vue';
import ContributionPeriodVue from '@components/contribution/ContributionPeriod.vue';
import ContributionAmount from '@components/contribution/ContributionAmount.vue';

import beabeeLogo from '@assets/images/beabee-logo.png';

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

// Change amount when switching periods
watch(
  () => signUpData.period,
  (period) => {
    signUpData.amount =
      period === ContributionPeriod.Annually
        ? signUpData.amount * 12
        : Math.floor(signUpData.amount / 12);
  }
);

const buttonText = computed(() => {
  return signUpData.noContribution
    ? t('join.now')
    : //: t('join.contribute', signUpDescription.value);
      'Next: Payment method';
});

useVuelidate({ $stopPropagation: true });
</script>
