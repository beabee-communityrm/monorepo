<template>
  <div class="mb-3 rounded border border-primary-20 bg-primary-10">
    <div class="flex items-center bg-primary-5 px-4 py-1 text-sm">
      <slot name="view" />
      <AppButtonGroup class="-mr-2 ml-auto">
        <AppButton
          v-if="!noUpdate"
          size="sm"
          variant="text"
          @click="formVisible = !formVisible"
        >
          {{ editButtonText }}
        </AppButton>
        <AppButton
          size="sm"
          variant="dangerText"
          @click="showDeleteModal = true"
        >
          {{ deleteButtonText }}
        </AppButton>
      </AppButtonGroup>
    </div>

    <ItemManagerForm
      v-if="formVisible"
      mode="update"
      class="p-4"
      :data="itemToData(item)"
      :button-text="updateButtonText"
      :reset-button-text="cancelButtonText"
      @save="handleUpdate"
      @cancel="formVisible = false"
    >
      <template #default="{ data, mode }">
        <slot name="form" :data="data" :mode="mode" />
      </template>
    </ItemManagerForm>

    <AppConfirmDialog
      :open="showDeleteModal"
      :title="deleteTitle"
      :cancel="noBackButtonText"
      :confirm="yesRemoveButtonText"
      variant="danger"
      @close="showDeleteModal = false"
      @confirm="onDelete"
    >
      <p>{{ deleteText }}</p>
    </AppConfirmDialog>
  </div>
</template>

<script lang="ts" setup generic="T, D">
/**
 * A component for displaying and managing individual items in a list.
 * Provides view, edit, and delete functionality with confirmation dialogs.
 *
 * @component ItemManagerItem
 *
 * @example
 * <ItemManagerItem
 *   :item="item"
 *   :item-to-data="convertItemToFormData"
 *   delete-title="Delete Item"
 *   delete-text="Are you sure you want to delete this item?"
 *   edit-button-text="Edit"
 *   delete-button-text="Delete"
 *   update-button-text="Update"
 *   cancel-button-text="Cancel"
 *   no-back-button-text="No, keep it"
 *   yes-remove-button-text="Yes, delete"
 *   @update="handleUpdate"
 *   @delete="handleDelete"
 * >
 *   <template #view>
 *     <strong>{{ item.name }}</strong>
 *   </template>
 *   <template #form="{ data, mode }">
 *     <AppInput v-model="data.name" label="Name" required />
 *   </template>
 * </ItemManagerItem>
 */
import { ref } from 'vue';

import { AppButton, AppButtonGroup } from '../button';
import { AppConfirmDialog } from '../dialog';
import ItemManagerForm from './ItemManagerForm.vue';

/**
 * Props for the ItemManagerItem component
 */
export interface ItemManagerItemProps<T, D> {
  /** The item data */
  item: T;
  /** Title for the delete confirmation dialog */
  deleteTitle: string;
  /** Text content for the delete confirmation dialog */
  deleteText: string;
  /** Whether update functionality is disabled */
  noUpdate: boolean;
  /** Function to convert item to form data */
  itemToData: (item: T | undefined) => D;
  /** Text for the edit button */
  editButtonText: string;
  /** Text for the delete button */
  deleteButtonText: string;
  /** Text for the update button */
  updateButtonText: string;
  /** Text for the cancel button */
  cancelButtonText: string;
  /** Text for the "No, go back" button in delete dialog */
  noBackButtonText: string;
  /** Text for the "Yes, remove" button in delete dialog */
  yesRemoveButtonText: string;
  /** Async function to execute on update */
  onUpdate?: (data: D) => Promise<void> | undefined;
  /** Async function to execute on delete */
  onDelete?: () => Promise<void> | undefined;
}

const props = defineProps<ItemManagerItemProps<T, D>>();

const formVisible = ref(false);
const showDeleteModal = ref(false);

/**
 * Handles item update
 */
async function handleUpdate(data: D) {
  await props.onUpdate?.(data);
  formVisible.value = false;
}
</script>
