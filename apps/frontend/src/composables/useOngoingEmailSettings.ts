import type {
  CreateEmailData,
  GetEmailData,
  SegmentOngoingEmailTrigger,
  UpdateEmailData,
} from '@beabee/beabee-common';

import { computed, ref } from 'vue';

/**
 * Composable for managing ongoing email settings state.
 * Used by both the send-email page (create) and the edit-email page (update).
 */
export function useOngoingEmailSettings() {
  const isOngoing = ref(false);
  const trigger = ref<SegmentOngoingEmailTrigger>('onJoin');
  const directSend = ref(false);
  const enabled = ref(true);

  const shouldSendImmediately = computed(
    () => !isOngoing.value || (directSend.value && trigger.value === 'onJoin')
  );

  /** Populate state from a loaded email (edit page). */
  function loadFromEmail(data: GetEmailData) {
    isOngoing.value = !!data.isOngoing;
    trigger.value = data.trigger || 'onJoin';
    enabled.value = data.enabled ?? true;
  }

  /** Build the ongoing-related fields for a create payload. */
  function buildCreatePayload(
    segmentId?: string
  ): Pick<CreateEmailData, 'isOngoing' | 'segmentId' | 'trigger' | 'enabled'> {
    if (!isOngoing.value) return {};
    return {
      isOngoing: true,
      segmentId,
      trigger: trigger.value,
      enabled: enabled.value,
    };
  }

  /** Build the ongoing-related fields for an update payload. */
  function buildUpdatePayload(
    segmentId?: string
  ): Pick<UpdateEmailData, 'isOngoing' | 'segmentId' | 'trigger' | 'enabled'> {
    return {
      isOngoing: isOngoing.value,
      ...(isOngoing.value && {
        segmentId,
        trigger: trigger.value,
        enabled: enabled.value,
      }),
    };
  }

  return {
    isOngoing,
    trigger,
    directSend,
    enabled,
    shouldSendImmediately,
    loadFromEmail,
    buildCreatePayload,
    buildUpdatePayload,
  };
}
