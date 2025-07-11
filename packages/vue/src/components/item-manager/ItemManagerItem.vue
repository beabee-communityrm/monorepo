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
          {{ t('actions.edit') }}
        </AppButton>
        <AppButton
          size="sm"
          variant="dangerText"
          @click="showDeleteModal = true"
        >
          {{ t('actions.delete') }}
        </AppButton>
      </AppButtonGroup>
    </div>

    <ItemManagerForm
      v-if="formVisible"
      mode="update"
      class="p-4"
      :data="itemToData(item)"
      :button-text="t('actions.update')"
      :reset-button-text="t('actions.cancel')"
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
      :cancel="t('actions.noBack')"
      :confirm="t('actions.yesRemove')"
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
 * Uses internal i18n for standard action buttons:
 * - Edit button: actions.edit
 * - Delete button: actions.delete
 * - Update button: actions.update
 * - Cancel button: actions.cancel
 * - No back button: actions.noBack
 * - Yes remove button: actions.yesRemove
 *
 * @component ItemManagerItem
 *
 * @example
 * <ItemManagerItem
 *   :item="item"
 *   :item-to-data="convertItemToFormData"
 *   delete-title="Delete Item"
 *   delete-text="Are you sure you want to delete this item?"
 *   :on-update="handleUpdate"
 *   :on-delete="handleDelete"
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
import { useI18n } from 'vue-i18n';

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
  /** Async function to execute on update */
  onUpdate?: (data: D) => Promise<void> | undefined;
  /** Async function to execute on delete */
  onDelete?: () => Promise<void> | undefined;
}

const props = defineProps<ItemManagerItemProps<T, D>>();

const { t } = useI18n();

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
