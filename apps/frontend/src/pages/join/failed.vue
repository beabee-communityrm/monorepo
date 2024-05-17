<route lang="yaml">
name: joinFailed
meta:
  pageTitle: pageTitle.failed
  layout: Auth
  noAuth: true
</route>

<template>
  <AuthBox>
    <AppTitle big>
      {{ t('join.errors.failed.title') }}
    </AppTitle>
    <p class="mb-5 md:text-lg">{{ t('join.errors.failed.message') }}</p>

    <AppButton to="/join" class="w-full">
      {{ t('join.errors.failed.backToJoin') }}
    </AppButton>
  </AuthBox>
</template>

<script lang="ts" setup>
import AppButton from '../../components/button/AppButton.vue';
import { useI18n } from 'vue-i18n';
import AppTitle from '../../components/AppTitle.vue';
import AuthBox from '../../components/AuthBox.vue';

const { t } = useI18n();
</script>
