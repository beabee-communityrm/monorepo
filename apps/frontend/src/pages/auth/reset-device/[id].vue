<route lang="yaml">
name: reset_device
meta:
  pageTitle: pageTitle.resetDevice
  layout: Auth
  noAuth: true
</route>

<template>
  <AuthBox>
    <AppForm
      :button-text="t('actions.reset2FA')"
      :success-text="t('resetDevice.success')"
      :error-text="{
        [LOGIN_CODES.LOGIN_FAILED]: t('resetDevice.invalidPassword'),
        unknown: t('resetDevice.failed'),
      }"
      inline-error
      full-button
      @submit="handleSubmit"
    >
      <AppTitle>
        {{ t('resetDevice.title') }}
      </AppTitle>

      <p class="mb-4 font-semibold">
        {{ t('resetDevice.description') }}
      </p>

      <div class="mb-4">
        <AppInput
          v-model="data.password"
          :label="t('form.password')"
          type="password"
          name="password"
          autocomplete="current-password"
          required
        />
      </div>
    </AppForm>
  </AuthBox>
</template>

<script lang="ts" setup>
import { reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

import AppInput from '@components/forms/AppInput.vue';
import AppTitle from '@components/AppTitle.vue';
import AuthBox from '@components/AuthBox.vue';
import AppForm from '@components/forms/AppForm.vue';

import { resetDeviceComplete } from '@utils/api/reset-security-flow';
import { isInternalUrl } from '@utils/index';

import { updateCurrentUser } from '@store/index';
import { LOGIN_CODES } from '@enums/login-codes';

const props = defineProps<{ id: string }>();

const { t } = useI18n();

const route = useRoute();
const router = useRouter();

const redirectTo = route.query.next as string | undefined;

const data = reactive({ password: '' });

async function handleSubmit() {
  await resetDeviceComplete(props.id, data.password);
  await updateCurrentUser();
  if (isInternalUrl(redirectTo)) {
    // TODO: use router when legacy app is gone
    window.location.href = redirectTo;
  } else {
    router.push({ path: '/profile/account' });
  }
}
</script>
