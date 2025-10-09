<!-- eslint-disable vue/no-mutating-props -->
<template>
  <div class="flex max-h-full min-h-0 flex-1 flex-col">
    <!-- TODO: Add email tab content here -->
  </div>
</template>

<script lang="ts" setup>
import type { SidebarTabProps } from '../SidebarTabs.interface';

/**
 * Data for the email tab in the sidebar
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface EmailTabData {
  // TODO: Add email tab data structure here
}

/**
 * Props for the EmailTab component
 */
export type EmailTabProps = SidebarTabProps<EmailTabData>;

defineProps<EmailTabProps>();
</script>
