<template>
  <UCard
    :ui="{
      header: 'flex flex-wrap items-center justify-between gap-2',
      body: 'p-0 sm:p-0',
    }"
  >
    <template #header>
      <div class="flex flex-wrap items-center gap-2">
        <UIcon :name="icon" class="text-primary size-4 shrink-0" />
        <h2>{{ title }}</h2>
      </div>

      <UButton
        :to="viewAllTo"
        variant="link"
        trailing-icon="i-lucide-arrow-right"
      >
        {{ viewAllLabel }}
      </UButton>
    </template>

    <slot />
  </UCard>
</template>

<script lang="ts" setup>
import type { RouteLocationRaw } from 'vue-router';

/** Props for CalloutPreviewCard */
export interface CalloutPreviewCardProps {
  /** Icon shown next to the title, e.g. `i-lucide-map-pin` */
  icon: string;
  /** Card title, e.g. "Response locations" */
  title: string;
  /** Link to the full view (map/gallery) */
  viewAllTo: RouteLocationRaw;
  /** Label for the "view all" link, e.g. "View full map" */
  viewAllLabel: string;
}

defineProps<CalloutPreviewCardProps>();
</script>
