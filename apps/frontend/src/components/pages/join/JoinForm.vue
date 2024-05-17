<template>
  <AuthBox :title="joinContent.title" :preview="preview">
    <template #header>
      <div class="content-message" v-html="joinContent.subtitle" />
    </template>

    <AppForm :button-text="buttonText" full-button @submit="onSubmit">
      <AccountSection
        v-if="generalContent.hideContribution"
        v-model:email="signUpData.email"
        v-model:password="signUpData.password"
        class="mb-6"
      />
      <Contribution
        v-else
        v-model:amount="signUpData.amount"
        v-model:period="signUpData.period"
        v-model:payFee="signUpData.payFee"
        v-model:paymentMethod="signUpData.paymentMethod"
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
        <AccountSection
          v-model:email="signUpData.email"
          v-model:password="signUpData.password"
          class="my-6"
        />
      </Contribution>
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
import { computed, toRef } from 'vue';
import { useI18n } from 'vue-i18n';
import useVuelidate from '@vuelidate/core';
import { generalContent } from '@store';
import { useJoin } from './use-join';

import beabeeLogo from '@assets/images/beabee-logo.png';

import AccountSection from './AccountSection.vue';
import Contribution from '@components/contribution/Contribution.vue';
import AppCheckbox from '@components/forms/AppCheckbox.vue';
import AppForm from '@components/forms/AppForm.vue';
import AuthBox from '@components/AuthBox.vue';

import type { ContentJoinData, ContentPaymentData } from '@type';

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
