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
      <template v-if="accountUrl">
        <AppHeading>
          {{ t('accountPage.loginDetail') }}
        </AppHeading>
        <AppButton
          :href="accountUrl"
          external
          variant="primaryOutlined"
          :icon="faKey"
        >
          {{ t('accountPage.manageAccount') }}
        </AppButton>
      </template>
      <Suspense>
        <ContactUpdateAccount id="me" class="mt-6" />
      </Suspense>
    </template>
  </App2ColGrid>
</template>

<script lang="ts" setup>
import { App2ColGrid, AppButton, AppHeading, PageTitle } from '@beabee/vue';

import { faKey } from '@fortawesome/free-solid-svg-icons';
import { onBeforeMount, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import ContactUpdateAccount from '../../components/contact/ContactUpdateAccount.vue';
import { client } from '../../utils/api';

const { t } = useI18n();

// Login details (password, MFA, email) are managed at the identity provider
const accountUrl = ref<string>();

onBeforeMount(async () => {
  accountUrl.value = (await client.auth.info()).accountUrl;
});
</script>
