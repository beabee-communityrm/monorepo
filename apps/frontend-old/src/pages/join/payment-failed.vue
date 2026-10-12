<route lang="yaml">
name: joinPaymentFailed
meta:
  pageTitle: pageTitle.paymentFailed
  layout: Auth
  noAuth: true
</route>

<template>
  <AuthBox>
    <AppTitle big>
      {{ t('join.errors.paymentFailed.title') }}
    </AppTitle>
    <p class="mb-5 md:text-lg">{{ t('join.errors.paymentFailed.message') }}</p>

    <AppButton to="/join" class="w-full">
      {{ t('join.errors.paymentFailed.backToJoin') }}
    </AppButton>
  </AuthBox>
</template>

<script lang="ts" setup>
import { AppButton, AppTitle } from '@beabee/vue';

import { useI18n } from 'vue-i18n';

import AuthBox from '../../components/AuthBox.vue';

const { t } = useI18n();
</script>
