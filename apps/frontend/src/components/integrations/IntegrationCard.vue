<template>
  <div class="rounded border border-primary-20 bg-white">
    <IntegrationCardHeader :integration="integration" />
    <div
      v-if="integration.status === ApiHealthStatus.HEALTHY"
      class="border-t border-primary-20 p-4"
    >
      <slot />
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Integration } from '#type/integration';
import { ApiHealthStatus } from '@beabee/beabee-common';
import IntegrationCardHeader from './IntegrationCardHeader.vue';

defineProps<{ integration: Integration }>();
</script>
