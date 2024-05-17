<route lang="yaml">
name: confirmEmail
meta:
  layout: Auth
  noAuth: true
  pageTitle: pageTitle.confirmEmail
</route>

<template>
  <AuthBox>
    <AppTitle big>
      {{ t('join.errors.confirmEmail.title') }}
    </AppTitle>
    <div class="md:text-lg">
      <p class="mb-3">
        {{ t('join.errors.confirmEmail.message') }}
      </p>
      <p class="font-bold">{{ t('join.errors.confirmEmail.proceed') }}</p>
    </div>
  </AuthBox>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import AppTitle from '../../../components/AppTitle.vue';
import AuthBox from '../../../components/AuthBox.vue';
const { t } = useI18n();
</script>
