<template>
  <span
    class="inline-block whitespace-nowrap rounded border border-white bg-white px-1 py-0.5 text-xs font-bold text-link"
  >
    {{ tag }}
    <font-awesome-icon
      v-if="hasRemoveIcon"
      class="ml-2 inline-block cursor-pointer hover:text-link-110"
      :icon="faTimes"
      @click="$emit('click:removeTag')"
    />
  </span>
</template>

<script lang="ts" setup>
import { faTimes } from '@fortawesome/free-solid-svg-icons';

/**
 * Tag component for displaying labels or categories
 *
 * @example
 * ```vue
 * <AppTag
 *   tag="Featured"
 *   :has-remove-icon="true"
 *   @click:removeTag="handleRemove"
 * />
 * ```
 */

defineProps<{
  /** Tag text to display */
  tag: string;
  /** Whether to show remove icon */
  hasRemoveIcon?: boolean;
}>();

defineEmits<{
  (e: 'click:removeTag'): void;
}>();
</script>
