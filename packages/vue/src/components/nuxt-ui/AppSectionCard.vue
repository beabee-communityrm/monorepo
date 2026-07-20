<!--
  # AppSectionCard
  A `UCard` with a standardised header: an icon badge, title, and optional
  description. Used to group a page into labelled sections (e.g. settings
  forms).

  ## Props
  - `icon` (string): Iconify icon name, e.g. `i-lucide-user-circle`.
  - `title` (string): Section title.
  - `description` (string, optional): Short description shown under the title.

  ## Slots
  - `default`: Section body content.
-->
<template>
  <UCard :ui="{ header: 'flex items-center gap-3', body: 'space-y-4' }">
    <template #header>
      <AppIconBadge :icon="icon" />
      <div class="space-y-1">
        <h2>{{ title }}</h2>
        <p v-if="description" class="text-muted">
          {{ description }}
        </p>
      </div>
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
import AppIconBadge from './AppIconBadge.vue';

export interface AppSectionCardProps {
  /** Iconify icon name, e.g. `i-lucide-user-circle` */
  icon: string;
  /** Section title */
  title: string;
  /** Optional short description shown under the title */
  description?: string;
}

withDefaults(defineProps<AppSectionCardProps>(), {
  description: undefined,
});

defineSlots<{
  default(): unknown;
}>();
</script>
