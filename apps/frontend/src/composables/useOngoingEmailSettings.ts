import type {
  CreateEmailData,
  GetEmailData,
  SegmentOngoingEmailTrigger,
  UpdateEmailData,
} from '@beabee/beabee-common';

import { computed, ref } from 'vue';

export type OngoingEmailSummaryKey =
  | 'summaryOnceOnly'
  | 'summaryTemplate'
  | 'summaryOngoingPaused'
  | 'summaryOngoingLeave'
  | 'summaryOngoingJoinDirectSend'
  | 'summaryOngoingJoin';

/**
 * Composable for managing ongoing email settings state.
 * Used by both the send-email page (create) and the edit-email page (update).
 */
export function useOngoingEmailSettings(segmentId: string | undefined) {
  const isOngoing = ref(false);
  const trigger = ref<SegmentOngoingEmailTrigger>('onJoin');
  const directSend = ref(false);
  const enabled = ref(true);

  const shouldSendImmediately = computed(
    () => !isOngoing.value || (directSend.value && trigger.value === 'onJoin')
  );

  /**
   * Returns the i18n key suffix for the current settings summary.
   * In 'edit' mode, non-ongoing emails use 'summaryTemplate' instead of 'summaryOnceOnly'.
   */
  function getSummaryKey(
    mode: 'create' | 'edit' = 'create'
  ): OngoingEmailSummaryKey {
    if (!isOngoing.value) {
      return mode === 'edit' ? 'summaryTemplate' : 'summaryOnceOnly';
    }
    if (!enabled.value) return 'summaryOngoingPaused';
    if (trigger.value === 'onLeave') return 'summaryOngoingLeave';
    if (directSend.value) return 'summaryOngoingJoinDirectSend';
    return 'summaryOngoingJoin';
  }

  /** Reactive summary key for create mode. */
  const summaryKey = computed<OngoingEmailSummaryKey>(() => getSummaryKey());

  /** Populate state from a loaded email (edit page). */
  function loadFromEmail(data: GetEmailData) {
    isOngoing.value = !!data.isOngoing;
    trigger.value = data.trigger || 'onJoin';
    enabled.value = data.enabled ?? true;
  }

  /** Build the ongoing-related fields for a create payload. */
  function buildCreatePayload(
    segmentId?: string
  ): Pick<CreateEmailData, 'ongoingEmail'> {
    if (!isOngoing.value) return {};
    return {
      ongoingEmail: {
        isOngoing: true,
        segmentId,
        trigger: trigger.value,
        enabled: enabled.value,
      },
    };
  }

  /** Build the ongoing-related fields for an update payload. */
  function buildUpdatePayload(
    segmentId?: string
  ): Pick<UpdateEmailData, 'ongoingEmail'> {
    return {
      ongoingEmail: {
        isOngoing: isOngoing.value,
        ...(isOngoing.value && {
          segmentId,
          trigger: trigger.value,
          enabled: enabled.value,
        }),
      },
    };
  }

  /** Reactive send type properties that depend on isOngoing. */
  const sendType = computed({
    get: () => (isOngoing.value ? 'ongoing' : 'oneOff'),
    set: (val) => {
      isOngoing.value = val === 'ongoing';
    },
  });

  /** Reactive property that sees if ongoing emails can be enabled or not. */
  const canEnableOngoing = computed(() => !!segmentId);

  return {
    isOngoing,
    trigger,
    directSend,
    sendType,
    enabled,
    canEnableOngoing,
    summaryKey,
    getSummaryKey,
    shouldSendImmediately,
    loadFromEmail,
    buildCreatePayload,
    buildUpdatePayload,
  };
}
