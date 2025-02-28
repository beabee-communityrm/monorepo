<template>
  <ul>
    <li
      v-for="item in items"
      :key="item.id"
      class="flex items-center justify-between gap-4 px-3 py-2"
      :class="[
        selectedByItemId[item.id] ? 'bg-primary-10' : 'hover:bg-primary-5',
        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
      ]"
      @click="!disabled && $emit('click', item, selectedByItemId[item.id])"
    >
      <span><slot :item="item" /></span>
      <font-awesome-icon v-if="selectedByItemId[item.id]" :icon="faCheck" />
    </li>
  </ul>
</template>

<script lang="ts" setup generic="Item extends { id: string }">
/**
 * A selectable list component that displays a list of items with selection state.
 * Commonly used in dropdown menus for selecting items from a list.
 */
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { computed } from 'vue';

// Define the component props interface
export interface AppSelectableListProps<T extends { id: string }> {
  /**
   * Array of items to display in the list
   * Each item must have an id property
   */
  items: T[];

  /**
   * Array of selected item IDs
   */
  selectedItemIds?: string[];

  /**
   * Whether the list is disabled
   */
  disabled?: boolean;
}

defineEmits<{ (event: 'click', item: Item, selected: boolean): void }>();

const props = defineProps<AppSelectableListProps<Item>>();

const selectedByItemId = computed(() =>
  props.selectedItemIds
    ? Object.fromEntries(props.selectedItemIds.map((id) => [id, true]))
    : {}
);
</script>
