<template>
  <div class="rounded border border-primary-20 bg-white">
    <IntegrationCardHeader :integration="integration" :on-refresh="onRefresh" />
    <div v-if="hasBody" class="border-t border-primary-20 p-4">
      <slot />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Comment, computed, useSlots } from 'vue';

import type { Integration } from '#type/integration';
import IntegrationCardHeader from './IntegrationCardHeader.vue';

defineProps<{
  integration: Integration;
  onRefresh?: () => Promise<void>;
}>();

const slots = useSlots();

const hasBody = computed(
  () => slots.default?.().some(({ type }) => type !== Comment) ?? false
);
</script>
