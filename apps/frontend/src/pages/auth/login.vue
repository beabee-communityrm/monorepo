<route lang="yaml">
name: login
meta:
  pageTitle: pageTitle.login
  layout: Auth
  noAuth: true
</route>

<template>
  <AuthBox>
    <AppForm
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
    </AppForm>
  </AuthBox>
</template>

<script lang="ts" setup>
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { reactive, ref, toRef, watch } from 'vue';

import AppInput from '@components/forms/AppInput.vue';
import AppForm from '@components/forms/AppForm.vue';
import AppNotification from '@components/AppNotification.vue';
import AppTitle from '@components/AppTitle.vue';
import AuthBox from '@components/AuthBox.vue';

import { isInternalUrl } from '@utils/index';
import { login } from '@utils/api/auth';
import { isRequestError } from '@utils/api/index';

import { updateCurrentUser } from '@store/index';

import { LOGIN_CODES } from '@enums/login-codes';

import { type LoginData } from '@type';
import env from '@env';

const { t } = useI18n();

const route = useRoute();
const redirectTo = route.query.next as string | undefined;

const data = reactive<LoginData>({
  email: '',
  password: '',
  token: '',
});

const hasMFAEnabled = ref(false);

async function submitLogin() {
  try {
    await login(data);
    await updateCurrentUser();
    // TODO: use router when legacy app is gone
    window.location.href = isInternalUrl(redirectTo) ? redirectTo : '/';
  } catch (err) {
    if (isRequestError(err, [LOGIN_CODES.REQUIRES_2FA], [401])) {
      hasMFAEnabled.value = true;
    } else {
      throw err;
    }
  }
}

// Reset MFA if email changed
watch(toRef(data, 'email'), () => (hasMFAEnabled.value = false));
</script>
