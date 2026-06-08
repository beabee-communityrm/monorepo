<template>
  <div class="flex items-center gap-4 p-4">
    <div
      class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg text-lg font-bold"
      :style="{
        backgroundColor: integration.color,
        color: integration.textColor ?? '#000',
      }"
    >
      <font-awesome-icon
        v-if="integration.icon"
        :icon="integration.icon"
        class="text-3xl"
      />
      <span v-else>{{ integration.name[0] }}</span>
    </div>
    <div class="min-w-0 flex-1">
      <p class="font-semibold">{{ integration.name }}</p>
      <p v-if="'audienceId' in integration" class="text-sm text-body-80">
        {{ t('adminSettings.integrations.mailchimp.audienceId') }}:
        <span class="font-mono">{{ integration.audienceId }}</span>
      </p>
    </div>
    <div class="flex items-center gap-2">
      <StatusPill :type="statusType[integration.status]">
        {{ t(`adminSettings.integrations.status.${integration.status}`) }}
      </StatusPill>
      <!-- TODO: refresh functionality not yet implemented -->
      <AppButton v-if="false" variant="greyOutlined" size="sm" :icon="faRotate">
        {{ t('adminSettings.integrations.refresh') }}
      </AppButton>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { AppButton } from '@beabee/vue';
import { faRotate } from '@fortawesome/free-solid-svg-icons';
import { useI18n } from 'vue-i18n';

import { ApiHealthStatus } from '@beabee/beabee-common';
import type { Integration } from '#type/integration';
import StatusPill from './StatusPill.vue';

defineProps<{ integration: Integration }>();

const { t } = useI18n();

const statusType: Record<ApiHealthStatus, 'success' | 'disabled' | 'danger'> = {
  [ApiHealthStatus.HEALTHY]: 'success',
  [ApiHealthStatus.UNHEALTHY]: 'danger',
  [ApiHealthStatus.DISABLED]: 'disabled',
};
</script>
