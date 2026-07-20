<!--
  # AppModalHeader
  Standardised `UModal` header: an icon badge, title, optional description,
  and a close button — meant for a `UModal`'s `#header` slot.

  Renders the real `DialogTitle`/`DialogDescription` (never a hidden dupe)
  so the dialog keeps a proper `aria-labelledby`/`aria-describedby` and the
  text people actually see is the real heading.

  ## Props
  - `icon` (string, optional): Iconify icon name for the header badge.
  - `iconColor` (string, default 'primary'): semantic color for the icon badge.
  - `title` (string): the dialog's title (and accessible name).
  - `description` (string, optional): shown under the title.

  ## Events
  - `close`: emitted when the close button is clicked.
-->
<template>
  <div class="flex items-center gap-3">
    <AppIconBadge v-if="icon" :icon="icon" :color="iconColor" />
    <div class="space-y-1">
      <DialogTitle class="text-highlighted font-semibold">
        {{ title }}
      </DialogTitle>
      <DialogDescription
        v-if="description"
        class="text-muted text-sm font-normal"
      >
        {{ description }}
      </DialogDescription>
    </div>
  </div>

  <UButton
    icon="i-lucide-x"
    color="neutral"
    variant="ghost"
    class="absolute inset-e-4 top-4"
    :aria-label="t('actions.close')"
    @click="emit('close')"
  />
</template>

<script lang="ts" setup>
/**
 * Icon + title + description + close button header for a `UModal`.
 *
 * @component AppModalHeader
 */
import { DialogDescription, DialogTitle } from 'reka-ui';
import { useI18n } from 'vue-i18n';

import AppIconBadge from './AppIconBadge.vue';

export interface AppModalHeaderProps {
  /** Iconify icon name for the header badge */
  icon?: string;
  /** Semantic color for the icon badge */
  iconColor?: 'primary' | 'neutral' | 'error';
  /** The dialog's title (and accessible name) */
  title: string;
  /** Shown under the title */
  description?: string;
}

withDefaults(defineProps<AppModalHeaderProps>(), {
  iconColor: 'primary',
  description: undefined,
});

const emit = defineEmits<{
  close: [];
}>();

const { t } = useI18n();
</script>
