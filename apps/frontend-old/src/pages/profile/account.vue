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
      <LoginMethods v-if="generalContent.oidcEnabled" />
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
import { App2ColGrid, PageTitle } from '@beabee/vue';

import { useI18n } from 'vue-i18n';

import ContactUpdateAccount from '../../components/contact/ContactUpdateAccount.vue';
import ChangePassword from '../../components/pages/profile/account/ChangePassword.vue';
import LoginMethods from '../../components/pages/profile/account/LoginMethods.vue';
import SetMFA from '../../components/pages/profile/account/SetMFA.vue';
import { generalContent } from '../../store';

const { t } = useI18n();
</script>
