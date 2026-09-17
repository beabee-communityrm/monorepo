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
        <div v-if="selfService" class="flex flex-col gap-2 sm:flex-row">
          <AppButton
            :href="selfService.changePassword"
            variant="primaryOutlined"
            :icon="faKey"
          >
            {{ t('accountPage.selfService.changePassword') }}
          </AppButton>
          <AppButton
            :href="selfService.addPasskey"
            variant="primaryOutlined"
            :icon="faFingerprint"
          >
            {{ t('accountPage.selfService.addPasskey') }}
          </AppButton>
          <AppButton
            :href="selfService.setupMfa"
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
import type { AuthInfoSelfServiceData } from '@beabee/beabee-common';
import { App2ColGrid, AppButton, AppHeading, PageTitle } from '@beabee/vue';

import {
  faFingerprint,
  faKey,
  faMobileScreen,
} from '@fortawesome/free-solid-svg-icons';
import { onBeforeMount, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import ContactUpdateAccount from '../../components/contact/ContactUpdateAccount.vue';
import ChangePassword from '../../components/pages/profile/account/ChangePassword.vue';
import SetMFA from '../../components/pages/profile/account/SetMFA.vue';
import { generalContent } from '../../store';
import { client } from '../../utils/api';

const { t } = useI18n();

const selfService = ref<AuthInfoSelfServiceData>();

onBeforeMount(async () => {
  if (generalContent.value.oidcEnabled) {
    const auth = await client.auth.info();
    if (auth.method === 'user') selfService.value = auth.selfService;
  }
});
</script>
