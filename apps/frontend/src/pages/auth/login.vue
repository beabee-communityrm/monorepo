<route lang="yaml">
name: login
meta:
  pageTitle: pageTitle.login
  layout: Auth
  noAuth: true
</route>

<template>
  <AuthBox>
    <AppTitle>{{ t('login.title') }}</AppTitle>
    <template v-if="errorCode">
      <AppNotification
        class="mb-4"
        variant="error"
        :title="t(`login.errors.${errorCode}`)"
      />
      <AppButton class="w-full" @click="redirectToLogin">
        {{ t('common.login') }}
      </AppButton>
    </template>
  </AuthBox>
</template>

<script lang="ts" setup>
import { AppButton, AppNotification, AppTitle } from '@beabee/vue';

import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

import AuthBox from '#components/AuthBox.vue';
import env from '#env';
import { isInternalUrl } from '#utils/index';

const { t } = useI18n();

const route = useRoute();
const redirectTo = route.query.next as string | undefined;

const errorCodes = ['unlinked-account', 'login-failed'] as const;
const errorCode = errorCodes.find((code) => code === route.query.error);

// The identity provider handles the login itself, this page just forwards
// there via the API's OIDC login endpoint
function redirectToLogin() {
  const next = isInternalUrl(redirectTo) ? redirectTo : '/';
  window.location.href = `${env.apiUrl}auth/login?next=${encodeURIComponent(next)}`;
}

onMounted(() => {
  if (!errorCode) {
    redirectToLogin();
  }
});
</script>
