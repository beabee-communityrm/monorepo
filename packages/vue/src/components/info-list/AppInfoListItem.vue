<!--
  # AppInfoListItem
  A definition list item component for displaying name-value pairs with consistent styling.

  ## Features:
  - Semantic dt/dd structure for accessibility
  - Visual border accent for grouping
  - Automatic fallback for empty values
  - Slot support for custom value content
  - Responsive text sizing

  ## Usage:
  ```vue
  <AppInfoListItem name="Status" value="Active" />
  <AppInfoListItem name="Description">
    <span class="text-success">Custom content</span>
  </AppInfoListItem>
  ```
-->
<template>
  <div class="mb-2 border-l border-primary-20 pl-2">
    <dt class="mb-1 block text-sm font-semibold text-body-80">{{ name }}</dt>
    <dd class="font-bold">
      <slot>
        {{ valueWithDefault }}
      </slot>
    </dd>
  </div>
</template>

<script lang="ts" setup>
/**
 * Definition list item component for displaying name-value pairs
 *
 * @component AppInfoListItem
 */
import { computed } from 'vue';

/**
 * Props for the AppInfoListItem component
 */
export interface AppInfoListItemProps {
  /** The label or name for this information item */
  name: string;
  /** The value to display (optional if using slot) */
  value?: unknown;
}

const props = defineProps<AppInfoListItemProps>();

/**
 * Computed value with fallback for empty or null values
 */
const valueWithDefault = computed(() => (props.value ? `${props.value}` : '–'));

/**
 * Slots available in the AppInfoListItem component
 */
defineSlots<{
  /**
   * Custom value content
   * @description Override the default value display with custom content
   */
  default(): any;
}>();
</script>
