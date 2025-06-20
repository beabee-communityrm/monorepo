<template>
  <AppButtonGroup>
    <AppButton
      type="button"
      variant="primaryOutlined"
      :icon="faStepBackward"
      :disabled="isFirst"
      @click="emit('update:modelValue', 0)"
    />
    <AppButton
      type="button"
      variant="primaryOutlined"
      :icon="faCaretLeft"
      :disabled="isFirst"
      @click="emit('update:modelValue', modelValue - 1)"
    />
    <AppButton
      type="button"
      variant="primaryOutlined"
      :icon="faCaretRight"
      :disabled="isLast"
      @click="emit('update:modelValue', modelValue + 1)"
    />
    <AppButton
      type="button"
      variant="primaryOutlined"
      :icon="faStepForward"
      :disabled="isLast"
      @click="emit('update:modelValue', totalPages - 1)"
    />
  </AppButtonGroup>
</template>

<script lang="ts" setup>
import {
  faCaretLeft,
  faCaretRight,
  faStepBackward,
  faStepForward,
} from '@fortawesome/free-solid-svg-icons';
import { computed } from 'vue';

import { AppButton, AppButtonGroup } from '../button';

/**
 * Pagination component for navigating through pages
 *
 * @example
 * ```vue
 * <AppPagination
 *   v-model="currentPage"
 *   :total-pages="10"
 * />
 * ```
 */

const props = defineProps<{
  /** Current page index (0-based) */
  modelValue: number;
  /** Total number of pages */
  totalPages: number;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: number): void;
}>();

const isFirst = computed(() => props.modelValue === 0);
const isLast = computed(() => props.modelValue >= props.totalPages - 1);
</script>
