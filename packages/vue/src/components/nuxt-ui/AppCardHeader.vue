<!--
  # AppCardHeader
  The standard card header: an icon badge, a title and an optional
  description, with room at the end for a count or status badge. Goes in a
  `UCard`'s `#header` slot.

  ## Props
  - `icon` (string): Iconify icon name, e.g. `i-lucide-user-circle`.
  - `title` (string): Card title.
  - `description` (string, optional): Short description shown under the title.
  - `level` (2 | 3 | 4 | 5 | 6, optional): Heading level for the title, so the
    page's outline stays correctly nested. Defaults to 2.

  ## Slots
  - `aside`: Content at the end of the header, e.g. a count or status badge.
-->
<template>
  <div class="flex items-center gap-3">
    <AppIconBadge :icon="icon" />
    <div class="min-w-0 flex-1 space-y-1">
      <component :is="`h${level}`">{{ title }}</component>
      <p v-if="description" class="text-muted">
        {{ description }}
      </p>
    </div>
    <slot name="aside" />
  </div>
</template>

<script lang="ts" setup>
/**
 * Standard card header with an icon badge, title and optional description.
 *
 * @component AppCardHeader
 */
import AppIconBadge from './AppIconBadge.vue';

export interface AppCardHeaderProps {
  /** Iconify icon name, e.g. `i-lucide-user-circle` */
  icon: string;
  /** Card title */
  title: string;
  /** Optional short description shown under the title */
  description?: string;
  /** Heading level for the title, so the page's outline stays nested */
  level?: 2 | 3 | 4 | 5 | 6;
}

withDefaults(defineProps<AppCardHeaderProps>(), {
  description: undefined,
  level: 2,
});

defineSlots<{
  aside?(): unknown;
}>();
</script>
