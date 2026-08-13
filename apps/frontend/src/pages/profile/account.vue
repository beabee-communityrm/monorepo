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
      <template v-if="generalContent.oidcEnabled">
        <!-- Login details (password, MFA, email) are managed at the identity provider -->
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
import { App2ColGrid, AppButton, AppHeading, PageTitle } from '@beabee/vue';

import { faKey } from '@fortawesome/free-solid-svg-icons';
import { computed, onBeforeMount, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import ContactUpdateAccount from '../../components/contact/ContactUpdateAccount.vue';
import ChangePassword from '../../components/pages/profile/account/ChangePassword.vue';
import SetMFA from '../../components/pages/profile/account/SetMFA.vue';
import { generalContent } from '../../store';
import { addBreadcrumb } from '../../store/breadcrumb';
import { client } from '../../utils/api';
import { routeIcons, routeLabels } from '../../utils/route-nav';

const { t } = useI18n();

const accountUrl = ref<string>();

onBeforeMount(async () => {
  if (generalContent.value.oidcEnabled) {
    accountUrl.value = (await client.auth.info()).accountUrl;
  }
});

addBreadcrumb(
  computed(() => [
    {
      label: t(routeLabels.profileAccount),
      to: '/profile/account',
      icon: routeIcons.profileAccount,
    },
  ])
);
</script>
