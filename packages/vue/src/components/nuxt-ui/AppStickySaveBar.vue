<!--
  # AppStickySaveBar
  A sticky "unsaved changes" bar with Cancel/Save actions, for forms that
  live inside the Dashboard layout. Teleports into that layout's
  `#sticky-bottom-banner` target so it renders full-width and flush against
  the page footer, regardless of where in the page the calling form lives —
  see `layout-Dashboard.vue` in the frontend app for that target.

  ## Props
  - `form` (string): id of the `<form>` element to associate the Save
    button with, via the native `form` attribute — needed because this bar
    is Teleported out of that form's own DOM subtree, so a plain
    `type="submit"` click has no ancestry-based form to reach.

  ## Events
  - `cancel`: emitted when the Cancel button is clicked.
-->
<template>
  <Teleport to="#sticky-bottom-banner">
    <div class="border-default bg-default border-t">
      <div
        class="mx-auto flex max-w-2xl items-center justify-between gap-4 px-4 py-3 sm:px-6"
      >
        <p class="text-muted text-sm">{{ t('form.unsavedChanges') }}</p>
        <div class="flex items-center gap-2">
          <UButton
            type="button"
            variant="outline"
            color="neutral"
            @mousedown.prevent
            @click="emit('cancel')"
          >
            {{ t('actions.cancel') }}
          </UButton>
          <UButton type="submit" :form="form" loading-auto>
            {{ t('form.saveChanges') }}
          </UButton>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script lang="ts" setup>
/**
 * Sticky "unsaved changes" bar with Cancel/Save actions, for forms inside
 * the Dashboard layout.
 *
 * @component AppStickySaveBar
 */
import { useI18n } from 'vue-i18n';

export interface AppStickySaveBarProps {
  /** id of the `<form>` element the Save button submits, via the native `form` attribute */
  form: string;
}

defineProps<AppStickySaveBarProps>();

const emit = defineEmits<{
  cancel: [];
}>();

const { t } = useI18n();
</script>
