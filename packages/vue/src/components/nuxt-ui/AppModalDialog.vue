<!--
  # AppModalDialog
  A `UModal` with a standardised header: an icon badge, title, and optional
  description, rendered ourselves (rather than via `UModal`'s `title`/
  `description` props) so the icon vertically centers against the title +
  description as one block, instead of just the title line.

  Renders the real `DialogTitle`/`DialogDescription` (never a hidden dupe)
  so the dialog keeps a proper `aria-labelledby`/`aria-describedby` and the
  text people actually see is the real heading. Set `titleInBody` for a
  confirmation dialog whose title is long and reads better as a heading in
  the body — the header then shows only the icon, and the title renders as
  the first body element instead.

  ## Props
  - `open` (boolean): whether the modal is open. Use with `v-model:open`.
  - `icon` (string): Iconify icon name for the header badge.
  - `iconColor` (string, default 'primary'): semantic color for the icon badge.
  - `title` (string): the dialog's title (and accessible name).
  - `titleInBody` (boolean, default false): render the title as the first
    body element instead of in the header, which then shows only the icon.
  - `description` (string, optional): shown under the title, when the title
    is in the header (ignored when `titleInBody` is true).

  ## Slots
  - `default`: modal body content.
  - `actions`: modal footer actions (e.g. `AppModalActions`), rendered below
    the body content rather than as a separate bordered footer.

  ## Events
  - `update:open`: emitted when the modal's open state changes (e.g. via the
    close button, escape key, or clicking outside).
  - `after:leave`: emitted after the modal's close transition finishes.
-->
<template>
  <UModal
    :open="open"
    :title="title"
    :description="description"
    @update:open="emit('update:open', $event)"
    @after:leave="emit('after:leave')"
  >
    <!--
      title/description are also passed as plain props above (never
      rendered, since #header is fully overridden below) purely so
      UModal doesn't think a title/description is missing and inject its
      own hidden fallback DialogTitle/DialogDescription, which would
      duplicate the id our real one (in #header or #body) already uses.
    -->
    <template #header="{ close }">
      <div class="flex items-center gap-3">
        <AppIconBadge v-if="icon" :icon="icon" :color="iconColor" />
        <div v-if="!titleInBody">
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
        class="absolute end-4 top-4"
        :aria-label="t('actions.close')"
        @click="close"
      />
    </template>

    <template #body>
      <div class="flex flex-col gap-6">
        <DialogTitle
          v-if="titleInBody"
          class="text-highlighted text-base font-semibold"
        >
          {{ title }}
        </DialogTitle>
        <slot />
        <slot name="actions" />
      </div>
    </template>
  </UModal>
</template>

<script lang="ts" setup>
/**
 * Modal with a standardised icon + title + description header.
 *
 * @component AppModalDialog
 */
import { DialogDescription, DialogTitle } from 'reka-ui';
import { useI18n } from 'vue-i18n';

import AppIconBadge from './AppIconBadge.vue';

export interface AppModalDialogProps {
  /** Whether the modal is open */
  open: boolean;
  /** Iconify icon name for the header badge */
  icon?: string;
  /** Semantic color for the icon badge */
  iconColor?: 'primary' | 'neutral' | 'error';
  /** The dialog's title (and accessible name) */
  title: string;
  /** Render the title as the first body element instead of in the header */
  titleInBody?: boolean;
  /** Shown under the title, when the title is in the header */
  description?: string;
}

withDefaults(defineProps<AppModalDialogProps>(), {
  iconColor: 'primary',
  titleInBody: false,
  description: undefined,
});

const emit = defineEmits<{
  'update:open': [value: boolean];
  'after:leave': [];
}>();

defineSlots<{
  default(): unknown;
  actions(): unknown;
}>();

const { t } = useI18n();
</script>
