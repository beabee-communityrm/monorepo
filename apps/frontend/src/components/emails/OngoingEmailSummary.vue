<template>
  <AppNotification
    :variant="notificationVariant"
    :icon="isOngoing ? faRotate : faEnvelope"
    :title="
      t(`adminSettings.email.contactTemplates.${summaryKey}`, {
        segment: segmentName,
      })
    "
  >
    <template v-if="isOngoing && segmentId" #title>
      <i18n-t :keypath="`adminSettings.email.contactTemplates.${summaryKey}`">
        <template #segment>
          <router-link
            :to="`/admin/contacts?segment=${segmentId}`"
            class="font-bold text-link"
          >
            {{ segmentName }}
          </router-link>
        </template>
      </i18n-t>
    </template>
  </AppNotification>
</template>

<script lang="ts" setup>
import { AppNotification } from '@beabee/vue';

import { faEnvelope, faRotate } from '@fortawesome/free-solid-svg-icons';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import type { OngoingEmailSummaryKey } from '#composables/useOngoingEmailSettings';

const { t } = useI18n();

const props = defineProps<{
  summaryKey: OngoingEmailSummaryKey;
  isOngoing: boolean;
  enabled?: boolean;
  segmentId?: string;
  segmentName?: string;
}>();

const notificationVariant = computed(() => {
  if (!props.isOngoing) return 'info';
  return props.enabled ? 'success' : 'warning';
});
</script>
