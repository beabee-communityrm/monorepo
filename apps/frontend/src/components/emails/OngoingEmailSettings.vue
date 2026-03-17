<template>
  <div>
    <AppLabel
      :label="t('adminSettings.email.contactTemplates.sendSettings')"
      class="mb-3"
    />
    <div class="flex flex-col gap-6 md:flex-row md:items-start">
      <div class="min-w-0 flex-1">
        <AppToggleField
          v-model="isOngoing"
          variant="link"
          :label="t('adminSettings.email.contactTemplates.ongoing')"
          :disabled="!canEnableOngoing && !isOngoing"
          :disabled-description="
            t('adminSettings.email.contactTemplates.ongoingDisabled')
          "
          :enabled-description="
            t('adminSettings.email.contactTemplates.ongoingEnabled')
          "
        />
      </div>

      <div class="min-w-0 flex-1" :class="{ 'hidden md:block': !isOngoing }">
        <template v-if="isOngoing">
          <AppRadioGroup
            v-model="trigger"
            :options="[
              [
                'onJoin',
                t('adminSettings.email.contactTemplates.contactJoins'),
              ],
              [
                'onLeave',
                t('adminSettings.email.contactTemplates.contactLeaves'),
              ],
            ]"
            variant="link"
            :label="t('adminSettings.email.contactTemplates.titleSendTime')"
            :inline="true"
            :disabled="!isOngoing"
          />

          <div v-if="showDirectSend && trigger === 'onJoin'" class="mt-4">
            <AppToggleField
              v-model="directSend"
              variant="link"
              :disabled="!isOngoing"
              :label="
                t('adminSettings.email.contactTemplates.titleDirectSend')
              "
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
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { SegmentOngoingEmailTrigger } from '@beabee/beabee-common';
import { AppLabel, AppRadioGroup, AppToggleField } from '@beabee/vue';

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

// Can only enable ongoing if a segment is assigned
const canEnableOngoing = computed(() => !!props.segmentId);

const trigger = defineModel<SegmentOngoingEmailTrigger>('trigger', {
  required: true,
});
const directSend = defineModel<boolean>('directSend', { required: true });
</script>
