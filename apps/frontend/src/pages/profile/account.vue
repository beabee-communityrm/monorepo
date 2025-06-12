<route lang="yaml">
name: profileAccount
meta:
  pageTitle: accountPage.title
</route>

<template>
  <PageTitle border :title="t('accountPage.title')" />
  <p class="mb-5 text-sm text-primary-80">{{ t('accountPage.subTitle') }}</p>

  <App2ColGrid>
    <template #col1>
      <ChangePassword />
      <SetMFA contact-id="me" />
      <Suspense>
        <ContactUpdateAccount id="me" class="mt-6" />
      </Suspense>
    </template>
  </App2ColGrid>
</template>

<script lang="ts" setup>
import { App2ColGrid } from '@beabee/vue';

import { useI18n } from 'vue-i18n';

import PageTitle from '../../components/PageTitle.vue';
import ContactUpdateAccount from '../../components/contact/ContactUpdateAccount.vue';
import ChangePassword from '../../components/pages/profile/account/ChangePassword.vue';
import SetMFA from '../../components/pages/profile/account/SetMFA.vue';

const { t } = useI18n();
</script>
