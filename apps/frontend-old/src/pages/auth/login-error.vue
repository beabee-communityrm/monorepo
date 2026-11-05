<route lang="yaml">
name: login-error
meta:
  pageTitle: pageTitle.login
  layout: Auth
  noAuth: true
</route>

<template>
  <AuthBox>
    <AppTitle>{{ t('login.title') }}</AppTitle>
    <AppNotification
      class="mb-4"
      variant="error"
      :title="t(`login.errors.${errorCode}`)"
    />
    <AppButton class="w-full" to="/auth/login">
      {{ t('common.login') }}
    </AppButton>
  </AuthBox>
</template>

<script lang="ts" setup>
import { LOGIN_CODES } from '@beabee/beabee-common';
import { AppButton, AppNotification, AppTitle } from '@beabee/vue';

import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

import AuthBox from '#components/AuthBox.vue';

const { t } = useI18n();
const route = useRoute();

const errorCode =
  route.query.code === LOGIN_CODES.UNLINKED_ACCOUNT
    ? LOGIN_CODES.UNLINKED_ACCOUNT
    : LOGIN_CODES.LOGIN_FAILED;
</script>
