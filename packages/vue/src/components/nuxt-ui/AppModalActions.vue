<!--
  # AppModalActions
  A cancel/confirm button pair for modal footers, laid out full-width and
  evenly split (`flex-1` each). Used for multi-step wizards (cancel/next,
  back/save) and confirmation dialogs (keep/remove).

  ## Props
  - `cancelLabel` (string): Label for the secondary (outline) button.
  - `confirmLabel` (string): Label for the primary button.
  - `confirmColor` (string, default 'primary'): Color of the confirm button.
  - `confirmDisabled` (boolean, default false): Disables the confirm button.
  - `confirmLoading` (boolean, default false): Shows a loading state on the confirm button.

  ## Events
  - `cancel`: emitted when the cancel button is clicked.
  - `confirm`: emitted when the confirm button is clicked.
-->
<template>
  <div class="flex w-full gap-2">
    <UButton
      class="flex-1"
      variant="outline"
      color="neutral"
      @click="emit('cancel')"
    >
      {{ cancelLabel }}
    </UButton>
    <UButton
      class="flex-1"
      :color="confirmColor"
      :disabled="confirmDisabled"
      :loading="confirmLoading"
      @click="emit('confirm')"
    >
      {{ confirmLabel }}
    </UButton>
  </div>
</template>

<script lang="ts" setup>
/**
 * Cancel/confirm button pair for modal footers.
 *
 * @component AppModalActions
 */
export interface AppModalActionsProps {
  /** Label for the secondary (outline) button */
  cancelLabel: string;
  /** Label for the primary button */
  confirmLabel: string;
  /** Color of the confirm button */
  confirmColor?: 'primary' | 'error';
  /** Disables the confirm button */
  confirmDisabled?: boolean;
  /** Shows a loading state on the confirm button */
  confirmLoading?: boolean;
}

withDefaults(defineProps<AppModalActionsProps>(), {
  confirmColor: 'primary',
  confirmDisabled: false,
  confirmLoading: false,
});

const emit = defineEmits<{
  cancel: [];
  confirm: [];
}>();
</script>
