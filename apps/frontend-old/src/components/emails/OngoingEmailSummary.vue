<template>
  <AppNotification
    :variant="notificationVariant"
    :icon="email.isOngoing ? faRotate : faEnvelope"
    :title="
      t(`adminSettings.email.contactTemplates.${summaryKey}`, {
        segment: segmentName,
      })
    "
  >
    <template v-if="email.isOngoing && segmentId" #title>
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

const { t } = useI18n();

interface OngoingEmailData {
  isOngoing: boolean;
  enabled?: boolean;
  trigger?: 'onJoin' | 'onLeave';
  directSend?: boolean;
}

const props = defineProps<{
  email: OngoingEmailData;
  mode: 'edit' | 'send';
  segmentId?: string;
  segmentName?: string;
}>();

const notificationVariant = computed(() =>
  props.email.isOngoing ? (props.email.enabled ? 'success' : 'warning') : 'info'
);

const summaryKey = computed(() => {
  if (!props.email.isOngoing) {
    return props.mode === 'edit' ? 'summaryTemplate' : 'summaryOnceOnly';
  }
  if (!props.email.enabled) return 'summaryOngoingPaused';
  if (props.email.trigger === 'onLeave') return 'summaryOngoingLeave';
  if (props.email.directSend) return 'summaryOngoingJoinDirectSend';
  return 'summaryOngoingJoin';
});
</script>
