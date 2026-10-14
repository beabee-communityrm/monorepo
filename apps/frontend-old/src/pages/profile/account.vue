<route lang="yaml">
name: profileAccount
meta:
  pageTitle: accountPage.title
</route>

<template>
  <PageTitle border :title="t('accountPage.title')" />
  <p class="mb-5 text-sm text-main-80">{{ t('accountPage.subTitle') }}</p>

  <App2ColGrid>
    <template #col1>
      <!-- Login details are managed at the identity provider on OIDC instances -->
      <template v-if="generalContent.oidcEnabled">
        <AppHeading>{{ t('accountPage.selfService.title') }}</AppHeading>
        <p class="mb-4 text-sm text-main-80">
          {{ t('accountPage.selfService.intro') }}
        </p>
        <div class="flex flex-col gap-2 sm:flex-row">
          <AppButton
            :href="loginActionUrl('changePassword')"
            variant="primaryOutlined"
            :icon="faKey"
          >
            {{ t('accountPage.selfService.changePassword') }}
          </AppButton>
          <AppButton
            :href="loginActionUrl('addPasskey')"
            variant="primaryOutlined"
            :icon="faFingerprint"
          >
            {{ t('accountPage.selfService.addPasskey') }}
          </AppButton>
          <AppButton
            :href="loginActionUrl('setupMfa')"
            variant="primaryOutlined"
            :icon="faMobileScreen"
          >
            {{ t('accountPage.selfService.setupMfa') }}
          </AppButton>
        </div>
      </template>
      <template v-else>
        <ChangePassword />
        <SetMFA contact-id="me" />
      </template>
      <Suspense>
        <ContactUpdateAccount id="me" class="mt-6" />
      </Suspense>
    </template>
  </App2ColGrid>
</template>

<script lang="ts" setup>
import type { LoginAction } from '@beabee/beabee-common';
import { App2ColGrid, AppButton, AppHeading, PageTitle } from '@beabee/vue';

import {
  faFingerprint,
  faKey,
  faMobileScreen,
} from '@fortawesome/free-solid-svg-icons';
import { useI18n } from 'vue-i18n';

import ContactUpdateAccount from '../../components/contact/ContactUpdateAccount.vue';
import ChangePassword from '../../components/pages/profile/account/ChangePassword.vue';
import SetMFA from '../../components/pages/profile/account/SetMFA.vue';
import { generalContent } from '../../store';
import { client } from '../../utils/api';

const { t } = useI18n();

// Each action runs at the identity provider inside a login that returns here
const loginActionUrl = (action: LoginAction) =>
  client.auth.getLoginUrl('/profile/account', action);
</script>
