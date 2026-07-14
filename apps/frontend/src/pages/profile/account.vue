<route lang="yaml">
name: profileAccount
meta:
  pageTitle: accountPage.title
</route>

<template>
  <div class="mx-auto flex max-w-2xl flex-col gap-6">
    <div
      class="bg-elevated text-muted flex items-start gap-3 rounded-xl px-4 py-3 text-xs"
    >
      <UIcon
        name="i-lucide-shield"
        class="text-primary mt-0.5 size-4 shrink-0"
      />
      <p>{{ t('accountPage.subTitle') }}</p>
    </div>

    <AccountForm />
    <ChangePassword />
    <SetMFA contact-id="me" />

    <p class="text-muted px-1 text-xs">
      <span class="text-primary font-medium">*</span>
      {{ t('accountPage.requiredFields') }}
    </p>
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n';

import AccountForm from '../../components/pages/profile/account/AccountForm.vue';
import ChangePassword from '../../components/pages/profile/account/ChangePassword.vue';
import SetMFA from '../../components/pages/profile/account/SetMFA.vue';

const { t } = useI18n();
</script>
