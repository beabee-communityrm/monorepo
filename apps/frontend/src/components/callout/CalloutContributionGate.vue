<!--
  # CalloutContributionGate
  Shown in place of the respond action when a CrowdNewsroom is open to members
  only and the current user is logged in but isn't a member. The caller decides
  when to show it — see `showMemberOnlyPrompt` in `useCallout`.
-->
<template>
  <AppNoticeCard
    icon="i-lucide-lock"
    :title="t('callouts.access.member')"
    fill="gradient"
  >
    <p class="text-muted">
      {{ t('callout.membersOnly-nuxt') }}
      {{ t('callout.updateContribution-nuxt') }}
    </p>

    <template #actions>
      <UButton to="/profile/contribution">
        {{ t('callout.toContributionPage') }}
      </UButton>
    </template>
  </AppNoticeCard>
</template>

<script lang="ts" setup>
import { AppNoticeCard } from '@beabee/vue';

import { useI18n } from 'vue-i18n';

const { t } = useI18n();
</script>
