<route lang="yaml">
name: reset_password
meta:
  pageTitle: pageTitle.resetPassword
  layout: Auth
  noAuth: true
</route>

<template>
  <AuthBox>
    <AppForm
      :button-text="
        mode === 'set' ? t('common.login') : t('actions.changePassword')
      "
      :success-text="t('resetPassword.success')"
      :error-text="{ unknown: t('resetPassword.failed') }"
      inline-error
      full-button
      @submit="handleSubmit"
    >
      <AppTitle>
        {{ mode === 'set' ? t('setPassword.title') : t('resetPassword.title') }}
      </AppTitle>

      <p class="mb-4 font-semibold">
        {{
          mode === 'set'
            ? t('setPassword.description')
            : t('resetPassword.description')
        }}
      </p>

      <div class="mb-4">
        <AppInput
          v-model="data.password"
          :label="t('form.newPassword')"
          :info-message="t('form.passwordInfo')"
          type="password"
          name="password"
          autocomplete="new-password"
          required
        />
      </div>

      <div class="mb-4">
        <AppInput
          v-model="data.repeatPassword"
          :label="t('form.newPasswordConfirm')"
          type="password"
          name="confirmPassword"
          autocomplete="new-password"
          :same-as="data.password"
          required
        />
      </div>

      <template v-if="hasMFAEnabled">
        <AppNotification
          variant="info"
          class="mb-4"
          :title="t('form.errorMessages.api.mfa-token-required')"
        />

        <div class="mb-4">
          <AppInput
            v-model="data.token"
            type="text"
            name="verifyCode"
            required
            min="6"
            max="6"
            :label="t('accountPage.mfa.codeInput.label')"
            :info-message="t('resetPassword.lostDevice')"
          />
        </div>
      </template>
    </AppForm>

    <div v-if="mode === 'reset'" class="mt-4 text-center">
      <router-link
        variant="link"
        to="/auth/login"
        class="font-semibold text-link underline"
        >{{ t('resetPassword.login') }}</router-link
      >
    </div>
  </AuthBox>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

import AppInput from '@components/forms/AppInput.vue';
import AppNotification from '@components/AppNotification.vue';
import AppTitle from '@components/AppTitle.vue';
import AuthBox from '@components/AuthBox.vue';
import AppForm from '@components/forms/AppForm.vue';

import { resetPasswordComplete } from '@utils/api/reset-security-flow';
import { isInternalUrl } from '@utils/index';
import { isRequestError } from '@utils/api';

import { updateCurrentUser } from '@store/index';

import { RESET_SECURITY_FLOW_ERROR_CODE } from '@enums/reset-security-flow-error-code';

const props = withDefaults(
  defineProps<{
    id: string;
    mode?: 'set' | 'reset';
  }>(),
  { mode: 'reset' }
);

const { t } = useI18n();

const route = useRoute();
const router = useRouter();

const redirectTo = route.query.next as string | undefined;

const hasMFAEnabled = ref(false);
const data = reactive({ password: '', repeatPassword: '', token: '' });

async function handleSubmit() {
  try {
    await resetPasswordComplete(
      props.id,
      data.password,
      data.token || undefined
    );
    await updateCurrentUser();

    if (isInternalUrl(redirectTo)) {
      // TODO: use router when legacy app is gone
      window.location.href = redirectTo;
    } else {
      router.push({ path: '/profile/account' });
    }
  } catch (err) {
    if (
      isRequestError(
        err,
        [RESET_SECURITY_FLOW_ERROR_CODE.MFA_TOKEN_REQUIRED],
        [400]
      )
    ) {
      hasMFAEnabled.value = true;
      return false;
    }

    throw err;
  }
}
</script>
