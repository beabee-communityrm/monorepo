<!-- eslint-disable vue/no-mutating-props -->
<template>
  <div class="flex max-h-full min-h-0 flex-1 flex-col">
    <!-- Form Builder -->
    <FormBuilder
      :key="currentSlide.id"
      v-model="currentSlide.components"
      :slides="slides"
      class="min-h-0 flex-1"
    />
  </div>
</template>

<script lang="ts" setup>
import FormBuilder from '#components/form-builder/FormBuilder.vue';

import type { SidebarTabProps } from '../SidebarTabs.interface';

/**
 * Data for the ContentFormTab component
 */
export type ContentFormTabData = undefined;

/**
 * Props for the ContentFormTab component
 */
export type ContentFormTabProps = SidebarTabProps<never>;

defineProps<ContentFormTabProps>();
</script>
