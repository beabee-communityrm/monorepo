<!--
  # AppConfirmDialog
  A confirmation dialog that wraps AppModal with predefined cancel and confirm buttons.
  Used for user decision flows like destructive actions, important decisions, or async operations.
  
  Uses internal i18n for standard text:
  - Close button: actions.close
-->
<template>
  <AppModal
    :open="open"
    :title="title"
    :variant="variant"
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
 * Uses internal i18n for standard text:
 * - Close button: actions.close
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

import { AppButton } from '../button';
import AppModal from './AppModal.vue';

/**
 * Props for the AppConfirmDialog component
 */
export interface AppConfirmDialogProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Visual variant for styling (affects button styling) */
  variant?: 'danger';
  /** Text for the confirm button */
  confirm: string;
  /** Text for the cancel button */
  cancel?: string;
  /** Title displayed in the dialog header */
  title: string;
  /** Whether to disable the confirm button */
  disableConfirm?: boolean;
  /** Async function to execute on confirm */
  onConfirm?: () => Promise<void> | void;
}

const props = defineProps<AppConfirmDialogProps>();

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
