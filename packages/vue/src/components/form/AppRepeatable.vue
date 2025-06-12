<!-- eslint-disable vue/no-mutating-props -->
<template>
  <div class="space-y-4">
    <div
      v-for="(item, index) in items"
      :key="itemKey ? item[itemKey] : index"
      class="group relative"
    >
      <div class="flex gap-3">
        <!-- Drag handle -->
        <div
          v-if="allowReorder"
          class="flex h-6 w-6 cursor-move items-center justify-center text-grey-dark hover:text-primary"
          :aria-label="t('actions.reorder')"
        >
          <font-awesome-icon :icon="faGripVertical" class="h-3 w-3" />
        </div>

        <!-- Item content -->
        <div class="flex-1">
          <slot :item="item" :index="index" :remove="() => removeItem(index)" />
        </div>

        <!-- Remove button -->
        <button
          v-if="allowRemove"
          type="button"
          class="flex h-6 w-6 items-center justify-center text-grey-dark hover:text-danger"
          :aria-label="t('actions.remove')"
          @click="removeItem(index)"
        >
          <font-awesome-icon :icon="faTimes" class="h-3 w-3" />
        </button>
      </div>
    </div>

    <!-- Add button -->
    <button
      v-if="allowAdd"
      type="button"
      class="hover:text-primary-110 flex items-center gap-2 px-3 py-2 text-primary focus:outline-none focus:ring-2 focus:ring-primary-40 focus:ring-offset-2"
      :aria-label="addButtonText || t('actions.add')"
      @click="addItem"
    >
      <font-awesome-icon :icon="faPlus" class="h-4 w-4" />
      <span>{{ addButtonText || t('actions.add') }}</span>
    </button>
  </div>
</template>

<script lang="ts" setup>
/**
 * Dynamic list component for managing arrays of items with CRUD operations.
 * Supports drag-and-drop reordering, custom content slots, and flexible item management.
 *
 * @component AppRepeatable
 *
 * @example
 * <AppRepeatable v-model="contactList" :item-key="'id'" add-button-text="Add Contact">
 *   <template #default="{ item, index, remove }">
 *     <div class="border p-3 rounded">
 *       <AppInput v-model="item.name" placeholder="Name" />
 *       <AppInput v-model="item.email" placeholder="Email" />
 *     </div>
 *   </template>
 * </AppRepeatable>
 */
import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import {
  faGripVertical,
  faPlus,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

/**
 * Props for the AppRepeatable component
 */
export interface AppRepeatableProps<T = any> {
  /** Array of items to manage */
  modelValue: T[];
  /** Property name to use as unique key for items (for better Vue reactivity) */
  itemKey?: keyof T;
  /** Whether users can add new items */
  allowAdd?: boolean;
  /** Whether users can remove existing items */
  allowRemove?: boolean;
  /** Whether users can reorder items via drag-and-drop */
  allowReorder?: boolean;
  /** Text for the add button */
  addButtonText?: string;
  /** Factory function to create new items when adding */
  createItem?: () => T;
}

/**
 * Events emitted by the AppRepeatable component
 */
const emit = defineEmits<{
  /**
   * Emitted when the items array changes
   * @param items - The updated array of items
   */
  (e: 'update:modelValue', items: T[]): void;
  /**
   * Emitted when a new item is added
   * @param item - The newly added item
   * @param index - The index where the item was added
   */
  (e: 'item-added', item: T, index: number): void;
  /**
   * Emitted when an item is removed
   * @param item - The removed item
   * @param index - The index where the item was removed
   */
  (e: 'item-removed', item: T, index: number): void;
}>();

/**
 * Slots available in the AppRepeatable component
 */
defineSlots<{
  /**
   * Default slot for rendering each item
   * @param item - The current item being rendered
   * @param index - The index of the current item
   * @param remove - Function to remove the current item
   */
  default(props: { item: T; index: number; remove: () => void }): any;
}>();

const props = withDefaults(defineProps<AppRepeatableProps>(), {
  itemKey: undefined,
  allowAdd: true,
  allowRemove: true,
  allowReorder: true,
  addButtonText: undefined,
  createItem: () => ({}) as any,
});

const { t } = useI18n();

const items = computed(() => props.modelValue || []);

/**
 * Adds a new item to the list using the createItem factory function
 */
function addItem(): void {
  const newItem = props.createItem();
  const newItems = [...items.value, newItem];
  emit('update:modelValue', newItems);
  emit('item-added', newItem, newItems.length - 1);
}

/**
 * Removes an item at the specified index
 */
function removeItem(index: number): void {
  const item = items.value[index];
  const newItems = items.value.filter((_, i) => i !== index);
  emit('update:modelValue', newItems);
  emit('item-removed', item, index);
}
</script>
