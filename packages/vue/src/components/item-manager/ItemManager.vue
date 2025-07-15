<template>
  <div>
    <ItemManagerItem
      v-for="(item, i) in items"
      :key="i"
      :item="item"
      :item-to-data="itemToData"
      :delete-title="deleteTitle"
      :delete-text="deleteText(item)"
      :no-update="!!noUpdate"
      @update="(data) => onUpdate?.(item, data)"
      @delete="() => onDelete?.(item)"
    >
      <template #view>
        <slot name="view" :item="item" />
      </template>
      <template #form="{ data, mode }">
        <slot name="form" :data="data" :mode="mode" />
      </template>
    </ItemManagerItem>

    <div
      v-if="formVisible"
      class="rounded rounded-t-none border border-primary-20 bg-primary-10 p-4"
    >
      <ItemManagerForm
        mode="add"
        :data="itemToData(undefined)"
        @cancel="formVisible = false"
        @save="handleAdd"
      >
        <template #default="{ data, mode }">
          <slot name="form" :data="data" :mode="mode" />
        </template>
      </ItemManagerForm>
    </div>
    <AppButton
      v-else
      class="w-full"
      variant="primaryOutlined"
      @click="formVisible = true"
    >
      {{ addButtonText }}
    </AppButton>
  </div>
</template>

<script lang="ts" setup generic="T, D">
/**
 * A comprehensive item management component that provides CRUD operations for lists of items.
 * Includes add, edit, delete functionality with confirmation dialogs and customizable text.
 *
 * Uses internal i18n for standard action buttons via ItemManagerItem:
 * - Edit, Delete, Update, Cancel buttons: actions.*
 * - Dialog confirmation buttons: actions.noBack, actions.yesRemove
 *
 * @component ItemManager
 *
 * @example
 * <ItemManager
 *   :items="tags"
 *   :item-to-data="tagToFormData"
 *   add-button-text="Add Tag"
 *   delete-title="Delete Tag"
 *   :delete-text="(tag) => `Are you sure you want to delete ${tag.name}?`"
 *   @add="handleAdd"
 *   @update="handleUpdate"
 *   @delete="handleDelete"
 * >
 *   <template #view="{ item }">
 *     <strong>{{ item.name }}</strong>
 *   </template>
 *   <template #form="{ data, mode }">
 *     <AppInput v-model="data.name" label="Name" required />
 *   </template>
 * </ItemManager>
 */
import { ref } from 'vue';

import { AppButton } from '../button';
import ItemManagerForm from './ItemManagerForm.vue';
import ItemManagerItem from './ItemManagerItem.vue';

/**
 * Props for the ItemManager component
 */
export interface ItemManagerProps<T, D> {
  /** Array of items to manage */
  items: T[];
  /** Function to convert item to form data */
  itemToData: (item: T | undefined) => D;
  /** Text for the add button (context-specific, e.g., "Add Tag") */
  addButtonText: string;
  /** Title for the delete confirmation dialog (context-specific, e.g., "Delete Tag") */
  deleteTitle: string;
  /** Function that returns delete confirmation text for each item */
  deleteText: (item: T) => string;
  /** Whether update functionality is disabled */
  noUpdate?: boolean;
  /** Async function to execute on add */
  onAdd?: (data: D) => Promise<void>;
  /** Async function to execute on update */
  onUpdate?: (item: T, data: D) => Promise<void> | undefined;
  /** Async function to execute on delete */
  onDelete?: (item: T) => Promise<void> | undefined;
}

const props = defineProps<ItemManagerProps<T, D>>();

const formVisible = ref(false);

/**
 * Handles adding a new item
 */
async function handleAdd(data: D) {
  await props.onAdd?.(data);
  formVisible.value = false;
}
</script>
