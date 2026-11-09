<!--
  # CalloutClosedNotice
  Shown on the respond view when a CrowdNewsroom has ended, so someone landing
  there from an old link or an embed sees why there's no form. The caller
  decides when to show it.
-->
<template>
  <AppNoticeCard
    icon="i-lucide-lock"
    :title="t('callout.closedOn', { date: formatLocale(expires, 'PPP') })"
    fill="gradient"
  >
    <p class="text-muted">{{ t('callout.closedNoEdit') }}</p>
  </AppNoticeCard>
</template>

<script lang="ts" setup>
import { AppNoticeCard, formatLocale } from '@beabee/vue';

import { useI18n } from 'vue-i18n';

/** Props for CalloutClosedNotice */
export interface CalloutClosedNoticeProps {
  /** When the CrowdNewsroom closed */
  expires: Date;
}

defineProps<CalloutClosedNoticeProps>();

const { t } = useI18n();
</script>
