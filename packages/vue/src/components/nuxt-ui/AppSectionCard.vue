<!--
  # AppSectionCard
  A `UCard` with a standardised header: an icon badge, title, and optional
  description. Used to group a page into labelled sections (e.g. settings
  forms).

  ## Props
  - `icon` (string): Iconify icon name, e.g. `i-lucide-user-circle`.
  - `title` (string): Section title.
  - `description` (string, optional): Short description shown under the title.
  - `level` (2 | 3 | 4 | 5 | 6, optional): Heading level for the title.
    Defaults to 2.

  ## Slots
  - `default`: Section body content.
-->
<template>
  <UCard :ui="{ body: 'space-y-4' }">
    <template #header>
      <AppCardHeader
        :icon="icon"
        :title="title"
        :description="description"
        :level="level"
      />
    </template>

    <slot />
  </UCard>
</template>

<script lang="ts" setup>
/**
 * Section card with an icon badge header, used to group a page into
 * labelled sections.
 *
 * @component AppSectionCard
 */
import AppCardHeader from './AppCardHeader.vue';

export interface AppSectionCardProps {
  /** Iconify icon name, e.g. `i-lucide-user-circle` */
  icon: string;
  /** Section title */
  title: string;
  /** Optional short description shown under the title */
  description?: string;
  /** Heading level for the title, so the page's outline stays nested */
  level?: 2 | 3 | 4 | 5 | 6;
}

withDefaults(defineProps<AppSectionCardProps>(), {
  description: undefined,
  level: 2,
});

defineSlots<{
  default(): unknown;
}>();
</script>
