<!--
  # AppConfirmDialog
  A confirmation dialog that wraps AppModal with predefined cancel and confirm buttons.
  Used for user decision flows like destructive actions, important decisions, or async operations.
-->
<template>
  <AppModal
    :open="open"
    :title="title"
    :variant="variant"
    :close-button-text="closeButtonText"
    @close="$emit('close')"
  >
    <div class="mb-4 text-lg">
      <slot />
    </div>

    <footer class="text-center">
      <AppButton
        v-if="cancel"
        class="mr-4"
        variant="primaryOutlined"
        @click="$emit('close')"
      >
        {{ cancel }}
      </AppButton>
      <AppButton
        :disabled="disableConfirm === true"
        :loading="isConfirming"
        :variant="variant"
        @click="handleConfirm"
      >
        {{ confirm }}
      </AppButton>
    </footer>
  </AppModal>
</template>

<script lang="ts" setup>
/**
 * Confirmation dialog component with cancel and confirm buttons.
 * Extends AppModal with predefined button layout and loading state management for user decisions.
 *
 * @component AppConfirmDialog
 *
 * @example
 * <AppConfirmDialog
 *   :open="showConfirm"
 *   title="Delete Item"
 *   confirm="Delete"
 *   cancel="Cancel"
 *   variant="danger"
 *   @close="showConfirm = false"
 *   @confirm="deleteItem"
 * >
 *   <p>Are you sure you want to delete this item?</p>
 * </AppConfirmDialog>
 */
import { ref } from 'vue';

import type { AppConfirmDialogProps } from '../../types/dialog';
import { AppButton } from '../button';
import AppModal from './AppModal.vue';

// Props interface is now imported from types
export type { AppConfirmDialogProps } from '../../types/dialog';

const props = withDefaults(defineProps<AppConfirmDialogProps>(), {
  variant: undefined,
  cancel: undefined,
  disableConfirm: false,
  onConfirm: undefined,
  closeButtonText: 'Close dialog',
});

/**
 * Events emitted by the AppConfirmDialog component
 */
const emit = defineEmits<{
  /** Emitted when the dialog should be closed */
  (e: 'close'): void;
  /** Emitted when the confirm button is clicked */
  (e: 'confirm'): void;
}>();

const isConfirming = ref(false);

/**
 * Handles confirm button click
 */
async function handleConfirm() {
  isConfirming.value = true;
  try {
    await props.onConfirm?.();
    emit('confirm');
  } finally {
    isConfirming.value = false;
  }
}
</script>
