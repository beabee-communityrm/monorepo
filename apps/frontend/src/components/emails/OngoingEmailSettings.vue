<template>
  <div>
    <AppSubHeading>
      {{ t('adminSettings.email.contactTemplates.sendSettings') }}
    </AppSubHeading>

    <AppRadioGroup
      v-model="sendType"
      :options="[
        ['oneOff', t('emails.sendType.oneOff')],
        ['ongoing', t('emails.sendType.ongoing')],
      ]"
      :disabled="!canEnableOngoing && !isOngoing"
      variant="link"
      :label="t('emails.type')"
      :inline="true"
      required
      class="mb-4"
    />

    <template v-if="isOngoing">
      <AppRadioGroup
        v-model="trigger"
        :options="[
          ['onJoin', t('adminSettings.email.contactTemplates.contactJoins')],
          ['onLeave', t('adminSettings.email.contactTemplates.contactLeaves')],
        ]"
        variant="link"
        :label="t('adminSettings.email.contactTemplates.titleSendTime')"
        :inline="true"
        required
        class="mb-4"
      />

      <div v-if="showDirectSend && trigger === 'onJoin'" class="mb-4">
        <AppToggleField
          v-model="directSend"
          variant="link"
          :label="t('adminSettings.email.contactTemplates.titleDirectSend')"
          :disabled-description="
            t('adminSettings.email.contactTemplates.directSendDisabled')
          "
          :enabled-description="
            t('adminSettings.email.contactTemplates.directSendEnabled')
          "
        />
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
import type { SegmentOngoingEmailTrigger } from '@beabee/beabee-common';
import { AppRadioGroup, AppSubHeading, AppToggleField } from '@beabee/vue';

import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = withDefaults(
  defineProps<{
    segmentId?: string;
    showDirectSend?: boolean;
  }>(),
  {
    segmentId: undefined,
    showDirectSend: false,
  }
);

const isOngoing = defineModel<boolean>('isOngoing', { required: true });
const sendType = computed({
  get: () => (isOngoing.value ? 'ongoing' : 'oneOff'),
  set: (val) => {
    isOngoing.value = val === 'ongoing';
  },
});

// Can only enable ongoing if a segment is assigned
const canEnableOngoing = computed(() => !!props.segmentId);

const trigger = defineModel<SegmentOngoingEmailTrigger>('trigger', {
  required: true,
});
const directSend = defineModel<boolean>('directSend', { required: true });
</script>
