<template>
  <div class="flex flex-col md:flex-row md:items-stretch">
    <div class="relative min-w-0 flex-1">
      <div class="md:mr-3">
        <AppLabel
          :label="t('adminSettings.email.contactTemplates.sendSettings')"
          class="mb-3"
        />
        <AppFormBox
          class="relative min-w-0 flex-1 md:flex md:min-h-0 md:flex-col"
        >
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

          <div
            v-if="isOngoing"
            class="ml-6 mt-4 border-l-2 border-grey-light pl-6"
          >
            <div v-if="segmentName" class="mb-4 text-sm text-body-80">
              {{ t('adminSettings.email.contactTemplates.segment') }}:
              <router-link
                v-if="segmentId"
                :to="`/admin/contacts?segment=${segmentId}`"
                class="font-bold text-link"
              >
                {{ segmentName }}
              </router-link>
              <strong v-else>{{ segmentName }}</strong>
            </div>

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

            <div v-if="showEnabled" class="mt-4">
              <AppToggleField
                v-model="enabled"
                variant="link"
                :disabled="!isOngoing"
                :label="t('adminSettings.email.contactTemplates.activeLabel')"
                :disabled-description="
                  t('adminSettings.email.contactTemplates.activePaused')
                "
                :enabled-description="
                  t('adminSettings.email.contactTemplates.activeRunning')
                "
              />
            </div>

            <p class="mt-4 text-sm text-body-80">
              {{
                t(
                  'adminSettings.email.contactTemplates.descriptionOngoingEmails'
                )
              }}
            </p>
          </div>
        </AppFormBox>
      </div>
    </div>
    <div class="hidden min-w-0 md:block md:flex-1" />
  </div>
</template>

<script lang="ts" setup>
import type { SegmentOngoingEmailTrigger } from '@beabee/beabee-common';
import {
  AppFormBox,
  AppLabel,
  AppRadioGroup,
  AppToggleField,
} from '@beabee/vue';

import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = withDefaults(
  defineProps<{
    segmentId?: string;
    showDirectSend?: boolean;
    showEnabled?: boolean;
    segmentName?: string;
  }>(),
  {
    segmentId: undefined,
    showDirectSend: false,
    showEnabled: false,
    segmentName: undefined,
  }
);

const isOngoing = defineModel<boolean>('isOngoing', { required: true });

// Can only enable ongoing if a segment is assigned
const canEnableOngoing = computed(() => !!props.segmentId);

const trigger = defineModel<SegmentOngoingEmailTrigger>('trigger', {
  required: true,
});
const directSend = defineModel<boolean>('directSend', { required: true });
const enabled = defineModel<boolean>('enabled', { required: true });
</script>
