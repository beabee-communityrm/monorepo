<route lang="yaml">
name: profileAccount
meta:
  pageTitle: accountPage.title
</route>

<template>
  <div class="nuxt-page mx-auto flex max-w-2xl flex-col gap-6">
    <div
      class="flex items-start gap-3 rounded-xl bg-elevated px-4 py-3 text-muted"
    >
      <UIcon
        name="i-lucide-shield"
        class="mt-0.5 size-5 shrink-0 text-primary"
      />
      <p>{{ t('accountPage.subTitle-nuxt') }}</p>
    </div>

    <UTabs :items="items" class="w-full">
      <template #contact>
        <AccountForm />
      </template>
      <template #security>
        <!-- Login details are managed at the identity provider on OIDC instances -->
        <div v-if="generalContent.oidcEnabled" class="flex flex-col gap-4">
          <p class="text-muted">{{ t('accountPage.selfService.intro') }}</p>
          <div v-if="selfService" class="flex flex-col gap-2 sm:flex-row">
            <UButton
              :to="selfService.changePassword"
              external
              icon="i-lucide-key-round"
              variant="outline"
            >
              {{ t('accountPage.selfService.changePassword') }}
            </UButton>
            <UButton
              :to="selfService.addPasskey"
              external
              icon="i-lucide-fingerprint"
              variant="outline"
            >
              {{ t('accountPage.selfService.addPasskey') }}
            </UButton>
            <UButton
              :to="selfService.setupMfa"
              external
              icon="i-lucide-smartphone"
              variant="outline"
            >
              {{ t('accountPage.selfService.setupMfa') }}
            </UButton>
          </div>
        </div>
        <div v-else class="flex flex-col gap-4">
          <ChangePassword />
          <SetMFA contact-id="me" />
        </div>
      </template>
      <template #subscriptions>
        <AccountNewsletterSubscriptions />
      </template>
    </UTabs>

    <p class="px-1 text-muted">
      <span class="font-medium text-primary">*</span>
      {{ t('accountPage.requiredFields') }}
    </p>
  </div>
</template>

<script lang="ts" setup>
import type { AuthInfoSelfServiceData } from '@beabee/beabee-common';

import { computed, onBeforeMount, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import AccountForm from '../../components/pages/profile/account/AccountForm.vue';
import AccountNewsletterSubscriptions from '../../components/pages/profile/account/AccountNewsletterSubscriptions.vue';
import ChangePassword from '../../components/pages/profile/account/ChangePassword.vue';
import SetMFA from '../../components/pages/profile/account/SetMFA.vue';
import { generalContent } from '../../store';
import { addBreadcrumb } from '../../store/breadcrumb';
import { client } from '../../utils/api';
import { routeIcons, routeLabels } from '../../utils/route-nav';
import type { TabsItem } from '@nuxt/ui';

const { t } = useI18n();

const selfService = ref<AuthInfoSelfServiceData>();

onBeforeMount(async () => {
  if (generalContent.value.oidcEnabled) {
    const auth = await client.auth.info();
    if (auth.method === 'user') selfService.value = auth.selfService;
  }
});

const items = computed<TabsItem[]>(() => [
  {
    label: t('accountPage.contactInformation'),
    icon: 'i-lucide-contact',
    slot: 'contact',
  },
  {
    label: t('accountPage.security'),
    icon: 'i-lucide-shield',
    slot: 'security',
  },
  {
    label: t('accountPage.subscriptions'),
    icon: 'i-lucide-mail',
    slot: 'subscriptions',
  },
]);

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
