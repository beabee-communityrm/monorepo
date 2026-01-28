<route lang="yaml">
name: lost-device
meta:
  layout: Auth
  pageTitle: pageTitle.lostDevice
  noAuth: true
</route>

<template>
  <AuthBox>
    <AppTitle>{{ t('lostDevice.title') }}</AppTitle>

    <template v-if="!isRequestSuccessful">
      <AppApiForm
        :button-text="t('actions.reset2FA')"
        inline-error
        full-button
        @submit="submitLostDevice"
      >
        <p class="mb-4">{{ t('lostDevice.description') }}</p>

        <div class="mb-4">
          <AppInput
            v-model="email"
            type="email"
            name="email"
            :label="t('form.email')"
            required
          />
        </div>
      </AppApiForm>
    </template>

    <template v-else>
      <p class="rounded bg-primary-10 p-4">
        <i18n-t keypath="lostDevice.message">
          <template #email>
            <b>{{ email }}</b>
          </template>
        </i18n-t>
      </p>
    </template>

    <div class="mt-2 text-center">
      <AppButton to="/auth/login" variant="text" size="sm">
        {{ t('actions.backToLogin') }}
      </AppButton>
    </div>
  </AuthBox>
</template>

<script lang="ts" setup>
import { AppButton, AppInput, AppTitle } from '@beabee/vue';

import AuthBox from '@components/AuthBox.vue';
import AppApiForm from '@components/forms/AppApiForm.vue';
import { client } from '@utils/api';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

const { t } = useI18n();
const route = useRoute();

const isRequestSuccessful = ref(false);

const email = ref(route.query.email?.toString() || '');

const submitLostDevice = async () => {
  await client.resetSecurity.resetDeviceBegin(email.value);
  isRequestSuccessful.value = true;
};
</script>
