<route lang="yaml">
name: profileAccount
meta:
  pageTitle: accountPage.title
</route>

<template>
  <div class="nuxt-page mx-auto flex max-w-2xl flex-col gap-6">
    <div
      class="bg-elevated text-muted flex items-start gap-3 rounded-xl px-4 py-3"
    >
      <UIcon
        name="i-lucide-shield"
        class="text-primary mt-0.5 size-5 shrink-0"
      />
      <p>{{ t('accountPage.subTitle-nuxt') }}</p>
    </div>

    <UTabs :items="items" class="w-full">
      <template #contact>
        <AccountForm />
      </template>
      <template #security>
        <div class="flex flex-col gap-4">
          <ChangePassword />
          <SetMFA contact-id="me" />
        </div>
      </template>
      <template #subscriptions>
        <AccountNewsletterSubscriptions />
      </template>
    </UTabs>

    <p class="text-muted px-1">
      <span class="text-primary font-medium">*</span>
      {{ t('accountPage.requiredFields') }}
    </p>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import AccountForm from '../../components/pages/profile/account/AccountForm.vue';
import AccountNewsletterSubscriptions from '../../components/pages/profile/account/AccountNewsletterSubscriptions.vue';
import ChangePassword from '../../components/pages/profile/account/ChangePassword.vue';
import SetMFA from '../../components/pages/profile/account/SetMFA.vue';
import { addBreadcrumb } from '../../store/breadcrumb';
import { routeIcons, routeLabels } from '../../utils/route-nav';
import type { TabsItem } from '@nuxt/ui';

const { t } = useI18n();

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
