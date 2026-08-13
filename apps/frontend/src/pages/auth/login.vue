<route lang="yaml">
name: login
meta:
  pageTitle: pageTitle.login
  layout: Auth
  noAuth: true
</route>

<template>
  <AuthBox>
    <template v-if="generalContent.oidcEnabled">
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
    </template>
    <AppApiForm
      v-else
      :button-text="t('common.login')"
      inline-error
      full-button
      @submit="submitLogin"
    >
      <AppTitle>{{ t('login.title') }}</AppTitle>

      <div v-if="!env.cnrMode" class="mb-5">
        <span>{{ t('login.notMember') }}</span>
        <router-link
          to="/join"
          class="ml-1 font-semibold text-link underline"
          >{{ t('login.joinNow') }}</router-link
        >
      </div>

      <div class="mb-5">
        <AppInput
          v-model="data.email"
          type="email"
          name="email"
          required
          :label="t('form.email')"
        />
      </div>

      <div class="mb-3">
        <AppInput
          v-model="data.password"
          type="password"
          name="password"
          autocomplete="current-password"
          required
          :label="t('form.password')"
        />
      </div>

      <div class="mb-4">
        <router-link
          class="text-sm underline"
          :to="{ path: '/auth/forgot-password', query: { email: data.email } }"
        >
          {{ t('login.forgotPassword') }}
        </router-link>
      </div>

      <template v-if="hasMFAEnabled">
        <AppNotification
          class="mb-4"
          variant="info"
          :title="t('form.errorMessages.api.mfa-token-required')"
        />

        <div class="mb-3">
          <AppInput
            v-model="data.token"
            type="text"
            name="verifyCode"
            required
            min="6"
            max="6"
            :label="t('accountPage.mfa.codeInput.label')"
          />
        </div>

        <div class="mb-4">
          <router-link
            class="text-sm underline"
            :to="{ path: '/auth/lost-device', query: { email: data.email } }"
          >
            {{ t('login.lostMfaDevice') }}
          </router-link>
        </div>
      </template>
    </AppApiForm>
  </AuthBox>
</template>

<script lang="ts" setup>
import { LOGIN_CODES } from '@beabee/beabee-common';
import type { LoginData } from '@beabee/beabee-common';
import { UnauthorizedError } from '@beabee/client';
import { AppButton, AppInput, AppNotification, AppTitle } from '@beabee/vue';

import { onMounted, reactive, ref, toRef, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

import AuthBox from '#components/AuthBox.vue';
import AppApiForm from '#components/forms/AppApiForm.vue';
import env from '#env';
import { generalContent, updateCurrentUser } from '#store/index';
import { client } from '#utils/api';
import { isInternalUrl } from '#utils/index';

const { t } = useI18n();

const route = useRoute();
const redirectTo = route.query.next as string | undefined;

const data = reactive<LoginData>({
  email: '',
  password: '',
  token: '',
});

const hasMFAEnabled = ref(false);

const errorCodes = ['unlinked-account', 'login-failed'] as const;
const errorCode = errorCodes.find((code) => code === route.query.error);

// The identity provider handles the login itself, this page just forwards
// there via the API's OIDC login endpoint
function redirectToLogin() {
  const next = isInternalUrl(redirectTo) ? redirectTo : '/';
  window.location.href = client.auth.getLoginUrl(next);
}

onMounted(() => {
  if (generalContent.value.oidcEnabled && !errorCode) {
    redirectToLogin();
  }
});

async function submitLogin() {
  try {
    await client.auth.login(data);
    await updateCurrentUser();
    // TODO: use router when legacy app is gone
    window.location.href = isInternalUrl(redirectTo) ? redirectTo : '/';
  } catch (err) {
    if (
      err instanceof UnauthorizedError &&
      err.code === LOGIN_CODES.REQUIRES_2FA
    ) {
      hasMFAEnabled.value = true;
    } else {
      throw err;
    }
  }
}

// Reset MFA if email changed
watch(toRef(data, 'email'), () => (hasMFAEnabled.value = false));
</script>
