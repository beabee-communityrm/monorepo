<!--
  # CalloutLoginGate
  Shown in place of the respond action when a CrowdNewsroom is open to members
  only and nobody is logged in. The caller decides when to show it — see
  `showLoginPrompt` in `useCallout`.
-->
<template>
  <AppNoticeCard
    icon="i-lucide-lock"
    :title="t('callouts.access.member')"
    fill="gradient"
  >
    <p class="text-muted">
      {{ t('callout.membersOnly-nuxt') }}
      {{ t('callout.logInOrSignUp') }}
    </p>

    <template #actions>
      <UButton to="/auth/login">
        {{ t('callout.loginToYourAccount-nuxt') }}
      </UButton>
      <UButton color="primary" variant="outline" to="/join">
        {{ t('callout.joinNow') }}
      </UButton>
    </template>
  </AppNoticeCard>
</template>

<script lang="ts" setup>
import { AppNoticeCard } from '@beabee/vue';

import { useI18n } from 'vue-i18n';

const { t } = useI18n();
</script>
